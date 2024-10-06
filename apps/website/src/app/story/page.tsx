import type { Metadata } from "next";
import Image from "next/image";
import founder from "public/founder.png";

export const metadata: Metadata = {
  title: "Story",
  description: "This is why I'm building Travelese.",
};

export default function Page() {
  return (
    <div className="container max-w-[750px]">
      <h1 className="mt-24 font-medium text-center text-5xl mb-16 leading-snug">
        This is why I'm building <br />
        Travelese.
      </h1>

      <h3 className="font-medium text-xl mb-2">Problem</h3>
      <p className="text-[#878787] mb-8">After years of ...</p>

      <h3 className="font-medium text-xl mb-2">Solution</h3>
      <p className="text-[#878787] mb-8">So,</p>

      <h3 className="font-medium text-xl mb-2">Open source</h3>
      <p className="text-[#878787] mb-12">
        I've always admired companies that prioritize transparency and
        collaboration with users to build the best possible product. Whether
        it's through 15-minute user calls, building in public, or open-sourcing
        our system, these are values we hold dear and will continue to uphold,
        regardless of how far or big we go.
      </p>

      <Image src={founder} width={800} height={514} alt="Armin" />

      <div className="mt-6 mb-8">
        <p className="text-sm text-[#878787] mb-2">Best regards, Armin</p>
        {/* <Image
          src={signature}
          alt="Signature"
          className="block w-[143px] h-[20px]"
        /> */}
      </div>
    </div>
  );
}
