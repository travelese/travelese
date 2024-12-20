import { resend } from "@/utils/resend";
import { render } from "@react-email/render";
import InvoiceEmail from "@travelese/email/emails/invoice";
import { createClient } from "@travelese/supabase/job";
import { getAppUrl } from "@travelese/utils/envs";
import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { nanoid } from "nanoid";
import { z } from "zod";

export const sendInvoiceEmail = schemaTask({
  id: "send-invoice-email",
  schema: z.object({
    invoiceId: z.string().uuid(),
  }),
  maxDuration: 300,
  queue: {
    concurrencyLimit: 10,
  },
  run: async ({ invoiceId }) => {
    const supabase = createClient();

    const { data: invoice } = await supabase
      .from("invoices")
      .select(
        "id, token, sent_to, customer:customer_id(name, website, email), team:team_id(name, email)",
      )
      .eq("id", invoiceId)
      .single();

    if (!invoice) {
      logger.error("Invoice not found");
      return;
    }

    await resend.emails.send({
      from: "Travelese <travelesebot@midday.ai>",
      to: invoice?.customer.email,
      reply_to: invoice?.team.email,
      subject: `${invoice?.team.name} sent you an invoice`,
      headers: {
        "X-Entity-Ref-ID": nanoid(),
      },
      html: await render(
        InvoiceEmail({
          customerName: invoice?.customer.name,
          teamName: invoice?.team.name,
          link: `${getAppUrl()}/i/${invoice?.token}`,
        }),
      ),
    });

    await supabase
      .from("invoices")
      .update({
        status: "unpaid",
        sent_to: invoice?.customer.email,
      })
      .eq("id", invoiceId);
  },
});
