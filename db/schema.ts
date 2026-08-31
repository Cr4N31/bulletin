import { db } from "./database";

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS habit( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT NOT NULL, 
        isPriority INTEGER NOT NULL DEFAULT 0, 
        scheduleDays TEXT NOT NULL, 
        createdAt TEXT NOT NULL 
    );
 `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS habit_log( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        habitId INTEGER NOT NULL, 
        date TEXT NOT NULL, 
        completed INTEGER NOT NULL DEFAULT 0, 
        FOREIGN KEY (habitId) REFERENCES habit (id) 
    );
 `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS project( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT NOT NULL, 
        status TEXT NOT NULL, 
        priority TEXT NOT NULL, 
        progress REAL NOT NULL, 
        notes TEXT, 
        createdAt TEXT NOT NULL 
    );
 `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS project_progress_log(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    amountAdded INTEGER NOT NULL,
    note TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(projectId) REFERENCES project (id))
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS meetings( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT NOT NULL, 
        date TEXT NOT NULL, 
        time TEXT NOT NULL, 
        notes TEXT, 
        createdAt TEXT NOT NULL 
    );
 `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS activity_log(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        action TEXT NOT NULL,
        description TEXT NOT NULL,
        createdAt TEXT NOT NULL
); 
      `);
  console.log("Tables created");
}
