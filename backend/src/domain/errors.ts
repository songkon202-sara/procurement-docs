export class ForbiddenError extends Error {}
export class ConflictError extends Error {}
export class NotFoundError extends Error {}

export class ValidationError extends Error {
  details: string[];
  constructor(message: string, details: string[] = []) {
    super(message);
    this.details = details;
  }
}
