"use client";

import { updateInvoiceTemplateAction } from "@/actions/invoice/update-invoice-template-action";
import { Editor } from "@/components/invoice/editor";
import { useInvoiceParams } from "@/hooks/use-invoice-params";
import type { JSONContent } from "@tiptap/react";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { SelectTraveller } from "../select-traveller";
import { LabelInput } from "./label-input";
import { transformTravellerToContent } from "./utils";

export interface Traveller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  token: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  vat?: string;
}

interface TravellerDetailsProps {
  travellers: Traveller[];
}

export function TravellerDetails({ travellers }: TravellerDetailsProps) {
  const { control, setValue, watch } = useFormContext();
  const { setParams, selectedTravellerId } = useInvoiceParams();
  const updateInvoiceTemplate = useAction(updateInvoiceTemplateAction);

  const content = watch("traveller_details");

  const handleLabelSave = (value: string) => {
    updateInvoiceTemplate.execute({ traveller_label: value });
  };

  const handleOnChange = (content?: JSONContent | null) => {
    // Reset the selected customer id when the content is changed
    setParams({ selectedTravellerId: null });

    setValue("traveller_details", content, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (!content) {
      setValue("traveller_name", null, { shouldValidate: true });
      setValue("traveller_id", null, { shouldValidate: true });
    }
  };

  useEffect(() => {
    const traveller = travellers.find((c) => c.id === selectedTravellerId);

    if (traveller) {
      const travellerContent = transformTravellerToContent(traveller);

      // Remove the selected customer id from the url so we don't introduce a race condition
      setParams({ selectedTravellerId: null });

      setValue("traveller_name", traveller.name, { shouldValidate: true });
      setValue("traveller_id", traveller.id, { shouldValidate: true });
      setValue("traveller_details", travellerContent, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [selectedTravellerId, travellers]);

  return (
    <div>
      <LabelInput
        name="template.traveller_label"
        className="mb-2 block"
        onSave={handleLabelSave}
      />
      {content
        ? (
          <Controller
            name="traveller_details"
            control={control}
            render={({ field }) => (
              <Editor
                initialContent={field.value}
                onChange={handleOnChange}
                className="h-[115px]"
              />
            )}
          />
        )
        : <SelectTraveller data={travellers} />}
    </div>
  );
}
