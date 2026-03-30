import { Image as ImageIcon, Trash2, Upload } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '../../utils/cn'

function isLikelyImageFile(file: File) {
  if (file.type.startsWith('image/')) return true
  return /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i.test(file.name)
}

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
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

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

  const applyDroppedFile = useCallback(
    (file: File) => {
      if (disabled || !inputRef.current) return
      if (!isLikelyImageFile(file)) return

      const input = inputRef.current
      try {
        const dt = new DataTransfer()
        dt.items.add(file)
        input.files = dt.files
      } catch {
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setLocalPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      onChange?.({
        target: input,
        currentTarget: input,
      } as React.ChangeEvent<HTMLInputElement>)
    },
    [disabled, onChange],
  )

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    if (![...e.dataTransfer.types].includes('Files')) return
    dragCounterRef.current += 1
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0
      setIsDragging(false)
    }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      applyDroppedFile(file)
    }
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

  const dropZoneDraggingClass = isDragging
    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400/50 dark:border-indigo-400 dark:bg-indigo-950/40 dark:ring-indigo-500/40'
    : ''

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      {label ? (
        <label
          className={cn(
            'text-sm font-medium leading-none',
            error ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200',
          )}
        >
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
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            'group flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors',
            error
              ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800/80 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50'
              : 'border-slate-300 bg-slate-50 text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300',
            disabled && 'pointer-events-none opacity-50',
            !error && !disabled && dropZoneDraggingClass,
          )}
        >
          <ImageIcon className="h-8 w-8 opacity-90" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Adicionar imagem</span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Clique ou arraste uma imagem para esta área
          </span>
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50 md:p-0">
          <div
            className={cn(
              'group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100/80 transition-colors dark:border-slate-700 dark:bg-slate-950/60',
              !disabled && isDragging && 'border-indigo-500 ring-2 ring-indigo-400/40 dark:border-indigo-400 dark:ring-indigo-500/35',
            )}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <img
              src={effectivePreview}
              alt="Preview da imagem"
              className="h-44 w-full object-cover"
            />

            {/* Desktop (md+): ações no hover ou ao focar um botão (teclado) */}
            <div
              className={cn(
                'absolute inset-0 hidden flex-col items-center justify-center gap-2 px-4 transition-opacity duration-200 md:flex',
                'bg-slate-950/70 backdrop-blur-[2px]',
                'opacity-0 group-hover:opacity-100',
                'pointer-events-none group-hover:pointer-events-auto',
                'focus-within:opacity-100 focus-within:pointer-events-auto',
              )}
            >
              <p className="pointer-events-none mb-0.5 hidden text-center text-[11px] font-medium text-white/90 md:block">
                Passe o mouse, arraste outra imagem ou use os botões
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={triggerInput}
                  disabled={disabled}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-white disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <Upload size={14} aria-hidden />
                  Trocar imagem
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="pointer-events-auto inline-flex items-center gap-1.5 rounded-xl border border-rose-300/80 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200 dark:hover:bg-rose-900/80"
                >
                  <Trash2 size={14} aria-hidden />
                  Remover
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: botões sempre visíveis abaixo da imagem */}
          <div className="mt-3 flex flex-wrap items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={triggerInput}
              disabled={disabled}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50/80 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 sm:flex-none"
            >
              <Upload size={14} aria-hidden />
              Trocar imagem
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60 dark:border-rose-900/50 dark:bg-rose-950/35 dark:text-rose-300 dark:hover:bg-rose-950/55 sm:flex-none"
            >
              <Trash2 size={14} aria-hidden />
              Remover
            </button>
          </div>
        </div>
      )}

      {(helperText || error) && (
        <p
          className={cn(
            'text-[0.8rem]',
            error ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400',
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}
