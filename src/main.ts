import { Command } from "commander";
import {
  crawlFutureCommand,
  crawlYearMonthCommand,
} from "./commands/command_crawl.js";
import { icalCommand } from "./commands/command_ical.js";

const program = new Command();
program.addCommand(crawlYearMonthCommand);
program.addCommand(crawlFutureCommand);
program.addCommand(icalCommand);
await program.parseAsync(process.argv);
