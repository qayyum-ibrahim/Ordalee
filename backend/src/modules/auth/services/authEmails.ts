import { sendEmail } from '../../../shared/services/email';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const link = `${FRONTEND_URL}/verify-email?token=${rawToken}`;
  await sendEmail({
    to,
    subject: 'Verify your Ordalee account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1B4B5A;">Welcome to Ordalee</h2>
        <p>Confirm your email address to activate your account.</p>
        <p><a href="${link}" style="display: inline-block; background: #1B4B5A; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">Verify email</a></p>
        <p style="color: #6B6459; font-size: 13px;">This link expires in 24 hours. If you didn't create an Ordalee account, ignore this email.</p>
      </div>`,
  });
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const link = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendEmail({
    to,
    subject: 'Reset your Ordalee password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1B4B5A;">Reset your password</h2>
        <p>Click below to choose a new password.</p>
        <p><a href="${link}" style="display: inline-block; background: #1B4B5A; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none;">Reset password</a></p>
        <p style="color: #6B6459; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>`,
  });
}