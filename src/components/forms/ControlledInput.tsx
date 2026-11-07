import * as React from 'react';
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Input, type InputProps } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Types & Interfaces (Top of file)
// ---------------------------------------------------------------------------

export interface ControlledInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, 'name' | 'defaultValue'> {
  name: TName;
  control: Control<TFieldValues>;
}

// ---------------------------------------------------------------------------
// Component Implementation
// ---------------------------------------------------------------------------

export function ControlledInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  error,
  ...props
}: ControlledInputProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error: fieldError },
  } = useController({
    name,
    control,
  });

  return (
    <Input
      {...field}
      {...props}
      error={error || fieldError}
    />
  );
}
