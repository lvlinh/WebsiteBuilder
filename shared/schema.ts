import { pgTable, text, serial, json, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertArticleSchema = createInsertSchema(articles).omit({ 
  id: true,
  publishedAt: true 
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  publishedAt: true
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
