"use client";

import { deleteBookingAction } from "@/actions/booking/delete-booking-action";
import { updateBookingAction } from "@/actions/booking/update-booking-action";
import { TravelExportCSV } from "@/components/travel/travel-export-csv";
import { TravelStatus } from "@/components/travel/travel-status";
import { useTravelParams } from "@/hooks/use-travel-params";
import { formatAmount, secondsToHoursAndMinutes } from "@/utils/format";
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
} from "@travelese/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@travelese/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@travelese/ui/dropdown-menu";
import { Icons } from "@travelese/ui/icons";
import { TableCell, TableRow } from "@travelese/ui/table";
import { useToast } from "@travelese/ui/use-toast";
import { useAction } from "next-safe-action/hooks";
import type { TravelBooking } from "./data-table";

type DataTableCellProps = {
  children: React.ReactNode;
  className?: string;
};

export function DataTableCell({ children, className }: DataTableCellProps) {
  return <TableCell className={className}>{children}</TableCell>;
}

type RowProps = {
  onClick: () => void;
  children: React.ReactNode;
};

export function Row({ onClick, children }: RowProps) {
  return (
    <TableRow className="h-[45px]" onClick={onClick}>
      {children}
    </TableRow>
  );
}

type DataTableRowProps = {
  row: TravelBooking;
  userId: string;
};

export function DataTableRow({ row, userId }: DataTableRowProps) {
  const { toast } = useToast();
  const { setParams } = useTravelParams();

  const deleteAction = useAction(deleteBookingAction, {
    onError: () => {
      toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  const updateAction = useAction(updateBookingAction, {
    onError: () => {
      toast({
        duration: 2500,
        variant: "error",
        title: "Something went wrong please try again.",
      });
    },
  });

  return (
    <AlertDialog>
      <DropdownMenu>
        <Row onClick={() => setParams({ bookingId: row.id })}>
          <DataTableCell>{row.name}</DataTableCell>
          <DataTableCell>
            <span className="text-sm">
              {row.estimate
                ? `${secondsToHoursAndMinutes(row.total_duration)} / ${secondsToHoursAndMinutes(row.estimate * 3600)}`
                : secondsToHoursAndMinutes(row?.total_duration)}
            </span>
          </DataTableCell>
          <DataTableCell>
            <span className="text-sm">
              {formatAmount({
                currency: row.currency,
                amount: row.total_amount,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </DataTableCell>
          <DataTableCell>{row.description}</DataTableCell>
          <DataTableCell>
            <div className="flex items-center space-x-2">
              {row.users?.map((user) => (
                <Avatar key={user.user_id} className="size-4">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-[10px]">
                    {user.full_name?.slice(0, 1)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </DataTableCell>
          <DataTableCell>
            <div className="flex justify-between items-center">
              <TravelStatus status={row.status} />

              <DropdownMenuTrigger>
                <Icons.MoreHoriz />
              </DropdownMenuTrigger>
            </div>
          </DataTableCell>
        </Row>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAction.execute({ id: row.id })}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        <DropdownMenuContent className="w-42" sideOffset={10} align="end">
          <DropdownMenuItem
            onClick={() => setParams({ update: true, bookingId: row.id })}
          >
            Edit
          </DropdownMenuItem>

          <TravelExportCSV
            name={row.name}
            bookingId={row.id}
            currency={row.currency}
            billable={row.billable}
            rate={row.rate}
            teamId={row.team_id}
            userId={userId}
          />

          {row.status !== "completed" && (
            <DropdownMenuItem
              onClick={() =>
                updateAction.execute({
                  id: row.id,
                  status: "completed",
                })
              }
            >
              Mark as complete
            </DropdownMenuItem>
          )}

          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
    </AlertDialog>
  );
}
