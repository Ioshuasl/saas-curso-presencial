import React, { useEffect, useRef, useState } from 'react'
import { Image as ImageIcon, Trash2, Upload } from 'lucide-react'

import { cn } from '../../utils/cn'

interface ImagePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  previewUrl?: string | null
  onRemove?: () => void
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  label,
  error,
  helperText,
  className,
  onChange,
  onRemove,
  previewUrl,
  disabled,
  ...props
}) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const effectivePreview = localPreview ?? previewUrl ?? null

  useEffect(() => {
    if (!previewUrl) {
      setLocalPreview(null)
    }
  }, [previewUrl])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLocalPreview(null)
    }

    onChange?.(event)
  }

  const triggerInput = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  const handleRemove = () => {
    setLocalPreview(null)

    if (inputRef.current) {
      inputRef.current.value = ''
    }

    onRemove?.()
  }

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label className={cn('text-sm font-medium leading-none', error ? 'text-red-600' : 'text-slate-700')}>
          {label}
        </label>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
        {...props}
      />

      {!effectivePreview ? (
        <button
          type="button"
          onClick={triggerInput}
          disabled={disabled}
          className={cn(
            'group flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors',
            error
              ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
              : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm font-semibold">Adicionar imagem</span>
          <span className="text-xs font-medium text-slate-400">Clique para selecionar um arquivo</span>
        </button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <img src={effectivePreview} alt="Preview da imagem" className="h-44 w-full object-cover" />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerInput}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <Upload size={14} />
              Trocar imagem
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <Trash2 size={14} />
              Remover
            </button>
          </div>
        </div>
      )}

      {(helperText || error) && (
        <p className={cn('text-[0.8rem]', error ? 'font-medium text-red-600' : 'text-slate-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}