# 서울월드컵경기장 iCal

## why?

![실시간...축구보러가는길 합정역](./images/resize.jpg)

> 실시간...축구보러가는길 합정역
>
> 열차 최소 3번은 놓칠듯 ㅠ
>
> <https://bbs.ruliweb.com/etcs/board/300781/read/57392774>

서울월드컵경기장에서 축구 있는날 합정역은 헬-이다.
홈플러스 월드컵점 역시 헬-이다.

행사 일정 보고 눈치껏 피해야지

## URL

- git branch
  - <https://github.com/if1live/sangam-stadium-ical/tree/data>
- iCal
  - <https://raw.githubusercontent.com/if1live/sangam-stadium-ical/refs/heads/data/calendar.ics>
- 구글 캘린더 공개 URL
  - <https://calendar.google.com/calendar/embed?src=uvg3h88kfrid1mffnktrrvp2tcvhvg22%40import.calendar.google.com&ctz=Asia%2FSeoul>
  - 테스트하다 말아먹고 URL 바뀔 수 있어서 iCal 주소로 등록하는거 권장

## usage

```sh
# html -> schedule.json
pnpm tsx src/main.ts crawl

# schedule.json -> sangam-stadium.ics
pnpm tsx src/main.ts write
```

## 데이터 출처

서울시설공단 - 서울월드컵경기장 - 시설이용안내 - 경기/행사 일정
... 을 적당히 크롤링

<https://www.sisul.or.kr/open_content/sub/schedule/list.do?year=2025&month=7&site_div=worldcupst>
