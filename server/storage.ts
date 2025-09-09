import { 
  users, 
  students, 
  attendance, 
  behaviorReports, 
  notifications, 
  surveys,
  type User, 
  type InsertUser,
  type Student,
  type InsertStudent,
  type Attendance,
  type InsertAttendance,
  type BehaviorReport,
  type InsertBehaviorReport,
  type Notification,
  type InsertNotification,
  type Survey,
  type InsertSurvey,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(email: string, password: string): Promise<User | null>;

  // Student methods
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  // Attendance methods
  getAttendance(date?: string, grade?: string, section?: string): Promise<(Attendance & { student: Student })[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance>;

  // Behavior report methods
  getBehaviorReports(): Promise<(BehaviorReport & { student: Student })[]>;
  createBehaviorReport(report: InsertBehaviorReport): Promise<BehaviorReport>;

  // Notification methods
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotificationStatus(id: string, status: 'sent' | 'failed'): Promise<Notification>;

  // Survey methods
  getSurveys(): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: string, survey: Partial<InsertSurvey>): Promise<Survey>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalStudents: number;
    attendanceToday: number;
    pendingReports: number;
    notificationsSent: number;
    positiveReports: number;
    negativeReports: number;
    activeSurveys: number;
    surveyResponses: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(students.firstName, students.lastName);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values(insertStudent)
      .returning();
    return student;
  }

  async updateStudent(id: string, insertStudent: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(insertStudent)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getAttendance(date?: string, grade?: string, section?: string): Promise<(Attendance & { student: Student })[]> {
    let query = db
      .select()
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .orderBy(desc(attendance.date), students.firstName);

    const conditions = [];
    if (date) conditions.push(eq(attendance.date, date));
    if (grade) conditions.push(eq(students.grade, grade));
    if (section) conditions.push(eq(students.section, section));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;
    return results.map(result => ({
      ...result.attendance,
      student: result.students
    }));
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db
      .insert(attendance)
      .values(insertAttendance)
      .returning();
    return attendanceRecord;
  }

  async updateAttendance(id: string, insertAttendance: Partial<InsertAttendance>): Promise<Attendance> {
    const [attendanceRecord] = await db
      .update(attendance)
      .set(insertAttendance)
      .where(eq(attendance.id, id))
      .returning();
    return attendanceRecord;
  }

  async getBehaviorReports(): Promise<(BehaviorReport & { student: Student })[]> {
    const results = await db
      .select()
      .from(behaviorReports)
      .innerJoin(students, eq(behaviorReports.studentId, students.id))
      .orderBy(desc(behaviorReports.createdAt));

    return results.map(result => ({
      ...result.behavior_reports,
      student: result.students
    }));
  }

  async createBehaviorReport(insertReport: InsertBehaviorReport): Promise<BehaviorReport> {
    const [report] = await db
      .insert(behaviorReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async updateNotificationStatus(id: string, status: 'sent' | 'failed'): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ status, sentAt: status === 'sent' ? new Date() : undefined })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getSurveys(): Promise<Survey[]> {
    return await db.select().from(surveys).orderBy(desc(surveys.createdAt));
  }

  async createSurvey(insertSurvey: InsertSurvey): Promise<Survey> {
    const [survey] = await db
      .insert(surveys)
      .values(insertSurvey)
      .returning();
    return survey;
  }

  async updateSurvey(id: string, insertSurvey: Partial<InsertSurvey>): Promise<Survey> {
    const [survey] = await db
      .update(surveys)
      .set(insertSurvey)
      .where(eq(surveys.id, id))
      .returning();
    return survey;
  }

  async getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalStudentsResult,
      attendanceTodayResult,
      behaviorStatsResult,
      notificationStatsResult,
      surveyStatsResult
    ] = await Promise.all([
      // Total students
      db.select({ count: sql`COUNT(*)` }).from(students).where(eq(students.status, 'active')),

      // Attendance today
      db.select({ 
        total: sql`COUNT(*)`,
        present: sql`COUNT(*) FILTER (WHERE status = 'present')`
      }).from(attendance).where(eq(attendance.date, today)),

      // Behavior reports stats
      db.select({
        positive: sql`COUNT(*) FILTER (WHERE type = 'positive')`,
        negative: sql`COUNT(*) FILTER (WHERE type = 'negative')`
      }).from(behaviorReports),

      // Notifications sent
      db.select({ count: sql`COUNT(*)` }).from(notifications).where(eq(notifications.status, 'sent')),

      // Survey stats
      db.select({
        active: sql`COUNT(*) FILTER (WHERE is_active = true)`,
        totalResponses: sql`SUM(response_count)`
      }).from(surveys)
    ]);

    const totalStudents = Number(totalStudentsResult[0]?.count || 0);
    const attendanceData = attendanceTodayResult[0];
    const total = Number(attendanceData?.total || 0);
    const present = Number(attendanceData?.present || 0);
    const attendanceToday = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      totalStudents,
      attendanceToday,
      pendingReports: Number(behaviorStatsResult[0]?.negative || 0),
      notificationsSent: Number(notificationStatsResult[0]?.count || 0),
      positiveReports: Number(behaviorStatsResult[0]?.positive || 0),
      negativeReports: Number(behaviorStatsResult[0]?.negative || 0),
      activeSurveys: Number(surveyStatsResult[0]?.active || 0),
      surveyResponses: Number(surveyStatsResult[0]?.totalResponses || 0)
    };
  }
}

export const storage = new DatabaseStorage();
