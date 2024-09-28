import {
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { TripleColumn } from "responsive-react-email";

type Props = {
  baseUrl?: string;
};

export function Footer({ baseUrl }: Props) {
  return (
    <Section className="w-full">
      <Hr />

      <br />

      <Text className="text-[21px] font-regular">Traveller Experince</Text>

      <br />

      <TripleColumn
        pX={0}
        pY={0}
        styles={{ textAlign: "left" }}
        columnOneContent={
          <Section className="text-left p-0 m-0">
            <Row>
              <Text className="font-medium">Features</Text>
            </Row>

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/pZLWc4R"
              >
                Overview
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/JISKG9m"
              >
                Flights
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/H4EQQK2"
              >
                Stays
              </Link>
            </Row>
            {/* <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai"
              >
                Tracker
              </Link>
            </Row>

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai"
              >
                Invoice
              </Link>
            </Row> */}

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/LWIpEcG"
              >
                Pricing
              </Link>
            </Row>

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/hhYt47S"
              >
                Engine
              </Link>
            </Row>

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://travelese.ai/download"
              >
                Download
              </Link>
            </Row>
          </Section>
        }
        columnOneStyles={{ paddingRight: 0, paddingLeft: 0, width: 185 }}
        columnTwoContent={
          <Section className="text-left p-0 m-0">
            <Row>
              <Text className="font-medium">Resources</Text>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai"
              >
                Homepage
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://git.new/travelese"
              >
                Github
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/hasc1BR"
              >
                Support
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/0YxKnZU"
              >
                Terms of service
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/bdpkTRD"
              >
                Privacy policy
              </Link>
            </Row>

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/wXccEF50"
              >
                Branding
              </Link>
            </Row>

            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/qtPAqor"
              >
                Feature Request
              </Link>
            </Row>
          </Section>
        }
        columnTwoStyles={{ paddingRight: 0, paddingLeft: 0, width: 185 }}
        columnThreeContent={
          <Section className="text-left p-0 m-0">
            <Row>
              <Text className="font-medium">Company</Text>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/oPf0AmF"
              >
                Story
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/m5UA5OH"
              >
                Updates
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai"
              >
                Open startup
              </Link>
            </Row>
            <Row className="mb-1.5">
              <Link
                className="text-[#707070] text-[14px]"
                href="https://go.travelese.ai/rZrELLy"
              >
                OSS Friends
              </Link>
            </Row>
          </Section>
        }
        columnThreeStyles={{ paddingRight: 0, paddingLeft: 0, width: 185 }}
      />

      <br />
      <br />

      <Row>
        <Column className="align-middle w-[40px]">
          <Link href="https://go.travelese.ai/0FpSUKo">
            <Img
              src={`${baseUrl}/x.png`}
              width="22"
              height="22"
              alt="Travelese on X"
            />
          </Link>
        </Column>
        {/* <Column className="align-middle w-[40px]">
          <Link href="https://go.travelese.ai/">
            <Img
              src={`${baseUrl}/producthunt.png`}
              width="22"
              height="22"
              alt="Travelese on Producthunt"
            />
          </Link>
        </Column> */}

        <Column className="align-middle w-[40px]">
          <Link href="https://go.travelese.ai/XTxOfuy">
            <Img
              src={`${baseUrl}/discord.png`}
              width="22"
              height="22"
              alt="Travelese on Discord"
            />
          </Link>
        </Column>

        <Column className="align-middle">
          <Link href="https://go.travelese.ai/oP5xRyx">
            <Img
              src={`${baseUrl}/linkedin.png`}
              width="22"
              height="22"
              alt="Travelese on LinkedIn"
            />
          </Link>
        </Column>
      </Row>

      <br />
      <br />

      <Row>
        <Text className="text-[#B8B8B8] text-xs">
          Armin Babaei Studio Inc (Travelese) - Toronto, Canada
        </Text>
      </Row>

      <Row>
        <Link
          className="text-[#707070] text-[14px]"
          href="https://app.travelese.ai/settings/notifications"
          title="Unsubscribe"
        >
          Notification preferences
        </Link>
      </Row>

      <br />
      <br />

      <Row>
        <Link href="https://go.travelese.ai">
          <Img
            src={`${baseUrl}/logo-footer.png`}
            width="100"
            alt="Travelese"
            className="block"
          />
        </Link>
      </Row>
    </Section>
  );
}
