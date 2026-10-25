import jwt from 'jsonwebtoken';

// No fallback secret. A missing JWT_SECRET must be loud (the server refuses to
// start, see server.js) — a hard-coded fallback lets anyone who reads this
// repo sign themselves an admin token. Tests set their own secret in
// tests/helpers.js before importing the app.
function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) {
    throw new Error('JWT_SECRET is not set. Set a strong secret in backend/.env and restart.');
  }
  return s;
}

const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

export function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret(), { expiresIn: expiresIn() });
}

export function verifyToken(token) {
  // Pin the algorithm: token forgery via alg confusion (e.g. "none") must be
  // impossible even if a token leaks.
  return jwt.verify(token, secret(), { algorithms: ['HS256'] });
}
