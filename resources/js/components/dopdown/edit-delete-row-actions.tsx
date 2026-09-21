import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RowActionsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    editLabel?: string;
    deleteLabel?: string;
}

export const EditDeleteRowActions = ({
    onEdit,
    onDelete,
    editLabel = 'Edit',
    deleteLabel = 'Delete',
}: RowActionsProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {onEdit && (
                    <DropdownMenuItem
                        onClick={onEdit}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{editLabel}</span>
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <DropdownMenuItem
                        onClick={onDelete}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{deleteLabel}</span>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
