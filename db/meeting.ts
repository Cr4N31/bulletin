import { db } from "./database";

export type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
};

export async function createMeeting(
  title: string,
  date: string,
  time: string,
  notes: string = "",
): Promise<number> {
  const createdAt = new Date().toISOString();

  const result = await db.runAsync(
    `
      INSERT INTO meetings (
        title,
        date,
        time,
        notes,
        createdAt
      )
      VALUES (?, ?, ?, ?, ?)
    `,
    [title.trim(), date, time, notes.trim(), createdAt],
  );

  return result.lastInsertRowId;
}

export async function getMeetings(): Promise<Meeting[]> {
  const meetings = await db.getAllAsync<Meeting>(
    `
        SELECT * 
        FROM meetings
        ORDER BY date ASC, time  ASC
      `,
  );
  return meetings;
}

export async function getMeeting(id: number): Promise<Meeting | null> {
  const meeting = await db.getFirstAsync<Meeting>(
    `
      SELECT * 
      FROM meetings
      WHERE id = ? 
    `,
    [id],
  );
  return meeting ?? null;
}

export async function updateMeeting(
  id: number,
  title: string,
  date: string,
  time: string,
  notes: string = "",
): Promise<void> {
  await db.runAsync(
    `
      UPDATE meetings
      SET
        title = ?,
        date = ?,
        time = ?,
        notes = ?
      WHERE id = ?
    `,
    [title.trim(), date, time, notes.trim(), id],
  );
}
export async function deleteMeeting(id: number): Promise<void> {
  await db.runAsync(
    `
      DELETE FROM meetings
      WHERE id = ?
    `,
    [id],
  );
}
