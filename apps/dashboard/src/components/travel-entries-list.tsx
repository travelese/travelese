import { secondsToHoursAndMinutes } from "@/utils/format";
import { format } from "date-fns";
import { TravelRecordForm } from "./forms/travel-record-form";
import { RecordSkeleton, UpdateRecordForm } from "./forms/update-record-form";

export function TravelEntriesList({
  data,
  date,
  user,
  isLoading,
  onCreate,
  onDelete,
  bookingId,
}) {
  const currentDate = date ? new Date(date) : new Date();
  const totalDuration = data?.reduce(
    (duration, item) => item.duration + duration,
    0,
  );

  return (
    <div>
      <div className="flex justify-between border-b-[1px] mt-12 mb-4 pb-2">
        <span>{format(currentDate, "LLL d")}</span>
        <span>{secondsToHoursAndMinutes(totalDuration)}</span>
      </div>

      {isLoading && <RecordSkeleton />}

      {data?.map((record) => (
        <UpdateRecordForm
          id={record.id}
          key={record.id}
          assigned={record.assigned}
          description={record.description}
          duration={record.duration}
          onDelete={onDelete}
        />
      ))}

      <TravelRecordForm
        userId={user.id}
        onCreate={onCreate}
        bookingId={bookingId}
      />
    </div>
  );
}
