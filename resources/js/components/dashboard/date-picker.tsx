'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    value?: string | null;
    onChange: (dateString: string) => void;
    placeholder?: string;
}

const DatePicker = ({
    value,
    onChange,
    placeholder = 'Pick a date',
}: DatePickerProps) => {
    // Convert string date back to local Date object for shadcn calendar tracking
    const dateValue = value ? new Date(value) : undefined;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" data-empty={!value}>
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {dateValue ? (
                        format(dateValue, 'PPP')
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={dateValue}
                    captionLayout="dropdown"

                    onSelect={(date) => {
                        if (date) {
                            // Standardizes date format to YYYY-MM-DD for form presentation/DB entry
                            onChange(format(date, 'yyyy-MM-dd'));
                        } else {
                            onChange('');
                        }
                    }}

                    // Sets the historical boundary to January, 10 years ago
                    startMonth={new Date(new Date().getFullYear() - 10, 0)}
                    // Sets the forward boundary to the current month
                    endMonth={new Date(new Date().getFullYear() + 10, 0)}
                />
            </PopoverContent>
        </Popover>
    );
};

export default DatePicker;
