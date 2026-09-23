import { router } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Search } from 'lucide-react';

import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';

interface SearchInputProps {
    href: NonNullable<InertiaLinkProps['href']>;
    filters: any;
    placeholder?: string;
}

const SearchInput = ({ href, filters, placeholder }: SearchInputProps) => {
    const [search, setSearch] = useState(filters.search || '');
    const [loading, setLoading] = useState<boolean>(false);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(
            href,
            { ...filters, search: value },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                // only: ['data'],
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    }, 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            debouncedSearch(search);
        }
    };

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    return (
        <div className="relative w-full">
            {/* Lucide Search Icon positioned absolute inside the input container */}
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            {/* Shadcn UI Input Component */}
            <Input
                type="text"
                value={search}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-background pl-9"
            />

            {loading && (
                <div className="absolute top-2.5 right-2.5">
                    <Spinner className="h-4 w-4" />
                </div>
            )}
        </div>
    );
};

export default SearchInput;
