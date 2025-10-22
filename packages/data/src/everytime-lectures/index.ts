export interface EverytimeLectureRate {
  average: number;
  count: number;
  items: { value: number; count: number }[];
}

export interface EverytimeLectureDetail {
  name: string;
  count: number;
  items: { text: string; count: number }[];
}

export interface EverytimeLecture {
  id: number;
  name: string;
  professor: string;
  rate: EverytimeLectureRate;
  details: EverytimeLectureDetail[];
}

export const everytimeLectures: EverytimeLecture[] = require('./everytime-lectures.json');
