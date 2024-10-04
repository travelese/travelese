"use client";

import Badge from "@kiwicom/orbit-components/lib/Badge";
import Box from "@kiwicom/orbit-components/lib/Box";
import Itinerary, {
  ItinerarySegment,
  ItinerarySegmentStop,
  ItinerarySegmentDetail,
} from "@kiwicom/orbit-components/lib/Itinerary";
import {
  Airplane,
  Entertainment,
  InformationCircle,
  PowerPlug,
  Seat,
  Wifi,
} from "@kiwicom/orbit-components/lib/icons";

function FlightItinerary() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background rounded-lg shadow-lg border gap-1">
      <Itinerary>
        <ItinerarySegment spaceAfter="medium">
          <ItinerarySegmentStop
            city="Toronto"
            station="Toronto Pearson International Airport (YYZ)"
            date="Mon, 04.11"
            time="00:55"
          />
          <ItinerarySegmentDetail
            icon={<Airplane size="small" />}
            duration="15h 50m"
            summary={
              <Badge
                carriers={[
                  {
                    code: "CX",
                    name: "Cathay Pacific",
                  },
                ]}
              >
                Cathay Pacific
              </Badge>
            }
            content={[
              {
                title: "Connection Info",
                items: [
                  {
                    icon: <Airplane size="small" />,
                    name: "Carrier",
                    value: "Cathay Pacific",
                  },
                  {
                    icon: <InformationCircle size="small" />,
                    name: "Connection number",
                    value: "CX 829",
                  },
                ],
              },
              {
                title: "Seating Info",
                items: [
                  {
                    icon: <Seat size="small" />,
                    name: "Seat pitch",
                    value: "76cm",
                  },
                  {
                    icon: <Seat size="small" />,
                    name: "Seat width",
                    value: "43cm",
                  },
                  {
                    icon: <Seat size="small" />,
                    name: "Seat recline",
                    value: "7cm",
                  },
                  {
                    icon: <Entertainment size="small" />,
                    name: "Audio & video on demand",
                    value: "No",
                  },
                  {
                    icon: <PowerPlug size="small" />,
                    name: "In-seat power",
                    value: "No",
                  },
                  {
                    icon: <Wifi size="small" />,
                    name: "Wi-Fi on board",
                    value: "No",
                  },
                ],
              },
            ]}
          />
          <ItinerarySegmentStop
            city="Hong Kong"
            station="Hong Kong International Airport (HKG)"
            date="Mon, 04.11"
            time="04:45"
          />
        </ItinerarySegment>
      </Itinerary>
    </div>
  );
}

export default FlightItinerary;
