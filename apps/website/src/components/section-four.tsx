import Image from "next/image";
import inbox from "public/inbox.png";
import invoicing from "public/invoicing.png";
import { CopyInput } from "./copy-input";

export function SectionFour() {
  return (
    <section className="flex justify-between space-y-12 md:space-y-0 md:space-x-8 flex-col md:flex-row overflow-hidden mb-12">
      <div className="border border-border basis-1/3 bg-[#121212] p-10 md:text-center flex flex-col">
        <h4 className="font-medium text-xl md:text-2xl mb-4">Invoicing</h4>
        <p className="text-[#878787] mb-[35px] text-sm">
          Invoice your travellers
        </p>

        <Image
          src={invoicing}
          quality={100}
          className="object-contain mt-auto"
          alt="Invoice"
        />
      </div>

      <div className="border border-border md:basis-2/3 bg-[#121212] p-10 flex justify-between md:space-x-8 md:flex-row flex-col">
        <div className="flex flex-col md:basis-1/2">
          <h4 className="font-medium text-xl md:text-2xl mb-4">Inbox</h4>

          <p className="text-[#878787] mb-4 text-sm">
            Automatic matching of incoming invoices or receipts to the right
            transaction.
          </p>

          <CopyInput
            value="inbox.tavel@travelese.ai"
            className="max-w-[240px] mt-8"
          />
        </div>

        <div className="md:basis-1/2 mt-8 md:mt-0 -bottom-[8px] relative">
          <Image
            src={inbox}
            quality={100}
            className="object-contain -bottom-[32px] relative"
            alt="Inbox"
          />
        </div>
      </div>
    </section>
  );
}
