import { db } from "./database";

export type Habit = {
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

export async function createHabit(
  title: string,
  isPriority: boolean,
  scheduleDays: string,
): Promise<number> {
  const createdAt = new Date().toISOString();
  const result = await db.runAsync(
    `
          INSERT INTO habit(
              title,
              isPriority,
              scheduleDays,
              createdAt
          )
              VALUES( ?, ?, ?, ? )
      `,
    [title.trim(), isPriority ? 1 : 0, scheduleDays, createdAt],
  );

  return result.lastInsertRowId;
}

export async function getHabits(): Promise<Habit[]> {
  return await db.getAllAsync<Habit>(`
    SELECT * FROM habit
    ORDER BY title ASC
  `);
}

export async function getHabit(id: number): Promise<Habit | null> {
  return await db.getFirstAsync<Habit>(`SELECT * FROM habit WHERE id = ?`, [
    id,
  ]);
}

export async function updateHabit(
  id: number,
  title: string,
  isPriority: boolean,
  scheduleDays: string,
): Promise<void> {
  await db.runAsync(
    `UPDATE habit
     SET title = ?, isPriority = ?, scheduleDays = ?
     WHERE id = ?`,
    [title.trim(), isPriority ? 1 : 0, scheduleDays, id],
  );
}

export async function deleteHabit(id: number): Promise<void> {
  await db.runAsync(`DELETE FROM habit_log WHERE habitId = ?`, [id]);
  await db.runAsync(`DELETE FROM habit WHERE id = ?`, [id]);
}

export async function setPriorityHabit(id: number): Promise<void> {
  await db.runAsync(`UPDATE habit SET isPriority = 0`);
  await db.runAsync(`UPDATE habit SET isPriority = 1 WHERE id = ?`, [id]);
}

export async function getPriorityHabit(): Promise<Habit | null> {
  return await db.getFirstAsync<Habit>(
    `SELECT * FROM habit WHERE isPriority = 1 LIMIT 1`,
  );
}

export async function toggleHabitLog(
  habitId: number,
  date: string,
): Promise<void> {
  const existing = await db.getFirstAsync<HabitLog>(
    `SELECT * FROM habit_log WHERE habitId = ? AND date = ?`,
    [habitId, date],
  );

  if (existing) {
    await db.runAsync(`UPDATE habit_log SET completed = ? WHERE id = ?`, [
      existing.completed ? 0 : 1,
      existing.id,
    ]);
  } else {
    await db.runAsync(
      `INSERT INTO habit_log (habitId, date, completed) VALUES (?, ?, 1)`,
      [habitId, date],
    );
  }
}

export async function getHabitLogs(
  habitId: number,
  daysBack: number = 30,
): Promise<HabitLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  const startDateStr = startDate.toISOString().split("T")[0];

  return await db.getAllAsync<HabitLog>(
    `SELECT * FROM habit_log WHERE habitId = ? AND date >= ? ORDER BY date ASC`,
    [habitId, startDateStr],
  );
}
