"use client"

import * as React from "react"
import { cn } from "@/core/lib/utils"

export type DietaryType = "VEG" | "NON_VEG" | "VEGAN"

interface DietarySelectorProps {
    value: DietaryType
    onChange: (value: DietaryType) => void
    className?: string
}

export function DietarySelector({
    value,
    onChange,
    className,
}: DietarySelectorProps) {
    return (
        <div className={cn("flex space-x-2", className)}>
            <button
                type="button"
                onClick={() => onChange("VEG")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                    value === "VEG"
                        ? "bg-green-100 border-green-500 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                )}
            >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Veg
            </button>
            <button
                type="button"
                onClick={() => onChange("NON_VEG")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                    value === "NON_VEG"
                        ? "bg-red-100 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                )}
            >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Non-Veg
            </button>
            <button
                type="button"
                onClick={() => onChange("VEGAN")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors",
                    value === "VEGAN"
                        ? "bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : "border-input hover:bg-accent hover:text-accent-foreground"
                )}
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Vegan
            </button>
        </div>
    )
}
