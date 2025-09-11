var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/env-loader.ts
import dotenv from "dotenv";
dotenv.config();

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  attendance: () => attendance,
  attendanceRelations: () => attendanceRelations,
  attendanceStatusEnum: () => attendanceStatusEnum,
  behaviorReports: () => behaviorReports,
  behaviorReportsRelations: () => behaviorReportsRelations,
  behaviorTypeEnum: () => behaviorTypeEnum,
  insertAttendanceSchema: () => insertAttendanceSchema,
  insertBehaviorReportSchema: () => insertBehaviorReportSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertStudentSchema: () => insertStudentSchema,
  insertSurveySchema: () => insertSurveySchema,
  insertUserSchema: () => insertUserSchema,
  notificationStatusEnum: () => notificationStatusEnum,
  notifications: () => notifications,
  studentStatusEnum: () => studentStatusEnum,
  students: () => students,
  studentsRelations: () => studentsRelations,
  surveyTargetEnum: () => surveyTargetEnum,
  surveys: () => surveys,
  users: () => users
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, uuid, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late"]);
var behaviorTypeEnum = pgEnum("behavior_type", ["positive", "negative"]);
var notificationStatusEnum = pgEnum("notification_status", ["sent", "draft", "failed"]);
var surveyTargetEnum = pgEnum("survey_target", ["students", "parents", "both"]);
var studentStatusEnum = pgEnum("student_status", ["active", "inactive", "graduated"]);
var users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var students = pgTable("students", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: text("student_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  status: studentStatusEnum("status").default("active").notNull(),
  parentName: text("parent_name").notNull(),
  parentEmail: text("parent_email").notNull(),
  parentPhone: text("parent_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => students.id).notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  time: text("time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var behaviorReports = pgTable("behavior_reports", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => students.id).notNull(),
  teacherName: text("teacher_name").notNull(),
  type: behaviorTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  recipients: text("recipients").array().notNull(),
  type: text("type").notNull(),
  status: notificationStatusEnum("status").default("draft").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var surveys = pgTable("surveys", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  target: surveyTargetEnum("target").notNull(),
  questions: text("questions").array().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  endDate: date("end_date"),
  responseCount: integer("response_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var studentsRelations = relations(students, ({ many }) => ({
  attendance: many(attendance),
  behaviorReports: many(behaviorReports)
}));
var attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id]
  })
}));
var behaviorReportsRelations = relations(behaviorReports, ({ one }) => ({
  student: one(students, {
    fields: [behaviorReports.studentId],
    references: [students.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true
});
var insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true
});
var insertBehaviorReportSchema = createInsertSchema(behaviorReports).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  sentAt: true
});
var insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  createdAt: true,
  responseCount: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and, desc, sql as sql2 } from "drizzle-orm";
import bcrypt from "bcrypt";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db.insert(users).values({ ...insertUser, password: hashedPassword }).returning();
    return user;
  }
  async validateUser(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  async getStudents() {
    return await db.select().from(students).orderBy(students.firstName, students.lastName);
  }
  async getStudent(id) {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || void 0;
  }
  async createStudent(insertStudent) {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }
  async updateStudent(id, insertStudent) {
    const [student] = await db.update(students).set(insertStudent).where(eq(students.id, id)).returning();
    return student;
  }
  async deleteStudent(id) {
    await db.delete(students).where(eq(students.id, id));
  }
  async getAttendance(date2, grade, section) {
    let query = db.select().from(attendance).innerJoin(students, eq(attendance.studentId, students.id)).orderBy(desc(attendance.date), students.firstName);
    const conditions = [];
    if (date2) conditions.push(eq(attendance.date, date2));
    if (grade) conditions.push(eq(students.grade, grade));
    if (section) conditions.push(eq(students.section, section));
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const results = await query;
    return results.map((result) => ({
      ...result.attendance,
      student: result.students
    }));
  }
  async createAttendance(insertAttendance) {
    const [attendanceRecord] = await db.insert(attendance).values(insertAttendance).returning();
    return attendanceRecord;
  }
  async updateAttendance(id, insertAttendance) {
    const [attendanceRecord] = await db.update(attendance).set(insertAttendance).where(eq(attendance.id, id)).returning();
    return attendanceRecord;
  }
  async getBehaviorReports() {
    const results = await db.select().from(behaviorReports).innerJoin(students, eq(behaviorReports.studentId, students.id)).orderBy(desc(behaviorReports.createdAt));
    return results.map((result) => ({
      ...result.behavior_reports,
      student: result.students
    }));
  }
  async createBehaviorReport(insertReport) {
    const [report] = await db.insert(behaviorReports).values(insertReport).returning();
    return report;
  }
  async getNotifications() {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }
  async createNotification(insertNotification) {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }
  async updateNotificationStatus(id, status) {
    const [notification] = await db.update(notifications).set({ status, sentAt: status === "sent" ? /* @__PURE__ */ new Date() : void 0 }).where(eq(notifications.id, id)).returning();
    return notification;
  }
  async getSurveys() {
    return await db.select().from(surveys).orderBy(desc(surveys.createdAt));
  }
  async createSurvey(insertSurvey) {
    const [survey] = await db.insert(surveys).values(insertSurvey).returning();
    return survey;
  }
  async updateSurvey(id, insertSurvey) {
    const [survey] = await db.update(surveys).set(insertSurvey).where(eq(surveys.id, id)).returning();
    return survey;
  }
  async getDashboardStats() {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [
      totalStudentsResult,
      attendanceTodayResult,
      behaviorStatsResult,
      notificationStatsResult,
      surveyStatsResult
    ] = await Promise.all([
      // Total students
      db.select({ count: sql2`COUNT(*)` }).from(students).where(eq(students.status, "active")),
      // Attendance today
      db.select({
        total: sql2`COUNT(*)`,
        present: sql2`COUNT(*) FILTER (WHERE status = 'present')`
      }).from(attendance).where(eq(attendance.date, today)),
      // Behavior reports stats
      db.select({
        positive: sql2`COUNT(*) FILTER (WHERE type = 'positive')`,
        negative: sql2`COUNT(*) FILTER (WHERE type = 'negative')`
      }).from(behaviorReports),
      // Notifications sent
      db.select({ count: sql2`COUNT(*)` }).from(notifications).where(eq(notifications.status, "sent")),
      // Survey stats
      db.select({
        active: sql2`COUNT(*) FILTER (WHERE is_active = true)`,
        totalResponses: sql2`SUM(response_count)`
      }).from(surveys)
    ]);
    const totalStudents = Number(totalStudentsResult[0]?.count || 0);
    const attendanceData = attendanceTodayResult[0];
    const total = Number(attendanceData?.total || 0);
    const present = Number(attendanceData?.present || 0);
    const attendanceToday = total > 0 ? Math.round(present / total * 100) : 0;
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
};
var storage = new DatabaseStorage();

// server/routes.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
async function registerRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contrase\xF1a son requeridos" });
      }
      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inv\xE1lidas" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  app2.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Error al obtener estad\xEDsticas" });
    }
  });
  app2.get("/api/students", authenticateToken, async (req, res) => {
    try {
      const students2 = await storage.getStudents();
      res.json(students2);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ message: "Error al obtener estudiantes" });
    }
  });
  app2.post("/api/students", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Create student error:", error);
      res.status(400).json({ message: "Error al crear estudiante" });
    }
  });
  app2.put("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, validatedData);
      res.json(student);
    } catch (error) {
      console.error("Update student error:", error);
      res.status(400).json({ message: "Error al actualizar estudiante" });
    }
  });
  app2.delete("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStudent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(400).json({ message: "Error al eliminar estudiante" });
    }
  });
  app2.get("/api/attendance", authenticateToken, async (req, res) => {
    try {
      const { date: date2, grade, section } = req.query;
      const attendance2 = await storage.getAttendance(
        date2,
        grade,
        section
      );
      res.json(attendance2);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ message: "Error al obtener asistencia" });
    }
  });
  app2.post("/api/attendance", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance2 = await storage.createAttendance(validatedData);
      res.status(201).json(attendance2);
    } catch (error) {
      console.error("Create attendance error:", error);
      res.status(400).json({ message: "Error al crear registro de asistencia" });
    }
  });
  app2.put("/api/attendance/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertAttendanceSchema.partial().parse(req.body);
      const attendance2 = await storage.updateAttendance(id, validatedData);
      res.json(attendance2);
    } catch (error) {
      console.error("Update attendance error:", error);
      res.status(400).json({ message: "Error al actualizar asistencia" });
    }
  });
  app2.get("/api/behavior-reports", authenticateToken, async (req, res) => {
    try {
      const reports = await storage.getBehaviorReports();
      res.json(reports);
    } catch (error) {
      console.error("Get behavior reports error:", error);
      res.status(500).json({ message: "Error al obtener reportes de comportamiento" });
    }
  });
  app2.post("/api/behavior-reports", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertBehaviorReportSchema.parse(req.body);
      const report = await storage.createBehaviorReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Create behavior report error:", error);
      res.status(400).json({ message: "Error al crear reporte de comportamiento" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifications2 = await storage.getNotifications();
      res.json(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error al obtener notificaciones" });
    }
  });
  app2.post("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      await storage.updateNotificationStatus(notification.id, "sent");
      res.status(201).json(notification);
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(400).json({ message: "Error al crear notificaci\xF3n" });
    }
  });
  app2.get("/api/surveys", authenticateToken, async (req, res) => {
    try {
      const surveys2 = await storage.getSurveys();
      res.json(surveys2);
    } catch (error) {
      console.error("Get surveys error:", error);
      res.status(500).json({ message: "Error al obtener encuestas" });
    }
  });
  app2.post("/api/surveys", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertSurveySchema.parse(req.body);
      const survey = await storage.createSurvey(validatedData);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Create survey error:", error);
      res.status(400).json({ message: "Error al crear encuesta" });
    }
  });
  app2.put("/api/surveys/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSurveySchema.partial().parse(req.body);
      const survey = await storage.updateSurvey(id, validatedData);
      res.json(survey);
    } catch (error) {
      console.error("Update survey error:", error);
      res.status(400).json({ message: "Error al actualizar encuesta" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
