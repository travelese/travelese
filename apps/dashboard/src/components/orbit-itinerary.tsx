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
              city="Moscow"
              station="Sheremetyevo International Airport (SVO)"
              date="Fri, 19.10"
              time="14:05"
            />
            <ItinerarySegmentDetail
              icon={<Airplane size="small" />}
              duration="2h 30m"
              summary={
                <Badge
                  carriers={[
                    {
                      code: "FR",
                      name: "Ryanair",
                    },
                  ]}
                >
                  Ryanair
                </Badge>
              }
              content={[
                {
                  title: "Connection Info",
                  items: [
                    {
                      icon: <Airplane size="small" />,
                      name: "Carrier",
                      value: "Ryanair",
                    },
                    {
                      icon: <InformationCircle size="small" />,
                      name: "Connection number",
                      value: "RA 8345",
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
              city="Prague"
              station="Václav Havel Airport Prague (PRG)"
              date="Fri, 19.10"
              time="16:35"
            />
          </ItinerarySegment>
        </Itinerary>
      </Provider>
    </StyledComponentsRegistry>
  );
}

export default FlightItinerary;
