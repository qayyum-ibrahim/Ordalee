import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from './models/User.model';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/token';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { AuthenticatedRequest } from './middleware/requireAuth';
import { generateVerificationToken, hashToken } from './utils/verificationToken';
import { sendVerificationEmail, sendPasswordResetEmail } from './services/authEmails';

const REFRESH_COOKIE_NAME = 'ordalee_refresh_token';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !isValidEmail(email)) return sendError(res, 'VALIDATION_ERROR', 'A valid email is required.');
  if (!password || password.length < 8) return sendError(res, 'VALIDATION_ERROR', 'Password must be at least 8 characters.');
  if (await User.findOne({ email })) return sendError(res, 'EMAIL_TAKEN', 'An account with this email already exists.', 409);

  const passwordHash = await hashPassword(password);
  const { rawToken, hashedToken, expiresAt } = generateVerificationToken(24 * 60 * 60 * 1000);

  const user = await User.create({
    email,
    passwordHash,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: expiresAt,
  });

  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    // The account is already created and the token is already saved —
    // "Resend" on the check-email screen will still work even if this
    // first send failed. A flaky email provider shouldn't make account
    // creation itself look like it failed when it didn't.
    console.error('Failed to send verification email:', error);
  }

  return sendSuccess(res, { userId: user._id.toString(), email: user.email }, 'Account created. Check your email to verify your account.', 201);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return sendError(res, 'VALIDATION_ERROR', 'Email and password are required.');
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return sendError(res, 'INVALID_CREDENTIALS', 'Incorrect email or password.', 401);
  }
if (!user.emailVerified) {
    return sendError(res, 'EMAIL_NOT_VERIFIED', 'Please verify your email before logging in.', 403);
  }
  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  user.refreshTokenHash = await hashPassword(refreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
  return sendSuccess(res, { accessToken }, 'Logged in.');
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) return sendError(res, 'NO_REFRESH_TOKEN', 'No refresh token provided.', 401);

  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return sendError(res, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.', 401);
  }

  const user = await User.findById(payload.userId).select('+refreshTokenHash');
  if (!user?.refreshTokenHash || !(await bcrypt.compare(token, user.refreshTokenHash))) {
    return sendError(res, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired.', 401);
  }

  // Rotate on every refresh — a leaked-but-unused old token stops working
  // the instant the legitimate client refreshes.
  const newAccessToken = signAccessToken({ userId: user.id });
  const newRefreshToken = signRefreshToken({ userId: user.id });
  user.refreshTokenHash = await hashPassword(newRefreshToken);
  await user.save();

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, REFRESH_COOKIE_OPTIONS);
  return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed.');
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (token) {
    try {
      const { userId } = verifyRefreshToken(token);
      await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
    } catch {
      // Already invalid/expired — nothing to revoke.
    }
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  return sendSuccess(res, null, 'Logged out.');
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) return sendError(res, 'NOT_FOUND', 'User not found.', 404);
  return sendSuccess(res, {
    userId: user._id.toString(),
    email: user.email,
    emailVerified: user.emailVerified,
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.body as { token?: string };
  if (!token) return sendError(res, 'VALIDATION_ERROR', 'Verification token is required.');

  const user = await User.findOne({
    emailVerificationToken: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) return sendError(res, 'INVALID_TOKEN', 'This verification link is invalid or has expired.', 400);

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return sendSuccess(res, null, 'Email verified. You can now log in.');
}

export async function resendVerification(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) return sendError(res, 'VALIDATION_ERROR', 'Email is required.');

  const user = await User.findOne({ email });
  if (!user || user.emailVerified) {
    // Same shape whether the account doesn't exist or is already
    // verified — no reason to reveal which, to an anonymous caller.
    return sendSuccess(res, null, 'If an unverified account exists for this email, a new link has been sent.');
  }

  const { rawToken, hashedToken, expiresAt } = generateVerificationToken(24 * 60 * 60 * 1000);
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = expiresAt;
  await user.save();

  try {
    await sendVerificationEmail(user.email, rawToken);
  } catch (error) {
    console.error('Failed to resend verification email:', error);
  }

  return sendSuccess(res, null, 'If an unverified account exists for this email, a new link has been sent.');
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) return sendError(res, 'VALIDATION_ERROR', 'Email is required.');

  const user = await User.findOne({ email });
  if (user) {
    const { rawToken, hashedToken, expiresAt } = generateVerificationToken(60 * 60 * 1000);
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();
    try {
      await sendPasswordResetEmail(user.email, rawToken);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  // Always this exact response, account or not — confirming "no account
  // with that email" to an anonymous caller is a real information leak,
  // useful to an attacker building a target list for credential stuffing.
  return sendSuccess(res, null, "If an account exists for this email, we've sent a password reset link.");
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };
  if (!token) return sendError(res, 'VALIDATION_ERROR', 'Reset token is required.');
  if (!newPassword || newPassword.length < 8) return sendError(res, 'VALIDATION_ERROR', 'Password must be at least 8 characters.');

  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) return sendError(res, 'INVALID_TOKEN', 'This reset link is invalid or has expired.', 400);

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // The password just changed — invalidate any existing session so a
  // refresh token issued before the reset stops working immediately.
  user.refreshTokenHash = undefined;
  await user.save();

  return sendSuccess(res, null, 'Password updated. You can now log in.');
}