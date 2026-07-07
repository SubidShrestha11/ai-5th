export interface ApiValidationError {
  [field: string]: string[] | string;
}

export interface ApiErrorBody {
  detail?: string | string[];
  message?: string;
  errors?: ApiValidationError;
  non_field_errors?: string[];
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody | null;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, body: ApiErrorBody | null = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.fieldErrors = extractFieldErrors(body);
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
  }
}

function extractFieldErrors(body: ApiErrorBody | null): Record<string, string> {
  if (!body) return {};

  const fieldErrors: Record<string, string> = {};

  if (body.errors && typeof body.errors === 'object') {
    for (const [field, value] of Object.entries(body.errors)) {
      if (Array.isArray(value)) fieldErrors[field] = value.join(' ');
      else if (typeof value === 'string') fieldErrors[field] = value;
    }
  }

  for (const [key, value] of Object.entries(body)) {
    if (['detail', 'message', 'errors', 'non_field_errors'].includes(key)) continue;
    if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
      fieldErrors[key] = value.join(' ');
    } else if (typeof value === 'string') {
      fieldErrors[key] = value;
    }
  }

  if (body.non_field_errors?.length) {
    fieldErrors._form = body.non_field_errors.join(' ');
  }

  return fieldErrors;
}

function detailToMessage(detail: string | string[] | undefined): string | null {
  if (!detail) return null;
  return Array.isArray(detail) ? detail.join(' ') : detail;
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const { status } = response;
  let body: ApiErrorBody | null = null;

  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }

  const detailMessage = detailToMessage(body?.detail);
  const message =
    detailMessage ??
    body?.message ??
    body?.non_field_errors?.join(' ') ??
    defaultMessageForStatus(status);

  return new ApiError(status, message, body);
}

function defaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'You need to sign in to continue.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Something went wrong on our server. Please try again.';
    default:
      return `Request failed with status ${status}.`;
  }
}

export function getErrorMessage(error: unknown): string {
  if (ApiError.isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
