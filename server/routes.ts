import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertNewsSchema, insertStudentSchema, insertCourseSchema, insertEnrollmentSchema, insertEventSchema, insertEventRegistrationSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const SessionStore = MemoryStore(session);

const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key-min-32-chars-long-here';

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup with better security
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const student = await storage.getStudentByEmail(email);
        if (!student) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, student.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, student);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const student = await storage.getStudent(id);
      if (!student) {
        return done(null, false);
      }
      done(null, student);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Articles routes
  app.get("/api/articles", async (_req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  app.get("/api/articles/:id", async (req, res) => {
    const article = await storage.getArticle(Number(req.params.id));
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.post("/api/articles", async (req, res) => {
    const parseResult = insertArticleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid article data" });
    }
    const article = await storage.createArticle(parseResult.data);
    res.status(201).json(article);
  });

  app.patch("/api/articles/:id", async (req, res) => {
    const parseResult = insertArticleSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid article data" });
    }
    const article = await storage.updateArticle(Number(req.params.id), parseResult.data);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  app.delete("/api/articles/:id", async (req, res) => {
    const success = await storage.deleteArticle(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(204).end();
  });

  // News routes
  app.get("/api/news", async (_req, res) => {
    const news = await storage.getNews();
    res.json(news);
  });

  app.get("/api/news/:id", async (req, res) => {
    const newsItem = await storage.getNewsItem(Number(req.params.id));
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found" });
    }
    res.json(newsItem);
  });

  app.post("/api/news", async (req, res) => {
    const parseResult = insertNewsSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid news data" });
    }
    const newsItem = await storage.createNewsItem(parseResult.data);
    res.status(201).json(newsItem);
  });

  app.patch("/api/news/:id", async (req, res) => {
    const parseResult = insertNewsSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid news data" });
    }
    const newsItem = await storage.updateNewsItem(Number(req.params.id), parseResult.data);
    if (!newsItem) {
      return res.status(404).json({ message: "News item not found" });
    }
    res.json(newsItem);
  });

  app.delete("/api/news/:id", async (req, res) => {
    const success = await storage.deleteNewsItem(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "News item not found" });
    }
    res.status(204).end();
  });

  // Student Portal Routes with improved error handling
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.logout(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  app.post("/api/students/register", async (req, res) => {
    try {
      const parseResult = insertStudentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid student data",
          errors: parseResult.error.errors
        });
      }

      // Check if email already exists
      const existingStudent = await storage.getStudentByEmail(parseResult.data.email);
      if (existingStudent) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(parseResult.data.password, 10);
      const student = await storage.createStudent({
        ...parseResult.data,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...safeStudent } = student;
      res.status(201).json(safeStudent);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/students/me", isAuthenticated, async (req: any, res) => {
    const student = await storage.getStudent(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const { password, ...safeStudent } = student;
    res.json(safeStudent);
  });

  app.get("/api/students/me/courses", isAuthenticated, async (req: any, res) => {
    const enrollments = await storage.getEnrollments(req.user.id);
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await storage.getCourse(enrollment.courseId);
        return {
          ...course,
          enrollment: {
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
            grade: enrollment.grade
          }
        };
      })
    );
    res.json(courses);
  });

  app.post("/api/courses", async (req, res) => {
    const parseResult = insertCourseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid course data" });
    }
    const course = await storage.createCourse(parseResult.data);
    res.status(201).json(course);
  });

  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    const parseResult = insertEnrollmentSchema.safeParse({
      ...req.body,
      studentId: req.user.id
    });
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid enrollment data" });
    }
    const enrollment = await storage.createEnrollment(parseResult.data);
    res.status(201).json(enrollment);
  });

  // Event routes
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/upcoming", async (_req, res) => {
    const events = await storage.getUpcomingEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  app.post("/api/events", async (req, res) => {
    const parseResult = insertEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid event data",
        errors: parseResult.error.errors
      });
    }
    const event = await storage.createEvent(parseResult.data);
    res.status(201).json(event);
  });

  app.patch("/api/events/:id", async (req, res) => {
    const parseResult = insertEventSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid event data" });
    }
    const event = await storage.updateEvent(Number(req.params.id), parseResult.data);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  // Event Registration routes
  app.get("/api/events/:id/registrations", async (req, res) => {
    const registrations = await storage.getEventRegistrations(Number(req.params.id));
    res.json(registrations);
  });

  app.get("/api/events/:id/registration-status", isAuthenticated, async (req: any, res) => {
    const registration = await storage.getEventRegistrationStatus(
      Number(req.params.id),
      req.user.id
    );
    res.json({ registered: !!registration, registration });
  });

  app.get("/api/students/me/event-registrations", isAuthenticated, async (req: any, res) => {
    const registrations = await storage.getStudentEventRegistrations(req.user.id);
    const eventsWithDetails = await Promise.all(
      registrations.map(async (registration) => {
        const event = await storage.getEvent(registration.eventId);
        return {
          ...registration,
          event
        };
      })
    );
    res.json(eventsWithDetails);
  });

  app.post("/api/events/:id/register", isAuthenticated, async (req: any, res) => {
    const eventId = Number(req.params.id);

    // Check if event exists and registration is still open
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    // Check if user is already registered
    const existingRegistration = await storage.getEventRegistrationStatus(eventId, req.user.id);
    if (existingRegistration) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    // Check if event is at capacity
    const registrations = await storage.getEventRegistrations(eventId);
    if (registrations.length >= event.capacity) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    const parseResult = insertEventRegistrationSchema.safeParse({
      eventId,
      studentId: req.user.id,
      status: "registered",
      notes: req.body.notes
    });

    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }

    const registration = await storage.createEventRegistration(parseResult.data);
    res.status(201).json(registration);
  });

  app.patch("/api/events/:eventId/registrations/:id", async (req, res) => {
    const parseResult = insertEventRegistrationSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }

    const registration = await storage.updateEventRegistration(
      Number(req.params.id),
      parseResult.data
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.json(registration);
  });

  const httpServer = createServer(app);
  return httpServer;
}