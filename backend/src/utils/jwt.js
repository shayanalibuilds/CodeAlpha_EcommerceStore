import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret(), { expiresIn: expiresIn() });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}
