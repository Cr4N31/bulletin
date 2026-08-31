import { db } from "./database";

export type ProjectProgressLog = {
  id: number;
  projectId: number;
  amountAdded: number;
  note: string | null;
  createdAt: string;
};

export async function addProgressLog(
  projectId: number,
  amountAdded: number,
  note: string,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO project_progress_log (projectId, amountAdded, note, createdAt) VALUES(?, ?, ?, ?)`,
    [projectId, amountAdded, note.trim() || null, new Date().toISOString()],
  );
}

export async function getProgressLogs(
  projectId: number,
): Promise<ProjectProgressLog[]> {
  return await db.getAllAsync<ProjectProgressLog>(
    `SELECT * FROM project_progress_log WHERE projectId = ? ORDER BY createdAt DESC`,
    [projectId],
  );
}
