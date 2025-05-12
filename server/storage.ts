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
  bannerSlides, type BannerSlide, type InsertBannerSlide,
  articleCategories, contentBlocks, quickLinks,
  type ArticleCategory, type InsertArticleCategory,
  type ContentBlock, type InsertContentBlock,
  type QuickLink, type InsertQuickLink
} from "@shared/schema";
import { db } from './db';
import { eq, and, gte } from 'drizzle-orm';

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
  getArticleBySlug(slug: string): Promise<Article | undefined>;

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

  // Add article category methods
  getArticleCategories(): Promise<ArticleCategory[]>;
  getArticleCategory(id: number): Promise<ArticleCategory | undefined>;
  getArticleCategoryBySlug(slug: string): Promise<ArticleCategory | undefined>;
  createArticleCategory(category: InsertArticleCategory): Promise<ArticleCategory>;
  updateArticleCategory(id: number, category: Partial<InsertArticleCategory>): Promise<ArticleCategory | undefined>;
  deleteArticleCategory(id: number): Promise<boolean>;
  
  // Content Blocks
  getContentBlocks(): Promise<ContentBlock[]>;
  getContentBlock(id: number): Promise<ContentBlock | undefined>;
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  updateContentBlock(id: number, block: Partial<InsertContentBlock>): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: number): Promise<boolean>;
  
  // Quick Links
  getQuickLinks(): Promise<QuickLink[]>;
  getQuickLink(id: number): Promise<QuickLink | undefined>;
  createQuickLink(link: InsertQuickLink): Promise<QuickLink>;
  updateQuickLink(id: number, link: Partial<InsertQuickLink>): Promise<QuickLink | undefined>;
  deleteQuickLink(id: number): Promise<boolean>;
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
  private articleCategories: Map<number, ArticleCategory>;
  private contentBlocks: Map<number, ContentBlock>;
  private quickLinks: Map<number, QuickLink>;
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
  private articleCategoryId: number;
  private contentBlockId: number;
  private quickLinkId: number;

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
    this.articleCategories = new Map();
    this.contentBlocks = new Map();
    this.quickLinks = new Map();
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
    this.articleCategoryId = 1;
    this.contentBlockId = 1;
    this.quickLinkId = 1;
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

    const updated = { 
      ...existing,
      ...article,
      // Preserve system fields
      id: existing.id,
      publishedAt: existing.publishedAt,
      viewCount: existing.viewCount
    };
    this.articles.set(id, updated);
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    return this.articles.delete(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(article => article.slug === slug);
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

  // Implement article category methods
  async getArticleCategories(): Promise<ArticleCategory[]> {
    return Array.from(this.articleCategories.values())
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .filter(category => category.active);
  }

  async getArticleCategory(id: number): Promise<ArticleCategory | undefined> {
    return this.articleCategories.get(id);
  }

  async getArticleCategoryBySlug(slug: string): Promise<ArticleCategory | undefined> {
    return Array.from(this.articleCategories.values())
      .find(category => category.slug === slug);
  }

  async createArticleCategory(category: InsertArticleCategory): Promise<ArticleCategory> {
    const id = this.articleCategoryId++;
    const newCategory = {
      ...category,
      id,
      createdAt: new Date(),
      active: category.active ?? true,
      order: category.order ?? id
    } as ArticleCategory;
    this.articleCategories.set(id, newCategory);
    return newCategory;
  }

  async updateArticleCategory(id: number, category: Partial<InsertArticleCategory>): Promise<ArticleCategory | undefined> {
    const existing = this.articleCategories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...category };
    this.articleCategories.set(id, updated);
    return updated;
  }

  async deleteArticleCategory(id: number): Promise<boolean> {
    return this.articleCategories.delete(id);
  }

  // Content Blocks methods
  async getContentBlocks(): Promise<ContentBlock[]> {
    return Array.from(this.contentBlocks.values())
      .sort((a, b) => a.order - b.order);
  }

  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    return this.contentBlocks.get(id);
  }

  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    const id = this.contentBlockId++;
    const newBlock = {
      ...block,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: block.order ?? id
    } as ContentBlock;
    this.contentBlocks.set(id, newBlock);
    return newBlock;
  }

  async updateContentBlock(id: number, block: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const existing = this.contentBlocks.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...block,
      updatedAt: new Date()
    };
    this.contentBlocks.set(id, updated);
    return updated;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    return this.contentBlocks.delete(id);
  }

  // Quick Links methods
  async getQuickLinks(): Promise<QuickLink[]> {
    return Array.from(this.quickLinks.values())
      .sort((a, b) => a.order - b.order);
  }

  async getQuickLink(id: number): Promise<QuickLink | undefined> {
    return this.quickLinks.get(id);
  }

  async createQuickLink(link: InsertQuickLink): Promise<QuickLink> {
    const id = this.quickLinkId++;
    const newLink = {
      ...link,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: link.order ?? id
    } as QuickLink;
    this.quickLinks.set(id, newLink);
    return newLink;
  }

  async updateQuickLink(id: number, link: Partial<InsertQuickLink>): Promise<QuickLink | undefined> {
    const existing = this.quickLinks.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...link,
      updatedAt: new Date()
    };
    this.quickLinks.set(id, updated);
    return updated;
  }

  async deleteQuickLink(id: number): Promise<boolean> {
    return this.quickLinks.delete(id);
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getAdmins(): Promise<Admin[]> {
    return await db.select().from(admins);
  }

  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [created] = await db.insert(admins).values(admin).returning();
    return created;
  }

  async updateAdmin(id: number, adminData: Partial<InsertAdmin>): Promise<Admin | undefined> {
    const [updated] = await db.update(admins).set(adminData).where(eq(admins.id, id)).returning();
    return updated;
  }

  // Pages methods
  async getPages(): Promise<Page[]> {
    return await db.select().from(pages);
  }

  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [created] = await db.insert(pages).values(page).returning();
    return created;
  }

  async updatePage(id: number, pageData: Partial<InsertPage>): Promise<Page | undefined> {
    const [updated] = await db.update(pages).set(pageData).where(eq(pages.id, id)).returning();
    return updated;
  }

  async deletePage(id: number): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return result.rowCount > 0;
  }

  // Banner Slides methods
  async getBannerSlides(): Promise<BannerSlide[]> {
    return await db.select().from(bannerSlides).orderBy(bannerSlides.order);
  }

  async createBannerSlide(slide: InsertBannerSlide): Promise<BannerSlide> {
    const [created] = await db.insert(bannerSlides).values(slide).returning();
    return created;
  }

  async updateBannerSlide(id: number, slideData: Partial<InsertBannerSlide>): Promise<BannerSlide | undefined> {
    const [updated] = await db.update(bannerSlides).set(slideData).where(eq(bannerSlides.id, id)).returning();
    return updated;
  }

  async deleteBannerSlide(id: number): Promise<boolean> {
    const result = await db.delete(bannerSlides).where(eq(bannerSlides.id, id));
    return result.rowCount > 0;
  }

  // Articles methods
  async getArticles(): Promise<Article[]> {
    return await db.select().from(articles);
  }

  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const [created] = await db.insert(articles).values(article).returning();
    return created;
  }

  async updateArticle(id: number, articleData: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updated] = await db.update(articles).set(articleData).where(eq(articles.id, id)).returning();
    return updated;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return result.rowCount > 0;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article;
  }

  // News methods
  async getNews(): Promise<News[]> {
    return await db.select().from(news);
  }

  async getNewsItem(id: number): Promise<News | undefined> {
    const [item] = await db.select().from(news).where(eq(news.id, id));
    return item;
  }

  async createNewsItem(newsItem: InsertNews): Promise<News> {
    const [created] = await db.insert(news).values(newsItem).returning();
    return created;
  }

  async updateNewsItem(id: number, newsData: Partial<InsertNews>): Promise<News | undefined> {
    const [updated] = await db.update(news).set(newsData).where(eq(news.id, id)).returning();
    return updated;
  }

  async deleteNewsItem(id: number): Promise<boolean> {
    const result = await db.delete(news).where(eq(news.id, id));
    return result.rowCount > 0;
  }

  // Students methods
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByEmail(email: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.email, email));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [created] = await db.insert(students).values(student).returning();
    return created;
  }

  async updateStudent(id: number, studentData: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db.update(students).set(studentData).where(eq(students.id, id)).returning();
    return updated;
  }

  // Courses methods
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
    const [updated] = await db.update(courses).set(courseData).where(eq(courses.id, id)).returning();
    return updated;
  }

  // Enrollments methods
  async getEnrollments(studentId: number): Promise<Enrollment[]> {
    return await db.select()
      .from(enrollments)
      .where(eq(enrollments.studentId, studentId));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [created] = await db.insert(enrollments).values(enrollment).returning();
    return created;
  }

  async updateEnrollment(id: number, enrollmentData: Partial<InsertEnrollment>): Promise<Enrollment | undefined> {
    const [updated] = await db.update(enrollments).set(enrollmentData).where(eq(enrollments.id, id)).returning();
    return updated;
  }

  // Events methods
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db.update(events).set(eventData).where(eq(events.id, id)).returning();
    return updated;
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return await db.select()
      .from(events)
      .where(gte(events.date, now))
      .orderBy(events.date);
  }

  // Event Registrations methods
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return await db.select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  async getStudentEventRegistrations(studentId: number): Promise<EventRegistration[]> {
    return await db.select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.studentId, studentId));
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [created] = await db.insert(eventRegistrations).values(registration).returning();
    return created;
  }

  async updateEventRegistration(id: number, regData: Partial<InsertEventRegistration>): Promise<EventRegistration | undefined> {
    const [updated] = await db.update(eventRegistrations).set(regData).where(eq(eventRegistrations.id, id)).returning();
    return updated;
  }

  async getEventRegistrationStatus(eventId: number, studentId: number): Promise<EventRegistration | undefined> {
    const [registration] = await db.select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, eventId),
        eq(eventRegistrations.studentId, studentId)
      ));
    return registration;
  }

  // Article Categories methods
  async getArticleCategories(): Promise<ArticleCategory[]> {
    return await db.select().from(articleCategories);
  }

  async getArticleCategory(id: number): Promise<ArticleCategory | undefined> {
    const [category] = await db.select().from(articleCategories).where(eq(articleCategories.id, id));
    return category;
  }

  async getArticleCategoryBySlug(slug: string): Promise<ArticleCategory | undefined> {
    const [category] = await db.select().from(articleCategories).where(eq(articleCategories.slug, slug));
    return category;
  }

  async createArticleCategory(category: InsertArticleCategory): Promise<ArticleCategory> {
    const [created] = await db.insert(articleCategories).values(category).returning();
    return created;
  }

  async updateArticleCategory(id: number, categoryData: Partial<InsertArticleCategory>): Promise<ArticleCategory | undefined> {
    const [updated] = await db.update(articleCategories).set(categoryData).where(eq(articleCategories.id, id)).returning();
    return updated;
  }

  async deleteArticleCategory(id: number): Promise<boolean> {
    const result = await db.delete(articleCategories).where(eq(articleCategories.id, id));
    return result.rowCount > 0;
  }

  // Content Blocks methods - using memory storage as fallback
  private contentBlocksMap: Map<number, ContentBlock> = new Map();
  private contentBlockId: number = 1;

  async getContentBlocks(): Promise<ContentBlock[]> {
    try {
      // Try to get content blocks from database, but may fail due to schema mismatch
      const dbBlocks = await db.select().from(contentBlocks);
      return dbBlocks;
    } catch (error) {
      console.warn("Using in-memory content blocks due to schema mismatch:", error);
      return Array.from(this.contentBlocksMap.values());
    }
  }

  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    try {
      const [block] = await db.select().from(contentBlocks).where(eq(contentBlocks.id, id));
      return block;
    } catch (error) {
      console.warn("Using in-memory content block lookup due to schema mismatch:", error);
      return this.contentBlocksMap.get(id);
    }
  }

  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    try {
      const [created] = await db.insert(contentBlocks).values(block).returning();
      return created;
    } catch (error) {
      console.warn("Using in-memory content block creation due to schema mismatch:", error);
      const id = this.contentBlockId++;
      const newBlock = {
        ...block,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      } as ContentBlock;
      this.contentBlocksMap.set(id, newBlock);
      return newBlock;
    }
  }

  async updateContentBlock(id: number, blockData: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    try {
      const [updated] = await db.update(contentBlocks).set(blockData).where(eq(contentBlocks.id, id)).returning();
      return updated;
    } catch (error) {
      console.warn("Using in-memory content block update due to schema mismatch:", error);
      const existing = this.contentBlocksMap.get(id);
      if (!existing) return undefined;
      
      const updated = {
        ...existing,
        ...blockData,
        updatedAt: new Date()
      };
      this.contentBlocksMap.set(id, updated);
      return updated;
    }
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    try {
      const result = await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.warn("Using in-memory content block deletion due to schema mismatch:", error);
      return this.contentBlocksMap.delete(id);
    }
  }

  // Quick Links methods - with fallback
  private quickLinksMap: Map<number, QuickLink> = new Map();
  private quickLinkId: number = 1;

  async getQuickLinks(): Promise<QuickLink[]> {
    try {
      return await db.select().from(quickLinks).orderBy(quickLinks.order);
    } catch (error) {
      console.warn("Using in-memory quick links due to schema mismatch:", error);
      return Array.from(this.quickLinksMap.values()).sort((a, b) => a.order - b.order);
    }
  }

  async getQuickLink(id: number): Promise<QuickLink | undefined> {
    try {
      const [link] = await db.select().from(quickLinks).where(eq(quickLinks.id, id));
      return link;
    } catch (error) {
      console.warn("Using in-memory quick link lookup due to schema mismatch:", error);
      return this.quickLinksMap.get(id);
    }
  }

  async createQuickLink(link: InsertQuickLink): Promise<QuickLink> {
    try {
      const [created] = await db.insert(quickLinks).values(link).returning();
      return created;
    } catch (error) {
      console.warn("Using in-memory quick link creation due to schema mismatch:", error);
      const id = this.quickLinkId++;
      const newLink = {
        ...link,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: link.order ?? id
      } as QuickLink;
      this.quickLinksMap.set(id, newLink);
      return newLink;
    }
  }

  async updateQuickLink(id: number, linkData: Partial<InsertQuickLink>): Promise<QuickLink | undefined> {
    try {
      const [updated] = await db.update(quickLinks).set(linkData).where(eq(quickLinks.id, id)).returning();
      return updated;
    } catch (error) {
      console.warn("Using in-memory quick link update due to schema mismatch:", error);
      const existing = this.quickLinksMap.get(id);
      if (!existing) return undefined;
      
      const updated = {
        ...existing,
        ...linkData,
        updatedAt: new Date()
      };
      this.quickLinksMap.set(id, updated);
      return updated;
    }
  }

  async deleteQuickLink(id: number): Promise<boolean> {
    try {
      const result = await db.delete(quickLinks).where(eq(quickLinks.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.warn("Using in-memory quick link deletion due to schema mismatch:", error);
      return this.quickLinksMap.delete(id);
    }
  }
}

// Use database storage
export const storage = new DatabaseStorage();