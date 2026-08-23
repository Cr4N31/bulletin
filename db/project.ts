import { db } from "./database";

export type Project = {
  id: number;
  title: string;
  status: "Not Started" | "In progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  progress: number;
  notes: string;
  createdAt: string;
};
