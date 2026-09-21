import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmAlertDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: React.ReactNode;
    actionText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    actionClassName?: string;
}

export function ConfirmAlertDialog({
    trigger,
    title,
    description,
    actionText = 'Continue',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    open,
    onOpenChange,
    actionClassName,
}: ConfirmAlertDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    {/* <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <AlertCircle />
                    </AlertDialogMedia> */}
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={actionClassName}
                    >
                        {actionText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
