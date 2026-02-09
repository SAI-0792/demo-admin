"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { GripVertical, Image as ImageIcon, Star, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/core/lib/utils"
// import {
//   DragDropContext,
//   Droppable,
//   Draggable,
//   DropResult,
// } from "react-beautiful-dnd"
// Note: dnd-kit is preferred for modern React, but for simplicity we'll use array move logic 
// without complex dnd library given the constraint of minimizing deps / setup. 
// If dnd is strict requirement, we can add it. For now, simple sequence buttons or just
// relying on the append-only nature + remove is often enough, but let's do a simple swap if needed.
// Actually, let's stick to simple "remove" and "set primary" for now as requested. 
// Drag and drop sorting requires more boilerplate (dnd-kit).

export interface ImageFile {
    id: string
    url: string
    isPrimary?: boolean
    sequence?: number
    file?: File // The raw file object for custom upload logic
}

interface ImageUploadProps {
    value: ImageFile[]
    onChange: (value: ImageFile[]) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newImages = acceptedFiles.map((file) => ({
                id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                url: URL.createObjectURL(file), // Preview URL
                file: file, // Store raw file
                isPrimary: false,
                sequence: value.length,
            }))

            // If it's the first image, make it primary by default
            if (value.length === 0 && newImages.length > 0) {
                newImages[0].isPrimary = true
            }

            onChange([...value, ...newImages])
        },
        [onChange, value]
    )

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp"],
        },
        disabled,
    })

    const removeImage = (id: string) => {
        const newImages = value.filter((img) => img.id !== id)
        // If we removed the primary image, set the first one as primary
        if (value.find((img) => img.id === id)?.isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true
        }
        onChange(newImages)
    }

    const setPrimary = (id: string) => {
        const newImages = value.map((img) => ({
            ...img,
            isPrimary: img.id === id,
        }))
        onChange(newImages)
    }

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer text-center hover:bg-muted/50",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-background rounded-full border shadow-sm">
                        <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
                </div>
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    {value.map((image, index) => (
                        <div
                            key={image.id}
                            className={cn(
                                "relative group rounded-lg overflow-hidden border bg-background aspect-square",
                                image.isPrimary && "ring-2 ring-primary ring-offset-2"
                            )}
                        >
                            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => removeImage(image.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="absolute top-2 left-2 z-10">
                                {image.isPrimary ? (
                                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md shadow-sm font-medium flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-primary-foreground" /> Cover
                                    </span>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 h-8 text-xs backdrop-blur-md bg-white/50 hover:bg-white/80"
                                        onClick={() => setPrimary(image.id)}
                                    >
                                        Set Cover
                                    </Button>
                                )}
                            </div>

                            <img
                                src={image.url}
                                alt="Upload preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}

                </div >
            )}
        </div >
    )
}
