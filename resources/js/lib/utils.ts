import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format a date string or Date object into a standard localized string.
 * Default output: "Sep 22, 2026"  AI GENERATED
 */
export function formatDate(
    date: string | number | Date | null | undefined,
    options?: Intl.DateTimeFormatOptions,
): string {
    if (!date) return 'N/A';

    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };

    return new Intl.DateTimeFormat('en-US', options ?? defaultOptions).format(
        d,
    );
}

/**
 * Format a date string or Date object including the time.
 * Default output: "Sep 22, 2026, 9:50 PM"
 */
export function formatDateTime(
    date: string | number | Date | null | undefined,
): string {
    return formatDate(date, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

/**
 * Format a date strictly for inputs or backend API calls.
 * Output: "2026-09-22"
 */
export function formatForBackend(
    date: string | number | Date | null | undefined,
): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    // Use Sweden locale ('sv-SE') because it natively outputs ISO 8601 (YYYY-MM-DD)
    return new Intl.DateTimeFormat('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(d);
}

/**
 * Check if a given date is expired compared to today.
 */
export function isExpired(date: string | Date): boolean {
    const d = new Date(date);
    const today = new Date();
    // Strip time from today for an accurate day-level comparison
    today.setHours(0, 0, 0, 0);

    return d < today;
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);
};
