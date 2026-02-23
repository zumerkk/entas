import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Roller kontrolü
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // İzinler kontrolü
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Hiç kısıtlama yoksa geç
        if (!requiredRoles && !requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException('Yetkilendirme başarısız');
        }

        // super_admin her yere erişebilir
        if (user.role === 'super_admin') {
            return true;
        }

        // Rol kontrolü
        if (requiredRoles && !requiredRoles.includes(user.role)) {
            throw new ForbiddenException(
                `Bu işlem için gereken rol: ${requiredRoles.join(', ')}`,
            );
        }

        // İzin kontrolü
        if (requiredPermissions) {
            const userPermissions: string[] = user.permissions || [];
            const hasAll = requiredPermissions.every(
                (perm) =>
                    userPermissions.includes(perm) || userPermissions.includes('*'),
            );
            if (!hasAll) {
                throw new ForbiddenException(
                    `Bu işlem için gereken izin: ${requiredPermissions.join(', ')}`,
                );
            }
        }

        return true;
    }
}
