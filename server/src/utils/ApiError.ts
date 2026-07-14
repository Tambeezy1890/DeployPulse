export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  errors?: ValidationErrorDetail[];

  constructor(message: string, status = 500, errors?: ValidationErrorDetail[]) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
