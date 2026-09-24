import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePermission } from '@/hooks/use-permission';
import { resolveUrl } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from './ui/collapsible';

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

export function NavMain({
    items = [],
    showLabel = false,
    labelGroup,
}: {
    items: NavItem[];
    showLabel?: boolean;
    labelGroup?: string;
}) {
    const page = usePage<SharedData>();
    const { hasPermission } = usePermission();
    const filteredItems = filterNavItemsByPermission(items, hasPermission);

    const isUrlActive = (href: NonNullable<NavItem['href']>) => {
        const itemUrl = resolveUrl(href);
        if (!itemUrl || itemUrl === '#') return false;

        if (itemUrl === '/' || itemUrl === '') {
            const currentPath = page.url.split('?')[0];
            return (
                currentPath === '/' ||
                currentPath === '' ||
                currentPath === '/profit-loss' ||
                currentPath === '/detail-revenue' ||
                currentPath === '/detail-expense'
            );
        }

        return page.url.startsWith(itemUrl);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            {showLabel && labelGroup && (
                <SidebarGroupLabel>{labelGroup}</SidebarGroupLabel>
            )}
            <SidebarMenu>
                {filteredItems.map((item) => {
                    const isParentActive = isUrlActive(item.href);
                    const isAnyChildActive = item.children?.some((subItem) =>
                        isUrlActive(subItem.href),
                    );
                    const isGroupActive = Boolean(
                        isParentActive || isAnyChildActive,
                    );

                    return item.children ? (
                        <Collapsible
                            key={item.title}
                            asChild
                            defaultOpen={isGroupActive}
                            className="group/collapsible"
                        >
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={item.title}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {item.children.map((subItem) => (
                                            <SidebarMenuSubItem
                                                key={subItem.title}
                                            >
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={isUrlActive(
                                                        subItem.href,
                                                    )}
                                                >
                                                    <Link
                                                        href={subItem.href}
                                                        prefetch
                                                    >
                                                        {subItem.title}
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    ) : (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isUrlActive(item.href)}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
