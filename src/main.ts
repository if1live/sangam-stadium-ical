import { JSDOM } from "jsdom";
import { createUrl, extractDate } from "./helpers.js";

const year = 2025;
const month = 12;

const url = createUrl(year, month);
const resp = await fetch(url);
const html = await resp.text();
const dom = new JSDOM(html);
const document = dom.window.document;

const anchorElements = document.querySelectorAll(".calendar tbody a");
for (const anchorElem of anchorElements) {
  const trElem = anchorElem.parentNode?.parentNode;
  if (!trElem) {
    continue;
  }

  const date = extractDate(trElem);

  const title: string =
    anchorElem.attributes.getNamedItem("title")?.value ?? "";
  const lines = title
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  const text = lines.join("\n");

  console.log(`${year}.${month}.${date}`);
  console.log(text);
  console.log('');
  console.log('');
}
