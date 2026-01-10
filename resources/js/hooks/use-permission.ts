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
    const userRoles = page.props.auth?.user?.roles;
    const isSuperAdmin = useMemo(
        () =>
            Array.isArray(userRoles) &&
            userRoles.some(
                (role) =>
                    typeof role?.name === 'string' &&
                    role.name.toLowerCase() === 'superadmin',
            ),
        [userRoles],
    );

    const hasPermission = useCallback<HasPermissionFn>(
        (required) => {
            if (isSuperAdmin) {
                return true;
            }

            if (!required?.length) {
                return true;
            }

            return required.some((permission) =>
                userPermissions.includes(permission),
            );
        },
        [isSuperAdmin, userPermissions],
    );

    return { hasPermission, userPermissions };
}
