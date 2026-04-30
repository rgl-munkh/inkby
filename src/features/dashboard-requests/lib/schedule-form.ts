export function generate30MinSlots(startTime: string, endTime: string): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let minutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  while (minutes < endMinutes) {
    slots.push(
      `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
    );
    minutes += 30;
  }

  return slots;
}

export function splitDatetime(value: string): { date: string; time: string } {
  if (!value) return { date: "", time: "" };
  const [date, time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}
