import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";
import { createUrl, extractDay, parseSchedule } from "./helpers.js";

const parseMonthHtml = (year: number, month: number, html: string) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const results = [];

  const anchorElements = document.querySelectorAll(".calendar tbody a");
  for (const anchorElem of anchorElements) {
    const trElem = anchorElem.parentNode?.parentNode;
    if (!trElem) {
      continue;
    }

    const day = extractDay(trElem);

    const title: string =
      anchorElem.attributes.getNamedItem("title")?.value ?? "";
    const lines = title
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    const date = { year, month, day };
    const schedule = parseSchedule(lines);
    results.push({ date, schedule, lines });
  }
  return results;
};

const main = async () => {
  // 일정이 그렇게 자주 바뀔까? 하드코딩으로 넣어도 될거같은데
  const year = 2025;

  const results = [];

  for (let month = 1; month <= 12; month++) {
    const monthUrl = createUrl(year, month);
    const monthResp = await fetch(monthUrl);
    const monthHtml = await monthResp.text();
    const candidates = parseMonthHtml(year, month, monthHtml);

    console.log(`Results for ${year}-${month}:  ${candidates.length}`);
    results.push(...candidates);
  }

  // TODO: iCal로 변환
  const lines_start = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourAppName//KoreanScheduleExport//EN",
    "CALSCALE:GREGORIAN",
  ];
  const lines_end = ["END:VCALENDAR"];

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

  const dtstamp = getCurrentDtstamp();
  const line_dtstamp = `DTSTAMP:${dtstamp}`;

  const lines_event = [];

  for (const sched of results) {
    const year = sched.date.year;
    const month = sched.date.month.toString().padStart(2, "0");
    const day = sched.date.day.toString().padStart(2, "0");
    const ymd = `${year}${month}${day}`;

    const line_dtstart = `DTSTART;TZID=Asia/Seoul:${ymd}T010000`;
    const line_dtend = `DTEND;TZID=Asia/Seoul:${ymd}T230000`;
    const line_summary = `SUMMARY:${sched.schedule.title}`;
    const line_description = `DESCRIPTION:${sched.lines.join("\\n")}`;

    // uid는 고유해야된다. 생성할떄마다 같은게 나오게 하고싶아
    const text = sched.lines.join("\n");
    const uid = createHash("md5").update(text).digest("hex");
    const line_uid = `UID:${ymd}-${uid}@yourcalendar.com`;

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
    lines_event.push(...lines);
  }

  const lines = [
    ...lines_start,
    ...lines_timezone,
    ...lines_event,
    ...lines_end,
  ];
  const ical = lines.join("\n");
  console.log(ical);
};

const getCurrentDtstamp = (): string => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");

  const year = now.getUTCFullYear();
  const month = pad(now.getUTCMonth() + 1); // 0-based
  const day = pad(now.getUTCDate());
  const hours = pad(now.getUTCHours());
  const minutes = pad(now.getUTCMinutes());
  const seconds = pad(now.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

await main();
