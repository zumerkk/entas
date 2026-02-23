import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    Logger,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../database/schemas/user.schema';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    customerId?: string;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly MAX_LOGIN_ATTEMPTS = 5;
    private readonly LOCK_DURATION_MS = 15 * 60 * 1000; // 15 dakika

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // ─── Login ───
    async login(email: string, password: string, requestId: string) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new UnauthorizedException('E-posta veya şifre hatalı');
        }

        // Hesap kilitli mi?
        if (user.isLocked && user.lockedUntil) {
            if (new Date() < user.lockedUntil) {
                const remainingMinutes = Math.ceil(
                    (user.lockedUntil.getTime() - Date.now()) / 60000,
                );
                throw new ForbiddenException(
                    `Hesap kilitli. ${remainingMinutes} dakika sonra tekrar deneyin.`,
                );
            }
            // Kilit süresi dolmuş, sıfırla
            await this.userModel.updateOne(
                { _id: user._id },
                { isLocked: false, failedLoginAttempts: 0, lockedUntil: null },
            );
        }

        // Aktif mi?
        if (!user.isActive) {
            throw new ForbiddenException('Hesap devre dışı');
        }

        // Şifre kontrolü
        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
            // Hatalı giriş sayısını artır
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updateData: Record<string, unknown> = {
                failedLoginAttempts: attempts,
            };

            if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
                updateData.isLocked = true;
                updateData.lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MS);
                this.logger.warn(
                    `Hesap kilitlendi: ${email} (${attempts} başarısız deneme) [${requestId}]`,
                );
            }

            await this.userModel.updateOne({ _id: user._id }, updateData);
            throw new UnauthorizedException('E-posta veya şifre hatalı');
        }

        // Başarılı giriş — sayaçları sıfırla
        await this.userModel.updateOne(
            { _id: user._id },
            {
                failedLoginAttempts: 0,
                isLocked: false,
                lockedUntil: null,
                lastLoginAt: new Date(),
            },
        );

        // Token üret
        const tokens = await this.generateTokens(user);

        // Refresh token'ı hash'leyip kaydet
        const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.userModel.updateOne(
            { _id: user._id },
            { refreshToken: refreshHash },
        );

        this.logger.log(`Başarılı giriş: ${email} [${requestId}]`);

        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                customerId: user.customerId?.toString(),
            },
        };
    }

    // ─── Register (admin tarafından) ───
    async register(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        role: string = 'customer_user',
        customerId?: string,
    ) {
        const existing = await this.userModel.findOne({
            email: email.toLowerCase(),
        });
        if (existing) {
            throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await this.userModel.create({
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            role,
            customerId,
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0,
        });

        const tokens = await this.generateTokens(user);

        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                customerId: user.customerId?.toString(),
            },
        };
    }

    // ─── Refresh Token ───
    async refreshTokens(refreshToken: string) {
        let payload: JwtPayload;
        try {
            payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Geçersiz refresh token');
        }

        const user = await this.userModel.findById(payload.sub);
        if (!user || !user.refreshToken || !user.isActive) {
            throw new UnauthorizedException('Geçersiz refresh token');
        }

        // Hash'lenmiş refresh token ile karşılaştır
        const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isValid) {
            // Token çalınmış olabilir — tüm token'ları iptal et
            await this.userModel.updateOne(
                { _id: user._id },
                { refreshToken: null },
            );
            throw new UnauthorizedException('Refresh token iptal edildi');
        }

        const tokens = await this.generateTokens(user);
        const newRefreshHash = await bcrypt.hash(tokens.refreshToken, 10);
        await this.userModel.updateOne(
            { _id: user._id },
            { refreshToken: newRefreshHash },
        );

        return {
            ...tokens,
            user: {
                id: user._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                customerId: user.customerId?.toString(),
            },
        };
    }

    // ─── Logout ───
    async logout(userId: string) {
        await this.userModel.updateOne(
            { _id: userId },
            { refreshToken: null },
        );
    }

    // ─── Change Password ───
    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new UnauthorizedException('Kullanıcı bulunamadı');
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Mevcut şifre hatalı');
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userModel.updateOne(
            { _id: userId },
            { passwordHash, refreshToken: null },
        );
    }

    // ─── Kullanıcı bilgisi ───
    async validateUserById(userId: string): Promise<UserDocument | null> {
        return this.userModel.findById(userId).select('-passwordHash -refreshToken');
    }

    // ─── Token üretimi ───
    private async generateTokens(user: UserDocument) {
        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            role: user.role,
            customerId: user.customerId?.toString(),
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '1d'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);

        return { accessToken, refreshToken };
    }
}
