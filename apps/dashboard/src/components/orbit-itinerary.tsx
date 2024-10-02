"use client";

import Badge from "@kiwicom/orbit-components/lib/Badge";
import Itinerary, {
  ItinerarySegment,
  ItinerarySegmentStop,
  ItinerarySegmentDetail,
} from "@kiwicom/orbit-components/lib/Itinerary";
import Airplane from "@kiwicom/orbit-components/lib/icons/Airplane";
import Entertainment from "@kiwicom/orbit-components/lib/icons/Entertainment";
import InformationCircle from "@kiwicom/orbit-components/lib/icons/InformationCircle";
import PowerPlug from "@kiwicom/orbit-components/lib/icons/PowerPlug";
import Seat from "@kiwicom/orbit-components/lib/icons/Seat";
import Wifi from "@kiwicom/orbit-components/lib/icons/Wifi";
import Provider from "@travelese/orbit/provider";
import StyledComponentsRegistry from "@travelese/orbit/registry";
import React from "react";

function FlightItinerary() {
  return (
    <StyledComponentsRegistry>
      <Provider>
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
      </Provider>
    </StyledComponentsRegistry>
  );
}

export default FlightItinerary;
