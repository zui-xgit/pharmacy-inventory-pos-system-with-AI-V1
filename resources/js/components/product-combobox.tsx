import { router } from '@inertiajs/react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ProductOption {
    uuid: string;
    name: string;
    dosage_form: { name: string };
}

interface ProductComboboxProps<T extends ProductOption> {
    products?: T[] | null;
    selected: T | null;
    onSelect: (product: T | null) => void;
    searchUrl: Parameters<typeof router.get>[0];
    filters: Record<string, unknown>;
}

const ProductCombobox = <T extends ProductOption>({
    products,
    selected,
    onSelect,
    searchUrl,
    filters,
}: ProductComboboxProps<T>) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const options = products ?? [];

    useEffect(() => () => clearTimeout(timer.current), []);

    const handleSearch = (value: string) => {
        setQuery(value);
        clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            router.get(
                searchUrl,
                { ...filters, search: value },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);
    };

    const choose = (product: T) => {
        onSelect(product);
        setOpen(false);
    };

    return (
        <div className="flex items-center gap-1.5">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="min-w-0 flex-1 cursor-pointer justify-between bg-background font-normal"
                    >
                        {selected ? (
                            <span className="flex min-w-0 items-center gap-2">
                                <span className="truncate font-medium">
                                    {selected.name}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="h-4 shrink-0 py-0 text-[10px]"
                                >
                                    {selected.dosage_form.name}
                                </Badge>
                            </span>
                        ) : (
                            <span className="text-muted-foreground">
                                Search product...
                            </span>
                        )}
                        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) p-0"
                >
                    <Command shouldFilter={false}>
                        <CommandInput
                            value={query}
                            onValueChange={handleSearch}
                            placeholder="Type a product name..."
                        />
                        <CommandList>
                            <CommandEmpty>
                                {query
                                    ? 'No matching products found.'
                                    : 'Start typing to search products.'}
                            </CommandEmpty>

                            {options.length > 0 && (
                                <CommandGroup
                                    heading={`Available products (${options.length})`}
                                >
                                    {options.map((product) => (
                                        <CommandItem
                                            key={product.uuid}
                                            value={product.uuid}
                                            onSelect={() => choose(product)}
                                            className="justify-between gap-2"
                                        >
                                            <span className="flex min-w-0 items-center gap-2">
                                                <Check
                                                    className={cn(
                                                        'h-4 w-4 shrink-0',
                                                        selected?.uuid ===
                                                            product.uuid
                                                            ? 'opacity-100'
                                                            : 'opacity-0',
                                                    )}
                                                />
                                                <span className="truncate">
                                                    {product.name}
                                                </span>
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className="shrink-0 bg-background py-0 text-[10px]"
                                            >
                                                {product.dosage_form.name}
                                            </Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selected && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Clear product"
                    onClick={() => onSelect(null)}
                    className="shrink-0 cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
};

export default ProductCombobox;
