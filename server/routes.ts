import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertAttendanceSchema, insertBehaviorReportSchema, insertNotificationSchema, insertNotificationWithStatusSchema, insertSurveySchema } from "@shared/schema";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son requeridos" });
      }

      const user = await storage.validateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
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

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Error al obtener estadísticas" });
    }
  });

  // Dashboard chart data
  app.get("/api/dashboard/weekly-attendance", authenticateToken, async (req, res) => {
    try {
      const data = await storage.getWeeklyAttendanceData();
      res.json(data);
    } catch (error) {
      console.error("Weekly attendance data error:", error);
      res.status(500).json({ message: "Error al obtener datos de asistencia semanal" });
    }
  });

  app.get("/api/dashboard/behavior-by-grade", authenticateToken, async (req, res) => {
    try {
      const data = await storage.getBehaviorReportsByGrade();
      res.json(data);
    } catch (error) {
      console.error("Behavior by grade data error:", error);
      res.status(500).json({ message: "Error al obtener datos de comportamiento por grado" });
    }
  });

  // Student routes
  app.get("/api/students", authenticateToken, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Get students error:", error);
      res.status(500).json({ message: "Error al obtener estudiantes" });
    }
  });

  app.post("/api/students", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Create student error:", error);
      res.status(400).json({ message: "Error al crear estudiante" });
    }
  });

  app.put("/api/students/:id", authenticateToken, async (req, res) => {
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

  app.delete("/api/students/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStudent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(400).json({ message: "Error al eliminar estudiante" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", authenticateToken, async (req, res) => {
    try {
      const { date, grade, section } = req.query;
      const attendance = await storage.getAttendance(
        date as string,
        grade as string,
        section as string
      );
      res.json(attendance);
    } catch (error) {
      console.error("Get attendance error:", error);
      res.status(500).json({ message: "Error al obtener asistencia" });
    }
  });

  app.post("/api/attendance", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Create attendance error:", error);
      res.status(400).json({ message: "Error al crear registro de asistencia" });
    }
  });

  app.put("/api/attendance/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertAttendanceSchema.partial().parse(req.body);
      const attendance = await storage.updateAttendance(id, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Update attendance error:", error);
      res.status(400).json({ message: "Error al actualizar asistencia" });
    }
  });

  // Behavior report routes
  app.get("/api/behavior-reports", authenticateToken, async (req, res) => {
    try {
      const reports = await storage.getBehaviorReports();
      res.json(reports);
    } catch (error) {
      console.error("Get behavior reports error:", error);
      res.status(500).json({ message: "Error al obtener reportes de comportamiento" });
    }
  });

  app.post("/api/behavior-reports", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertBehaviorReportSchema.parse(req.body);
      const report = await storage.createBehaviorReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Create behavior report error:", error);
      res.status(400).json({ message: "Error al crear reporte de comportamiento" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Error al obtener notificaciones" });
    }
  });

  app.post("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertNotificationWithStatusSchema.parse(req.body);
      
      // Validate recipients are not empty if sending notification (not draft)
      if (validatedData.status !== 'draft' && (!validatedData.recipients || validatedData.recipients.length === 0 || validatedData.recipients[0] === '')) {
        return res.status(400).json({ message: "Los destinatarios son requeridos para enviar la notificación" });
      }
      
      const notification = await storage.createNotification(validatedData);
      
      // Mark as sent if not a draft (in a real app, this would be handled by email service)
      if (validatedData.status !== 'draft') {
        await storage.updateNotificationStatus(notification.id, 'sent');
      }
      
      res.status(201).json(notification);
    } catch (error) {
      console.error("Create notification error:", error);
      res.status(400).json({ message: "Error al crear notificación" });
    }
  });

  // Survey routes
  app.get("/api/surveys", authenticateToken, async (req, res) => {
    try {
      const surveys = await storage.getSurveys();
      res.json(surveys);
    } catch (error) {
      console.error("Get surveys error:", error);
      res.status(500).json({ message: "Error al obtener encuestas" });
    }
  });

  app.post("/api/surveys", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertSurveySchema.parse(req.body);
      const survey = await storage.createSurvey(validatedData);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Create survey error:", error);
      res.status(400).json({ message: "Error al crear encuesta" });
    }
  });

  app.put("/api/surveys/:id", authenticateToken, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
