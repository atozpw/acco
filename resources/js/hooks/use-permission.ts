import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export type HasPermissionFn = (required?: string[]) => boolean;

export function usePermission() {
    const page = usePage<SharedData>();
    const userPermissions = useMemo(
        () => page.props.auth?.can ?? [],
        [page.props.auth?.can],
    );

    const hasPermission = useCallback<HasPermissionFn>(
        (required) => {
            if (!required?.length) {
                return true;
            }

            return required.some((permission) =>
                userPermissions.includes(permission),
            );
        },
        [userPermissions],
    );

    return { hasPermission, userPermissions };
}
