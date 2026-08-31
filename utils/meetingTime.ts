import { Meeting } from "@/db/meeting";

export function parseDateTime(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [timePart, modifier] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function parseMeetingDateTime(meeting: Meeting): Date {
  return parseDateTime(meeting.date, meeting.time);
}
