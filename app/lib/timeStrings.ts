export function parseTimeIntoMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export function calculateDuration(start: string, end: string): number {
  const startMinutes = parseTimeIntoMinutes(start);
  const endMinutes = parseTimeIntoMinutes(end);
  return endMinutes - startMinutes;
}
