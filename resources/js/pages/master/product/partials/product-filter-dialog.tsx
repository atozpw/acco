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
import { ListFilterPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

export type ProductFilterValues = {
    warehouseId: string;
};

type ProductFilterDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    warehouseItems: ComboboxItem[];
    values: ProductFilterValues;
    onApply: (values: ProductFilterValues) => void;
};

export default function ProductFilterDialog({
    open,
    onOpenChange,
    trigger,
    warehouseItems,
    values,
    onApply,
}: ProductFilterDialogProps) {
    const [formValues, setFormValues] = useState<ProductFilterValues>(values);

    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormValues(values);
        }
    }, [open, values]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Filter Produk</DialogTitle>
                    <DialogDescription>
                        Gunakan filter untuk mempersempit hasil pencarian.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-4 space-y-4">
                    <div className="grid gap-2 md:flex md:items-center md:gap-3">
                        <Label className="w-[150px]">Gudang</Label>
                        <InputCombobox
                            name="ware_selected"
                            placeholder="Pilih gudang"
                            value={formValues.warehouseId}
                            onValueChange={(next) =>
                                setFormValues((prev) => ({
                                    ...prev,
                                    warehouseId: next,
                                }))
                            }
                            items={warehouseItems}
                            className="w-full"
                        />
                    </div>
                </div>
                <DialogFooter className="flex items-center justify-between">
                    <Button
                        type="button"
                        onClick={() => {
                            onApply(formValues);
                            onOpenChange(false);
                        }}
                    >
                        <ListFilterPlus />
                        Filter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
