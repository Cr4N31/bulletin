import { db } from "./database";

export type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
};
