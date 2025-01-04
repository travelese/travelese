import { cn } from "@travelese/ui/cn";

export interface FlightActivity {
  status: "landed" | "active";
  statusString: string;
  arrival: {
    airport: string;
    scheduled: string;
    iata: string;
    estimated: string;
  };
  departure: {
    airport: string;
    scheduled: string;
    iata: string;
    estimated: string;
  };
}

async function getFlightActivity(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const activity: FlightActivity[] = [
    {
      status: "active",
      statusString: "Landing in 1H 10M",
      arrival: {
        airport: "San Francisco",
        scheduled: "2024-10-22",
        iata: "SFO",
        estimated: "2024-10-22",
      },
      departure: {
        airport: "New York",
        scheduled: "2024-10-22",
        iata: "JFK",
        estimated: "2024-10-22",
      },
    },
    {
      status: "landed",
      statusString: "Landed at 10:30 AM",
      arrival: {
        airport: "New York",
        scheduled: "2024-10-22",
        iata: "JFK",
        estimated: "2024-10-22",
      },
      departure: {
        airport: "San Francisco",
        scheduled: "2024-10-22",
        iata: "SFO",
        estimated: "2024-10-22",
      },
    },
    {
      status: "landed",
      statusString: "Landed at 11:30 AM",
      arrival: {
        airport: "San Francisco",
        scheduled: "2024-10-22",
        iata: "SFO",
        estimated: "2024-10-22",
      },
      departure: {
        airport: "New York",
        scheduled: "2024-10-22",
        iata: "JFK",
        estimated: "2024-10-22",
      },
    },
    {
      status: "landed",
      statusString: "Landed at 10:30 AM",
      arrival: {
        airport: "New York",
        scheduled: "2024-10-22",
        iata: "JFK",
        estimated: "2024-10-22",
      },
      departure: {
        airport: "San Francisco",
        scheduled: "2024-10-22",
        iata: "SFO",
        estimated: "2024-10-22",
      },
    },
    {
      status: "landed",
      statusString: "Landed at 11:30 AM",
      arrival: {
        airport: "San Francisco",
        scheduled: "2024-10-22",
        iata: "SFO",
        estimated: "2024-10-22",
      },
      departure: {
        airport: "New York",
        scheduled: "2024-10-22",
        iata: "JFK",
        estimated: "2024-10-22",
      },
    },
  ];

  return activity;
}

export async function InnerFlightActivity({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children?: React.ReactNode;
}) {
  const id = (await params).id;
  const activity = await getFlightActivity(id);

  return (
    <div className="text-white max-w-screen-lg mx-auto">
      <h2 className="text-xl p-4 font-bold">Recent activity</h2>
      <div className="py-4 px-2">
        {activity.map((flight, i) => (
          <div
            key={i}
            className="flex gap-2 items-stretch flight-activity-container"
            style={{ "--index": i } as React.CSSProperties}
          >
            <div className="w-[2rem] flex items-center flex-col">
              <div
                className={cn(
                  "border border-white rounded-full w-[1rem] h-[1rem] shrink-0 flight-activity-dot",
                  {
                    "bg-white opacity-50 w-[0.7rem] h-[0.7rem] my-[0.15rem]":
                      flight.status !== "active",
                  },
                )}
              ></div>
              <div className="border-l-[1px] my-2 opacity-50 border-white h-full grow flight-activity-line"></div>
            </div>
            <div className="pb-2 flight-activity-item">
              <div className="uppercase opacity-50 font-mono font-bold leading-none">
                {flight.arrival.iata}
              </div>
              <div className="my-2 pb-8">
                <p className="text-xl font-bold">
                  {flight.departure.airport} to {flight.arrival.airport}
                </p>
                <p className="uppercase opacity-50 font-mono text-sm">
                  {flight.statusString}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
