import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';


const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const REFRESH_TOKEN_BYTES = 32;

export interface GeneratedRefreshToken {
  raw: string;
  hash: string;
}

export function generateRefreshToken(): GeneratedRefreshToken {
  const raw = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
  const hash = hashRefreshToken(raw);
  return { raw, hash };
}

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
