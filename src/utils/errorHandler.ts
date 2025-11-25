// Simple error handler utilities used by controllers
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  // Optional raw details for debugging (avoid sending to clients in prod)
  details?: unknown;
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function logError(error: unknown, context?: string): void {
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error(error);
  }
}

export function createErrorResponse(error: unknown, message?: string): ErrorResponse {
  const errMsg = formatErrorMessage(error);
  return {
    success: false,
    message: message ?? 'Internal Server Error',
    error: errMsg,
    details: typeof error === 'object' ? error : undefined,
  };
}
