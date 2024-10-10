"use client";

import Badge from "@kiwicom/orbit-components/lib/Badge";
import Card from "@kiwicom/orbit-components/lib/Card";
import Heading from "@kiwicom/orbit-components/lib/Heading";
import Itinerary, {
  ItineraryBadgeList,
  ItineraryBadgeListItem,
  ItinerarySegmentBanner,
  ItinerarySegmentDetail,
  ItinerarySegmentStop,
  ItineraryStatus,
  ItinerarySegment,
} from "@kiwicom/orbit-components/lib/Itinerary";
import Separator from "@kiwicom/orbit-components/lib/Separator";
import Stack from "@kiwicom/orbit-components/lib/Stack";
import Text from "@kiwicom/orbit-components/lib/Text";
import {
  Accommodation,
  Airplane,
  BaggageCheckedNone,
  Clock,
  Entertainment,
  InformationCircle,
  Location,
  PowerPlug,
  Seat,
  SelfTransfer,
  StarFull,
  Visa,
  Wifi,
} from "@kiwicom/orbit-components/lib/icons";

export default function FlightItinerary() {
  return (
    <Card>
      <Heading type="title2">Throwaway ticketing</Heading>
      <Itinerary>
        <ItineraryStatus label="This part is new" type="success">
          <ItinerarySegment
            banner={
              <Stack align="stretch" direction="column" spacing="200">
                <ItinerarySegmentBanner
                  onClick={() => {
                    console.log("clicked");
                  }}
                >
                  <ItineraryBadgeList>
                    <ItineraryBadgeListItem
                      icon={<StarFull color="info" />}
                      type="info"
                    >
                      <Text as="span" type="info" weight="bold">
                        Throwaway ticketing hack:{" "}
                      </Text>{" "}
                      You are saving money with this travel hack.
                    </ItineraryBadgeListItem>
                  </ItineraryBadgeList>
                </ItinerarySegmentBanner>
                <Separator />
                <ItinerarySegmentBanner>
                  <ItineraryBadgeList>
                    <Stack spacing="200">
                      <ItineraryBadgeListItem
                        icon={<Location color="secondary" />}
                      >
                        You’ll depart from a different place in New York: John
                        F. Kennedy International.
                      </ItineraryBadgeListItem>
                      <ItineraryBadgeListItem
                        icon={<Location color="secondary" />}
                      >
                        You’ll depart from a different place in New York: John
                        F. Kennedy International.
                      </ItineraryBadgeListItem>
                      <ItineraryBadgeListItem
                        icon={<Accommodation color="secondary" />}
                      >
                        We won’t cover your overnight stay. Hotel coverage is
                        only available if the disruption happens during the
                        trip. If you want to avoid extra hotel costs please
                        choose a different alternative or a refund.
                      </ItineraryBadgeListItem>
                    </Stack>
                  </ItineraryBadgeList>
                </ItinerarySegmentBanner>
              </Stack>
            }
          >
            <ItinerarySegmentStop
              city="Barcelona BCN"
              date="Mon, 30.1"
              station="Brno-Tuřany"
              time="17:30"
            />
            <ItinerarySegmentDetail
              content={[
                {
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
                  title: "Connection Info",
                },
                {
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
                  title: "Seating Info",
                },
              ]}
              duration="2h 30m"
              summary={
                <Badge carriers={[{ code: "FR", name: "Ryanair" }]}>
                  Ryanair
                </Badge>
              }
            />
            <ItinerarySegmentStop
              city="London LHR"
              date="Mon, 30.1"
              station="London Heathrow"
              time="20:00"
            />
          </ItinerarySegment>
        </ItineraryStatus>
        <ItineraryBadgeList>
          <ItineraryBadgeListItem
            icon={<InformationCircle color="warning" />}
            type="warning"
          >
            Changing stations is your responsibility.
          </ItineraryBadgeListItem>
          <ItineraryBadgeListItem icon={<Clock />} type="warning">
            10h 20m layover
          </ItineraryBadgeListItem>
          <ItineraryBadgeListItem
            icon={<SelfTransfer color="warning" />}
            type="warning"
          >
            You need to do a self-transfer in Prague.
          </ItineraryBadgeListItem>
        </ItineraryBadgeList>
        <ItineraryStatus label="This part is new" type="success">
          <ItinerarySegment
            banner={
              <Stack>
                <ItinerarySegmentBanner>
                  <ItineraryBadgeList>
                    <ItineraryBadgeListItem icon={<StarFull />} type="warning">
                      Hidden city hack: This itinerary finishes in New York
                      (United States), but you’ll get off during the layover.
                    </ItineraryBadgeListItem>
                    <ItineraryBadgeListItem icon={<Visa />}>
                      Check travel document requirements for all destinations,
                      including passport, visa and COVID-19 documents.
                    </ItineraryBadgeListItem>
                    <ItineraryBadgeListItem icon={<BaggageCheckedNone />}>
                      You can’t bring checked or cabin baggage.
                    </ItineraryBadgeListItem>
                  </ItineraryBadgeList>
                </ItinerarySegmentBanner>
                <Separator />
                <ItinerarySegmentBanner>
                  <ItineraryBadgeList>
                    <ItineraryBadgeListItem icon={<Location />} type="warning">
                      You’ll depart from a different place in Prague: Václav
                      Havel Airport Prague
                    </ItineraryBadgeListItem>
                  </ItineraryBadgeList>
                </ItinerarySegmentBanner>
              </Stack>
            }
          >
            <ItinerarySegmentStop
              city="Prague"
              date="Wed, 15.6"
              station="Václav Havel Airport Prague (PRG)"
              time="16:20"
            />
            <ItinerarySegmentDetail
              content={[
                {
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
                  title: "Connection Info",
                },
                {
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
                  title: "Seating Info",
                },
              ]}
              duration="2h 10m"
              summary={
                <Badge carriers={[{ code: "FR", name: "Ryanair" }]}>
                  Ryanair
                </Badge>
              }
            />
            <ItinerarySegmentStop
              city="Frankfurt"
              date="Wed, 15.6"
              hidden
              station="Frankfurt International Airport "
              time="18:30"
            />
            <ItinerarySegmentStop city="New York JFK" station="United States" />
          </ItinerarySegment>
        </ItineraryStatus>
      </Itinerary>
    </Card>
  );
}
