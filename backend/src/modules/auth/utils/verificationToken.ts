import crypto from 'crypto';

export function generateVerificationToken(expiresInMs: number) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + expiresInMs);
  return { rawToken, hashedToken, expiresAt };
}

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}