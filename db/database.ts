import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("bulletin.db");
console.log("DB initialised:", db);
