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

export type DashboardFilterValues = {
    dateRange?: DateRange;
    departmentId: string;
    projectId: string;
};

type DashboardFilterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    departmentItems: ComboboxItem[];
    projectItems: ComboboxItem[];
    values: DashboardFilterValues;
    onApply: (values: DashboardFilterValues) => void;
    onReset: () => void;
};

export default function DashboardFilterDialog({
    open,
    onOpenChange,
    trigger,
    departmentItems,
    projectItems,
    values,
    onApply,
    onReset,
}: DashboardFilterDialogProps) {
    const [formValues, setFormValues] = useState<DashboardFilterValues>(values);
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
            <DialogContent className="md:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Filter Dashboard</DialogTitle>
                    <DialogDescription>
                        Sesuaikan periode, departemen, atau proyek
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
                        <Label className="md:w-[200px]">Departemen</Label>
                        <InputCombobox
                            name="department_selected"
                            placeholder="Semua departemen"
                            value={formValues.departmentId}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    departmentId: next,
                                }))
                            }
                            items={departmentItems}
                            className="w-full"
                        />
                    </div>
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[200px]">Proyek</Label>
                        <InputCombobox
                            name="project_selected"
                            placeholder="Semua proyek"
                            value={formValues.projectId}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    projectId: next,
                                }))
                            }
                            items={projectItems}
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
                        <RotateCcw /> Reset
                    </Button>
                    <Button
                        type="button"
                        className="w-full sm:w-auto"
                        onClick={() => {
                            onApply(formValues);
                            onOpenChange(false);
                        }}
                    >
                        <ListFilterPlus /> Terapkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
