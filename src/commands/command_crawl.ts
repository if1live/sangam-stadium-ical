import fs from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { z } from "zod";
import { createUrl } from "../helpers.js";
import { parseMonthHtml } from "../parser.js";
import { dataDir } from "./command_ical.js";

const yearSchema = z.number().int();
const monthSchema = z.number().int().min(1).max(12);

type YearMonth = {
  year: number;
  month: number;
};

const crawl = async (input: YearMonth) => {
  const { year, month } = input;
  const mm = month.toString().padStart(2, "0");

  const url = createUrl(year, month);
  const resp = await fetch(url);
  const html = await resp.text();
  const candidates = parseMonthHtml(year, month, html);
  console.log(`Results for ${year}-${mm}: ${candidates.length}`);

  const fileName = `schedule-${year}-${mm}.json`;
  const fp = path.join(dataDir, fileName);

  const json = JSON.stringify(candidates, null, 2);
  await fs.writeFile(fp, json, "utf8");
  console.log(`Schedule data written to ${fp}`);
};

// 지정된 날짜 크롤링
export const crawlYearMonthCommand = new Command("crawl-year-month")
  .requiredOption("--list <strings...>", "yyyy-mm (예: 2025-01 2025-02)")
  .action(async (options) => {
    const list: YearMonth[] = options.list.map((item: string): YearMonth => {
      const tokens = item.split("-").map((x) => Number.parseInt(x, 10));
      const year = yearSchema.parse(tokens[0]);
      const month = monthSchema.parse(tokens[1]);
      return { year, month };
    });

    const tasks = list.map(async (x) => crawl(x));
    await Promise.all(tasks);
  });

// 오늘을 기준으로 적절히 크롤링 범위 결정
export const crawlFutureCommand = new Command("crawl-future").action(
  async () => {
    console.log("todo");
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const targets: YearMonth[] = [];
    for (let m = month; m <= month + 3; m++) {
      const date = new Date(year, m - 1);
      targets.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    }

    const tasks = targets.map(async (x) => crawl(x));
    await Promise.all(tasks);
  },
);
