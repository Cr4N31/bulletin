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

export async function createProject(
  title: string,
  status: Project["status"] = "Not Started",
  priority: Project["priority"] = "Medium",
  progress: number = 0,
  notes: string = "",
): Promise<number> {
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `
      INSERT INTO project (
        title,
        status,
        priority,
        progress,
        notes,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [title.trim(), status, priority, progress, notes.trim(), createdAt],
  );

  return result.lastInsertRowId;
}

export async function getProjects(): Promise<Project[]> {
  return await db.getAllAsync<Project>(
    `
      SELECT *
      FROM project
      ORDER BY createdAt DESC
    `,
  );
}

export async function getProject(id: number): Promise<Project | null> {
  const project = await db.getFirstAsync<Project>(
    `
      SELECT *
      FROM project
      WHERE id = ?
    `,
    [id],
  );
  return project ?? null;
}

export async function updateProject(
  id: number,
  title: string,
  status: Project["status"],
  priority: Project["priority"],
  progress: number,
  notes: string = "",
): Promise<void> {
  await db.runAsync(
    `
      UPDATE project
      SET
        title = ?,
        status = ?,
        priority = ?,
        progress = ?,
        notes = ?
      WHERE id = ?
    `,
    [title.trim(), status, priority, progress, notes.trim(), id],
  );
}

export async function updateProjectProgress(
  id: number,
  progress: number,
): Promise<void> {
  const status: Project["status"] =
    progress >= 100
      ? "Completed"
      : progress > 0
        ? "In progress"
        : "Not Started";

  await db.runAsync(
    `
      UPDATE project
      SET progress = ?, status = ?
      WHERE id = ?
    `,
    [progress, status, id],
  );
}

export async function deleteProject(id: number): Promise<void> {
  await db.runAsync(
    `
      DELETE FROM project
      WHERE id = ?
    `,
    [id],
  );
}
