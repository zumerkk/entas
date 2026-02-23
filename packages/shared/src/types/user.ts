/**
 * User & RBAC types
 */

export type UserRole = 'super_admin' | 'admin' | 'sales_rep' | 'customer_user';

export interface UserBase {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
}

export interface Permission {
    resource: string;
    actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

export interface RoleDefinition {
    name: UserRole;
    displayName: string;
    permissions: Permission[];
}
