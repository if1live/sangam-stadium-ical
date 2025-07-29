import { JSDOM } from "jsdom";
import type { Schedule } from "./types.ts";

const reNumber = /^\d+$/;

export const extractDay = (trElem: ParentNode) => {
  for (const child of trElem.childNodes) {
    const text = child.textContent?.trim();
    if (!text) {
      continue;
    }

    const match = reNumber.exec(text);
    if (!match) {
      continue;
    }

    const date = parseInt(match[0], 10);
    return date;
  }

  return -1;
};

export const parseTitle = (text: string): string => {
  if (text[0] === "[") {
    return text.replace("[", "").replace("]", "").trim();
  }

  if (text.includes(":")) {
    const tokens = text.split(":");
    const token = tokens[1] ?? "";
    return token.trim();
  }

  return text;
};

const reSite = /홈페이지:(.+)/;
const reTel = /대표번호:(.+)/;

export const parseSiteAndTel = (
  lines: string[],
): Pick<Schedule, "site" | "tel"> => {
  let content: { site?: string; tel?: string } = {};

  for (const line of lines) {
    const compact = line.replaceAll(" ", "");
    const matchTel = reTel.exec(compact);
    if (matchTel) {
      content = { ...content, tel: matchTel[1] };
    }

    const matchSite = reSite.exec(compact);
    if (matchSite) {
      content = { ...content, site: matchSite[1] };
    }
  }
  return content;
};

// '대진'의 vs 규격은 사람이 입력하나 공백이 조금씩 다르다
// "대 진 : 토트넘vs 뉴캐슬"
// "대 진 : 서울 vs FC바르셀로나"
// "대 진 : 서울 vs 전북(19:30)"
// 근데 없어도 되는 정보 아닐까? 내 관심사는 행사 자체니까
export const parseMatchup = (lines: string[]): string | undefined => {
  for (const line of lines) {
    if (!line.includes("대 진 :")) {
      continue;
    }
    const _tokens = line.split(":")[1]?.split("vs") ?? [];
  }

  return "TODO";
};

// 데이터 처리 쉽게 하려고 공백 적당히 제거된 내용 가공
export const parseSchedule = (lines: string[]): Schedule => {
  // 제목은 첫줄 그대로 써도 되지 않을까?
  // 어차피 나한테 관심있는건 행사의 내용이 아니라 존재 여부니까
  const firstLine = lines[0] ?? "";
  const title = parseTitle(firstLine);

  const siteAndTel = parseSiteAndTel(lines);

  const content: Schedule = {
    title,
    ...siteAndTel,
  };

  return content;
};

export const parseMonthHtml = (year: number, month: number, html: string) => {
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
