"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { FileIcon, Trash2, Upload, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/core/lib/utils"

interface FileUploaderProps {
    /**
     * Current value: can be a File object (pending upload), a string URL (uploaded), or null/empty
     */
    value?: File | string | null
    /**
     * Callback when a file is selected. 
     * Can be async. If it returns a promise, we show a loading state.
     */
    onFileSelected: (file: File) => Promise<void> | void
    /**
     * Callback to remove/clear the file
     */
    onRemove?: () => void
    disabled?: boolean
    accept?: Record<string, string[]>
    maxSize?: number // bytes
}

export function FileUploader({
    value,
    onFileSelected,
    onRemove,
    disabled,
    accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".pdf"] },
    maxSize = 5 * 1024 * 1024 // 5MB
}: FileUploaderProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // Create preview URL if value is File
    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else if (typeof value === 'string') {
            setPreviewUrl(value)
        } else {
            setPreviewUrl(null)
        }
    }, [value])

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return

            const file = acceptedFiles[0]
            setIsLoading(true)
            try {
                await onFileSelected(file)
            } catch (error) {
                console.error("File selection error", error)
            } finally {
                setIsLoading(false)
            }
        },
        [onFileSelected]
    )

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles: 1,
        disabled: disabled || isLoading,
    })

    const isImage = (val: File | string | null | undefined) => {
        if (!val) return false
        if (typeof val === 'string') {
            return val.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || val.startsWith('data:image');
        }
        return val.type.startsWith('image/')
    }

    const renderPreview = () => {
        if (!value) return null

        const isImg = isImage(value)

        if (isImg && previewUrl) {
            return (
                <div className="relative w-full h-full min-h-[200px] bg-muted/20 rounded-lg overflow-hidden border flex items-center justify-center group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain max-h-[300px]" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!disabled && onRemove && (
                            <Button type="button" variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                            </Button>
                        )}
                        <Button type="button" variant="secondary" size="sm" onClick={() => { document.getElementById('hidden-dropzone')?.click() }}>
                            <RefreshCcw className="w-4 h-4 mr-2" /> Change
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/10">
                <div className="p-3 bg-primary/10 rounded-full">
                    <FileIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">
                        {value instanceof File ? value.name : "Uploaded File"}
                    </p>
                    {value instanceof File && (
                        <p className="text-xs text-muted-foreground">
                            {(value.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    )}
                </div>
                {!disabled && (
                    <div className="flex gap-2">
                        {onRemove && (
                            <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    if (value && !isDragActive) {
        return (
            <div className="space-y-4">
                {renderPreview()}
                {/* Hidden dropzone trigger for "Change" button */}
                <div {...getRootProps({ className: "hidden", id: "hidden-dropzone" })}>
                    <input {...getInputProps()} />
                </div>
            </div>
        )
    }

    return (
        <div>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer text-center hover:bg-muted/50 flex flex-col items-center justify-center min-h-[150px]",
                    isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    (disabled || isLoading) && "opacity-50 cursor-not-allowed",
                    fileRejections.length > 0 && "border-destructive/50 bg-destructive/5"
                )}
            >
                <input {...getInputProps()} />
                {isLoading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-background rounded-full border shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
                        </p>
                        {fileRejections.length > 0 && (
                            <p className="text-xs text-destructive mt-2">
                                File rejected used. Too large or invalid type.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
