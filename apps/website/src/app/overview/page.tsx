import { Assistant } from "@/components/assistant";
import type { Metadata } from "next";
import Image from "next/image";
import Overview from "public/product-overview.png";
import Spending from "public/product-spending.png";

export const metadata: Metadata = {
  title: "Travel Overview",
  description: "Get real-time insight into your Traveller Experience state.",
};

export default function Page() {
  return (
    <div className="container mb-52">
      <div className="mb-40">
        <h1 className="mt-24 font-medium text-center text-[75px] md:text-[170px] mb-2 leading-none text-stroke">
          Travel
        </h1>

        <h3 className="font-medium text-center text-[75px] md:text-[170px] mb-2 leading-none">
          Overview
        </h3>

        <div className="flex items-center flex-col text-center relative">
          <p className="text-lg mt-4 max-w-[600px]">
            Get real-time insight into your traveller experience state. Keep
            track of your travellers, expenses and overall traveller experience.
          </p>
        </div>
      </div>

      {/* <Image src={Overview} quality={100} alt="Overview" /> */}

      <div className="flex items-center flex-col text-center relative mt-28">
        <div className="max-w-[600px]">
          <h4 className="font-medium text-xl md:text-2xl mb-4">
            From source to destination
          </h4>
          <p className="text-[#878787] text-sm">
            The traveller experience overview is there for your travels when you
            feel that you don’t have enough insights about your travellers
            experience.
          </p>
        </div>

        {/* <Image
          src={Spending}
          quality={100}
          alt="Spending"
          className="mt-10 max-w-[834px] w-full"
        /> */}

        <div className="mt-32 max-w-[550px]">
          <h4 className="font-medium text-xl md:text-2xl mb-4">
            Use assistant to dive deeper
          </h4>
          <p className="text-[#878787] text-sm md:mb-10">
            Use the assistant to ask questions about your travellers experience,
            all just one keystroke away.
          </p>
        </div>

        <div className="text-left scale-[0.45] md:scale-100 -mt-20 md:mt-0">
          <Assistant />
        </div>
      </div>
    </div>
  );
}
