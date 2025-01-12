import { Loader2 } from "lucide-react";
import { cn } from "../utils";
import { Button, type ButtonProps } from "./button";
import { InteractiveHoverButton } from "./interactive-hover-button";

export function SubmitButton({
  children,
  isSubmitting,
  disabled,
  variant = "default",
  interactive = false,
  text,
  ...props
}: {
  children: React.ReactNode;
  isSubmitting: boolean;
  disabled?: boolean;
  interactive?: boolean;
  text?: string;
} & ButtonProps) {
  const commonProps = {
    disabled: isSubmitting || disabled,
    ...props,
  };

  if (interactive) {
    return (
      <InteractiveHoverButton
        {...commonProps}
        text={typeof children === 'string' ? children : text}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children
        )}
      </InteractiveHoverButton>
    );
  }

  return (
    <Button
      {...commonProps}
      className={cn(props.className, "relative")}
      variant={variant}
    >
      <span className={cn({ "opacity-0": isSubmitting })}>{children}</span>

      {isSubmitting && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
    </Button>
  );
}

