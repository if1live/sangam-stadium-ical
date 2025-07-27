import { assert, describe, it } from "vitest";
import {
  createUrl,
  parseSchedule,
  parseSiteAndTel,
  parseTitle,
} from "../src/helpers.js";

describe("createUrl", () => {
  it("match", () => {
    const actual = createUrl(2025, 3);
    const expected =
      "https://www.sisul.or.kr/open_content/sub/schedule/detail.do?year=2025&month=03&day=01&site_div=worldcupst";
    assert.equal(actual, expected);
  });
});

describe("parseTitle", () => {
  it.each([
    ["[2025 K리그1]", "2025 K리그1"],
    ["2025 쿠팡플레이시리즈", "2025 쿠팡플레이시리즈"],
    [
      "경 기 명 : 2026 북중미월드컵 아시아지역 3차예선 대한민국 vs 쿠웨이트",
      "2026 북중미월드컵 아시아지역 3차예선 대한민국 vs 쿠웨이트",
    ],
  ])("parseTitle(%s) should return %s", (input, expected) => {
    const actual = parseTitle(input);
    assert.equal(actual, expected);
  });
});

describe("parseSiteAndTel", () => {
  it("K리그", () => {
    const text = `
- 홈페이지 : http://www.fcseoul.com/
- 대표번호 : 02-306-5050
`.trim();
    const lines = text.split("\n");
    const actual = parseSiteAndTel(lines);
    assert.deepEqual(actual, {
      site: "http://www.fcseoul.com/",
      tel: "02-306-5050",
    });
  });

  it("WK리그", () => {
    const text = `
- 홈페이지 : 한국여자축구연맹(KWFF)
- 대표번호 : 02-490-2794
`.trim();
    const lines = text.split("\n");
    const actual = parseSiteAndTel(lines);
    assert.deepEqual(actual, {
      site: "한국여자축구연맹(KWFF)",
      tel: "02-490-2794",
    });
  });

  it("blank", () => {
    const lines: string[] = [];
    const actual = parseSiteAndTel(lines);
    assert.deepEqual(actual, {});
  });
});

const scheduleText = (text: string) => {
  const lines = text
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  return lines;
};

describe("parseSchedule", () => {
  it("K리그1", () => {
    const text = scheduleText(`
[2025 K리그1]
대 진 : 서울 vs 김천(14:00)
장 소 : 서울월드컵경기장
■ 축구경기 관련 문의
- 홈페이지 : http://www.fcseoul.com/
- 대표번호 : 02-306-5050
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2025 K리그1",
      // matchup: "서울 vs 김천",
      // startTime: "14:00",
      site: "http://www.fcseoul.com/",
      tel: "02-306-5050",
    });
  });

  it("WK리그", () => {
    const text = scheduleText(`
[2025 WK리그]
대 진 : 서울시청 vs 수원FC
장 소 : 서울월드컵경기장 보조경기장
시 간 : 19:00 ~ 21:00
* 축구경기 관련 문의
- 홈페이지 : 한국여자축구연맹(KWFF)
- 대표번호 : 02-490-2794
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2025 WK리그",
      // matchup: "서울시청 vs 수원FC",
      // startTime: "19:00",
      // endTime: "21:00",
      site: "한국여자축구연맹(KWFF)",
      tel: "02-490-2794",
    });
  });

  it("공공행사", () => {
    const text = scheduleText(`
[서울월드컵경기장 공공행사]
주 최 : 서울특별시, 서울관광재단
내 용 : 서울 스프링 페스타 개막식
행사일 : 2025.04.30(수)
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "서울월드컵경기장 공공행사",
    });
  });

  it("북중미월드컵", () => {
    const text = scheduleText(`
경 기 명 : 2026 북중미월드컵 아시아지역 3차예선 대한민국 vs 쿠웨이트
경 기 일 : 2025. 6. 10(화) 20:00
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2026 북중미월드컵 아시아지역 3차예선 대한민국 vs 쿠웨이트",
      // startTime: "20:00",
    });
  });

  it("코리아컵", () => {
    const text = scheduleText(`
[2025 코리아컵 8강]
대 진 : 서울 vs 전북(19:30)
장 소 : 서울월드컵경기장
■ 축구경기 관련 문의
- 홈페이지 : http://www.fcseoul.com/
- 대표번호 : 02-306-5050
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2025 코리아컵 8강",
      // matchup: "서울 vs 전북",
      // startTime: "19:30",
      site: "http://www.fcseoul.com/",
      tel: "02-306-5050",
    });
  });

  it("친선경기", () => {
    const text = scheduleText(`
[2025 FC서울 친선경기]
대 진 : 서울 vs FC바르셀로나
장 소 : 서울월드컵경기장
■ 축구경기 관련 문의
- 홈페이지 : http://www.fcseoul.com/
- 대표번호 : 02-306-5050
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2025 FC서울 친선경기",
      // matchup: "서울 vs FC바르셀로나",
      site: "http://www.fcseoul.com/",
      tel: "02-306-5050",
    });
  });

  it("쿠팡플레이시리즈", () => {
    const text = scheduleText(`
2025 쿠팡플레이시리즈
대 진 : 토트넘vs 뉴캐슬
장 소 : 서울월드컵경기장
■ 축구경기 관련 문의
- 홈페이지 : www.coupangplay.com
- 대표번호 : 1600-9800
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2025 쿠팡플레이시리즈",
      // matchup: "토트넘vs 뉴캐슬",
      site: "www.coupangplay.com",
      tel: "1600-9800",
    });
  });

  it("아이콘매치", () => {
    const text = scheduleText(`
2025 아이콘매치
`);
    const actual = parseSchedule(text);
    assert.deepEqual(actual, {
      title: "2025 아이콘매치",
    });
  });
});
