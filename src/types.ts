export type Schedule = {
  title: string;
  matchup?: string;
  startTime?: string;
  endTime?: string;
  site?: string;
  tel?: string;
};

export type MyDate = {
  year: number;
  month: number;
  day: number;
};

export type MyEvent = {
  date: MyDate;
  schedule: Schedule;
  lines: string[];
};
