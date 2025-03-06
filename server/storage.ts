import { admins, pages, articles, news, students, courses, enrollments, events, eventRegistrations,
  type Admin, type InsertAdmin,
  type Page, type InsertPage,
  type Article, type InsertArticle, 
  type News, type InsertNews,
  type Student, type InsertStudent,
  type Course, type InsertCourse,
  type Enrollment, type InsertEnrollment,
  type Event, type InsertEvent,
  type EventRegistration, type InsertEventRegistration,
  type BannerSlide, type InsertBannerSlide
} from "@shared/schema";

export interface IStorage {
  // Admin methods
  getAdmins(): Promise<Admin[]>;
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdmin(id: number, admin: Partial<InsertAdmin>): Promise<Admin | undefined>;

  // Page methods
  getPages(): Promise<Page[]>;
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: number): Promise<boolean>;

  //Banner Slides
  getBannerSlides(): Promise<BannerSlide[]>;
  createBannerSlide(slide: InsertBannerSlide): Promise<BannerSlide>;
  updateBannerSlide(id: number, slide: Partial<InsertBannerSlide>): Promise<BannerSlide | undefined>;
  deleteBannerSlide(id: number): Promise<boolean>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;

  // News
  getNews(): Promise<News[]>;
  getNewsItem(id: number): Promise<News | undefined>;
  createNewsItem(newsItem: InsertNews): Promise<News>;
  updateNewsItem(id: number, newsItem: Partial<InsertNews>): Promise<News | undefined>;
  deleteNewsItem(id: number): Promise<boolean>;

  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByEmail(email: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;

  // Enrollments
  getEnrollments(studentId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  getUpcomingEvents(): Promise<Event[]>;

  // Event Registrations
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getStudentEventRegistrations(studentId: number): Promise<EventRegistration[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateEventRegistration(id: number, registration: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined>;
  getEventRegistrationStatus(eventId: number, studentId: number): Promise<EventRegistration | undefined>;
}

export class MemStorage implements IStorage {
  private admins: Map<number, Admin>;
  private pages: Map<number, Page>;
  private articles: Map<number, Article>;
  private news: Map<number, News>;
  private students: Map<number, Student>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private events: Map<number, Event>;
  private eventRegistrations: Map<number, EventRegistration>;
  private bannerSlides: Map<number, BannerSlide>;
  private adminId: number;
  private pageId: number;
  private articleId: number;
  private newsId: number;
  private studentId: number;
  private courseId: number;
  private enrollmentId: number;
  private eventId: number;
  private eventRegistrationId: number;
  private bannerSlideId: number;

  constructor() {
    this.admins = new Map();
    this.pages = new Map();
    this.articles = new Map();
    this.news = new Map();
    this.students = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.events = new Map();
    this.eventRegistrations = new Map();
    this.bannerSlides = new Map();
    this.adminId = 1;
    this.pageId = 1;
    this.articleId = 1;
    this.newsId = 1;
    this.studentId = 1;
    this.courseId = 1;
    this.enrollmentId = 1;
    this.eventId = 1;
    this.eventRegistrationId = 1;
    this.bannerSlideId = 1;
  }

  // Admin methods
  async getAdmins(): Promise<Admin[]> {
    return Array.from(this.admins.values());
  }

  async getAdmin(id: number): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = this.adminId++;
    const newAdmin = {
      ...admin,
      id,
      createdAt: new Date()
    };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }

  async updateAdmin(id: number, admin: Partial<InsertAdmin>): Promise<Admin | undefined> {
    const existing = this.admins.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...admin };
    this.admins.set(id, updated);
    return updated;
  }

  // Page methods
  async getPages(): Promise<Page[]> {
    return Array.from(this.pages.values());
  }

  async getPage(id: number): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    return Array.from(this.pages.values()).find(page => page.slug === slug);
  }

  async createPage(page: InsertPage): Promise<Page> {
    const id = this.pageId++;
    const newPage = {
      ...page,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pages.set(id, newPage);
    return newPage;
  }

  async updatePage(id: number, page: Partial<InsertPage>): Promise<Page | undefined> {
    const existing = this.pages.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...page,
      updatedAt: new Date()
    };
    this.pages.set(id, updated);
    return updated;
  }

  async deletePage(id: number): Promise<boolean> {
    return this.pages.delete(id);
  }

  //Banner Slides
  async getBannerSlides(): Promise<BannerSlide[]> {
    return Array.from(this.bannerSlides.values())
      .sort((a, b) => a.order - b.order)
      .filter(slide => slide.active);
  }

  async createBannerSlide(slide: InsertBannerSlide): Promise<BannerSlide> {
    const id = this.bannerSlideId++;
    const newSlide = {
      ...slide,
      id,
      createdAt: new Date(),
      active: slide.active ?? true,
      order: slide.order ?? id
    } as BannerSlide;
    this.bannerSlides.set(id, newSlide);
    return newSlide;
  }

  async updateBannerSlide(id: number, slide: Partial<InsertBannerSlide>): Promise<BannerSlide | undefined> {
    const existing = this.bannerSlides.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...slide };
    this.bannerSlides.set(id, updated);
    return updated;
  }

  async deleteBannerSlide(id: number): Promise<boolean> {
    return this.bannerSlides.delete(id);
  }

  // Articles methods
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = this.articleId++;
    const newArticle = { 
      ...article, 
      id,
      publishedAt: new Date(),
      published: true
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  async updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...article };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  // News methods
  async getNews(): Promise<News[]> {
    return Array.from(this.news.values());
  }

  async getNewsItem(id: number): Promise<News | undefined> {
    return this.news.get(id);
  }

  async createNewsItem(newsItem: InsertNews): Promise<News> {
    const id = this.newsId++;
    const newItem = {
      ...newsItem,
      id,
      publishedAt: new Date()
    };
    this.news.set(id, newItem);
    return newItem;
  }

  async updateNewsItem(id: number, newsItem: Partial<InsertNews>): Promise<News | undefined> {
    const existing = this.news.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...newsItem };
    this.news.set(id, updated);
    return updated;
  }

  async deleteNewsItem(id: number): Promise<boolean> {
    return this.news.delete(id);
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(student => student.email === email);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.studentId++;
    const newStudent = {
      ...student,
      id,
      enrollmentDate: new Date()
    };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...student };
    this.students.set(id, updated);
    return updated;
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.courseId++;
    const newCourse = {
      ...course,
      id
    };
    this.courses.set(id, newCourse);
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined> {
    const existing = this.courses.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...course };
    this.courses.set(id, updated);
    return updated;
  }

  // Enrollments
  async getEnrollments(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values())
      .filter(enrollment => enrollment.studentId === studentId);
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentId++;
    const newEnrollment = {
      ...enrollment,
      id,
      enrolledAt: new Date(),
      status: enrollment.status || "active",
      grade: enrollment.grade || null
    } as Enrollment;
    this.enrollments.set(id, newEnrollment);
    return newEnrollment;
  }

  async updateEnrollment(id: number, enrollment: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const existing = this.enrollments.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...enrollment };
    this.enrollments.set(id, updated);
    return updated;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const newEvent = {
      ...event,
      id,
      status: event.status || "upcoming",
      capacity: event.capacity || 0
    } as Event;
    this.events.set(id, newEvent);
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    return updated;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return Array.from(this.events.values()).filter(event => 
      new Date(event.startDate) > now && 
      event.status === "upcoming"
    );
  }

  // Event Registrations
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(registration => registration.eventId === eventId);
  }

  async getStudentEventRegistrations(studentId: number): Promise<EventRegistration[]> {
    return Array.from(this.eventRegistrations.values())
      .filter(registration => registration.studentId === studentId);
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const id = this.eventRegistrationId++;
    const newRegistration = {
      ...registration,
      id,
      registeredAt: new Date(),
      status: registration.status || "registered",
      notes: registration.notes || null
    } as EventRegistration;
    this.eventRegistrations.set(id, newRegistration);
    return newRegistration;
  }

  async updateEventRegistration(id: number, registration: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined> {
    const existing = this.eventRegistrations.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...registration };
    this.eventRegistrations.set(id, updated);
    return updated;
  }

  async getEventRegistrationStatus(eventId: number, studentId: number): Promise<EventRegistration | undefined> {
    return Array.from(this.eventRegistrations.values())
      .find(registration => 
        registration.eventId === eventId && 
        registration.studentId === studentId
      );
  }
}

export const storage = new MemStorage();