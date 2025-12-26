/**
 * Reusable debounce hooks for React (Next.js 16 / modern React best practice).
 *
 * Provides:
 *  - useDebounceValue: returns a debounced value that updates after `delay` ms.
 *  - useDebouncedCallback: returns a debounced function with `cancel` & `flush` helpers and optional `maxWait`.
 *
 * Features / Best Practices:
 *  - Typed generics for values & callback.
 *  - Stable references via useCallback / useMemo.
 *  - SSR-safe (no direct access to browser-only APIs during render phase).
 *  - Optional `maxWait` ensures function runs at least once within the specified timeframe.
 *  - Cancel & Flush controls for imperative needs (e.g., on route change, unmount, manual trigger).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Debounce a changing value. Useful for search inputs.
 * @example
 * const debouncedSearch = useDebounceValue(search, 400);
 */
export function useDebounceValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const handle = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handle);
    }, [value, delay]);

    return debounced;
}

export interface DebouncedCallbackOptions {
    /** Ensure the callback executes at least once within this timeframe (ms). */
    maxWait?: number;
}

export interface DebouncedCallbackControls<R> {
    /** Cancel any pending execution (does not call the original fn). */
    cancel: () => void;
    /** Immediately invoke pending execution with last args and clear timers. */
    flush: () => R | undefined;
}

export interface DebouncedFn<F extends (...args: unknown[]) => unknown>
    extends DebouncedCallbackControls<ReturnType<F>> {
    /** Invoke the debounced function with arguments. */
    callback: (...args: Parameters<F>) => void;
}

/**
 * Create a debounced version of a callback.
 * @example
 * const save = useDebouncedCallback((payload) => api.save(payload), 500, { maxWait: 2000 });
 * // usage
 * save.callback(formState);
 * // cancel on unmount or route change if required
 * useEffect(() => () => save.cancel(), [save]);
 */
export function useDebouncedCallback<F extends (...args: unknown[]) => unknown>(
    fn: F,
    delay: number,
    options: DebouncedCallbackOptions = {},
): DebouncedFn<F> {
    const { maxWait } = options;
    const fnRef = useRef<F>(fn);
    const argsRef = useRef<Parameters<F> | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number | null>(null);

    // Keep latest fn without re-registering timers.
    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        startTimeRef.current = null;
    }, []);

    const flush: () => ReturnType<F> | undefined = useCallback(() => {
        if (!argsRef.current) return undefined;
        const args = argsRef.current;
        cancel();
        return fnRef.current(...args) as ReturnType<F>;
    }, [cancel]);

    const schedule = useCallback(() => {
        if (!argsRef.current) return;
        const now = Date.now();
        if (startTimeRef.current == null) {
            startTimeRef.current = now;
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If maxWait is set, ensure we don't exceed it.
        if (maxWait != null && startTimeRef.current != null) {
            const deadline = startTimeRef.current + maxWait;
            const remaining = deadline - now;
            if (remaining <= delay) {
                // Execute at the maxWait deadline.
                timeoutRef.current = setTimeout(flush, remaining);
                return;
            }
        }

        timeoutRef.current = setTimeout(flush, delay);
    }, [delay, maxWait, flush]);

    const debounced = useCallback(
        (...args: Parameters<F>) => {
            argsRef.current = args;
            schedule();
        },
        [schedule],
    );

    // Auto-clean timers on unmount.
    useEffect(() => cancel, [cancel]);

    return { callback: debounced, cancel, flush };
}

/**
 * Convenience hook combining input state + debounced value.
 * @example
 * const { value, setValue, debounced } = useDebouncedInput('', 300);
 */
export function useDebouncedInput<T>(initial: T, delay = 300) {
    const [value, setValue] = useState<T>(initial);
    const debounced = useDebounceValue(value, delay);
    return { value, setValue, debounced };
}
