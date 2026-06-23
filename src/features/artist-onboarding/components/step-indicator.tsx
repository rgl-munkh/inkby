import { cn } from "@/lib/utils";
import { CheckIcon } from "./onboarding-icons";

const STEPS = ["Profile", "Booking", "Customize"] as const;

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex w-full items-center gap-1 rounded-full bg-muted p-1">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div
            key={label}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : isDone
                  ? "text-foreground"
                  : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-[18px] items-center justify-center rounded-full border text-[11px] leading-none",
                isActive
                  ? "border-transparent bg-background/20 text-background"
                  : isDone
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground",
              )}
            >
              {isDone ? <CheckIcon /> : stepNum}
            </span>
            {label}
          </div>
        );
      })}
    </div>
  );
}
