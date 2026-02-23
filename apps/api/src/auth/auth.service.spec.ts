import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../database/schemas/user.schema';
import * as bcrypt from 'bcrypt';

// ─── Mock User Model ───
const mockUserModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
};

const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    verify: jest.fn(),
};

const mockConfigService = {
    get: jest.fn((key: string, defaultVal?: string) => {
        const map: Record<string, string> = {
            JWT_SECRET: 'test-jwt-secret-very-long-key-123',
            JWT_REFRESH_SECRET: 'test-refresh-secret-very-long-key-123',
            JWT_EXPIRES_IN: '1d',
            JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return map[key] || defaultVal;
    }),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: getModelToken(User.name), useValue: mockUserModel },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('login', () => {
        const email = 'test@entec.com.tr';
        const password = 'TestPass123!';
        const requestId = 'req_test123';
        const passwordHash = bcrypt.hashSync(password, 10);

        it('should throw UnauthorizedException for invalid email', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            await expect(
                service.login(email, password, requestId),
            ).rejects.toThrow('E-posta veya şifre hatalı');
        });

        it('should throw ForbiddenException for locked account', async () => {
            mockUserModel.findOne.mockResolvedValue({
                _id: 'user1',
                email,
                passwordHash,
                isLocked: true,
                lockedUntil: new Date(Date.now() + 10 * 60000), // 10 dk sonra
                isActive: true,
                failedLoginAttempts: 5,
            });

            await expect(
                service.login(email, password, requestId),
            ).rejects.toThrow(/Hesap kilitli/);
        });

        it('should throw ForbiddenException for disabled account', async () => {
            mockUserModel.findOne.mockResolvedValue({
                _id: 'user1',
                email,
                passwordHash,
                isLocked: false,
                isActive: false,
                failedLoginAttempts: 0,
            });

            await expect(
                service.login(email, password, requestId),
            ).rejects.toThrow('Hesap devre dışı');
        });

        it('should increment failedLoginAttempts on wrong password', async () => {
            mockUserModel.findOne.mockResolvedValue({
                _id: 'user1',
                email,
                passwordHash,
                isLocked: false,
                isActive: true,
                failedLoginAttempts: 0,
            });

            await expect(
                service.login(email, 'wrong-password', requestId),
            ).rejects.toThrow('E-posta veya şifre hatalı');

            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'user1' },
                expect.objectContaining({ failedLoginAttempts: 1 }),
            );
        });

        it('should lock account after 5 failed attempts', async () => {
            mockUserModel.findOne.mockResolvedValue({
                _id: 'user1',
                email,
                passwordHash,
                isLocked: false,
                isActive: true,
                failedLoginAttempts: 4, // 5. deneme
            });

            await expect(
                service.login(email, 'wrong-password', requestId),
            ).rejects.toThrow('E-posta veya şifre hatalı');

            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'user1' },
                expect.objectContaining({
                    failedLoginAttempts: 5,
                    isLocked: true,
                    lockedUntil: expect.any(Date),
                }),
            );
        });

        it('should return tokens on successful login', async () => {
            const mockUser = {
                _id: { toString: () => 'user1' },
                email,
                passwordHash,
                firstName: 'Test',
                lastName: 'User',
                role: 'admin',
                isLocked: false,
                isActive: true,
                failedLoginAttempts: 0,
                customerId: undefined,
            };

            mockUserModel.findOne.mockResolvedValue(mockUser);

            const result = await service.login(email, password, requestId);

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.email).toBe(email);
            expect(result.user.role).toBe('admin');

            // Sayaçlar sıfırlandı mı?
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: mockUser._id },
                expect.objectContaining({
                    failedLoginAttempts: 0,
                    isLocked: false,
                    lockedUntil: null,
                }),
            );
        });
    });

    describe('register', () => {
        it('should throw ConflictException for existing email', async () => {
            mockUserModel.findOne.mockResolvedValue({ email: 'x@y.com' });
            await expect(
                service.register('x@y.com', 'pass', 'A', 'B'),
            ).rejects.toThrow('Bu e-posta adresi zaten kullanılıyor');
        });

        it('should create user and return tokens', async () => {
            mockUserModel.findOne.mockResolvedValue(null);
            mockUserModel.create.mockResolvedValue({
                _id: { toString: () => 'new-user-id' },
                email: 'yeni@firma.com.tr',
                firstName: 'Ali',
                lastName: 'Veli',
                role: 'customer_user',
                customerId: undefined,
            });

            const result = await service.register(
                'yeni@firma.com.tr',
                'GüçlüŞifre123!',
                'Ali',
                'Veli',
            );

            expect(result).toHaveProperty('accessToken');
            expect(result.user.email).toBe('yeni@firma.com.tr');
            expect(mockUserModel.create).toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should clear refresh token', async () => {
            await service.logout('user1');
            expect(mockUserModel.updateOne).toHaveBeenCalledWith(
                { _id: 'user1' },
                { refreshToken: null },
            );
        });
    });
});
