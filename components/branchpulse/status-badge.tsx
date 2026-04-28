import { installStatusClasses, paymentStatusClasses } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { InstallStatus, PaymentStatus } from "@/lib/types";

type StatusBadgeProps =
  | { type: "install"; value: InstallStatus }
  | { type: "payment"; value: PaymentStatus };

export function StatusBadge(props: StatusBadgeProps) {
  const className =
    props.type === "install"
      ? installStatusClasses[props.value]
      : paymentStatusClasses[props.value];

  return <span className={cn("chip", className)}>{props.value}</span>;
}
