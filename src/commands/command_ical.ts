import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { z } from "zod";
import { transformVCalendar } from "../ical.js";
import type { MyEvent } from "../types.js";
import { defaultDataDir } from "./options.js";

const inputSchema = z.object({
  dataDir: z.string(),
});
type Input = z.infer<typeof inputSchema>;

const write = async (input: Input) => {
  const { dataDir } = input;
  const files = await fs.readdir(dataDir);
  const candidates = files.filter(
    (file) => file.startsWith("schedule-") && file.endsWith(".json"),
  );

  const tasks = candidates.map(async (file) => {
    const fp = path.join(dataDir, file);
    const json = await fs.readFile(fp, "utf8");
    const results = JSON.parse(json) as MyEvent[];
    console.log(`Read ${results.length} events from ${file}`);
    return results;
  });
  const results = await Promise.all(tasks);

  // 시간순으로 일정 정렬된게 보기 편할듯
  const events = results.flat().sort((a, b) => {
    const x = new Date(a.date.year, a.date.month - 1, a.date.day);
    const y = new Date(b.date.year, b.date.month - 1, b.date.day);
    return x.getTime() - y.getTime();
  });
  console.log(`Total events: ${events.length}`);

  const now = new Date();
  const ics = transformVCalendar(events, now);
  const fp_ics = path.join(dataDir, "calendar.ics");
  await fs.writeFile(fp_ics, ics, "utf8");
  console.log(`iCalendar data written to ${fp_ics}`);
};

export const icalCommand = new Command("ical")
  .option(
    "--data-dir <path>",
    "Data directory to save crawled data",
    defaultDataDir,
  )
  .action(async (options) => {
    const input = inputSchema.parse(options);
    await write(input);
  });
