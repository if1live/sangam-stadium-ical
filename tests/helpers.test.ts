import { assert, describe, it } from "vitest";
import { createUrl } from "../src/helpers.js";

describe("createUrl", () => {
  it("match", () => {
    const actual = createUrl(2025, 3);
    const expected =
      "https://www.sisul.or.kr/open_content/sub/schedule/detail.do?year=2025&month=03&day=01&site_div=worldcupst";
    assert.equal(actual, expected);
  });
});
