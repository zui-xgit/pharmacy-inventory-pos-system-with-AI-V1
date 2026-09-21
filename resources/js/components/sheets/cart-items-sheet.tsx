// cart-item-sheet.tsx
import React, { ReactNode, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet'; // Adjust import path to your UI library

interface CartItemSheetProps {
    /** Custom trigger element passed from the parent */
    trigger: ReactNode;
    /** Title displayed at the top of the sheet */
    title?: string;
    /** Description or subtitle */
    description?: string;
    /** Content to render inside the sheet body */
    children?: ReactNode;
    /** Optional custom footer actions */
    footer?: ReactNode;
    /** Controlled open state (optional) */
    open?: boolean;
    /** Callback when open state changes (optional) */
    onOpenChange?: (open: boolean) => void;
}

export const CartItemSheet: React.FC<CartItemSheetProps> = ({
    trigger,
    title = 'Shopping Cart',
    description = 'Review your items before proceeding to checkout.',
    children,
    footer,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}) => {
    const [internalOpen, setInternalOpen] = useState(false);

    // Allow component to work as both controlled and uncontrolled
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const handleOpenChange = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalOpen(newOpen);
        }
        setControlledOpen?.(newOpen);
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent className="flex w-full flex-col justify-between sm:max-w-lg">
                <div className="flex-1 overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>{title}</SheetTitle>
                        {description && (
                            <SheetDescription>{description}</SheetDescription>
                        )}
                    </SheetHeader>

                    {/* Sheet Body Content */}
                    <div className="py-2">{children}</div>
                </div>

                {/* Optional Footer */}
                {footer && (
                    <SheetFooter className="mt-auto border-t pt-4">
                        {footer}
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
};
