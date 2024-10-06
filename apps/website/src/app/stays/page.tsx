import { SubscribeInput } from "@/components/subscribe-input";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stays",
  description: "Travelese Stays.",
};

export default function Page() {
  return (
    <div className="w-full bg-[#0C0C0C] flex flex-col items-center justify-center mt-24">
      <h1 className="text-[100px] md:text-[170px] font-medium text-center text-white relative z-20 leading-none">
        Stays
      </h1>

      <h2 className="text-[100px] md:text-[170px] leading-none text-dotted text-center">
        ...
      </h2>

      <div className="mb-2 mt-6">
        <p className="text-[#707070] mt-4 mb-8 text-center max-w-[550px]">
          Travelese Stays
        </p>
      </div>

      <SubscribeInput group="stays" />
    </div>
  );
}
