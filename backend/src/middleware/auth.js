import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

function parseBearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

// 401 unless a valid Bearer token is present.
export async function requireAuth(req, res, next) {
  const token = parseBearer(req);
  if (!token) {
    return res.status(401).json({ error: 'Sign in to continue.' });
  }
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Your session expired. Sign in again.' });
  }
  try {
    // The token proves who the caller claims to be; the database decides what
    // that account may do. Role always comes from the user document, so a
    // forged "role" claim is worthless and demoted or deleted accounts lose
    // access immediately — not at token expiry.
    const user = await User.findById(payload.sub).select('role').lean();
    if (!user) {
      return res.status(401).json({ error: 'Your session expired. Sign in again.' });
    }
    req.user = { id: user._id.toString(), role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

// 403 for signed-in non-admins; 401 for anonymous requests.
export function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access is required for this action.' });
    }
    return next();
  });
}

// Attaches req.user when a valid token belonging to an existing user is
// present; never rejects. Used on public routes that behave slightly
// differently for admins.
export async function optionalAuth(req, res, next) {
  const token = parseBearer(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub).select('role').lean();
      if (user) {
        req.user = { id: user._id.toString(), role: user.role };
      }
    } catch {
      // Ignore invalid tokens on public routes.
    }
  }
  next();
}
