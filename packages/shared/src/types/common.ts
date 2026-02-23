/**
 * Common shared types used across the ENTEC monorepo.
 */

/** Standard cursor-based pagination request */
export interface PaginationQuery {
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/** Standard cursor-based pagination response */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        nextCursor: string | null;
        hasMore: boolean;
        total?: number;
    };
}

/** Standard API error response */
export interface ApiErrorResponse {
    statusCode: number;
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
    timestamp: string;
}

/** Feature flag definition */
export interface FeatureFlag {
    key: string;
    enabled: boolean;
    description?: string;
}

/** Audit log entry */
export interface AuditLogEntry {
    actorId: string;
    actorRole: string;
    entityType: string;
    entityId: string;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    requestId: string;
    timestamp: Date;
}

/** Order flow mode */
export type OrderFlowMode = 'direct' | 'quote_approval';
