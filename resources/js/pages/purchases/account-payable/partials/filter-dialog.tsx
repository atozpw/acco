import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarDays, ListFilterPlus, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

export type PayableFilterValues = {
    dateRange?: DateRange;
    taxAmount: string;
};

type AccountPayableFilterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    taxItems: ComboboxItem[];
    values: PayableFilterValues;
    onApply: (values: PayableFilterValues) => void;
    onReset: () => void;
};

export default function AccountPayableFilterDialog({
    open,
    onOpenChange,
    trigger,
    taxItems,
    values,
    onApply,
    onReset,
}: AccountPayableFilterDialogProps) {
    const [formValues, setFormValues] = useState<PayableFilterValues>(values);
    const [datePopoverOpen, setDatePopoverOpen] = useState(false);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormValues(values);
        }
    }, [open, values]);

    const dateLabel = useMemo(() => {
        const from = formValues.dateRange?.from;
        const to = formValues.dateRange?.to;

        if (!from && !to) {
            return 'Pilih rentang tanggal';
        }

        const format = (date?: Date) =>
            date?.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });

        return `${format(from) ?? ''} - ${format(to) ?? ''}`.trim();
    }, [formValues.dateRange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="md:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Filter Daftar Utang Usaha</DialogTitle>
                    <DialogDescription>
                        Sesuaikan daftar utang berdasarkan periode dan pajak
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 space-y-4">
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[200px]">Rentang Tanggal</Label>
                        <Popover
                            open={datePopoverOpen}
                            onOpenChange={setDatePopoverOpen}
                        >
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        'flex w-full items-center justify-between bg-transparent font-normal',
                                        !formValues.dateRange &&
                                            'text-muted-foreground',
                                    )}
                                >
                                    <span className="line-clamp-1 text-left">
                                        {dateLabel}
                                    </span>
                                    <CalendarDays className="opacity-60" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="range"
                                    numberOfMonths={1}
                                    selected={formValues.dateRange}
                                    onSelect={(range) =>
                                        setFormValues((prev) => ({
                                            ...prev,
                                            dateRange: range,
                                        }))
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[200px]">Pajak</Label>
                        <InputCombobox
                            name="tax_selected"
                            placeholder="Semua pajak"
                            value={formValues.taxAmount}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    taxAmount: next,
                                }))
                            }
                            items={taxItems}
                            className="w-full"
                        />
                    </div>
                </div>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            onReset();
                            onOpenChange(false);
                        }}
                    >
                        <RotateCcw className="me-2" /> Reset
                    </Button>
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            onApply(formValues);
                            onOpenChange(false);
                        }}
                    >
                        <ListFilterPlus className="me-2" /> Terapkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
