import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, resolveUrl } from '@/lib/utils';
import { usePermission } from '@/hooks/use-permission';
import beginningBalance from '@/routes/beginning-balance';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Akun',
        href: beginningBalance.account.index.url(),
        icon: null,
        permissions: ['account-beginning-balance.index'],
    },
    {
        title: 'Piutang Usaha',
        href: beginningBalance.receivable.index.url(),
        icon: null,
        permissions: ['receivable-beginning-balance.index'],
    },
    {
        title: 'Utang Usaha',
        href: beginningBalance.payable.index.url(),
        icon: null,
        permissions: ['payable-beginning-balance.index'],
    },
    {
        title: 'Persediaan',
        href: beginningBalance.inventory.index.url(),
        icon: null,
        permissions: ['inventory-beginning-balance.index'],
    },
];

const filterNavItemsByPermission = (
    navItems: NavItem[],
    hasPermission: (permissions?: string[]) => boolean,
): NavItem[] =>
    navItems
        .map((item) => {
            if (item.children?.length) {
                const allowedChildren = filterNavItemsByPermission(
                    item.children,
                    hasPermission,
                );

                if (
                    !allowedChildren.length &&
                    !hasPermission(item.permissions)
                ) {
                    return null;
                }

                return {
                    ...item,
                    children: allowedChildren,
                };
            }

            return hasPermission(item.permissions) ? item : null;
        })
        .filter((item): item is NavItem => Boolean(item));

export default function BeginningBalanceLayout({
    children,
}: PropsWithChildren) {
    const page = usePage();
    const { hasPermission } = usePermission();
    const filteredItems = filterNavItemsByPermission(sidebarNavItems, hasPermission);

    return (
        <div className="px-4 py-6">
            <Heading title="Saldo Awal" description="Atur dan isi saldo awal" />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {filteredItems.map((item, index) => (
                            <Button
                                key={`${resolveUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': page.url.startsWith(
                                        resolveUrl(item.href),
                                    ),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-7xl">
                    <section className="max-w-7xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
