import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

export type ComboboxItem = {
    value: string;
    label: string;
};

type InputComboboxProps = {
    name: string;
    items: ComboboxItem[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    value?: string;
    onValueChange?: (value: string) => void;
};

export default function InputCombobox({
    name,
    items,
    placeholder = 'Select...',
    className,
    disabled,
    value,
    onValueChange,
}: InputComboboxProps) {
    const [open, setOpen] = useState(false);
    // When used without Inertia form, fall back to internal state
    const [internalValue, setInternalValue] = useState('');

    const selectedValue = value !== undefined ? value : internalValue;
    const setSelectedValue = (next: string) => {
        if (onValueChange) onValueChange(next);
        else setInternalValue(next);
    };

    const isDisabled = !!disabled;

    const selectedLabel = useMemo(
        () => items.find((i) => i.value === selectedValue)?.label,
        [items, selectedValue],
    );

    return (
        <div className={cn('space-y-1.5', className)}>
            {/* Hidden input to ensure value is submitted with plain HTML forms */}
            <input type="hidden" name={name} value={selectedValue ?? ''} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={`${name}-listbox`}
                        aria-haspopup="listbox"
                        disabled={isDisabled}
                        className={cn(
                            'w-full justify-between bg-transparent font-normal',
                            !selectedValue && 'text-muted-foreground',
                        )}
                    >
                        <span className="line-clamp-1 text-left whitespace-normal">
                            {selectedLabel ?? placeholder}
                        </span>
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder={`Cari...`} className="h-9" />
                        <CommandList id={`${name}-listbox`}>
                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                            <CommandGroup>
                                {items.map((item, index) => (
                                    <CommandItem
                                        key={index}
                                        value={item.value}
                                        keywords={[item.label]}
                                        onSelect={(currentValue) => {
                                            const next =
                                                currentValue === selectedValue
                                                    ? ''
                                                    : currentValue;
                                            setSelectedValue(next);
                                            setOpen(false);
                                        }}
                                    >
                                        {item.label}
                                        <Check
                                            className={cn(
                                                'ml-auto',
                                                selectedValue === item.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
