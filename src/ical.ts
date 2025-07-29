import { createHash } from "node:crypto";
import type { MyEvent } from "./types.ts";

const lines_start = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//YourAppName//KoreanScheduleExport//EN",
  "CALSCALE:GREGORIAN",
  "X-WR-CALNAME:서울월드컵경기장",
  "X-WR-TIMEZONE:Asia/Seoul",
];
const lines_end = ["END:VCALENDAR", ""];

const lines_timezone = [
  "BEGIN:VTIMEZONE",
  "TZID:Asia/Seoul",
  "BEGIN:STANDARD",
  "DTSTART:19700101T000000",
  "TZOFFSETFROM:+0900",
  "TZOFFSETTO:+0900",
  "TZNAME:KST",
  "END:STANDARD",
  "END:VTIMEZONE",
];

const getCurrentDtstamp = (now: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = now.getUTCFullYear();
  const month = pad(now.getUTCMonth() + 1); // 0-based
  const day = pad(now.getUTCDate());
  const hours = pad(now.getUTCHours());
  const minutes = pad(now.getUTCMinutes());
  const seconds = pad(now.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

export const transformVEvent = (sched: MyEvent) => {
  const year = sched.date.year;
  const month = sched.date.month.toString().padStart(2, "0");
  const day = sched.date.day.toString().padStart(2, "0");
  const ymd = `${year}${month}${day}`;

  // 시간을 넣을수 있는 경우
  // const line_dtstart = `DTSTART;TZID=Asia/Seoul:${ymd}T010000`;
  // const line_dtend = `DTEND;TZID=Asia/Seoul:${ymd}T230000`;

  // 시작시간, 종료시간이 정의되지 않은 일정이 많아서 하루종일 이벤트로 설정
  const line_dtstart = `DTSTART;TZID=Asia/Seoul:${ymd}`;
  const line_dtend = `DTEND;TZID=Asia/Seoul:${ymd}`;
  const line_summary = `SUMMARY:${sched.schedule.title}`;
  const line_description = `DESCRIPTION:${sched.lines.join("\\n")}`;

  // uid는 고유해야된다. 생성할떄마다 같은게 나오게 하고싶아
  const text = sched.lines.join("\n");
  const uid = createHash("md5").update(text).digest("hex");
  const line_uid = `UID:${ymd}-${uid}@yourcalendar.com`;

  // 현재시간으로 하면 값이 계속 바뀌니까 그냥 값 고정. 큰 문제는 없겠지?
  const dateTime = new Date(2025, 0, 1);
  const dtstamp = getCurrentDtstamp(dateTime);
  const line_dtstamp = `DTSTAMP:${dtstamp}`;

  const lines = [
    "BEGIN:VEVENT",
    line_uid,
    line_dtstamp,
    line_dtstart,
    line_dtend,
    line_summary,
    line_description,
    "LOCATION:서울월드컵경기장",
    "END:VEVENT",
  ];
  return lines;
};

export const transformVCalendar = (events: MyEvent[]): string => {
  const lines_event = [];
  for (const sched of events) {
    const eventLines = transformVEvent(sched);
    lines_event.push(...eventLines);
  }

  const lines = [
    ...lines_start,
    ...lines_timezone,
    ...lines_event,
    ...lines_end,
  ];
  const ical = lines.join("\n");
  return ical;
};
