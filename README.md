# 서울월드컵경기장 iCal

## why?

평화로운 퇴근을 위하여.

![실시간...축구보러가는길 합정역](./documents/resize.jpg)

> 실시간...축구보러가는길 합정역
>
> 열차 최소 3번은 놓칠듯 ㅠ
>
> https://bbs.ruliweb.com/etcs/board/300781/read/57392774


## URL

https://raw.githubusercontent.com/if1live/sangam-stadium-ical/refs/heads/main/data/sangam-stadium.ics
[iCal](https://raw.githubusercontent.com/if1live/sangam-stadium-ical/refs/heads/main/data/sangam-stadium.ics)

## usage

```sh
# html -> schedule.json
pnpm tsx src/main.ts crawl

# schedule.json -> sangam-stadium.ics
pnpm tsx src/main.ts write
```
