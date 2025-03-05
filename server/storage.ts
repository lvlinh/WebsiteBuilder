import { articles, news, type Article, type InsertArticle, type News, type InsertNews } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private news: Map<number, News>;
  private articleId: number;
  private newsId: number;

  constructor() {
    this.articles = new Map();
    this.news = new Map();
    this.articleId = 1;
    this.newsId = 1;
  }

  // Articles
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

  // News
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
}

export const storage = new MemStorage();
