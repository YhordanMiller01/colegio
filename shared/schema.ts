import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, uuid, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late']);
export const behaviorTypeEnum = pgEnum('behavior_type', ['positive', 'negative']);
export const notificationStatusEnum = pgEnum('notification_status', ['sent', 'draft', 'failed']);
export const surveyTargetEnum = pgEnum('survey_target', ['students', 'parents', 'both']);
export const studentStatusEnum = pgEnum('student_status', ['active', 'inactive', 'graduated']);

// Users table (admins)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  status: studentStatusEnum("status").default('active').notNull(),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => students.id).notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  time: text("time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Behavior reports table
export const behaviorReports = pgTable("behavior_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => students.id).notNull(),
  teacherName: text("teacher_name").notNull(),
  type: behaviorTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  recipients: text("recipients").array().notNull(),
  type: text("type").notNull(),
  status: notificationStatusEnum("status").default('draft').notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Surveys table
export const surveys = pgTable("surveys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  target: surveyTargetEnum("target").notNull(),
  questions: text("questions").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  endDate: date("end_date"),
  responseCount: integer("response_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  attendance: many(attendance),
  behaviorReports: many(behaviorReports),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
}));

export const behaviorReportsRelations = relations(behaviorReports, ({ one }) => ({
  student: one(students, {
    fields: [behaviorReports.studentId],
    references: [students.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertBehaviorReportSchema = createInsertSchema(behaviorReports).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

// Extended schema for draft notifications that includes status
export const insertNotificationWithStatusSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true,
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  responseCount: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type BehaviorReport = typeof behaviorReports.$inferSelect;
export type InsertBehaviorReport = z.infer<typeof insertBehaviorReportSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type InsertNotificationWithStatus = z.infer<typeof insertNotificationWithStatusSchema>;
