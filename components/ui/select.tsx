'use client';

import * as React from 'react';
import type { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils/cn';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  id?: string;
  name?: string;
  label?: string;
  error?: string | FieldError;
  helperText?: string;
  selectSize?: SelectSize;
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  leftIcon?: React.ReactNode;
  'aria-label'?: string;
}

const sizeStyles: Record<
  SelectSize,
  {
    button: string;
    option: string;
    icon: string;
  }
> = {
  sm: {
    button: 'h-9 px-3 text-xs rounded-lg',
    option: 'px-2.5 py-1.5 text-xs',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    button: 'h-11 px-3.5 text-sm rounded-xl',
    option: 'px-3 py-2 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    button: 'h-12 px-4 text-base rounded-xl',
    option: 'px-3.5 py-2.5 text-base',
    icon: 'w-4.5 h-4.5',
  },
};

export function Select<T extends string = string>({
  id,
  name,
  label,
  error,
  helperText,
  selectSize = 'md',
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className,
  containerClassName,
  leftIcon,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [internalValue, setInternalValue] = React.useState<T | undefined>(defaultValue);
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const listboxRef = React.useRef<HTMLDivElement>(null);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const errorMessage = typeof error === 'string' ? error : error?.message;
  const isInvalid = Boolean(errorMessage);

  const generatedId = React.useId();
  const selectId = id || generatedId;
  const errorId = isInvalid ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;
  const listboxId = `${selectId}-listbox`;

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === currentValue),
    [options, currentValue]
  );

  const openDropdown = React.useCallback(() => {
    const selectedIdx = options.findIndex((opt) => opt.value === currentValue);
    setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
    setIsOpen(true);
  }, [options, currentValue]);

  const closeDropdown = React.useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, closeDropdown]);

  const handleSelect = (val: T) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(val);
    closeDropdown();
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < options.length) {
          const opt = options[highlightedIndex];
          if (!opt.disabled) {
            handleSelect(opt.value);
          }
        } else if (!isOpen) {
          openDropdown();
        } else {
          closeDropdown();
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) {
              next++;
            }
            return next < options.length ? next : prev;
          });
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setHighlightedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          e.preventDefault();
          closeDropdown();
          buttonRef.current?.focus();
        }
        break;
      }
      case 'Tab': {
        if (isOpen) {
          closeDropdown();
        }
        break;
      }
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full flex flex-col', containerClassName)}>
      {label && (
        <label
          id={`${selectId}-label`}
          htmlFor={selectId}
          className="block text-sm font-semibold text-gray-900 mb-1.5 select-none"
        >
          {label}
        </label>
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue !== undefined ? String(currentValue) : ''}
          disabled={disabled}
        />
      )}

      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={label ? `${selectId}-label` : undefined}
        aria-label={!label ? ariaLabel : undefined}
        aria-invalid={isInvalid ? true : undefined}
        aria-describedby={errorId || helperId}
        onClick={() => {
          if (!disabled) {
            if (isOpen) {
              closeDropdown();
            } else {
              openDropdown();
            }
          }
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex items-center justify-between w-full border bg-white transition-colors duration-150 text-left outline-none',
          sizeStyles[selectSize].button,
          isOpen
            ? 'border-[#1E4DB7] ring-2 ring-blue-100 shadow-xs'
            : isInvalid
            ? 'border-red-500 hover:border-red-600 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-100'
            : 'border-zinc-300 hover:border-zinc-400 focus-visible:border-[#1E4DB7] focus-visible:ring-2 focus-visible:ring-blue-100',
          disabled
            ? 'bg-gray-50 opacity-60 cursor-not-allowed text-zinc-400'
            : 'cursor-pointer text-zinc-800',
          className
        )}
      >
        <div className="flex items-center min-w-0 flex-1 gap-2">
          {leftIcon && (
            <span className="flex items-center text-zinc-400 shrink-0 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <span
            className={cn(
              'truncate font-medium',
              !selectedOption && 'text-zinc-400 font-normal'
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <span className="ml-2 flex items-center text-zinc-400 pointer-events-none shrink-0">
          <svg
            className={cn(
              'transition-transform duration-200 text-zinc-500',
              sizeStyles[selectSize].icon,
              isOpen && 'rotate-180 text-[#1E4DB7]'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label={label || ariaLabel || 'Opciones'}
          tabIndex={-1}
          className="absolute left-0 top-full mt-1.5 w-full min-w-full z-40 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg shadow-zinc-900/10 focus:outline-none animate-in fade-in-0 zoom-in-95"
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {options.map((option, index) => {
              const isSelected = option.value === currentValue;
              const isHighlighted = index === highlightedIndex;

              return (
                <div
                  key={String(option.value)}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onClick={() => {
                    if (!option.disabled) {
                      handleSelect(option.value);
                    }
                  }}
                  onMouseEnter={() => {
                    if (!option.disabled) setHighlightedIndex(index);
                  }}
                  className={cn(
                    'relative flex items-center justify-between rounded-lg cursor-pointer transition-colors select-none font-medium text-left',
                    sizeStyles[selectSize].option,
                    isSelected
                      ? 'bg-blue-50 text-[#1E4DB7] font-semibold'
                      : isHighlighted
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                    option.disabled &&
                      'opacity-50 cursor-not-allowed hover:bg-transparent text-zinc-400'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <svg
                      className={cn(
                        'text-[#1E4DB7] shrink-0 ml-2',
                        sizeStyles[selectSize].icon
                      )}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | FieldError;
  helperText?: string;
  selectSize?: SelectSize;
  containerClassName?: string;
}

export const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      selectSize = 'md',
      containerClassName,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const errorMessage = typeof error === 'string' ? error : error?.message;
    const isInvalid = Boolean(errorMessage);

    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = isInvalid ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className={cn('relative w-full flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-gray-900 mb-1.5 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative w-full">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={errorId || helperId}
            className={cn(
              'w-full border bg-white transition-colors duration-150 outline-none appearance-none pr-10 font-medium cursor-pointer',
              sizeStyles[selectSize].button,
              isInvalid
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-zinc-300 hover:border-zinc-400 focus:border-[#1E4DB7] focus:ring-2 focus:ring-blue-100',
              disabled && 'bg-gray-50 opacity-60 cursor-not-allowed',
              className
            )}
            {...props}
          >
            {children}
          </select>

          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-500">
            <svg
              className={sizeStyles[selectSize].icon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
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

NativeSelect.displayName = 'NativeSelect';
