"use client"

import { Control, FieldValues, Path } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { ReactNode } from "react"

interface FormInputProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  description?: string
  type?: string
  disabled?: boolean
  startIcon?: ReactNode
  endIcon?: ReactNode
  startContent?: ReactNode
  endContent?: ReactNode
  className?: string
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled,
  startIcon,
  endIcon,
  startContent,
  endContent,
  className,
}: FormInputProps<T>) {
  const hasAddon = startIcon || endIcon || startContent || endContent

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {hasAddon ? (
              <InputGroup>
                {(startIcon || startContent) && (
                  <InputGroupAddon align="inline-start">
                    {startIcon && <InputGroupText>{startIcon}</InputGroupText>}
                    {startContent}
                  </InputGroupAddon>
                )}
                <InputGroupInput
                  {...field}
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                />
                {(endIcon || endContent) && (
                  <InputGroupAddon align="inline-end">
                    {endIcon && <InputGroupText>{endIcon}</InputGroupText>}
                    {endContent}
                  </InputGroupAddon>
                )}
              </InputGroup>
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
