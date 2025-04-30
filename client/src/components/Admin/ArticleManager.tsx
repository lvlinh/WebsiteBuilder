import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, SortAsc, SortDesc, FilePlus2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import EnhancedArticleEditor from "./EnhancedArticleEditor";
import ArticleTree from "./ArticleTree";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Article, ArticleCategory } from "@shared/schema";

type SortField = "publishedAt" | "title" | "createdAt";
type SortOrder = "asc" | "desc";
type ViewType = "tree" | "compact";

export default function ArticleManager() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [selectedArticle, setSelectedArticle] = useState<Partial<Article> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("publishedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [viewType, setViewType] = useState<ViewType>("tree");
  const [showUnpublished, setShowUnpublished] = useState(true);

  // Fetch articles from the API
  const { data: articles = [], isLoading: isLoadingArticles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Fetch categories from the API
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<ArticleCategory[]>({
    queryKey: ["/api/article-categories"],
  });

  // Filter, sort and process articles
  const processedArticles = articles
    .filter((article) => {
      // Filter by search term
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
          article.title_vi.toLowerCase().includes(searchLower) ||
          article.title_en.toLowerCase().includes(searchLower) ||
          article.slug.toLowerCase().includes(searchLower) ||
          article.content_vi.toLowerCase().includes(searchLower) ||
          article.content_en.toLowerCase().includes(searchLower) ||
          (article.summary_vi && article.summary_vi.toLowerCase().includes(searchLower)) ||
          (article.summary_en && article.summary_en.toLowerCase().includes(searchLower))
        );
        if (!matchesSearch) return false;
      }

      // Filter by category
      if (selectedCategory !== "all" && article.categoryId !== parseInt(selectedCategory)) {
        if (selectedCategory === "none" && article.categoryId !== null) {
          return false;
        } else if (selectedCategory !== "none" && article.categoryId !== parseInt(selectedCategory)) {
          return false;
        }
      }

      // Filter by published status
      if (!showUnpublished && article.published === false) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;
      if (sortField === "title") {
        comparison = (language === "vi" ? a.title_vi : a.title_en)
          .localeCompare(language === "vi" ? b.title_vi : b.title_en);
      } else if (sortField === "publishedAt" || sortField === "createdAt") {
        const dateA = new Date(a[sortField] || a.createdAt);
        const dateB = new Date(b[sortField] || b.createdAt);
        comparison = dateA.getTime() - dateB.getTime();
      }

      // Apply sort order
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      try {
        const res = await fetch(`/api/admin/articles/${id}`, {
          method: "DELETE",
        });
        
        if (!res.ok) {
          // Try to parse error message, but don't fail if it's not JSON
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to delete article ${id}`);
        }
        
        // Some DELETE endpoints return 204 No Content
        if (res.status === 204) {
          return { success: true };
        }
        
        return res.json().catch(() => ({ success: true }));
      } catch (error) {
        console.error("Error deleting article:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "vi" ? "Xóa bài viết thành công" : "Article deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Xóa bài viết thất bại" : "Failed to delete article",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  // Toggle article publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      try {
        const res = await fetch(`/api/admin/articles/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to update article");
        }
        
        return res.json();
      } catch (error) {
        console.error("Error toggling publish status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "vi" ? "Cập nhật trạng thái thành công" : "Status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Cập nhật trạng thái thất bại" : "Failed to update status",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  // Reorder articles mutation
  const reorderArticlesMutation = useMutation({
    mutationFn: async (updatedArticles: Article[]) => {
      try {
        // Update articles one by one with their new order
        const promises = updatedArticles.map(async (article) => {
          const response = await fetch(`/api/admin/articles/${article.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ display_order: article.display_order }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to update article ${article.id}`);
          }
          
          return response.json();
        });
        
        await Promise.all(promises);
        return true;
      } catch (error) {
        console.error("Error reordering articles:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "vi" ? "Sắp xếp thành công" : "Articles reordered successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Sắp xếp thất bại" : "Failed to reorder articles",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  // Handle creating a new article
  const handleCreateArticle = (categoryId?: number) => {
    setSelectedArticle(categoryId ? { categoryId } : {});
    setIsNew(true);
  };

  // Handle editing an existing article
  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setIsNew(false);
  };

  // Handle deleting an article
  const handleDeleteArticle = (articleId: number) => {
    deleteMutation.mutate(articleId);
  };

  // Handle toggling article publish status
  const handleTogglePublish = (article: Article) => {
    togglePublishMutation.mutate({
      id: article.id,
      published: !article.published,
    });
  };

  // Handle reordering articles
  const handleReorderArticles = (reorderedArticles: Article[]) => {
    reorderArticlesMutation.mutate(reorderedArticles);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortField("publishedAt");
    setSortOrder("desc");
    setShowUnpublished(true);
  };

  if (selectedArticle) {
    return (
      <EnhancedArticleEditor
        article={selectedArticle}
        onBack={() => {
          setSelectedArticle(null);
          setIsNew(false);
        }}
        isNew={isNew}
      />
    );
  }

  const isLoading = isLoadingArticles || isLoadingCategories;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>{language === "vi" ? "Quản lý bài viết" : "Article Management"}</CardTitle>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {language === "vi" ? "Bộ lọc" : "Filters"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuCheckboxItem
                  checked={showUnpublished}
                  onCheckedChange={setShowUnpublished}
                >
                  {language === "vi" ? "Hiển thị bản nháp" : "Show unpublished"}
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  {language === "vi" ? "Xóa bộ lọc" : "Clear filters"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === "asc" ? (
                    <SortAsc className="h-4 w-4 mr-2" />
                  ) : (
                    <SortDesc className="h-4 w-4 mr-2" />
                  )}
                  {language === "vi" ? "Sắp xếp" : "Sort"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem 
                  onClick={() => setSortField("publishedAt")}
                  className={sortField === "publishedAt" ? "bg-accent" : ""}
                >
                  {language === "vi" ? "Ngày xuất bản" : "Publish date"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortField("title")}
                  className={sortField === "title" ? "bg-accent" : ""}
                >
                  {language === "vi" ? "Tiêu đề" : "Title"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortField("createdAt")}
                  className={sortField === "createdAt" ? "bg-accent" : ""}
                >
                  {language === "vi" ? "Ngày tạo" : "Creation date"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" 
                    ? language === "vi" ? "Giảm dần" : "Descending" 
                    : language === "vi" ? "Tăng dần" : "Ascending"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => handleCreateArticle()}>
              <FilePlus2 className="h-4 w-4 mr-2" />
              {language === "vi" ? "Tạo bài viết mới" : "Create New Article"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="relative col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                language === "vi" ? "Tìm kiếm bài viết..." : "Search articles..."
              }
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="min-w-[180px]">
                <SelectValue placeholder={language === "vi" ? "Tất cả danh mục" : "All categories"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "vi" ? "Tất cả danh mục" : "All categories"}</SelectItem>
                <SelectItem value="none">{language === "vi" ? "Không có danh mục" : "No category"}</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {language === "vi" ? category.title_vi : category.title_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <ArticleTree
            articles={processedArticles}
            categories={categories}
            onEditArticle={handleEditArticle}
            onCreateArticle={handleCreateArticle}
            onDeleteArticle={handleDeleteArticle}
            onTogglePublish={handleTogglePublish}
            onReorderArticles={handleReorderArticles}
          />
        )}
      </CardContent>
    </Card>
  );
}