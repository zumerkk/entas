import { validateEnv, apiEnvSchema, webEnvSchema, adminEnvSchema } from './env';

describe('validateEnv', () => {
    describe('apiEnvSchema', () => {
        const validApiEnv = {
            NODE_ENV: 'development',
            MONGODB_URI: 'mongodb://localhost:27017/entec',
            REDIS_URL: 'redis://localhost:6379',
            MINIO_ENDPOINT: 'localhost',
            MINIO_PORT: '9000',
            MINIO_ACCESS_KEY: 'entec-dev',
            MINIO_SECRET_KEY: 'entec-dev-secret',
            MINIO_BUCKET: 'entec-media',
            MINIO_USE_SSL: 'false',
            JWT_SECRET: 'change-me-in-production-min-32-chars!!',
            JWT_EXPIRES_IN: '1d',
            JWT_REFRESH_SECRET: 'change-me-refresh-in-production!!!',
            JWT_REFRESH_EXPIRES_IN: '7d',
            API_PORT: '3001',
            API_PREFIX: 'api',
        };

        it('should validate a correct API env', () => {
            const result = validateEnv(apiEnvSchema, validApiEnv);
            expect(result.MONGODB_URI).toBe('mongodb://localhost:27017/entec');
            expect(result.API_PORT).toBe(3001);
            expect(result.MINIO_USE_SSL).toBe(false);
        });

        it('should throw on missing MONGODB_URI', () => {
            const { MONGODB_URI, ...rest } = validApiEnv;
            expect(() => validateEnv(apiEnvSchema, rest)).toThrow(
                'Environment validation failed',
            );
        });

        it('should throw on short JWT_SECRET', () => {
            expect(() =>
                validateEnv(apiEnvSchema, { ...validApiEnv, JWT_SECRET: 'short' }),
            ).toThrow('at least 32 characters');
        });

        it('should coerce port string to number', () => {
            const result = validateEnv(apiEnvSchema, {
                ...validApiEnv,
                API_PORT: '4000',
            });
            expect(result.API_PORT).toBe(4000);
        });

        it('should apply defaults for optional fields', () => {
            const minimal = {
                MONGODB_URI: 'mongodb://localhost:27017/entec',
                REDIS_URL: 'redis://localhost:6379',
                MINIO_ACCESS_KEY: 'key',
                MINIO_SECRET_KEY: 'secret',
                JWT_SECRET: 'a'.repeat(32),
                JWT_REFRESH_SECRET: 'b'.repeat(32),
            };
            const result = validateEnv(apiEnvSchema, minimal);
            expect(result.NODE_ENV).toBe('development');
            expect(result.API_PORT).toBe(3001);
            expect(result.MINIO_BUCKET).toBe('entec-media');
        });
    });

    describe('webEnvSchema', () => {
        it('should validate a correct web env', () => {
            const result = validateEnv(webEnvSchema, {
                NEXT_PUBLIC_API_URL: 'http://localhost:3001/api',
            });
            expect(result.NEXT_PUBLIC_API_URL).toBe('http://localhost:3001/api');
        });

        it('should throw on invalid URL', () => {
            expect(() =>
                validateEnv(webEnvSchema, { NEXT_PUBLIC_API_URL: 'not-a-url' }),
            ).toThrow('Environment validation failed');
        });
    });

    describe('adminEnvSchema', () => {
        it('should validate a correct admin env', () => {
            const result = validateEnv(adminEnvSchema, {
                NEXT_PUBLIC_ADMIN_API_URL: 'http://localhost:3001/api',
                ADMIN_PORT: '3002',
            });
            expect(result.ADMIN_PORT).toBe(3002);
        });
    });
});
