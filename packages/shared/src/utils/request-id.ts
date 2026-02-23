const ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generate a nanoid-style random string.
 * Uses Math.random — sufficient for request IDs (not crypto).
 */
export function nanoid(size = 21): string {
    let id = '';
    for (let i = 0; i < size; i++) {
        id += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
    return id;
}

/**
 * Generate a prefixed request ID.
 * Format: req_<nanoid>
 */
export function generateRequestId(): string {
    return `req_${nanoid(16)}`;
}
