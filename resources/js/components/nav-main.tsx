import {
    SidebarGroup,
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

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage<SharedData>();
    const { hasPermission } = usePermission();
    const filteredItems = filterNavItemsByPermission(items, hasPermission);
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {filteredItems.map((item) => {
                    const isParentActive = page.url.startsWith(
                        resolveUrl(item.href),
                    );
                    const isAnyChildActive = item.children?.some((subItem) =>
                        page.url.startsWith(resolveUrl(subItem.href)),
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
                                                    isActive={page.url.startsWith(
                                                        resolveUrl(
                                                            subItem.href,
                                                        ),
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
                                isActive={page.url.startsWith(
                                    resolveUrl(item.href),
                                )}
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
