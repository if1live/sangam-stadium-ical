import { JSDOM } from "jsdom";
import type { Schedule } from "./types.ts";

const reNumber = /^\d+$/;

const extractDay = (tdElem: Element): number => {
  // 날짜 획득.
  // 일반적으로는 first child를 그대로 써도 되지만 today일때는 따로 처리해야한다.
  for (const child of tdElem.childNodes) {
    if (child.nodeType !== child.TEXT_NODE) {
      continue;
    }

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

type ExtractContentFn = (elem: Element) => string;

/*
패턴 A: anchor tag 내부에 상세 정보가 있음
.calendar tbody a -> attribute title 사용
<td onclick="thisSchedule('2025','10','14','worldcupst');" onmouseleave="hideThisSch(this);">
  14
  <p>
    <a href="#none" title="경 기 명 : 남자축구 국가대표팀 친선경기 파라과이전 어쩌고저쩌고">
      경 기 명 : 남자축...<img src="/open_content/main/images/sub/icon_sch.gif" alt="일정">
    </a>
  </p>
  <div class="overCon" style="display:none;">경 기 명 : 남자축...</div>
</td>
*/
const extractContentFromAnchor: ExtractContentFn = (elem) => {
  return elem.attributes.getNamedItem("title")?.value ?? "";
};

/*
패턴 B: anchor tag에 상세 정보 없음
.calendar tbody div로 그나마 유추할수 있음
<td class="sat today" onclick="thisSchedule('2025','10','18','worldcupst');" onmouseleave="hideThisSch(this);">
  <span>Today</span>
  18
  <p>
    <img src="/open_content/main/images/sub/icon_sch.gif" alt="일정">
  </p>
  <div class="overCon" style="display:none;">[2025 K리그1]대...</div>
</td>
*/
const extractContentFromDiv: ExtractContentFn = (elem) => {
  return elem.textContent?.trim() ?? "";
};

/*
패턴C: 일정 없음
p tag 비어있음
<td onclick="thisSchedule('2025','10','16','worldcupst');" onmouseleave="hideThisSch(this);">
  16
  <p></p>
</td>
*/

export const parseMonthHtml = (year: number, month: number, html: string) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const results = [];

  const selectors = '.calendar tbody td[onclick]:not([onclick=""])';
  const elements = document.querySelectorAll(selectors);
  for (const tdElem of elements) {
    // 날짜 획득. today일때는 따로 처리해야한다.
    const day = extractDay(tdElem);
    const date = { year, month, day };

    let text: string | null = null;

    const anchorEl = tdElem.querySelector("a");
    text = text || (anchorEl ? extractContentFromAnchor(anchorEl) : null);

    const divEl = tdElem.querySelector("div.overCon");
    text = text || (divEl ? extractContentFromDiv(divEl) : null);

    if (!text) {
      // 일정 없음
      continue;
    }

    const lines = text
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    const schedule = parseSchedule(lines);

    console.log(`${year}-${month}-${day}: ${schedule.title}`);
    results.push({ schedule, date, lines });
  }

  return results;
};
