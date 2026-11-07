import * as React from 'react';
import type { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils/cn';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string | FieldError;
  helperText?: string;
  inputSize?: InputSize;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg',
  md: 'h-11 px-3.5 text-sm rounded-xl',
  lg: 'h-12 px-4 text-base rounded-xl',
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      inputSize = 'md',
      prefix,
      suffix,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const isInvalid = Boolean(errorMessage);

    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = isInvalid ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={cn('w-full flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-900 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex items-center w-full rounded-xl border bg-white transition-colors duration-150',
            isInvalid
              ? 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
              : 'border-gray-300 hover:border-gray-400 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100',
            disabled && 'bg-gray-50 opacity-60 cursor-not-allowed'
          )}
        >
          {prefix && (
            <div className="flex items-center pl-3 pr-1 text-gray-500 text-sm border-r border-gray-200">
              {prefix}
            </div>
          )}

          {leftIcon && (
            <div className="flex items-center pl-3 text-gray-400 shrink-0 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={errorId || helperId}
            className={cn(
              'w-full bg-transparent text-gray-900 placeholder:text-gray-400 outline-none disabled:cursor-not-allowed',
              sizeStyles[inputSize],
              leftIcon && 'pl-2',
              rightIcon && 'pr-2',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="flex items-center pr-3 text-gray-400 shrink-0">
              {rightIcon}
            </div>
          )}

          {suffix && (
            <div className="flex items-center pr-3 pl-1 text-gray-500 text-sm border-l border-gray-200">
              {suffix}
            </div>
          )}
        </div>

        {errorMessage ? (
          <p id={errorId} className="mt-1.5 text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-xs text-gray-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
