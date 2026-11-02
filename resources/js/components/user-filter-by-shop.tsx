import { Check, ChevronsUpDown, Store } from 'lucide-react';
import { useState } from 'react';

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
import type { StaffShop } from '@/lib/staff';
import { cn } from '@/lib/utils';

const ShopFilter = ({
    shops,
    value,
    onChange,
}: {
    shops: StaffShop[];
    value: string;
    onChange: (uuid: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const selected = shops.find((shop) => shop.uuid === value);

    const select = (uuid: string) => {
        onChange(uuid);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full cursor-pointer justify-between bg-background font-normal"
                >
                    <span className="flex min-w-0 items-center gap-2">
                        <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                            {selected?.name ?? 'All shops'}
                        </span>
                    </span>
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-(--radix-popover-trigger-width) p-0"
            >
                <Command>
                    <CommandInput placeholder="Search shop..." />
                    <CommandList>
                        <CommandEmpty>No shop found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all shops"
                                onSelect={() => select('')}
                            >
                                <Check
                                    className={cn(
                                        'h-4 w-4',
                                        value ? 'opacity-0' : 'opacity-100',
                                    )}
                                />
                                All shops
                            </CommandItem>

                            {shops.map((shop) => (
                                <CommandItem
                                    key={shop.uuid}
                                    value={shop.name}
                                    onSelect={() => select(shop.uuid)}
                                >
                                    <Check
                                        className={cn(
                                            'h-4 w-4',
                                            value === shop.uuid
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    {shop.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default ShopFilter;
