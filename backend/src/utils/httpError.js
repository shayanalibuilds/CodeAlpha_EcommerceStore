// Error type that carries an HTTP status and optional per-field messages.
// Field messages tell the user HOW to fix the input, not just that it failed.
export class HttpError extends Error {
  constructor(status, message, fields = undefined) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const httpError = (status, message, fields) => new HttpError(status, message, fields);
