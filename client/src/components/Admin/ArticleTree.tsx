import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Calendar,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type Article, type ArticleCategory } from "@shared/schema";

interface ArticleTreeProps {
  articles: Article[];
  categories: ArticleCategory[];
  onEditArticle: (article: Article) => void;
  onCreateArticle: (categoryId?: number) => void;
  onDeleteArticle: (articleId: number) => void;
  onTogglePublish: (article: Article) => void;
  onReorderArticles: (articles: Article[]) => void;
}

function ArticleItem({ article }: { article: Article }) {
  const { language } = useI18n();
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50 border border-accent">
      <FileText className="h-4 w-4" />
      <span className="font-medium">
        {language === "vi" ? article.title_vi : article.title_en}
      </span>
    </div>
  );
}

// SortableItem component - represents each article in the list
function SortableArticleItem({
  article,
  category,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  article: Article;
  category?: ArticleCategory;
  onEdit: (article: Article) => void;
  onDelete: (articleId: number) => void;
  onTogglePublish: (article: Article) => void;
}) {
  const { language } = useI18n();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: article.id.toString(),
      data: { type: "article", article },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors border",
          isDragging ? "bg-accent" : "bg-card",
          !article.published && "opacity-70"
        )}
      >
        <div
          {...listeners}
          className="cursor-grab hover:bg-muted rounded p-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className={cn(
          "flex-1",
          !article.published && "text-muted-foreground"
        )}>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium line-clamp-1">
              {language === "vi" ? article.title_vi : article.title_en}
            </span>
            {category && (
              <Badge variant="outline" className="ml-2">
                {language === "vi" ? category.title_vi : category.title_en}
              </Badge>
            )}
            {!article.published && (
              <Badge variant="secondary" className="ml-auto">
                {language === "vi" ? "Chưa xuất bản" : "Draft"}
              </Badge>
            )}
          </div>
          <div className="flex text-xs text-muted-foreground mt-1 items-center">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(article.publishedAt || article.createdAt), "PP")}
            </span>
            <span className="mx-2">•</span>
            <span>/{article.slug}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onTogglePublish(article)}
            title={language === "vi" ? "Xuất bản/Thu hồi" : "Publish/Unpublish"}
          >
            {article.published ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(article)}>
                <Edit className="h-4 w-4 mr-2" />
                {language === "vi" ? "Chỉnh sửa" : "Edit"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {language === "vi" ? "Xóa" : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === "vi" ? "Xác nhận xóa" : "Confirm delete"}
            </DialogTitle>
            <DialogDescription>
              {language === "vi"
                ? `Bạn có chắc chắn muốn xóa bài viết "${article.title_vi}"? Thao tác này không thể hoàn tác.`
                : `Are you sure you want to delete the article "${article.title_en}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(article.id);
                setConfirmDelete(false);
              }}
            >
              {language === "vi" ? "Xóa" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ArticleTree({
  articles,
  categories,
  onEditArticle,
  onCreateArticle,
  onDeleteArticle,
  onTogglePublish,
  onReorderArticles,
}: ArticleTreeProps) {
  const { language } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Article | null>(null);

  // Initialize sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Handle start of drag operation
  const handleDragStart = (event: DragStartEvent) => {
    const { id, article } = event.active.data.current as { id: string; article: Article };
    setActiveId(id);
    setActiveItem(article);
  };

  // Handle end of drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the indices of the items
      const oldIndex = articles.findIndex(
        (article) => article.id.toString() === active.id
      );
      const newIndex = articles.findIndex(
        (article) => article.id.toString() === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the articles
        const reorderedArticles = arrayMove(articles, oldIndex, newIndex);
        
        // Update display_order for each article
        const updatedArticles = reorderedArticles.map((article, index) => ({
          ...article,
          display_order: index + 1,
        }));
        
        onReorderArticles(updatedArticles);
      }
    }

    setActiveId(null);
    setActiveItem(null);
  };

  // Group articles by category
  const groupedArticles: { [key: string]: Article[] } = {};
  const uncategorizedArticles: Article[] = [];

  articles.forEach(article => {
    if (article.categoryId) {
      const categoryKey = article.categoryId.toString();
      if (!groupedArticles[categoryKey]) {
        groupedArticles[categoryKey] = [];
      }
      groupedArticles[categoryKey].push(article);
    } else {
      uncategorizedArticles.push(article);
    }
  });

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={articles.map((article) => article.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          {/* First show uncategorized articles */}
          {uncategorizedArticles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {language === "vi" ? "Chưa phân loại" : "Uncategorized"}
                </h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCreateArticle()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {language === "vi" ? "Thêm bài viết" : "Add Article"}
                </Button>
              </div>
              <div className="space-y-3">
                {uncategorizedArticles.map((article) => (
                  <SortableArticleItem
                    key={article.id}
                    article={article}
                    onEdit={onEditArticle}
                    onDelete={onDeleteArticle}
                    onTogglePublish={onTogglePublish}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Then show categorized articles */}
          {categories.map((category) => {
            const categoryArticles = groupedArticles[category.id.toString()] || [];
            if (categoryArticles.length === 0) return null;

            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {language === "vi" ? category.title_vi : category.title_en}
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCreateArticle(category.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {language === "vi" ? "Thêm bài viết" : "Add Article"}
                  </Button>
                </div>
                <div className="space-y-3">
                  {categoryArticles.map((article) => (
                    <SortableArticleItem
                      key={article.id}
                      article={article}
                      category={category}
                      onEdit={onEditArticle}
                      onDelete={onDeleteArticle}
                      onTogglePublish={onTogglePublish}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {articles.length === 0 && (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
              <h3 className="text-lg font-medium mb-1">
                {language === "vi" ? "Chưa có bài viết nào" : "No articles yet"}
              </h3>
              <p className="text-sm max-w-md mx-auto">
                {language === "vi"
                  ? "Tạo bài viết mới để xuất bản trên trang web"
                  : "Create new articles to publish on your website"}
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => onCreateArticle()}
              >
                <Plus className="h-4 w-4 mr-2" />
                {language === "vi" ? "Tạo bài viết mới" : "Create New Article"}
              </Button>
            </div>
          )}
        </SortableContext>

        <DragOverlay>
          {activeItem ? <ArticleItem article={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}