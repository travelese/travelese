import { cn } from "@travelese/ui/cn";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), {
  ssr: false,
});

type Props = {
  eventId: string;
  setEventId: (eventId?: string) => void;
  onClose: () => void;
};

export function LoadingTransactionsEvent({
  eventId,
  setEventId,
  onClose,
}: Props) {
  const { run } = useRealtimeRun(eventId ?? "");
  const [step, setStep] = useState(1);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (run?.status) {
      if (run.status === "EXECUTING") {
        setStep(2);
      }

      if (run.status === "COMPLETED") {
        setStep(3);
        setTimeout(() => {
          onClose();
        }, 500);

        setTimeout(() => {
          setEventId(undefined);
        }, 1000);
      }
    }
  }, [run?.status]);

  return (
    <div className="h-[250px]">
      <Lottie
        className="mb-6"
        animationData={
          resolvedTheme === "dark"
            ? require("public/assets/setup-animation.json")
            : require("public/assets/setup-animation-dark.json")
        }
        loop={true}
        style={{ width: 50, height: 50 }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice",
        }}
      />
      <h2 className="text-lg font-semibold leading-none tracking-tight mb-8">
        Setting up account
      </h2>

      <ul className="text-md text-[#878787] space-y-4 transition-all">
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 0 && "!opacity-100",
          )}
        >
          Connecting bank
          {step === 1 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 1 && "!opacity-100",
          )}
        >
          Getting transactions
          {step === 2 && <span className="loading-ellipsis" />}
        </li>
        <li
          className={cn(
            "opacity-50 dark:opacity-20",
            step > 2 && "!opacity-100",
          )}
        >
          Completed
          {step === 3 && <span className="loading-ellipsis" />}
        </li>
      </ul>
    </div>
  );
}
