import Image from "next/image";
import Link from "next/link";
import armin from "./armin.png";
import founder from "./founder.png";
import { Card } from "./ui";

export function SectionTeam() {
  return (
    <div className="min-h-screen relative w-screen">
      <div className="absolute left-4 right-4 md:left-8 md:right-8 top-4 flex justify-between text-lg">
        <span>Who we are</span>
        <span className="text-[#878787]">
          <Link href="/">travelese.ai</Link>
        </span>
      </div>
      <div className="flex flex-col min-h-screen justify-center container">
        <div className="grid md:grid-cols-3 gap-8 px-4 md:px-0 md:pt-0 h-[580px] md:h-auto overflow-auto pb-[100px] md:pb-0">
          <div className="space-y-8">
            <Card className="items-start space-y-0">
              <Image
                src={armin}
                alt="Armin"
                width={76}
                height={76}
                quality={100}
                className="mb-4"
              />

              <h2 className="text-xl">Armin Babaei</h2>
              <span>Founder</span>
              <p className="text-[#878787] text-sm !mt-2">
                Nerd. Been running his own studio for 2 years offering his
                service to a range of early stage startups but also big
                companies like... <br />
                <br />
                Prior to this he was Travel Technology Director at ...
              </p>
            </Card>
          </div>
          <div>
            <Image
              src={founder}
              alt="Founder"
              width={650}
              height={875}
              quality={100}
            />
          </div>
          <div className="ml-auto w-full space-y-8 items-center flex">
            <h2 className="text-[64px] font-medium text-center leading-tight">
              “Hey 👋🏽 I'm Armin.”
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
