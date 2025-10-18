export const createUrl = (year: number, month: number, day: number) => {
  const search = new URLSearchParams();
  search.set("year", year.toString());
  search.set("month", month.toString().padStart(2, "0"));
  search.set("day", day.toString().padStart(2, "0"));
  search.set("site_div", "worldcupst");

  const path = "https://www.sisul.or.kr/open_content/sub/schedule/detail.do";
  return `${path}?${search.toString()}`;
};
