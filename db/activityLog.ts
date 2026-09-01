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

export async function getActivityCountByDay(
  daysBack: number = 7,
): Promise<{ date: string; count: number }[]> {
  const logs = await getRecentActivity(500); // enough headroom to cover a week of activity
  const results: { date: string; count: number }[] = [];

  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    const count = logs.filter((log) =>
      log.createdAt.startsWith(dateStr),
    ).length;
    results.push({ date: dateStr, count });
  }

  return results;
}
