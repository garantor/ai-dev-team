// Ensure JWT_SECRET and JWT_EXPIRES_IN are set in .env
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
