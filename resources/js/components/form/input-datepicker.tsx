import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';

type InputDatepickerProps = {
    id?: string;
    defaultValue?: string | Date | null;
    placeholder?: string;
    buttonClassName?: string;
    onChange?: (date: Date | undefined, iso: string) => void;
    readOnly?: boolean;
};

// Format as local date (YYYY-MM-DD) without timezone shifting
const toLocalISODate = (d?: Date): string => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const coerceDate = (v?: string | Date | null): Date | undefined => {
    if (!v) return undefined;
    if (v instanceof Date) return isNaN(v.getTime()) ? undefined : v;
    // Expecting format YYYY-MM-DD
    const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(v.trim());
    if (match) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, y, m, d] = match;
        const date = new Date(Number(y), Number(m) - 1, Number(d));
        // Validate components to avoid JS date overflow (e.g., 2025-13-40)
        if (
            date.getFullYear() === Number(y) &&
            date.getMonth() === Number(m) - 1 &&
            date.getDate() === Number(d)
        ) {
            return date;
        }
        return undefined;
    }
    // Fallback: try native parse (less reliable across browsers)
    const parsed = new Date(v);
    return isNaN(parsed.getTime()) ? undefined : parsed;
};

export default function InputDatepicker({
    id,
    defaultValue,
    placeholder = 'Pilih tanggal',
    buttonClassName,
    onChange,
    readOnly,
}: InputDatepickerProps) {
    const initial = useMemo(() => coerceDate(defaultValue), [defaultValue]);
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(initial);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    disabled={readOnly}
                    id={id}
                    className={`justify-between bg-transparent font-normal${
                        buttonClassName ? ` ${buttonClassName}` : ''
                    }`}
                >
                    {date ? date.toLocaleDateString('id-ID') : placeholder}
                    <CalendarDays className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown-months"
                    onSelect={(d) => {
                        setDate(d);
                        setOpen(false);
                        onChange?.(d, toLocalISODate(d));
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
