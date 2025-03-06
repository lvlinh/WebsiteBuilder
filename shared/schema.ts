import { pgTable, text, serial, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Add banner slides table
export const bannerSlides = pgTable("banner_slides", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title_vi: text("title_vi").notNull(),
  title_en: text("title_en").notNull(),
  description_vi: text("description_vi").notNull(),
  description_en: text("description_en").notNull(),
  textVerticalAlign: text("text_vertical_align").notNull().default("center"),
  textHorizontalAlign: text("text_horizontal_align").notNull().default("center"),
  darkOverlay: boolean("dark_overlay").default(false),
  buttonLink: text("button_link"),
  buttonText_vi: text("button_text_vi"),
  buttonText_en: text("button_text_en"),
  order: serial("order").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin users table
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dynamic pages table
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(), 
  title_vi: text("title_vi").notNull(),
  title_en: text("title_en").notNull(),
  content_vi: text("content_vi").notNull(),
  content_en: text("content_en").notNull(),
  menu_order: serial("menu_order").notNull(),
  parentId: serial("parent_id").references(() => pages.id),
  isSection: boolean("is_section").default(false),
  published: boolean("published").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title_vi: text("title_vi").notNull(),
  title_en: text("title_en").notNull(), 
  content_vi: text("content_vi").notNull(),
  content_en: text("content_en").notNull(),
  category: text("category").notNull(),
  published: boolean("published").default(true),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title_vi: text("title_vi").notNull(),
  title_en: text("title_en").notNull(),
  content_vi: text("content_vi").notNull(), 
  content_en: text("content_en").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  studentId: text("student_id").notNull().unique(),
  enrollmentDate: timestamp("enrollment_date").defaultNow(),
  program: text("program").notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name_vi: text("name_vi").notNull(),
  name_en: text("name_en").notNull(),
  description_vi: text("description_vi").notNull(),
  description_en: text("description_en").notNull(),
  credits: text("credits").notNull(),
  semester: text("semester").notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: serial("student_id").references(() => students.id),
  courseId: serial("course_id").references(() => courses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  status: text("status").notNull().default("active"),
  grade: text("grade"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title_vi: text("title_vi").notNull(),
  title_en: text("title_en").notNull(),
  description_vi: text("description_vi").notNull(),
  description_en: text("description_en").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: text("location").notNull(),
  capacity: serial("capacity").notNull(),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  category: text("category").notNull(), 
  status: text("status").notNull().default("upcoming"), 
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: serial("event_id").references(() => events.id),
  studentId: serial("student_id").references(() => students.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  status: text("status").notNull().default("registered"), 
  notes: text("notes"),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ 
  id: true,
  publishedAt: true 
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  publishedAt: true
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  enrollmentDate: true
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true
});

export const insertAdminSchema = createInsertSchema(admins).omit({ 
  id: true,
  createdAt: true
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertBannerSlideSchema = createInsertSchema(bannerSlides).omit({
  id: true,
  createdAt: true
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;

export type BannerSlide = typeof bannerSlides.$inferSelect;
export type InsertBannerSlide = z.infer<typeof insertBannerSlideSchema>;