import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from './models/User.model';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/token';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { AuthenticatedRequest } from './middleware/requireAuth';

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

  if (!email || !isValidEmail(email)) {
    return sendError(res, 'VALIDATION_ERROR', 'A valid email is required.');
  }
  if (!password || password.length < 8) {
    return sendError(res, 'VALIDATION_ERROR', 'Password must be at least 8 characters.');
  }

  if (await User.findOne({ email })) {
    return sendError(res, 'EMAIL_TAKEN', 'An account with this email already exists.', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email, passwordHash });

  // Email verification is its own milestone — it needs an email provider
  // decision first. For now the account is usable immediately;
  // emailVerified just stays false.
  return sendSuccess(res, { userId: user.id, email: user.email }, 'Account created.', 201);
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