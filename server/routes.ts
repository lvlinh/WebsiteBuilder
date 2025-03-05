import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertNewsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
