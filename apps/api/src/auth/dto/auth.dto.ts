import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@entec.com.tr' })
    @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
    email: string;

    @ApiProperty({ example: 'Admin123!' })
    @IsString()
    @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'yeni@firma.com.tr' })
    @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
    email: string;

    @ApiProperty({ example: 'Güçlü123!' })
    @IsString()
    @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
    @MaxLength(64)
    password: string;

    @ApiProperty({ example: 'Ali' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    firstName: string;

    @ApiProperty({ example: 'Veli' })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    lastName: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    refreshToken: string;
}

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @MinLength(6)
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(64)
    newPassword: string;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        customerId?: string;
    };
}
