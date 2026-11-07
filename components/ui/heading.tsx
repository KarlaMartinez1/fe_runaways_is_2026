import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type HeadingSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type HeadingAlign = 'left' | 'center' | 'right';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingLevel;
  size?: HeadingSize;
  align?: HeadingAlign;
  subtitle?: React.ReactNode;
  subtitleClassName?: string;
  children: React.ReactNode;
}

const sizeStyles: Record<HeadingSize, string> = {
  sm: 'text-base font-semibold tracking-tight',
  md: 'text-lg font-semibold tracking-tight',
  lg: 'text-xl font-bold tracking-tight',
  xl: 'text-2xl font-bold tracking-tight',
  '2xl': 'text-3xl font-extrabold tracking-tight',
  '3xl': 'text-4xl font-extrabold tracking-tight',
};

const defaultSizeMap: Record<HeadingLevel, HeadingSize> = {
  h1: '2xl',
  h2: 'xl',
  h3: 'lg',
  h4: 'md',
  h5: 'sm',
  h6: 'sm',
};

const alignStyles: Record<HeadingAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      as: Component = 'h1',
      size,
      align = 'left',
      subtitle,
      subtitleClassName,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const resolvedSize = size || defaultSizeMap[Component];

    const content = (
      <Component
        ref={ref}
        className={cn(
          'text-gray-950 text-balance',
          sizeStyles[resolvedSize],
          alignStyles[align],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );

    if (!subtitle) {
      return content;
    }

    return (
      <div className={cn('space-y-1.5', alignStyles[align])}>
        {content}
        <p className={cn('text-sm sm:text-base text-gray-500 font-normal', subtitleClassName)}>
          {subtitle}
        </p>
      </div>
    );
  }
);

Heading.displayName = 'Heading';
