import { verifyToken } from '../utils/jwt.js';

function parseBearer(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

// 401 unless a valid Bearer token is present.
export function requireAuth(req, res, next) {
  const token = parseBearer(req);
  if (!token) {
    return res.status(401).json({ error: 'Sign in to continue.' });
  }
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session expired. Sign in again.' });
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

// Attaches req.user when a valid token is present; never rejects.
// Used on public routes that behave slightly differently for admins.
export function optionalAuth(req, res, next) {
  const token = parseBearer(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // Ignore invalid tokens on public routes.
    }
  }
  next();
}
