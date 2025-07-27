import fs from "node:fs/promises";
import path from "node:path";
import { program } from "commander";
import { createUrl } from "./helpers.js";
import { transformVCalendar } from "./ical.js";
import { parseMonthHtml } from "./parser.js";
import type { MyEvent } from "./types.js";

// 일정이 그렇게 자주 바뀔까? 하드코딩으로 넣어도 될거같은데
// 2026년 되면 그건 그때 고민하고
const year = 2025;

const fp_sched = path.join(process.cwd(), "docs", "schedule.json");
const fp_ics = path.join(process.cwd(), "docs", "sangam-stadium.ics");

const write = async () => {
  const json = await fs.readFile(fp_sched, "utf8");
  const results = JSON.parse(json) as MyEvent[];

  const now = new Date();
  const ics = transformVCalendar(results, now);
  await fs.writeFile(fp_ics, ics, "utf8");
  console.log(`iCalendar data written to ${fp_ics}`);
};

const crawl = async () => {
  const results: MyEvent[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthUrl = createUrl(year, month);
    const monthResp = await fetch(monthUrl);
    const monthHtml = await monthResp.text();
    const candidates = parseMonthHtml(year, month, monthHtml);

    console.log(`Results for ${year}-${month}:  ${candidates.length}`);
    results.push(...candidates);
  }

  const json = JSON.stringify(results, null, 2);
  await fs.writeFile(fp_sched, json, "utf8");
  console.log(`Schedule data written to ${fp_sched}`);
};

const main = async () => {
  program.command("crawl").action(crawl);
  program.command("write").action(write);
  await program.parseAsync(process.argv);
};

await main();
