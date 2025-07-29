import { Command } from "commander";
import { crawlCommand } from "./commands/command_crawl.js";
import { icalCommand } from "./commands/command_ical.js";

const program = new Command();
program.addCommand(crawlCommand);
program.addCommand(icalCommand);
await program.parseAsync(process.argv);
