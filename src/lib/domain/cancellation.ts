// Pure policy helper shared by the API (enforcement) and the UI (button gating
// + policy copy). No DB or framework imports so it runs in both environments.

export type AppointmentStatus =
  | "pending_payment"
  | "paid"
  | "completed"
  | "cancelled";

export interface CancellationPolicyInput {
  now: Date;
  chosenDatetime: Date | string;
  status: AppointmentStatus;
  rescheduleCount: number;
  cancellationNoticeHours: number;
  maxReschedules: number;
}

export interface CancellationState {
  /** Hours from `now` until the appointment (negative if in the past). */
  hoursUntil: number;
  /** Appointment is too close to allow self-service changes. */
  withinNoticeWindow: boolean;
  /** Status is completed or cancelled — nothing more to do. */
  isTerminal: boolean;
  /** Reschedules a client has left before hitting the cap. */
  reschedulesLeft: number;
  /** Whether a client (not the artist) may cancel. */
  clientCanCancel: boolean;
  /** Whether a client (not the artist) may reschedule. */
  clientCanReschedule: boolean;
}

/**
 * Computes what a client may do with an appointment under the artist's policy.
 * The authenticated artist bypasses these rules and is not subject to them.
 */
export function getCancellationState(
  input: CancellationPolicyInput
): CancellationState {
  const start = new Date(input.chosenDatetime).getTime();
  const hoursUntil = (start - input.now.getTime()) / 3_600_000;

  const isTerminal = input.status === "completed" || input.status === "cancelled";
  const isPast = hoursUntil <= 0;
  const withinNoticeWindow = hoursUntil < input.cancellationNoticeHours;
  const reschedulesLeft = Math.max(
    0,
    input.maxReschedules - input.rescheduleCount
  );

  // Cancelling is allowed for any active (non-terminal, upcoming) appointment —
  // a late cancel simply forfeits the deposit. The notice window only restricts
  // self-service *reschedules*.
  const clientCanCancel = !isTerminal && !isPast;
  const clientCanReschedule =
    clientCanCancel && !withinNoticeWindow && reschedulesLeft > 0;

  return {
    hoursUntil,
    withinNoticeWindow,
    isTerminal,
    reschedulesLeft,
    clientCanCancel,
    clientCanReschedule,
  };
}
