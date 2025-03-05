import { articles, news, students, courses, enrollments, 
  type Article, type InsertArticle, 
  type News, type InsertNews,
  type Student, type InsertStudent,
  type Course, type InsertCourse,
  type Enrollment, type InsertEnrollment
} from "@shared/schema";

export interface IStorage {
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
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private news: Map<number, News>;
  private students: Map<number, Student>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, Enrollment>;
  private articleId: number;
  private newsId: number;
  private studentId: number;
  private courseId: number;
  private enrollmentId: number;

  constructor() {
    this.articles = new Map();
    this.news = new Map();
    this.students = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.articleId = 1;
    this.newsId = 1;
    this.studentId = 1;
    this.courseId = 1;
    this.enrollmentId = 1;
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
}

export const storage = new MemStorage();