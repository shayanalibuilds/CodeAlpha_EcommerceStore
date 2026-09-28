import { HttpError } from '../utils/httpError.js';

// Zod validation middleware. On failure returns 400 with a per-field map:
// { error: 'Please fix the highlighted fields.', fields: { password: '...' } }
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.length ? issue.path.join('.') : '_';
        if (!fields[key]) fields[key] = issue.message;
      }
      return next(new HttpError(400, 'Please fix the highlighted fields.', fields));
    }
    if (source === 'body') req.body = result.data;
    return next();
  };
}
