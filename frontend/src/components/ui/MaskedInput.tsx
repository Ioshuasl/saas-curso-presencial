import React from 'react';
import { IMaskInput } from 'react-imask';
import type { InputProps } from './Input';
import { cn } from '../../utils/cn';

type MaskType = 'cpf' | 'cnpj' | 'cep' | 'phone' | 'currency' | 'none';

interface MaskedInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  maskType?: MaskType;
  value?: string | number;
  onAccept?: (value: string, unmaskedValue: string) => void;
  customMask?: Record<string, unknown>;
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ maskType = 'none', value, onAccept, customMask, className, label, helperText, error, required, disabled, readOnly, size = 'md', ...props }, ref) => {

    const getMaskConfig = () => {
      switch (maskType) {
        case 'cpf':
          return { mask: '000.000.000-00' };
        case 'cnpj':
          return { mask: '00.000.000/0000-00' };
        case 'cep':
          return { mask: '00000-000' };
        case 'phone':
          return {
            mask: [
              { mask: '(00) 0000-0000' },
              { mask: '(00) 00000-0000' }
            ]
          };
        case 'currency':
          return {
            mask: 'R$ num',
            blocks: {
              num: {
                mask: Number,
                thousandsSeparator: '.',
                padFractionalZeros: true,
                radix: ',',
                mapToRadix: ['.']
              }
            }
          };
        case 'none':
          return customMask || { mask: /.*/ };
        default:
          return { mask: /.*/ };
      }
    };

    const maskConfig = getMaskConfig();
    const sizeClasses = {
      sm: "h-8 text-xs px-2.5",
      md: "h-10 text-sm px-3",
      lg: "h-12 text-base px-4"
    };

    return (
      <div className={cn("flex flex-col gap-1.5 w-full", className)}>
        {label && (
          <label className={cn("text-sm font-medium leading-none flex items-center gap-1", error ? "text-red-600" : "text-slate-700 dark:text-slate-200")}>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <IMaskInput
          {...maskConfig}
          {...props}
          value={value?.toString() || ''}
          unmask={true}
          inputRef={ref}
          disabled={disabled}
          readOnly={readOnly}
          onAccept={(acceptedValue: string, mask: { unmaskedValue: string }) => {
            if (onAccept) onAccept(acceptedValue, mask.unmaskedValue);
          }}
          className={cn(
            "flex w-full rounded-md border bg-white text-slate-900 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 transition-all duration-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-offset-slate-900 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800",
            sizeClasses[size],
            error
              ? "border-red-500 focus-visible:ring-red-500/30 text-red-900"
              : "border-slate-300 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 hover:border-slate-400 text-slate-900 dark:border-slate-700 dark:hover:border-slate-600 dark:text-slate-100",
            readOnly && "bg-slate-50 border-slate-200 text-slate-600 focus-visible:ring-0 cursor-default dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
          )}
        />

        {(helperText || error) && (
          <p className={cn("text-[0.8rem]", error ? "text-red-600 font-medium" : "text-slate-500 dark:text-slate-400")}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
