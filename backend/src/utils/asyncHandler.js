// Wrap async controllers so rejections flow to the central error handler.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
