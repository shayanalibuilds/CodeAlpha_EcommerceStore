import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { HttpError } from '../utils/httpError.js';
import { wrap } from '../utils/asyncHandler.js';

export const register = wrap(async (req, res) => {
  const { name, email, password } = req.body; // validated + normalized by middleware

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw new HttpError(409, 'That email is already registered.', {
      email: 'That email is already registered. Try signing in instead.',
    });
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role: 'customer', // role is never trusted from the client — admins are seed-only
  });

  res.status(201).json({ token: signToken(user), user: user.toPublic() });
});

export const login = wrap(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  const ok = user && (await verifyPassword(password, user.passwordHash));
  if (!ok) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }

  res.json({ token: signToken(user), user: user.toPublic() });
});

export const me = wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new HttpError(401, 'Account not found. Sign in again.');
  }
  res.json({ user: user.toPublic() });
});

// Stateless JWT: the client drops the token. Kept as an endpoint for API symmetry.
export const logout = wrap(async (req, res) => {
  res.json({ ok: true });
});
