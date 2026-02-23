import { z } from 'zod';

// ─── API Environment ───
export const apiEnvSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),

    // MongoDB
    MONGODB_URI: z
        .string()
        .min(1, 'MONGODB_URI is required')
        .url('MONGODB_URI must be a valid connection string'),

    // Redis
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

    // MinIO / S3
    MINIO_ENDPOINT: z.string().min(1).default('localhost'),
    MINIO_PORT: z.coerce.number().int().positive().default(9000),
    MINIO_ACCESS_KEY: z.string().min(1, 'MINIO_ACCESS_KEY is required'),
    MINIO_SECRET_KEY: z.string().min(1, 'MINIO_SECRET_KEY is required'),
    MINIO_BUCKET: z.string().min(1).default('entec-media'),
    MINIO_USE_SSL: z
        .string()
        .transform((v) => v === 'true')
        .default('false'),

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().min(1).default('1d'),
    JWT_REFRESH_SECRET: z
        .string()
        .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_REFRESH_EXPIRES_IN: z.string().min(1).default('7d'),

    // Server
    API_PORT: z.coerce.number().int().positive().default(3001),
    API_PREFIX: z.string().min(1).default('api'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

// ─── Web Environment ───
export const webEnvSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

// ─── Admin Environment ───
export const adminEnvSchema = z.object({
    NEXT_PUBLIC_ADMIN_API_URL: z
        .string()
        .url('NEXT_PUBLIC_ADMIN_API_URL must be a valid URL'),
    ADMIN_PORT: z.coerce.number().int().positive().default(3002),
});

export type AdminEnv = z.infer<typeof adminEnvSchema>;

// ─── Validator ───
export function validateEnv<T extends z.ZodType>(
    schema: T,
    env: Record<string, unknown> = process.env as Record<string, unknown>,
): z.infer<T> {
    const result = schema.safeParse(env);
    if (!result.success) {
        const formatted = result.error.issues
            .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
        throw new Error(
            `\n❌ Environment validation failed:\n${formatted}\n\nCheck your .env file against .env.example\n`,
        );
    }
    return result.data;
}
