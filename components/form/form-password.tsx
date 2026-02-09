"use client"

import { useState } from "react"
import { Control, FieldValues, Path } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Eye, EyeOff } from "lucide-react"
import { ReactNode } from "react"

interface FormPasswordProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  placeholder?: string
  description?: string
  disabled?: boolean
  startIcon?: ReactNode
  className?: string
}

export function FormPassword<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  disabled,
  startIcon,
  className,
}: FormPasswordProps<T>) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <InputGroup>
              {startIcon && (
                <InputGroupAddon align="inline-start">
                  <InputGroupText>{startIcon}</InputGroupText>
                </InputGroupAddon>
              )}
              <InputGroupInput
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
