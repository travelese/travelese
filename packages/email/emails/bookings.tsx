import {
  Body,
  Button,
  Container,
  Font,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { cn } from "@travelese/ui/cn";
import { getAppUrl } from "@travelese/utils/envs";
import { format } from "date-fns";
import { Footer } from "../components/footer";
import { Logo } from "../components/logo";
import { getI18n } from "../locales";

type Booking = {
  id: string;
  date: string;
  amount: number;
  name: string;
  currency: string;
  category?: string;
  status: "pending" | "posted";
  teamName: string;
};

interface Props {
  fullName: string;
  bookings: Booking[];
  locale: string;
}

const defaultBookings = [
  {
    id: "1",
    date: new Date().toISOString(),
    amount: -1000,
    currency: "USD",
    name: "Spotify",
    status: "pending",
  },
  {
    id: "2",
    date: new Date().toISOString(),
    amount: 1000,
    currency: "USD",
    name: "H23504959",
    category: "income",
    status: "pending",
  },
  {
    id: "3",
    date: new Date().toISOString(),
    amount: -1000,
    currency: "USD",
    name: "Webflow",
    status: "posted",
  },
  {
    id: "4",
    date: new Date().toISOString(),
    amount: -1000,
    currency: "USD",
    name: "Netflix",
    status: "posted",
  },
];

const baseAppUrl = getAppUrl();

export const BookingsEmail = ({
  fullName = "Armin Babaei",
  bookings = defaultBookings,
  locale = "en",
  teamName = "Travelese",
}: Props) => {
  const { t } = getI18n({ locale });
  const firstName = fullName.split(" ").at(0);

  const previewText = t("bookings.preview", {
    firstName,
    numberOfBookings: bookings.length,
  });

  return (
    <Html>
      <Tailwind>
        <head>
          <Font
            fontFamily="Geist"
            fallbackFontFamily="Helvetica"
            webFont={{
              url: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-400-normal.woff2",
              format: "woff2",
            }}
            fontWeight={400}
            fontStyle="normal"
          />

          <Font
            fontFamily="Geist"
            fallbackFontFamily="Helvetica"
            webFont={{
              url: "https://cdn.jsdelivr.net/npm/@fontsource/geist-sans@5.0.1/files/geist-sans-latin-500-normal.woff2",
              format: "woff2",
            }}
            fontWeight={500}
            fontStyle="normal"
          />
        </head>
        <Preview>{previewText}</Preview>

        <Body className="bg-[#fff] my-auto mx-auto font-sans">
          <Container
            className="border-transparent md:border-[#E8E7E1] my-[40px] mx-auto p-[20px] max-w-[600px]"
            style={{ borderStyle: "solid", borderWidth: 1 }}
          >
            <Logo />
            <Heading className="text-[#121212] text-[21px] font-normal text-center p-0 my-[30px] mx-0">
              {t("bookings.title1")}
              <span className="font-semibold">
                {t("bookings.title2", {
                  numberOfBookings: bookings.length,
                })}{" "}
              </span>
              {t("bookings.title3")} <br />
              {t("bookings.title4")}
            </Heading>
            <Text className="text-[#121212] text-[14px] leading-[24px]">
              {t("bookings.description1", { firstName })},
              <br />
              <br />
              {t("bookings.description2")}{" "}
              <span className="font-semibold">
                {t("bookings.description3", {
                  numberOfBookings: bookings.length,
                })}{" "}
              </span>
              {t("bookings.description4", { teamName })}
            </Text>

            <br />

            <table
              style={{ width: "100% !important", minWidth: "100%" }}
              className="border-collapse w-full"
            >
              <thead style={{ width: "100%" }}>
                <tr className="border-0 border-t-[1px] border-b-[1px] border-solid border-[#E8E7E1] h-[45px]">
                  <th align="left">
                    <Text className="text-[14px] font-semibold m-0 p-0">
                      {t("bookings.date")}
                    </Text>
                  </th>
                  <th align="left" style={{ width: "50%" }}>
                    <Text className="text-[14px] font-semibold m-0 p-0">
                      {t("bookings.description")}
                    </Text>
                  </th>
                  <th align="left">
                    <Text className="text-[14px] font-semibold m-0 p-0">
                      {t("bookings.amount")}
                    </Text>
                  </th>
                </tr>
              </thead>

              <tbody style={{ width: "100%", minWidth: "100% !important" }}>
                {bookings?.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-0 border-b-[1px] border-solid border-[#E8E7E1] h-[45px]"
                  >
                    <td align="left">
                      <Text className="text-[14px] m-0 p-0 mt-1 pb-1">
                        {format(new Date(booking.date), "MMM d")}
                      </Text>
                    </td>
                    <td align="left" style={{ width: "50%" }}>
                      <Link
                        href={`${baseAppUrl}/bookings?id=${booking.id}`}
                        className={cn(
                          "text-[#121212]",
                          booking?.category === "income" && "!text-[#00C969]",
                        )}
                      >
                        <div className="flex space-x-2 items-center">
                          <Text className="text-[14px] m-0 p-0 mt-1 pb-1 line-clamp-1">
                            {booking.name}
                          </Text>

                          {booking.status === "pending" && (
                            <div className="flex space-x-1 items-center border rounded-md text-xs py-1 px-2 h-[22px] text-[#878787]">
                              <span>Pending</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td align="left">
                      <Text
                        className={cn(
                          "text-[14px] m-0 p-0 mt-1 pb-1 text-[#121212]",
                          booking?.category === "income" && "!text-[#00C969]",
                        )}
                      >
                        {Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: booking.currency,
                        }).format(booking.amount)}
                      </Text>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <br />

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-transparent rounded-md text-primary text-[14px] text-[#121212] font-medium no-underline text-center px-6 py-3 border border-solid border-[#121212]"
                href={`${baseAppUrl}/bookings?start=${bookings.at(0)?.date}&end=${bookings[bookings.length - 1]?.date}`}
              >
                {t("bookings.button")}
              </Button>
            </Section>

            <br />
            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingsEmail;
