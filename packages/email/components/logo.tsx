import { Img, Section } from "@react-email/components";
import { getEmailUrl } from "@travelese/utils/envs";

const baseUrl = getEmailUrl();

export function Logo() {
  return (
    <Section className="mt-[32px]">
      <Img
        src={`${baseUrl}/email/logo.png`}
        width="45"
        height="45"
        alt="Travelese"
        className="my-0 mx-auto block"
      />
    </Section>
  );
}
