import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Req,
    UseGuards,
    Get,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import {
    LoginDto,
    RegisterDto,
    RefreshTokenDto,
    ChangePasswordDto,
    AuthResponseDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { AuditLogService } from '../audit/audit-log.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly auditLogService: AuditLogService,
    ) { }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Kullanıcı girişi' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Hatalı kimlik bilgileri' })
    @ApiResponse({ status: 403, description: 'Hesap kilitli' })
    async login(@Body() dto: LoginDto, @Req() req: Request) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        const result = await this.authService.login(
            dto.email,
            dto.password,
            requestId,
        );

        // Audit log
        await this.auditLogService.log({
            actorId: result.user.id,
            actorRole: result.user.role,
            actorEmail: result.user.email,
            entityType: 'User',
            entityId: result.user.id,
            action: 'login',
            requestId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        return result;
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Yeni kullanıcı kaydı (admin tarafından)' })
    @ApiResponse({ status: 201, type: AuthResponseDto })
    @ApiResponse({ status: 409, description: 'E-posta zaten kullanılıyor' })
    async register(@Body() dto: RegisterDto, @Req() req: Request) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        const result = await this.authService.register(
            dto.email,
            dto.password,
            dto.firstName,
            dto.lastName,
        );

        await this.auditLogService.log({
            actorId: result.user.id,
            actorRole: result.user.role,
            actorEmail: result.user.email,
            entityType: 'User',
            entityId: result.user.id,
            action: 'create',
            after: { email: dto.email, firstName: dto.firstName, lastName: dto.lastName },
            requestId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
        });

        return result;
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Access token yenileme' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Çıkış yap' })
    async logout(
        @CurrentUser('userId') userId: string,
        @Req() req: Request,
    ) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        await this.authService.logout(userId);

        await this.auditLogService.log({
            actorId: userId,
            actorRole: (req as any).user?.role || 'unknown',
            entityType: 'User',
            entityId: userId,
            action: 'logout',
            requestId,
        });

        return { message: 'Başarıyla çıkış yapıldı' };
    }

    @Post('change-password')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Şifre değiştir' })
    async changePassword(
        @CurrentUser('userId') userId: string,
        @Body() dto: ChangePasswordDto,
        @Req() req: Request,
    ) {
        await this.authService.changePassword(
            userId,
            dto.currentPassword,
            dto.newPassword,
        );

        const requestId = (req.headers['x-request-id'] as string) || '';
        await this.auditLogService.log({
            actorId: userId,
            actorRole: (req as any).user?.role || 'unknown',
            entityType: 'User',
            entityId: userId,
            action: 'update',
            after: { field: 'password' },
            requestId,
        });

        return { message: 'Şifre başarıyla değiştirildi' };
    }

    @Get('me')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Mevcut kullanıcı bilgileri' })
    async me(@CurrentUser('userId') userId: string) {
        const user = await this.authService.validateUserById(userId);
        return { user };
    }
}
