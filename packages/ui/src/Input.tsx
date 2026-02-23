import React from 'react';

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, fullWidth = false, className = '', id, ...props }, ref) => {
        const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
        const baseClass = 'entec-input';

        return (
            <div
                className={[
                    `${baseClass}-wrapper`,
                    fullWidth ? `${baseClass}-wrapper--full` : '',
                    error ? `${baseClass}-wrapper--error` : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                {label && (
                    <label htmlFor={inputId} className={`${baseClass}__label`}>
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={[baseClass, className].filter(Boolean).join(' ')}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <span id={`${inputId}-error`} className={`${baseClass}__error`} role="alert">
                        {error}
                    </span>
                )}
                {helperText && !error && (
                    <span className={`${baseClass}__helper`}>{helperText}</span>
                )}
            </div>
        );
    },
);

Input.displayName = 'Input';
