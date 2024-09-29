import { AI } from "@/actions/ai/chat";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { setupAnalytics } from "@travelese/events/server";
import { getCountryCode } from "@travelese/location";
import {
  currencies,
  uniqueCurrencies,
} from "@travelese/location/src/currencies";
import { getUser } from "@travelese/supabase/cached-queries";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const countryCode = getCountryCode();

  if (!user?.data?.team) {
    redirect("/teams");
  }

  if (user) {
    await setupAnalytics({ userId: user.data.id });
  }

  return (
    <div className="relative">
      <AI initialAIState={{ user: user.data, messages: [], chatId: nanoid() }}>
        <Sidebar />

        <div className="mx-4 md:ml-[95px] md:mr-10 pb-8">
          <Header />
          {children}
        </div>

        {/* This is used to make the header draggable on macOS */}
        <div className="hidden todesktop:block todesktop:[-webkit-app-region:drag] fixed top-0 w-full h-4 pointer-events-none" />

        {/* Dynamic imports using import() */}
        {import("@/components/assistant/assistant-modal").then((mod) => (
          <mod.AssistantModal />
        ))}
        {import("@/components/modals/connect-transactions-modal").then(
          (mod) => (
            <mod.ConnectTransactionsModal countryCode={countryCode} />
          ),
        )}
        {import("@/components/modals/select-bank-accounts").then((mod) => (
          <mod.SelectBankAccountsModal />
        ))}
        {import("@/components/modals/import-modal").then((mod) => (
          <mod.ImportModal
            currencies={uniqueCurrencies}
            defaultCurrency={currencies[countryCode as keyof typeof currencies]}
          />
        ))}
        {import("@/components/export-status").then((mod) => (
          <mod.ExportStatus />
        ))}
        {import("@/components/hot-keys").then((mod) => (
          <mod.HotKeys />
        ))}
      </AI>
    </div>
  );
}
