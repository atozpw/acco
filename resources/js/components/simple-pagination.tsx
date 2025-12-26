import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export type SimplePaginateProps = {
    prevHref?: string | null;
    nextHref?: string | null;
};

/**
 * SimplePaginate
 * Reusable prev/next pagination control using shadcn Button + Inertia Link.
 */
export default function SimplePaginate({
    prevHref,
    nextHref,
}: SimplePaginateProps) {
    return (
        <div className="flex items-center space-x-2">
            <Button asChild className="size-9" variant="outline" disabled>
                <Link
                    href={prevHref ? prevHref : '#'}
                    className={cn(
                        !prevHref &&
                            'pointer-events-none cursor-not-allowed opacity-50',
                    )}
                    aria-disabled={!prevHref}
                    tabIndex={!prevHref ? -1 : undefined}
                >
                    <span className="sr-only">Previous Page</span>
                    <Icon iconNode={ChevronLeftIcon} className="size-5" />
                </Link>
            </Button>
            <Button asChild className="size-9" variant="outline" aria-disabled>
                <Link
                    href={nextHref ? nextHref : '#'}
                    className={cn(
                        !nextHref &&
                            'pointer-events-none cursor-not-allowed opacity-50',
                    )}
                    aria-disabled={!nextHref}
                    tabIndex={!nextHref ? -1 : undefined}
                >
                    <span className="sr-only">Next Page</span>
                    <Icon iconNode={ChevronRightIcon} className="size-5" />
                </Link>
            </Button>
        </div>
    );
}
