import { db } from "./database";

export type Habits = {
  id: number;
  title: string;
  isPriority: boolean;
  scheduleDays: string;
  createdAt: string;
};

export type HabitLog = {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
};
