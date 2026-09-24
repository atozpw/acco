import InputCombobox, {
    type ComboboxItem,
} from '@/components/form/input-combobox';
import InputDatepicker from '@/components/form/input-datepicker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import payrollPeriods from '@/routes/payroll-periods';
import { router } from '@inertiajs/react';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export type GeneratePeriodDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payrollCategoryItems: ComboboxItem[];
    defaultPayrollCategoryId?: string;
    referenceNo?: string;
    today?: string;
};

export default function GeneratePeriodDialog({
    open,
    onOpenChange,
    payrollCategoryItems,
    defaultPayrollCategoryId,
    referenceNo,
    today,
}: GeneratePeriodDialogProps) {
    const [formData, setFormData] = useState({
        reference_no: referenceNo || '',
        payroll_category_id: defaultPayrollCategoryId || '',
        date: today || new Date().toISOString().split('T')[0],
        start_date: '',
        end_date: '',
        description: '',
    });

    const [generating, setGenerating] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setFormData({
                reference_no: referenceNo || '',
                payroll_category_id: defaultPayrollCategoryId || '',
                date: today || new Date().toISOString().split('T')[0],
                start_date: '',
                end_date: '',
                description: '',
            });
            setErrors({});
        }
    }, [open, referenceNo, defaultPayrollCategoryId, today]);

    const handleGenerate = () => {
        if (!formData.payroll_category_id) {
            setErrors({
                payroll_category_id: 'Pilih kategori gaji terlebih dahulu.',
            });
            return;
        }

        setGenerating(true);
        setErrors({});

        router.post(payrollPeriods.store.url(), formData, {
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Berhasil', {
                    description: 'Periode penggajian berhasil dibuat.',
                });
            },
            onError: (err) => {
                setErrors(err);
                const firstError = Object.values(err)[0];
                toast.error('Gagal Generate', {
                    description:
                        firstError ||
                        'Terjadi kesalahan saat memproses data periode penggajian.',
                });
            },
            onFinish: () => {
                setGenerating(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Buat Daftar Gaji</DialogTitle>
                    <DialogDescription>
                        Generate data daftar gaji dari perhitungan yang telah
                        dibuat.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="gen_reference_no">
                                Nomor Referensi
                            </Label>
                            <Input
                                id="gen_reference_no"
                                value={formData.reference_no}
                                onChange={(e) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        reference_no: e.target.value,
                                    }));
                                    if (errors.reference_no) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.reference_no;
                                            return next;
                                        });
                                    }
                                }}
                                placeholder="Nomor referensi (misal: PY-000001)"
                            />
                            <InputError message={errors.reference_no} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gen_date">Tanggal Transaksi</Label>
                            <InputDatepicker
                                id="gen_date"
                                defaultValue={formData.date}
                                placeholder="Pilih tanggal transaksi"
                                buttonClassName="w-full"
                                onChange={(_, iso) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        date: iso,
                                    }));
                                    if (errors.date) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.date;
                                            return next;
                                        });
                                    }
                                }}
                            />
                            <InputError message={errors.date} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Kategori Gaji</Label>
                        <InputCombobox
                            name="gen_payroll_category_id"
                            placeholder="Pilih kategori gaji"
                            items={payrollCategoryItems}
                            value={formData.payroll_category_id}
                            onValueChange={(val) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    payroll_category_id: val,
                                }));
                                if (errors.payroll_category_id) {
                                    setErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.payroll_category_id;
                                        return next;
                                    });
                                }
                            }}
                        />
                        <InputError message={errors.payroll_category_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="gen_start_date">
                                Mulai Periode
                            </Label>
                            <InputDatepicker
                                id="gen_start_date"
                                defaultValue={formData.start_date}
                                placeholder="Pilih tanggal mulai"
                                buttonClassName="w-full"
                                onChange={(_, iso) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        start_date: iso,
                                    }));
                                    if (errors.start_date) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.start_date;
                                            return next;
                                        });
                                    }
                                }}
                            />
                            <InputError message={errors.start_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gen_end_date">
                                Selesai Periode
                            </Label>
                            <InputDatepicker
                                id="gen_end_date"
                                defaultValue={formData.end_date}
                                placeholder="Pilih tanggal selesai"
                                buttonClassName="w-full"
                                onChange={(_, iso) => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        end_date: iso,
                                    }));
                                    if (errors.end_date) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next.end_date;
                                            return next;
                                        });
                                    }
                                }}
                            />
                            <InputError message={errors.end_date} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="gen_description">
                            Keterangan / Deskripsi
                        </Label>
                        <Input
                            id="gen_description"
                            value={formData.description}
                            onChange={(e) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }));
                                if (errors.description) {
                                    setErrors((prev) => {
                                        const next = { ...prev };
                                        delete next.description;
                                        return next;
                                    });
                                }
                            }}
                            placeholder="Contoh: Gaji Periode September 2026"
                        />
                        <InputError message={errors.description} />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={generating}
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        disabled={
                            generating ||
                            !formData.payroll_category_id ||
                            !formData.reference_no
                        }
                        onClick={handleGenerate}
                    >
                        {generating ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" />
                                Memproses...
                            </>
                        ) : (
                            <>
                                <Sparkles />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
