import { Icons } from "@travelese/ui/icons";
import Image from "next/image";
import bg from "public/screen-1.png";
import { Assistant } from "./assistant";
import { Tray } from "./tray";

export function SectionSix() {
  return (
    <section
      className="mt-[300px] mb-[250px] md:mt-24 md:mb-12 relative"
      id="assistant"
    >
      {/* <Tray /> */}
      <div className="absolute w-full h-full flex items-center justify-center flex-col top-8 xl:top-0">
        <h4 className="text-4xl mb-4 font-medium">Travelese Assistant</h4>
        <p className="max-w-[790px] px-4 text-center text-sm text-[#878787] mb-12 md:mb-0">
          Ask Travelese Assistant anything and get a deeper understanding of
          what you need to make your travels more authentic. Understand your
          preferences and discover experiences that align with your travel
          philosophy.
        </p>

        <div className="mt-6 hidden xl:block">
          <Icons.xAI />
        </div>

        <div className="xl:mt-14 w-full flex justify-center scale-[0.50] lg:scale-[0.80] xl:scale-100 min-w-[720px]">
          <Assistant />
        </div>
      </div>

      <div>
        <Image
          quality={100}
          src={bg}
          alt="Assistant background"
          priority
          style={{ width: "100%" }}
        />
      </div>
    </section>
  );
}
