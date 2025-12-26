import { Input } from '@/components/ui/input';
import React from 'react';

type InputDecimalProps = {
    name?: string;
    id?: string;
    placeholder?: string;
    value?: string | null; // formatted localized string, e.g. "1.234,56"
    onValueChange?: (formatted: string, numeric: number) => void;
    className?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    readOnly?: boolean;
};

const formatLocal = (num: number) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(isNaN(num) ? 0 : num);

const parseLocal = (str: string): number => {
    if (!str) return 0;
    const cleaned = str.replace(/\./g, '').replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
};

export default function InputDecimal({
    name,
    id,
    placeholder = '0,00',
    value = null,
    onValueChange,
    className,
    inputMode = 'decimal',
    readOnly = false,
}: InputDecimalProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        onValueChange?.(raw, parseLocal(raw));
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        // Select all text on focus for quick overwrite
        e.target.select();
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        // Prevent mouseup from clearing the selection immediately after focus
        e.preventDefault();
    };

    const handleBlur = () => {
        if (value == null || value === '') return;
        const num = parseLocal(value ?? '0');
        const formatted = formatLocal(num);
        if (formatted !== (value ?? '')) {
            onValueChange?.(formatted, num);
        }
    };

    return (
        <>
            <Input
                id={id}
                name={name}
                type="text"
                inputMode={inputMode}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={handleChange}
                onFocus={handleFocus}
                onMouseUp={handleMouseUp}
                onBlur={handleBlur}
                className={`text-right${className ? ` ${className}` : ''}`}
                autoComplete="off"
                readOnly={readOnly}
            />
        </>
    );
}
