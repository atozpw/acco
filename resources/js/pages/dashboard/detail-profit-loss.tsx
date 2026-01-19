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
import AppLayout from '@/layouts/app-layout';
import { dashboard as dashboardRoute } from '@/routes';
import dashboard from '@/routes/dashboard';
import financialStatement from '@/routes/financial-statement';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChartNoAxesCombined,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    ShoppingBag,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { TooltipProps } from 'recharts';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Line,
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
        title: 'Detail Keuntungan',
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
    income: number;
    expense: number;
    net_profit: number;
};

type Margins = {
    gross: number | null;
    operating: number | null;
    net: number | null;
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
    income: number[];
    expense: number[];
    net_profit: number[];
};

type DetailChart = {
    labels: string[];
    series: ChartSeries;
};

type DetailFilters = {
    month: number;
    year: number;
};

type PageProps = {
    period: DetailPeriod;
    summary: Summary;
    margins: Margins;
    comparisons: Comparisons;
    chart: DetailChart;
    filters: DetailFilters;
};

type TooltipItem = NonNullable<TooltipProps<number, string>['payload']>[number];

type DailyChartRow = {
    label: string;
    income: number;
    expense: number;
    net_profit: number;
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

const normalizeGrowthValue = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return 0;
    }

    return Math.min(100, Math.max(0, Math.abs(value)));
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
    const diff = day === 0 ? 6 : day - 1; // Monday as start of week
    start.setDate(start.getDate() - diff);
    return start;
};

export default function DetailProfitLossPage({
    period,
    summary,
    margins,
    comparisons,
    chart,
    filters,
}: PageProps) {
    const [chartMode, setChartMode] = useState<'daily' | 'weekly'>('daily');
    const { url } = usePage();
    const headingDescription = period?.label
        ? `Keuntungan Bulan - ${period.label}`
        : 'Keuntungan Bulan';

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
                    value?.toString() ?? '',
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

        router.get(dashboard.profitLoss.url(), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const chartRows = useMemo<DailyChartRow[]>(() => {
        const labels = chart?.labels ?? [];
        const incomeSeries = chart?.series?.income ?? [];
        const expenseSeries = chart?.series?.expense ?? [];
        const netSeries = chart?.series?.net_profit ?? [];

        return labels.map((label, index) => ({
            label,
            income: incomeSeries[index] ?? 0,
            expense: expenseSeries[index] ?? 0,
            net_profit: netSeries[index] ?? 0,
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
                        income: 0,
                        expense: 0,
                        net_profit: 0,
                    });
                }

                const entry = weekMap.get(key);
                if (entry) {
                    entry.income += row.income;
                    entry.expense += row.expense;
                    entry.net_profit += row.net_profit;
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
                    income: 0,
                    expense: 0,
                    net_profit: 0,
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
            bucket.income += row.income;
            bucket.expense += row.expense;
            bucket.net_profit += row.net_profit;
        });

        return buckets;
    }, [chartRows, period?.month, period?.year, periodMonthLabel]);

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

    const renderTooltipValue = (rawValue: unknown, item?: TooltipItem) => {
        const numericValue = Number(rawValue ?? 0) || 0;
        const colorSource =
            item?.color ??
            (typeof item?.payload === 'object' && item?.payload !== null
                ? (((item.payload as Record<string, unknown>)
                      .stroke as string) ??
                  ((item.payload as Record<string, unknown>).fill as string))
                : undefined);

        return (
            <span className="flex items-center gap-2">
                <span
                    className="inline-flex h-2.5 w-2.5 rounded-full"
                    style={{
                        backgroundColor: colorSource || 'var(--color-border)',
                    }}
                />
                <span className="font-mono font-medium">
                    {formatCurrency(numericValue)}
                </span>
            </span>
        );
    };

    const metricCards = [
        {
            key: 'income',
            label: 'Penerimaan',
            value: summary?.income ?? 0,
            icon: TrendingUp,
            accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100',
            secondIcon: ShoppingBag,
        },
        {
            key: 'expense',
            label: 'Pengeluaran',
            value: summary?.expense ?? 0,
            icon: TrendingDown,
            accent: 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-100',
            secondIcon: ShoppingCart,
        },
    ];

    const trendChartConfig = {
        net_profit: {
            label: 'Keuntungan',
            color: 'hsl(217 91% 60%)',
        },
        income: {
            label: 'Penerimaan',
            color: 'hsl(160 84% 39%)',
        },
        expense: {
            label: 'Pengeluaran',
            color: 'hsl(346 77% 49%)',
        },
    } as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Detail Keuntungan" />

            <div className="px-5 py-6">
                <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                    <Heading
                        title="Detail Keuntungan"
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

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
                        <Card className="px-0 py-0 md:col-span-2 dark:bg-sidebar/50">
                            <CardContent className="my-auto p-6">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex flex-row items-start gap-4">
                                        <div className="rounded-xl bg-sky-50 p-2 text-sky-600 dark:bg-sky-500/20 dark:text-sky-100">
                                            <DollarSign className="size-5" />
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <div className="text-sm text-muted-foreground">
                                                Keuntungan
                                            </div>
                                            <p className="text-2xl font-semibold tracking-tight">
                                                {formatCurrency(
                                                    summary?.net_profit ?? 0,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <ChartNoAxesCombined className="size-8 text-muted-foreground" />
                                </div>
                            </CardContent>
                        </Card>
                        {metricCards.map((card) => {
                            const IconComponent = card.icon;
                            const SeconIconComponent = card.secondIcon;
                            return (
                                <Card
                                    key={card.key}
                                    className="px-0 py-0 dark:bg-sidebar/50"
                                >
                                    <CardContent className="my-auto p-6">
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex flex-row items-start gap-4">
                                                <div
                                                    className={`rounded-xl p-2 ${card.accent}`}
                                                >
                                                    <IconComponent className="size-5" />
                                                </div>
                                                <div className="flex flex-1 flex-col">
                                                    <div className="text-sm text-muted-foreground">
                                                        {card.label}
                                                    </div>
                                                    <p className="text-lg font-semibold tracking-tight">
                                                        {formatCurrency(
                                                            card.value,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <SeconIconComponent className="size-6 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                    <Card className="gap-4 bg-secondary/50">
                        <CardHeader>
                            <CardTitle>Margin Ringkas</CardTitle>
                            <CardDescription className="text-xs">
                                Perbandingan profitabilitas berdasarkan
                                komposisi pendapatan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-1.5">
                                {[
                                    {
                                        label: 'Gross Margin',
                                        value: margins?.gross,
                                    },
                                    {
                                        label: 'Operating Margin',
                                        value: margins?.operating,
                                    },
                                    {
                                        label: 'Net Margin',
                                        value: margins?.net,
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex justify-between gap-4"
                                    >
                                        <p className="text-xs text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-end text-sm font-medium">
                                            {formatPercent(item.value)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                className="mt-4 w-full text-xs"
                                asChild
                            >
                                <Link
                                    href={financialStatement.profitLoss.url(
                                        queryParamsForReport
                                            ? { query: queryParamsForReport }
                                            : undefined,
                                    )}
                                >
                                    Lihat Laporan Laba Rugi <ArrowRight />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {[
                        {
                            label: 'MoM Growth',
                            metric: comparisons?.mom,
                        },
                        {
                            label: 'YoY Growth',
                            metric: comparisons?.yoy,
                        },
                    ].map((item) => {
                        const growthValue = item.metric?.growth ?? 0;
                        const normalizedValue = normalizeGrowthValue(
                            item.metric?.growth,
                        );
                        const isPositive = growthValue > 0;
                        const chartConfig = {
                            growth: {
                                label: item.label,
                                color: isPositive
                                    ? 'hsl(160 84% 39%)'
                                    : 'hsl(346 77% 49%)',
                            },
                        } as const;
                        const IconComponent = isPositive
                            ? TrendingUp
                            : TrendingDown;
                        const iconFillClass = isPositive
                            ? 'text-emerald-200'
                            : 'text-rose-200';
                        const radialData = [
                            {
                                name: item.label,
                                value: normalizedValue,
                                fill: 'var(--color-growth)',
                            },
                        ];

                        return (
                            <div
                                key={item.label}
                                className={`rounded-xl p-6 ${
                                    isPositive
                                        ? 'bg-gradient-to-tl from-emerald-500 to-sky-700 text-white dark:from-emerald-500/30 dark:to-sky-500/30'
                                        : 'bg-gradient-to-tl from-rose-500 to-indigo-500 text-white dark:from-rose-500/30 dark:to-indigo-500/30'
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
                                                        <IconComponent
                                                            className={`h-6 w-6 ${iconFillClass}`}
                                                        />
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
                                        <p className="text-sm">{item.label}</p>
                                        <p className="text-3xl font-semibold">
                                            {formatPercent(item.metric?.growth)}
                                        </p>
                                        <p className="text-xs">
                                            Dibandingkan periode{' '}
                                            {item.metric?.label ?? '-'}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs">
                                            Keuntungan Saat Ini
                                        </p>
                                        <p className="font-medium">
                                            {formatCurrency(
                                                item.metric?.current,
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs">
                                            Periode Referensi
                                        </p>
                                        <p className="font-medium">
                                            {formatCurrency(
                                                item.metric?.previous,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Tren Keuntungan</CardTitle>
                        <CardDescription>
                            Visualisasi tren keuntungan, penerimaan, dan
                            pengeluaran per hari atau pekan
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
                        ) : chartMode === 'daily' ? (
                            <ChartContainer
                                config={trendChartConfig}
                                className="h-[320px] w-full"
                            >
                                <ComposedChart data={chartRows}>
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
                                            fill: 'var(--color-net_profit)',
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
                                        dataKey="net_profit"
                                        fill="var(--color-net_profit)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={24}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        stroke="var(--color-income)"
                                        strokeWidth={2}
                                        dot={true}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="var(--color-expense)"
                                        strokeWidth={2}
                                        dot={true}
                                    />
                                </ComposedChart>
                            </ChartContainer>
                        ) : (
                            <ChartContainer
                                config={trendChartConfig}
                                className="h-[320px] w-full"
                            >
                                <BarChart data={weeklyRows}>
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
                                            fill: 'var(--color-net_profit)',
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
                                        dataKey="net_profit"
                                        fill="var(--color-net_profit)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={22}
                                    />
                                    <Bar
                                        dataKey="income"
                                        fill="var(--color-income)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={22}
                                    />
                                    <Bar
                                        dataKey="expense"
                                        fill="var(--color-expense)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={22}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
