import type { InvoiceFormValues } from "@/actions/invoice/schema";
import type { Traveller } from "./traveller-details";

export const transformTravellerToContent = (traveller?: Traveller) => {
  if (!traveller) return null;

  const content = [];

  if (traveller.name) {
    content.push({
      type: "paragraph",
      content: [
        {
          text: traveller.name,
          type: "text",
        },
      ],
    });
  }

  if (traveller.address_line_1) {
    content.push({
      type: "paragraph",
      content: [{ text: traveller.address_line_1, type: "text" }],
    });
  }

  if (traveller.zip || traveller.city) {
    content.push({
      type: "paragraph",
      content: [
        {
          text: `${traveller.zip || ""} ${traveller.city || ""}`.trim(),
          type: "text",
        },
      ],
    });
  }

  if (traveller.country) {
    content.push({
      type: "paragraph",
      content: [{ text: traveller.country, type: "text" }],
    });
  }

  if (traveller.email) {
    content.push({
      type: "paragraph",
      content: [{ text: traveller.email, type: "text" }],
    });
  }

  if (traveller.phone) {
    content.push({
      type: "paragraph",
      content: [{ text: traveller.phone, type: "text" }],
    });
  }

  if (traveller.vat) {
    content.push({
      type: "paragraph",
      content: [{ text: `VAT: ${traveller.vat}`, type: "text" }],
    });
  }

  return {
    type: "doc",
    content,
  };
};

export const transformFormValuesToDraft = (values: InvoiceFormValues) => {
  return {
    ...values,
    template: {
      ...values.template,
      ...(values.payment_details && {
        payment_details: JSON.stringify(values.payment_details),
      }),
      ...(values.from_details && {
        from_details: JSON.stringify(values.from_details),
      }),
    },
    ...(values.payment_details && {
      payment_details: JSON.stringify(values.payment_details),
    }),
    ...(values.from_details && {
      from_details: JSON.stringify(values.from_details),
    }),
    ...(values.traveller_details && {
      traveller_details: JSON.stringify(values.traveller_details),
    }),
    ...(values.note_details && {
      note_details: JSON.stringify(values.note_details),
    }),
  };
};

export function parseInputValue(value?: string | null) {
  if (value === null) return null;
  return value ? JSON.parse(value) : undefined;
}
