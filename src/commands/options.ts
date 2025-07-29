import path from "node:path";
import { z } from "zod";

export const dataDirSchema = z.string();

export const defaultDataDir = path.join(process.cwd(), "data");
