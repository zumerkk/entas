/**
 * Standard API error codes and formatting.
 */

export enum ApiErrorCode {
    BAD_REQUEST = 'BAD_REQUEST',
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    CONFLICT = 'CONFLICT',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    RATE_LIMITED = 'RATE_LIMITED',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface FormattedApiError {
    statusCode: number;
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
    timestamp: string;
}

const STATUS_MAP: Record<ApiErrorCode, number> = {
    [ApiErrorCode.BAD_REQUEST]: 400,
    [ApiErrorCode.UNAUTHORIZED]: 401,
    [ApiErrorCode.FORBIDDEN]: 403,
    [ApiErrorCode.NOT_FOUND]: 404,
    [ApiErrorCode.CONFLICT]: 409,
    [ApiErrorCode.VALIDATION_ERROR]: 422,
    [ApiErrorCode.RATE_LIMITED]: 429,
    [ApiErrorCode.INTERNAL_ERROR]: 500,
    [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
};

/**
 * Format a standard API error response.
 */
export function formatApiError(
    code: ApiErrorCode,
    message: string,
    requestId: string,
    details?: Record<string, unknown>,
): FormattedApiError {
    return {
        statusCode: STATUS_MAP[code],
        code,
        message,
        details,
        requestId,
        timestamp: new Date().toISOString(),
    };
}
