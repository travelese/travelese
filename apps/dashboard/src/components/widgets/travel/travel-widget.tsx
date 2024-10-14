import { TravelInput } from "./travel-input";
import { TravelList } from "./travel-list";

type Props = {
  disabled: boolean;
  initialPeriod: Date | string;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function TravelWidget({
  disabled,
  initialPeriod,
  searchParams,
}: Props) {
  return (
    <div>
      <div className="mt-8 overflow-auto scrollbar-hide pb-32 aspect-square flex flex-col-reverse">
        <TravelList />
      </div>
      <TravelInput />
    </div>
  );
}
