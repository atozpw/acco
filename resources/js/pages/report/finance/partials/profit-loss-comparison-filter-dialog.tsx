import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ListFilterPlus, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

const MONTH_OPTIONS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
}));

export type ComparisonFilterValues = {
    month: string;
    year: string;
    classificationId: string;
    departmentId: string;
    projectId: string;
};

type ComparisonFilterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    classificationItems: ComboboxItem[];
    departmentItems: ComboboxItem[];
    projectItems: ComboboxItem[];
    values: ComparisonFilterValues;
    onApply: (values: ComparisonFilterValues) => void;
    onReset: () => void;
};

export default function ProfitLossComparisonFilterDialog({
    open,
    onOpenChange,
    trigger,
    classificationItems,
    departmentItems,
    projectItems,
    values,
    onApply,
    onReset,
}: ComparisonFilterDialogProps) {
    const [formValues, setFormValues] =
        useState<ComparisonFilterValues>(values);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormValues(values);
        }
    }, [open, values]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="md:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Filter Laba Rugi Perbandingan</DialogTitle>
                    <DialogDescription>
                        Sesuaikan periode perbandingan dan parameter filter
                        lainnya.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 space-y-4">
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[220px]">Bulan</Label>
                        <Select
                            value={formValues.month}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    month: next,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTH_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[220px]">Tahun</Label>
                        <Select
                            value={formValues.year}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    year: next,
                                }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {YEAR_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[220px]">Klasifikasi</Label>
                        <InputCombobox
                            name="classification_selected"
                            placeholder="Semua klasifikasi"
                            value={formValues.classificationId}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    classificationId: next,
                                }))
                            }
                            items={classificationItems}
                            className="w-full"
                        />
                    </div>
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="md:w-[220px]">Departemen</Label>
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
                        <Label className="md:w-[220px]">Proyek</Label>
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
