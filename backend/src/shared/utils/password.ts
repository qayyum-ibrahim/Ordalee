import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(value: string): Promise<string> {
  return bcrypt.hash(value, SALT_ROUNDS);
}

export async function comparePassword(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}