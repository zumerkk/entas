import React from 'react';

export interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    children: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    children,
    className = '',
}) => {
    const classes = ['entec-badge', `entec-badge--${variant}`, className]
        .filter(Boolean)
        .join(' ');
    return <span className={classes}>{children}</span>;
};
