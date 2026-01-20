import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    ButtonGroup,
    ButtonGroupSeparator,
} from '@/components/ui/button-group';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { dashboard as dashboardRoute } from '@/routes';
import dashboard from '@/routes/dashboard';
import financialStatement from '@/routes/financial-statement';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { TooltipProps } from 'recharts';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    Pie,
    PieChart,
    PolarGrid,
    PolarRadiusAxis,
    RadialBar,
    RadialBarChart,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboardRoute().url,
    },
    {
        title: 'Detail Penerimaan',
        href: '',
    },
];

type PeriodNavigation = {
    month: number;
    year: number;
    label: string;
};

type DetailPeriod = {
    label: string;
    month: number;
    year: number;
    date_from: string;
    date_to: string;
    navigation?: {
        previous?: PeriodNavigation;
        next?: PeriodNavigation;
    };
};

type Summary = {
    total_amount: number;
    transaction_count: number;
    customer_count: number;
    average_value: number;
};

type ComparisonMetric = {
    growth: number | null;
    current: number;
    previous: number;
    label: string;
};

type Comparisons = {
    mom: ComparisonMetric;
    yoy: ComparisonMetric;
};

type ChartSeries = {
    amounts: number[];
};

type DetailChart = {
    labels: string[];
    series: ChartSeries;
};

type BreakdownItem = {
    label: string;
    amount: number;
};

type Breakdown = {
    total: number;
    items: BreakdownItem[];
};

type DetailBreakdowns = {
    sources: Breakdown;
    departments: Breakdown;
    projects: Breakdown;
};

type DetailFilters = {
    month: number;
    year: number;
    department_id?: number | null;
    project_id?: number | null;
};

type PageProps = {
    period: DetailPeriod;
    summary: Summary;
    comparisons: Comparisons;
    chart: DetailChart;
    breakdowns: DetailBreakdowns;
    filters: DetailFilters;
};

type TooltipItem = NonNullable<TooltipProps<number, string>['payload']>[number];

type DailyChartRow = {
    label: string;
    amount: number;
    date?: Date;
    rangeLabel?: string;
    tooltipLabel?: string;
};

type WeeklyChartRow = DailyChartRow & {
    startDate: Date;
    endDate: Date;
};

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const compactNumberFormatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
});

const longDateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const monthYearFormatter = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
});

const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 'Rp 0,00';
    }

    return `Rp ${currencyFormatter.format(value)}`;
};

const formatPercent = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '-';
    }

    return `${percentFormatter.format(value)}%`;
};

const formatAxisValue = (value: number) => {
    const abs = Math.abs(value);

    if (abs >= 1_000_000) {
        const formatted = compactNumberFormatter.format(value / 1_000_000);
        return `${formatted}m`;
    }

    if (abs >= 1_000) {
        const formatted = compactNumberFormatter.format(value / 1_000);
        return `${formatted}k`;
    }

    return value.toLocaleString('id-ID');
};

const SOURCE_BREAKDOWN_COLORS = [
    'hsl(160 84% 39%)',
    'hsl(199 89% 48%)',
    'hsl(217 91% 60%)',
    'hsl(271 91% 65%)',
    'hsl(12 94% 62%)',
    'hsl(40 97% 55%)',
    'hsl(326 74% 57%)',
    'hsl(190 90% 39%)',
    'hsl(142 71% 45%)',
    'hsl(262 83% 58%)',
] as const;

const formatDateToYmd = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const normalizeReportQueryParams = (
    params: Record<string, string>,
): Record<string, string> => {
    const normalized = { ...params };
    const hasMonth = Object.prototype.hasOwnProperty.call(normalized, 'month');
    const hasYear = Object.prototype.hasOwnProperty.call(normalized, 'year');

    if (hasMonth && hasYear) {
        const monthValue = Number(normalized.month);
        const yearValue = Number(normalized.year);

        if (
            Number.isInteger(monthValue) &&
            monthValue >= 1 &&
            monthValue <= 12 &&
            Number.isInteger(yearValue)
        ) {
            const startOfMonth = new Date(yearValue, monthValue - 1, 1);
            const endOfMonth = new Date(yearValue, monthValue, 0);

            normalized.date_from = formatDateToYmd(startOfMonth);
            normalized.date_to = formatDateToYmd(endOfMonth);

            delete normalized.month;
            delete normalized.year;
        }
    }

    return normalized;
};

const buildQueryForNavigation = (target?: PeriodNavigation) => {
    if (!target) return undefined;

    return {
        month: target.month,
        year: target.year,
    } satisfies Record<string, number>;
};

const getWeekStartDate = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    return start;
};

export default function DetailRevenuePage({
    period,
    summary,
    comparisons,
    chart,
    breakdowns,
    filters,
}: PageProps) {
    const [chartMode, setChartMode] = useState<'daily' | 'weekly'>('daily');
    const { url } = usePage();

    const headingDescription = period?.label
        ? `Penerimaan Bulan - ${period.label}`
        : 'Penerimaan Bulan';

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const queryParamsForReport = useMemo(() => {
        const existingParams = new URLSearchParams(url.split('?')[1] ?? '');
        const fromUrl = Object.fromEntries(existingParams.entries());

        if (Object.keys(fromUrl).length > 0) {
            return normalizeReportQueryParams(fromUrl);
        }

        if (filters) {
            const filterParams = Object.fromEntries(
                Object.entries(filters).map(([key, value]) => [
                    key,
                    value == null ? '' : String(value),
                ]),
            );

            if (Object.keys(filterParams).length > 0) {
                return normalizeReportQueryParams(filterParams);
            }
        }

        if (period?.date_from && period?.date_to) {
            return {
                date_from: period.date_from,
                date_to: period.date_to,
            };
        }

        return undefined;
    }, [filters, period?.date_from, period?.date_to, url]);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const periodMonthLabel = useMemo(() => {
        if (!period?.month || !period?.year) {
            return '';
        }

        return monthYearFormatter.format(
            new Date(period.year, period.month - 1, 1),
        );
    }, [period?.month, period?.year]);

    const handleChartModeChange = (value: string) => {
        setChartMode(value === 'weekly' ? 'weekly' : 'daily');
    };

    const parseLabelToDate = useCallback(
        (rawLabel: unknown) => {
            if (rawLabel === null || rawLabel === undefined) {
                return undefined;
            }

            if (rawLabel instanceof Date) {
                return rawLabel;
            }

            const numericValue = Number(rawLabel);
            const hasPeriod = Boolean(period?.month && period?.year);

            if (!Number.isNaN(numericValue)) {
                if (Number.isInteger(numericValue) && hasPeriod) {
                    const clampedDay = Math.max(1, Math.floor(numericValue));
                    return new Date(
                        period!.year,
                        period!.month - 1,
                        clampedDay,
                    );
                }

                const parsedFromNumber = new Date(numericValue);

                if (!Number.isNaN(parsedFromNumber.getTime())) {
                    return parsedFromNumber;
                }
            }

            const stringLabel = String(rawLabel).trim();
            const parsedDate = new Date(stringLabel);

            if (!Number.isNaN(parsedDate.getTime())) {
                return parsedDate;
            }

            if (hasPeriod) {
                const extractedDay = Number(stringLabel.replace(/[^0-9]/g, ''));

                if (!Number.isNaN(extractedDay) && extractedDay > 0) {
                    return new Date(
                        period!.year,
                        period!.month - 1,
                        extractedDay,
                    );
                }
            }

            return undefined;
        },
        [period],
    );

    const handleNavigate = (target?: PeriodNavigation) => {
        const query = buildQueryForNavigation(target);

        if (!query) return;

        router.get(dashboard.revenue.url(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const chartRows = useMemo<DailyChartRow[]>(() => {
        const labels = chart?.labels ?? [];
        const amountSeries = chart?.series?.amounts ?? [];

        return labels.map((label, index) => ({
            label,
            amount: amountSeries[index] ?? 0,
            date: parseLabelToDate(label),
        }));
    }, [chart, parseLabelToDate]);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const weeklyRows = useMemo<WeeklyChartRow[]>(() => {
        if (!chartRows.length) return [];

        if (!period?.month || !period?.year) {
            const weekMap = new Map<string, WeeklyChartRow>();

            chartRows.forEach((row) => {
                if (!row.date) return;
                const weekStart = getWeekStartDate(row.date);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                const key = weekStart.toISOString();

                if (!weekMap.has(key)) {
                    weekMap.set(key, {
                        label: `Pekan ${weekMap.size + 1}`,
                        startDate: weekStart,
                        endDate: weekEnd,
                        rangeLabel: `${longDateFormatter.format(
                            weekStart,
                        )} - ${longDateFormatter.format(weekEnd)}`,
                        tooltipLabel: undefined,
                        amount: 0,
                    });
                }

                const entry = weekMap.get(key);
                if (entry) {
                    entry.amount += row.amount;
                }
            });

            return Array.from(weekMap.values()).sort(
                (a, b) => a.startDate.getTime() - b.startDate.getTime(),
            );
        }

        const targetMonth = period.month - 1;
        const targetYear = period.year;
        const daysInMonth = new Date(period.year, period.month, 0).getDate();
        const buckets: WeeklyChartRow[] = Array.from(
            { length: 4 },
            (_, idx) => {
                const startDay = idx * 7 + 1;
                const endDay =
                    idx === 3
                        ? daysInMonth
                        : Math.min(startDay + 6, daysInMonth);
                const label = `Pekan ${idx + 1}`;
                const tooltipLabel = periodMonthLabel
                    ? `${label}, ${periodMonthLabel}`
                    : label;
                return {
                    label,
                    tooltipLabel,
                    rangeLabel:
                        `${startDay}-${endDay} ${periodMonthLabel}`.trim(),
                    startDate: new Date(
                        targetYear,
                        targetMonth,
                        Math.min(startDay, daysInMonth),
                    ),
                    endDate: new Date(targetYear, targetMonth, endDay),
                    amount: 0,
                };
            },
        );

        chartRows.forEach((row) => {
            if (!row.date) return;
            if (
                row.date.getMonth() !== targetMonth ||
                row.date.getFullYear() !== targetYear
            ) {
                return;
            }

            const day = row.date.getDate();
            const bucketIndex = Math.min(Math.floor((day - 1) / 7), 3);
            const bucket = buckets[bucketIndex];
            bucket.amount += row.amount;
        });

        return buckets;
    }, [chartRows, period?.month, period?.year, periodMonthLabel]);

    const sourceItems = (breakdowns?.sources?.items ?? []).slice(0, 10);
    const departmentItems = (breakdowns?.departments?.items ?? []).slice(0, 10);
    const projectItems = (breakdowns?.projects?.items ?? []).slice(0, 10);

    const sourceChartConfig = useMemo(() => {
        const baseConfig: Record<string, { label: string; color?: string }> = {
            amount: {
                label: 'Penerimaan',
                color: 'hsl(160 84% 39%)',
            },
        };

        sourceItems.forEach((item, index) => {
            baseConfig[`source-${index}`] = {
                label: item.label,
                color: SOURCE_BREAKDOWN_COLORS[
                    index % SOURCE_BREAKDOWN_COLORS.length
                ],
            };
        });

        return baseConfig;
    }, [sourceItems]);

    const sourceChartData = useMemo(
        () =>
            sourceItems.map((item, index) => ({
                name: item.label,
                amount: Number(item.amount ?? 0),
                fill: `var(--color-source-${index})`,
            })),
        [sourceItems],
    );

    const departmentChartConfig = useMemo(() => {
        const baseConfig: Record<string, { label: string; color?: string }> = {
            amount: {
                label: 'Penerimaan Departemen',
                color: 'hsl(217 91% 60%)',
            },
        };

        departmentItems.forEach((item, index) => {
            baseConfig[`department-${index}`] = {
                label: item.label,
                color: SOURCE_BREAKDOWN_COLORS[
                    index % SOURCE_BREAKDOWN_COLORS.length
                ],
            };
        });

        return baseConfig;
    }, [departmentItems]);

    const departmentChartData = useMemo(
        () =>
            departmentItems.map((item, index) => ({
                name: item.label,
                amount: Number(item.amount ?? 0),
                fill: `var(--color-department-${index})`,
            })),
        [departmentItems],
    );

    const projectChartConfig = useMemo(() => {
        const baseConfig: Record<string, { label: string; color?: string }> = {
            amount: {
                label: 'Penerimaan Proyek',
                color: 'hsl(40 97% 55%)',
            },
        };

        projectItems.forEach((item, index) => {
            baseConfig[`project-${index}`] = {
                label: item.label,
                color: SOURCE_BREAKDOWN_COLORS[
                    index % SOURCE_BREAKDOWN_COLORS.length
                ],
            };
        });

        return baseConfig;
    }, [projectItems]);

    const projectChartData = useMemo(
        () =>
            projectItems.map((item, index) => ({
                name: item.label,
                amount: Number(item.amount ?? 0),
                fill: `var(--color-project-${index})`,
            })),
        [projectItems],
    );

    const activeChartRows = chartMode === 'weekly' ? weeklyRows : chartRows;

    const resolveTooltipLabel = (
        rawLabel: unknown,
        payload?: TooltipItem[],
    ) => {
        if (payload?.length) {
            const firstEntry = payload[0];
            const sourcePayload = firstEntry?.payload as
                | WeeklyChartRow
                | DailyChartRow
                | undefined;

            if (sourcePayload?.tooltipLabel) {
                return sourcePayload.tooltipLabel;
            }

            if (
                sourcePayload?.rangeLabel &&
                typeof sourcePayload.rangeLabel === 'string'
            ) {
                return sourcePayload.rangeLabel;
            }

            if (sourcePayload?.date instanceof Date) {
                return longDateFormatter.format(sourcePayload.date);
            }
        }

        const parsedDate = parseLabelToDate(rawLabel);

        if (parsedDate) {
            return longDateFormatter.format(parsedDate);
        }

        return rawLabel === null || rawLabel === undefined
            ? '-'
            : String(rawLabel);
    };

    const resolveBreakdownTooltipLabel = (payload?: TooltipItem[]) => {
        if (!payload?.length) {
            return '-';
        }

        for (const entry of payload) {
            const sourcePayload = entry?.payload as
                | { name?: unknown; label?: unknown }
                | undefined;

            const candidate = [
                sourcePayload?.name,
                sourcePayload?.label,
                entry?.name,
                entry?.dataKey,
            ].find(
                (value): value is string =>
                    typeof value === 'string' && value.trim().length > 0,
            );

            if (candidate) {
                return candidate;
            }
        }

        return '-';
    };

    const resolveTooltipColorFromItem = (item?: TooltipItem) => {
        if (!item) {
            return undefined;
        }

        if (typeof item.color === 'string' && item.color.trim().length > 0) {
            return item.color;
        }

        if (typeof item.payload === 'object' && item.payload !== null) {
            const payload = item.payload as Record<string, unknown>;
            const fill = payload.fill;
            const stroke = payload.stroke;

            if (typeof fill === 'string' && fill.trim().length > 0) {
                return fill;
            }

            if (typeof stroke === 'string' && stroke.trim().length > 0) {
                return stroke;
            }
        }

        return undefined;
    };

    const resolveTooltipValueMeta = (rawValue: unknown, item?: TooltipItem) => {
        const numericValue = Number(rawValue ?? 0) || 0;
        const color = resolveTooltipColorFromItem(item);

        return { numericValue, color };
    };

    const renderTooltipValue = (rawValue: unknown, item?: TooltipItem) => {
        const { numericValue, color } = resolveTooltipValueMeta(rawValue, item);

        return (
            <span className="flex items-center gap-2">
                <span
                    className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{
                        backgroundColor: color || 'var(--color-border)',
                    }}
                />
                <span className="font-mono font-medium">
                    {formatCurrency(numericValue)}
                </span>
            </span>
        );
    };

    const renderBreakdownTooltipLabelWithColor = (payload?: TooltipItem[]) => {
        const label = resolveBreakdownTooltipLabel(payload);

        return <span className="font-medium">{label}</span>;
    };

    const trendChartConfig = {
        amount: {
            label: 'Penerimaan',
            color: 'hsl(160 84% 39%)',
        },
    } as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Penerimaan" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                    <Heading
                        title="Detail Penerimaan"
                        description={headingDescription}
                    />

                    <div>
                        <ButtonGroup>
                            <Button
                                type="button"
                                className="cursor-pointer"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    handleNavigate(period?.navigation?.previous)
                                }
                                disabled={!period?.navigation?.previous}
                            >
                                <ChevronLeft />
                            </Button>
                            <ButtonGroupSeparator />
                            <Button
                                type="button"
                                className="text-xs text-muted-foreground"
                                variant="outline"
                                size="sm"
                            >
                                Menampilkan - {period?.label ?? '-'}
                            </Button>
                            <ButtonGroupSeparator />
                            <Button
                                type="button"
                                className="cursor-pointer"
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    handleNavigate(period?.navigation?.next)
                                }
                                disabled={!period?.navigation?.next}
                            >
                                <ChevronRight />
                            </Button>
                        </ButtonGroup>
                    </div>
                </div>

                <Card className="dark:bg-sidebar/50">
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100">
                                    <TrendingUp className="size-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Penerimaan
                                    </p>
                                    <p className="text-2xl font-semibold tracking-tight">
                                        {formatCurrency(
                                            summary?.total_amount ?? 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                            <ShoppingBag className="size-8 text-muted-foreground" />
                        </div>
                        <Separator />
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-col flex-wrap gap-6 text-sm md:flex-row">
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Jumlah Pelanggan
                                    </p>
                                    <p className="font-semibold">
                                        {summary?.customer_count ?? 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Jumlah Transaksi
                                    </p>
                                    <p className="font-semibold">
                                        {summary?.transaction_count ?? 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Rata-rata Transaksi
                                    </p>
                                    <p className="font-semibold">
                                        {formatCurrency(
                                            summary?.average_value ?? 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="w-full text-xs sm:w-50"
                                asChild
                            >
                                <Link
                                    href={financialStatement.profitLoss.url(
                                        queryParamsForReport
                                            ? { query: queryParamsForReport }
                                            : undefined,
                                    )}
                                >
                                    Lihat Laporan Laba Rugi
                                    <ArrowRight />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {['mom', 'yoy'].map((key) => {
                        const metric = comparisons?.[key as keyof Comparisons];
                        const isPositive = (metric?.growth ?? 0) > 0;
                        const chartConfig = {
                            growth: {
                                label:
                                    key === 'mom' ? 'MoM Growth' : 'YoY Growth',
                                color: isPositive
                                    ? 'hsl(160 84% 39%)'
                                    : 'hsl(346 77% 49%)',
                            },
                        } as const;
                        const IconComponent = isPositive
                            ? TrendingUp
                            : TrendingDown;
                        const normalizedValue = Math.min(
                            100,
                            Math.max(0, Math.abs(metric?.growth ?? 0)),
                        );
                        const radialData = [
                            {
                                name: chartConfig.growth.label,
                                value: normalizedValue,
                                fill: 'var(--color-growth)',
                            },
                        ];

                        return (
                            <div
                                key={key}
                                className={`rounded-xl p-6 text-white ${
                                    isPositive
                                        ? 'bg-gradient-to-tl from-emerald-500 to-sky-700'
                                        : 'bg-gradient-to-tl from-rose-500 to-indigo-500'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <ChartContainer
                                        config={chartConfig}
                                        className="aspect-square h-24 w-24"
                                    >
                                        <RadialBarChart
                                            data={radialData}
                                            startAngle={90}
                                            endAngle={450}
                                            innerRadius={40}
                                            outerRadius={80}
                                        >
                                            <PolarRadiusAxis
                                                tick={({ cx = 0, cy = 0 }) => (
                                                    <g
                                                        transform={`translate(${cx - 12}, ${cy - 12})`}
                                                    >
                                                        <IconComponent className="h-6 w-6 text-white" />
                                                    </g>
                                                )}
                                                axisLine={false}
                                                domain={[0, 100]}
                                                tickCount={1}
                                            />
                                            <RadialBar
                                                dataKey="value"
                                                background
                                                cornerRadius={24}
                                                fill="var(--color-growth)"
                                            />
                                        </RadialBarChart>
                                    </ChartContainer>
                                    <div className="grid">
                                        <p className="text-sm">
                                            {chartConfig.growth.label}
                                        </p>
                                        <p className="text-3xl font-semibold">
                                            {formatPercent(metric?.growth)}
                                        </p>
                                        <p className="text-xs">
                                            Dibandingkan periode{' '}
                                            {metric?.label ?? '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs">
                                            Penerimaan Saat Ini
                                        </p>
                                        <p className="font-medium">
                                            {formatCurrency(metric?.current)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs">
                                            Periode Referensi
                                        </p>
                                        <p className="font-medium">
                                            {formatCurrency(metric?.previous)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Tren Penerimaan</CardTitle>
                        <CardDescription>
                            Visualisasi tren penerimaan per hari atau pekan
                        </CardDescription>
                        <CardAction>
                            <Select
                                value={chartMode}
                                onValueChange={handleChartModeChange}
                            >
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Pilih mode data" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="daily">
                                        Berdasarkan Hari
                                    </SelectItem>
                                    <SelectItem value="weekly">
                                        Berdasarkan Pekan
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="me-6">
                        {activeChartRows.length === 0 ? (
                            <p className="py-16 text-center text-sm text-muted-foreground">
                                Belum ada data untuk mode ini.
                            </p>
                        ) : (
                            <ChartContainer
                                config={trendChartConfig}
                                className="h-[320px] w-full"
                            >
                                <BarChart data={activeChartRows}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(148, 163, 184, 0.4)"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={formatAxisValue}
                                    />
                                    <ChartTooltip
                                        cursor={{
                                            fill: 'var(--color-amount)',
                                            opacity: 0.08,
                                        }}
                                        content={
                                            <ChartTooltipContent
                                                labelFormatter={(
                                                    label,
                                                    payload,
                                                ) =>
                                                    resolveTooltipLabel(
                                                        label,
                                                        payload as
                                                            | TooltipItem[]
                                                            | undefined,
                                                    )
                                                }
                                                formatter={(
                                                    value,
                                                    name,
                                                    item,
                                                ) =>
                                                    renderTooltipValue(
                                                        value,
                                                        item as TooltipItem,
                                                    )
                                                }
                                            />
                                        }
                                    />
                                    <ChartLegend
                                        verticalAlign="bottom"
                                        align="left"
                                        content={<ChartLegendContent />}
                                    />
                                    <Bar
                                        dataKey="amount"
                                        fill="var(--color-amount)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={24}
                                    />
                                    {chartMode === 'daily' ? (
                                        <Line
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="var(--color-amount)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    ) : null}
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-6 dark:bg-sidebar/50">
                    <CardHeader>
                        <CardTitle>Sumber Penerimaan</CardTitle>
                        <CardDescription>
                            10 Sumber Penerimaan Teratas{' '}
                            {periodMonthLabel ? `- ${periodMonthLabel}` : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sourceChartData.length ? (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <ChartContainer
                                    config={sourceChartConfig}
                                    className="mx-auto aspect-square max-h-[300px] w-full"
                                >
                                    <RadialBarChart
                                        data={sourceChartData}
                                        innerRadius={30}
                                        outerRadius={120}
                                    >
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(
                                                        _label,
                                                        tooltipPayload,
                                                    ) =>
                                                        renderBreakdownTooltipLabelWithColor(
                                                            tooltipPayload as
                                                                | TooltipItem[]
                                                                | undefined,
                                                        )
                                                    }
                                                    nameKey="name"
                                                    formatter={(
                                                        value,
                                                        _name,
                                                        item,
                                                    ) =>
                                                        renderTooltipValue(
                                                            value,
                                                            item as TooltipItem,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <PolarGrid gridType="circle" />
                                        <RadialBar
                                            dataKey="amount"
                                            cornerRadius={8}
                                            background
                                        />
                                    </RadialBarChart>
                                </ChartContainer>
                                <div className="space-y-2 text-sm">
                                    {sourceItems.map((item, index) => (
                                        <div
                                            key={`${item.label}-${index}`}
                                            className="flex flex-col items-baseline justify-between gap-6 sm:flex-row"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="inline-flex h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            SOURCE_BREAKDOWN_COLORS[
                                                                index %
                                                                    SOURCE_BREAKDOWN_COLORS.length
                                                            ],
                                                    }}
                                                />
                                                <span className="font-medium">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <p className="text-right font-medium">
                                                {formatCurrency(item.amount)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                Belum ada data.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <Card className="dark:bg-sidebar/50">
                        <CardHeader>
                            <CardTitle>Departemen Teratas</CardTitle>
                            <CardDescription>
                                10 Penerimaan Departemen Teratas{' '}
                                {periodMonthLabel
                                    ? `- ${periodMonthLabel}`
                                    : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {departmentChartData.length ? (
                                <ChartContainer
                                    config={departmentChartConfig}
                                    className="mx-auto aspect-square max-h-[300px] w-full [&_.recharts-pie-label-text]:fill-foreground"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(
                                                        _label,
                                                        tooltipPayload,
                                                    ) =>
                                                        renderBreakdownTooltipLabelWithColor(
                                                            tooltipPayload as
                                                                | TooltipItem[]
                                                                | undefined,
                                                        )
                                                    }
                                                    nameKey="name"
                                                    formatter={(
                                                        value,
                                                        _name,
                                                        item,
                                                    ) =>
                                                        renderTooltipValue(
                                                            value,
                                                            item as TooltipItem,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <Pie
                                            data={departmentChartData}
                                            dataKey="amount"
                                            label
                                            nameKey="name"
                                            innerRadius={60}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada data.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="dark:bg-sidebar/50">
                        <CardHeader>
                            <CardTitle>Proyek Teratas</CardTitle>
                            <CardDescription>
                                10 Penerimaan Proyek Teratas{' '}
                                {periodMonthLabel
                                    ? `- ${periodMonthLabel}`
                                    : ''}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {projectChartData.length ? (
                                <ChartContainer
                                    config={projectChartConfig}
                                    className="mx-auto aspect-square max-h-[300px] w-full"
                                >
                                    <PieChart>
                                        <ChartTooltip
                                            content={
                                                <ChartTooltipContent
                                                    labelFormatter={(
                                                        _label,
                                                        tooltipPayload,
                                                    ) =>
                                                        renderBreakdownTooltipLabelWithColor(
                                                            tooltipPayload as
                                                                | TooltipItem[]
                                                                | undefined,
                                                        )
                                                    }
                                                    nameKey="name"
                                                    formatter={(
                                                        value,
                                                        _name,
                                                        item,
                                                    ) =>
                                                        renderTooltipValue(
                                                            value,
                                                            item as TooltipItem,
                                                        )
                                                    }
                                                />
                                            }
                                        />
                                        <Pie
                                            data={projectChartData}
                                            dataKey="amount"
                                            nameKey="name"
                                            innerRadius={60}
                                        />
                                    </PieChart>
                                </ChartContainer>
                            ) : (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Belum ada data.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
