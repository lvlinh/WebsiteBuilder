import { pgTable, text, serial, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Existing tables
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

// New tables for student portal
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

// Existing schemas
export const insertArticleSchema = createInsertSchema(articles).omit({ 
  id: true,
  publishedAt: true 
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  publishedAt: true
});

// New schemas for student portal
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

// Types
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