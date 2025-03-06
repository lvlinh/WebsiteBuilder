import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertNewsSchema, insertStudentSchema, insertCourseSchema, insertEnrollmentSchema, insertEventSchema, insertEventRegistrationSchema, insertPageSchema, insertBannerSlideSchema } from "@shared/schema"; // Added import
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const SessionStore = MemoryStore(session);

const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key-min-32-chars-long-here';

// Initialize some sample events if none exist
async function initializeSampleEvents() {
  const events = await storage.getEvents();
  if (events.length === 0) {
    await storage.createEvent({
      title_vi: "Lễ Khai Giảng Năm Học 2025-2026",
      title_en: "Opening Ceremony Academic Year 2025-2026",
      description_vi: "Buổi lễ khai giảng năm học mới với sự tham gia của toàn thể giảng viên và sinh viên.",
      description_en: "Opening ceremony for the new academic year with participation from all faculty and students.",
      startDate: new Date("2025-09-15T08:00:00"),
      endDate: new Date("2025-09-15T11:00:00"),
      location: "Hội trường chính / Main Hall",
      capacity: 200,
      registrationDeadline: new Date("2025-09-10T23:59:59"),
      category: "academic",
      status: "upcoming"
    });

    await storage.createEvent({
      title_vi: "Tĩnh Tâm Mùa Vọng",
      title_en: "Advent Retreat",
      description_vi: "Chương trình tĩnh tâm chuẩn bị tâm hồn cho mùa Giáng Sinh.",
      description_en: "Spiritual retreat program to prepare for the Christmas season.",
      startDate: new Date("2025-12-01T09:00:00"),
      endDate: new Date("2025-12-03T17:00:00"),
      location: "Trung tâm Mục vụ / Pastoral Center",
      capacity: 100,
      registrationDeadline: new Date("2025-11-25T23:59:59"),
      category: "spiritual",
      status: "upcoming"
    });

    await storage.createEvent({
      title_vi: "Hội Thảo: Thần Học Đương Đại",
      title_en: "Symposium: Contemporary Theology",
      description_vi: "Hội thảo chuyên đề về các xu hướng thần học hiện đại.",
      description_en: "Symposium on modern theological trends and perspectives.",
      startDate: new Date("2025-10-20T08:30:00"),
      endDate: new Date("2025-10-21T16:30:00"),
      location: "Phòng Hội thảo / Conference Room",
      capacity: 150,
      registrationDeadline: new Date("2025-10-15T23:59:59"),
      category: "academic",
      status: "upcoming"
    });
  }
}

async function initializeAdminUser() {
  const admins = await storage.getAdmins();
  if (admins.length === 0) {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createAdmin({
      email: "admin@sjjs.edu.vn",
      password: hashedPassword,
      name: "Admin",
      role: "admin"
    });
  }
}

// Add this function after initializeAdminUser
async function initializeDefaultPages() {
  const pages = await storage.getPages();
  if (pages.length === 0) {
    // Create main sections first
    const mainSections = [
      {
        slug: "gioi-thieu",
        title_vi: "Giới Thiệu",
        title_en: "About",
        content_vi: "Thông tin giới thiệu về Học Viện",
        content_en: "Introduction to the Institute",
        menu_order: 1,
        isSection: true,
        published: true
      },
      {
        slug: "tuyen-sinh",
        title_vi: "Tuyển Sinh",
        title_en: "Admissions",
        content_vi: "Thông tin tuyển sinh",
        content_en: "Admissions Information",
        menu_order: 2,
        isSection: true,
        published: true
      },
      {
        slug: "dao-tao",
        title_vi: "Đào Tạo",
        title_en: "Education",
        content_vi: "Chương trình đào tạo",
        content_en: "Educational Programs",
        menu_order: 3,
        isSection: true,
        published: true
      },
      {
        slug: "ban-giang-huan",
        title_vi: "Ban Giảng Huấn",
        title_en: "Faculty",
        content_vi: "Thông tin về ban giảng huấn",
        content_en: "Faculty Information",
        menu_order: 4,
        isSection: true,
        published: true
      },
      {
        slug: "nghien-cuu-xuat-ban",
        title_vi: "Nghiên Cứu và Xuất Bản",
        title_en: "Research & Publications",
        content_vi: "Nghiên cứu và xuất bản",
        content_en: "Research and Publications",
        menu_order: 5,
        isSection: true,
        published: true
      },
      {
        slug: "gia-dinh-sjjs",
        title_vi: "Gia Đình SJJS",
        title_en: "SJJS Family",
        content_vi: "Cộng đồng SJJS",
        content_en: "SJJS Community",
        menu_order: 6,
        isSection: true,
        published: true
      },
      {
        slug: "tien-ich",
        title_vi: "Tiện Ích",
        title_en: "Resources",
        content_vi: "Tiện ích và tài nguyên",
        content_en: "Resources and Utilities",
        menu_order: 7,
        isSection: true,
        published: true
      }
    ];

    // Create main sections and store their IDs
    const sectionIds = {};
    for (const section of mainSections) {
      const createdSection = await storage.createPage(section);
      sectionIds[section.slug] = createdSection.id;
    }

    // Create subsections with parent IDs
    const subsections = [
      // Giới Thiệu (About) subsections
      {
        slug: "tuyen-ngon-tam-nhan",
        title_vi: "Tuyên Ngôn Tầm Nhìn",
        title_en: "Vision Statement",
        content_vi: "Tuyên ngôn và tầm nhìn của học viện",
        content_en: "Institute's vision statement",
        menu_order: 1,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },
      {
        slug: "lich-su",
        title_vi: "Lịch Sử",
        title_en: "History",
        content_vi: "Lịch sử phát triển",
        content_en: "Development history",
        menu_order: 2,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },
      {
        slug: "su-menh",
        title_vi: "Sứ Mệnh",
        title_en: "Mission",
        content_vi: "Sứ mệnh của học viện",
        content_en: "Institute's mission",
        menu_order: 3,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },
      {
        slug: "muc-tieu",
        title_vi: "Mục Tiêu",
        title_en: "Objectives",
        content_vi: "Mục tiêu của học viện",
        content_en: "Institute's objectives",
        menu_order: 4,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },

      // Tuyển Sinh (Admissions) subsections
      {
        slug: "thong-bao",
        title_vi: "Thông Báo",
        title_en: "Announcements",
        content_vi: "Thông báo tuyển sinh",
        content_en: "Admission announcements",
        menu_order: 1,
        parentId: sectionIds["tuyen-sinh"],
        published: true
      },
      {
        slug: "tuyen-sinh-cao-hoc",
        title_vi: "Tuyển Sinh Cao Học",
        title_en: "Graduate Admissions",
        content_vi: "Thông tin tuyển sinh cao học",
        content_en: "Graduate admission information",
        menu_order: 2,
        parentId: sectionIds["tuyen-sinh"],
        published: true
      },
      {
        slug: "hoc-phi-tai-tro",
        title_vi: "Học Phí & Tài Trợ",
        title_en: "Tuition & Financial Aid",
        content_vi: "Thông tin về học phí và tài trợ",
        content_en: "Tuition and financial aid information",
        menu_order: 3,
        parentId: sectionIds["tuyen-sinh"],
        published: true
      },

      // Đào Tạo (Education) subsections
      {
        slug: "chuong-trinh-toan-hoc",
        title_vi: "Chương Trình Toàn Học",
        title_en: "Full Programs",
        content_vi: "Thông tin về chương trình toàn học",
        content_en: "Full program information",
        menu_order: 1,
        parentId: sectionIds["dao-tao"],
        published: true
      },
      {
        slug: "cac-mon-hoc",
        title_vi: "Các Môn Học",
        title_en: "Courses",
        content_vi: "Thông tin về các môn học",
        content_en: "Course information",
        menu_order: 2,
        parentId: sectionIds["dao-tao"],
        published: true
      },
      {
        slug: "lich-hoc",
        title_vi: "Lịch Học",
        title_en: "Schedule",
        content_vi: "Lịch học của học viện",
        content_en: "Academic schedule",
        menu_order: 3,
        parentId: sectionIds["dao-tao"],
        published: true
      },
      {
        slug: "quy-che-hoc-tap",
        title_vi: "Quy Chế Học Tập",
        title_en: "Academic Policies",
        content_vi: "Quy chế học tập của học viện",
        content_en: "Academic policies and regulations",
        menu_order: 4,
        parentId: sectionIds["dao-tao"],
        published: true
      },

      // Ban Giảng Huấn (Faculty) subsections
      {
        slug: "ban-giang-huan",
        title_vi: "Ban Giảng Huấn",
        title_en: "Faculty List",
        content_vi: "Danh sách giảng viên",
        content_en: "List of faculty members",
        menu_order: 1,
        parentId: sectionIds["ban-giang-huan"],
        published: true
      },
      {
        slug: "cac-bo-mon",
        title_vi: "Các Bộ Môn",
        title_en: "Departments",
        content_vi: "Thông tin về các bộ môn",
        content_en: "Department information",
        menu_order: 2,
        parentId: sectionIds["ban-giang-huan"],
        published: true
      },
      {
        slug: "hoi-thao",
        title_vi: "Hội Thảo",
        title_en: "Seminars",
        content_vi: "Thông tin về các hội thảo",
        content_en: "Seminar information",
        menu_order: 3,
        parentId: sectionIds["ban-giang-huan"],
        published: true
      },

      // Nghiên Cứu và Xuất Bản (Research & Publications) subsections
      {
        slug: "bai-viet",
        title_vi: "Bài Viết",
        title_en: "Articles",
        content_vi: "Các bài viết nghiên cứu",
        content_en: "Research articles",
        menu_order: 1,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },
      {
        slug: "tap-chi",
        title_vi: "Tạp Chí",
        title_en: "Journal",
        content_vi: "Tạp chí nghiên cứu",
        content_en: "Research journal",
        menu_order: 2,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },
      {
        slug: "luan-van",
        title_vi: "Luận Văn",
        title_en: "Theses",
        content_vi: "Luận văn nghiên cứu",
        content_en: "Research theses",
        menu_order: 3,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },
      {
        slug: "sach",
        title_vi: "Sách",
        title_en: "Books",
        content_vi: "Sách xuất bản",
        content_en: "Published books",
        menu_order: 4,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },

      // Gia Đình SJJS (SJJS Family) subsections
      {
        slug: "su-kien",
        title_vi: "Sự Kiện",
        title_en: "Events",
        content_vi: "Sự kiện cộng đồng",
        content_en: "Community events",
        menu_order: 1,
        parentId: sectionIds["gia-dinh-sjjs"],
        published: true
      },
      {
        slug: "ban-tin",
        title_vi: "Bản Tin",
        title_en: "News",
        content_vi: "Tin tức cộng đồng",
        content_en: "Community news",
        menu_order: 2,
        parentId: sectionIds["gia-dinh-sjjs"],
        published: true
      },
      {
        slug: "van-hoa-sjjs",
        title_vi: "Văn Hóa SJJS",
        title_en: "SJJS Culture",
        content_vi: "Văn hóa học viện",
        content_en: "Institute culture",
        menu_order: 3,
        parentId: sectionIds["gia-dinh-sjjs"],
        published: true
      },

      // Tiện Ích (Resources) subsections
      {
        slug: "phong-tu",
        title_vi: "Phòng Tư",
        title_en: "Library",
        content_vi: "Thông tin thư viện",
        content_en: "Library information",
        menu_order: 1,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "co-so-hoc-tap",
        title_vi: "Cơ Sở Học Tập",
        title_en: "Study Facilities",
        content_vi: "Thông tin cơ sở vật chất",
        content_en: "Facility information",
        menu_order: 2,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "giao-an-videos",
        title_vi: "Giáo Án/Videos",
        title_en: "Lessons/Videos",
        content_vi: "Tài liệu học tập",
        content_en: "Learning materials",
        menu_order: 3,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "tai-lieu",
        title_vi: "Tài Liệu",
        title_en: "Documents",
        content_vi: "Tài liệu tham khảo",
        content_en: "Reference materials",
        menu_order: 4,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "cac-lien-ket",
        title_vi: "Các Liên Kết",
        title_en: "Links",
        content_vi: "Liên kết hữu ích",
        content_en: "Useful links",
        menu_order: 5,
        parentId: sectionIds["tien-ich"],
        published: true
      }

    ];

    for (const subsection of subsections) {
      await storage.createPage(subsection);
    }
  }
}

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

  await initializeSampleEvents();
  await initializeAdminUser();
  await initializeDefaultPages(); // Add this line

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

  // Search routes
  app.get("/api/search", async (req, res) => {
    const { query, type, category } = req.query;
    let results = [];

    try {
      if (!type || type === 'article') {
        const articles = await storage.getArticles();
        const filteredArticles = articles.filter(article => {
          const matchesQuery = !query ||
            article.title_vi.toLowerCase().includes(query.toString().toLowerCase()) ||
            article.title_en.toLowerCase().includes(query.toString().toLowerCase()) ||
            article.content_vi.toLowerCase().includes(query.toString().toLowerCase()) ||
            article.content_en.toLowerCase().includes(query.toString().toLowerCase());

          const matchesCategory = !category || article.category === category;

          return matchesQuery && matchesCategory;
        }).map(article => ({
          type: 'article',
          id: article.id,
          title: article.title_en,
          description: article.content_en,
          category: article.category,
          date: article.publishedAt
        }));
        results.push(...filteredArticles);
      }

      if (!type || type === 'event') {
        const events = await storage.getEvents();
        const filteredEvents = events.filter(event => {
          const matchesQuery = !query ||
            event.title_vi.toLowerCase().includes(query.toString().toLowerCase()) ||
            event.title_en.toLowerCase().includes(query.toString().toLowerCase()) ||
            event.description_vi.toLowerCase().includes(query.toString().toLowerCase()) ||
            event.description_en.toLowerCase().includes(query.toString().toLowerCase());

          const matchesCategory = !category || event.category === category;

          return matchesQuery && matchesCategory;
        }).map(event => ({
          type: 'event',
          id: event.id,
          title: event.title_en,
          description: event.description_en,
          category: event.category,
          date: event.startDate
        }));
        results.push(...filteredEvents);
      }

      if (!type || type === 'course') {
        const courses = await storage.getCourses();
        const filteredCourses = courses.filter(course => {
          const matchesQuery = !query ||
            course.name_vi.toLowerCase().includes(query.toString().toLowerCase()) ||
            course.name_en.toLowerCase().includes(query.toString().toLowerCase()) ||
            course.description_vi.toLowerCase().includes(query.toString().toLowerCase()) ||
            course.description_en.toLowerCase().includes(query.toString().toLowerCase());

          const matchesCategory = !category || course.semester === category;

          return matchesQuery && matchesCategory;
        }).map(course => ({
          type: 'course',
          id: course.id,
          title: course.name_en,
          description: course.description_en,
          category: course.semester
        }));
        results.push(...filteredCourses);
      }

      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: "Search failed" });
    }
  });


  // Add these routes after the existing routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);

      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set admin session
      req.session.adminId = admin.id;

      // Remove password from response
      const { password: _, ...safeAdmin } = admin;
      res.json(safeAdmin);
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.adminId = undefined;
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Add this route near the other admin routes
  app.get("/api/admin/me", async (req: any, res) => {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await storage.getAdmin(adminId);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove sensitive data before sending
    const { password, ...safeAdmin } = admin;
    res.json(safeAdmin);
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await storage.getAdmin(adminId);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.admin = admin;
    next();
  };

  // Pages API
  app.get("/api/pages", async (_req, res) => {
    const pages = await storage.getPages();
    res.json(pages);
  });

  app.get("/api/pages/:slug", async (req, res) => {
    const page = await storage.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  });

  // Admin protected routes
  app.post("/api/admin/pages", isAdmin, async (req, res) => {
    const parseResult = insertPageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid page data",
        errors: parseResult.error.errors
      });
    }
    const page = await storage.createPage(parseResult.data);
    res.status(201).json(page);
  });

  app.patch("/api/admin/pages/:id", isAdmin, async (req, res) => {
    const parseResult = insertPageSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid page data" });
    }
    const page = await storage.updatePage(Number(req.params.id), parseResult.data);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  });

  app.delete("/api/admin/pages/:id", isAdmin, async (req, res) => {
    const success = await storage.deletePage(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(204).end();
  });

  // Add after existing API endpoints but before registerRoutes function
  app.get("/api/banner-slides", async (_req, res) => {
    try {
      const slides = await storage.getBannerSlides();
      res.json(slides);
    } catch (error) {
      console.error('Error fetching banner slides:', error);
      res.status(500).json({ message: "Failed to fetch banner slides" });
    }
  });

  app.post("/api/banner-slides", isAdmin, async (req, res) => {
    const parseResult = insertBannerSlideSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid banner slide data",
        errors: parseResult.error.errors
      });
    }
    const slide = await storage.createBannerSlide(parseResult.data);
    res.status(201).json(slide);
  });

  app.patch("/api/banner-slides/:id", isAdmin, async (req, res) => {
    const parseResult = insertBannerSlideSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid banner slide data" });
    }
    const slide = await storage.updateBannerSlide(Number(req.params.id), parseResult.data);
    if (!slide) {
      return res.status(404).json({ message: "Banner slide not found" });
    }
    res.json(slide);
  });

  app.delete("/api/banner-slides/:id", isAdmin, async (req, res) => {
    const success = await storage.deleteBannerSlide(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Banner slide not found" });
    }
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}