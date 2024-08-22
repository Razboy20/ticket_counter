import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull(),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const eventTable = sqliteTable("event", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  date: integer("date", { mode: "timestamp" }),
});

export const attendanceTable = sqliteTable("attendance", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  eventId: text("event_id")
    .notNull()
    .references(() => eventTable.id),
  checkinTime: integer("checkin_time", { mode: "timestamp" }).notNull(),
});

export const schema = {
  users: userTable,
  sessions: sessionTable,
  events: eventTable,
  attendance: attendanceTable,
};

export type User = typeof userTable.$inferSelect;
export type Session = typeof sessionTable.$inferSelect;
export type Event = typeof eventTable.$inferSelect;
export type Attendance = typeof attendanceTable.$inferSelect;
