import { updateInstitutionUsageAction } from "@/actions/institutions/update-institution-usage";
import { useConnectParams } from "@/hooks/use-connect-params";
import { useAction } from "next-safe-action/hooks";
import { BankConnectButton } from "./bank-connect-button";

type Props = {
  id: string;
  provider: string;
  availableHistory: number;
  openPlaid: () => void;
};

export function ConnectBankProvider({
  id,
  provider,
  openPlaid,
  availableHistory,
}: Props) {
  const { setParams } = useConnectParams();
  const updateInstitutionUsage = useAction(updateInstitutionUsageAction);

  const updateUsage = () => {
    updateInstitutionUsage.execute({ institutionId: id });
  };

  switch (provider) {
    case "plaid":
      return (
        <BankConnectButton
          onClick={() => {
            updateUsage();
            openPlaid();
          }}
        />
      );
    default:
      return null;
  }
}
