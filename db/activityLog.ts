import { db } from "./database";

export type ActivityLog = {
  id: number;
  type: "habit" | "meeting" | "project";
  action: string;
  description: string;
  createdAt: string;
};

export async function logActivity(
  type: ActivityLog["type"],
  action: string,
  description: string,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO activity_log (type, action, description, createdAt) VALUES (?, ?, ?, ?)`,
    [type, action, description, new Date().toISOString()],
  );
}

export async function getRecentActivity(
  limit: number = 50,
): Promise<ActivityLog[]> {
  return await db.getAllAsync<ActivityLog>(
    `SELECT * FROM activity_log ORDER BY createdAt DESC LIMIT ?`,
    [limit],
  );
}
