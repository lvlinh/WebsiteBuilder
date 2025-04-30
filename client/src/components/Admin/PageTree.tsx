import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import {
  ChevronRight,
  ChevronDown,
  Globe,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  GripVertical,
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
import { type Page } from "@shared/schema";

interface PageTreeProps {
  pages: Page[];
  onEditPage: (page: Page) => void;
  onCreatePage: (parentId?: number) => void;
  onDeletePage: (pageId: number) => void;
  onTogglePublish: (page: Page) => void;
  onReorderPages: (pages: Page[]) => void;
}

// Building a hierarchical tree from flat pages list
function buildPageTree(pages: Page[]): Page[] {
  const rootPages = pages.filter((page) => !page.parentId);
  const childrenMap = new Map<number, Page[]>();

  pages.forEach((page) => {
    if (page.parentId) {
      if (!childrenMap.has(page.parentId)) {
        childrenMap.set(page.parentId, []);
      }
      childrenMap.get(page.parentId)?.push(page);
    }
  });

  // Sort children by menu_order
  childrenMap.forEach((children, parentId) => {
    children.sort((a, b) => a.menu_order - b.menu_order);
  });

  // Add children property to each page
  const result = rootPages.map((page) => ({
    ...page,
    children: childrenMap.get(page.id) || [],
  }));

  // Sort root pages by menu_order
  result.sort((a, b) => a.menu_order - b.menu_order);

  return result;
}

// Interface for extended page with children
interface PageWithChildren extends Page {
  children: PageWithChildren[];
}

// SortableItem component - represents each page in the tree
function SortablePageItem({
  page,
  depth = 0,
  onToggle,
  onEdit,
  onAdd,
  onDelete,
  onTogglePublish,
  expanded,
}: {
  page: PageWithChildren;
  depth?: number;
  onToggle: (id: number) => void;
  onEdit: (page: Page) => void;
  onAdd: (parentId: number) => void;
  onDelete: (pageId: number) => void;
  onTogglePublish: (page: Page) => void;
  expanded: Set<number>;
}) {
  const { language } = useI18n();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isExpanded = expanded.has(page.id);
  const hasChildren = page.children && page.children.length > 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: page.id.toString(),
      data: { type: "page", page },
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
          "flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors",
          isDragging && "bg-accent"
        )}
      >
        <div
          {...listeners}
          className="cursor-grab hover:bg-muted rounded p-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div
          onClick={() => hasChildren && onToggle(page.id)}
          className={cn(
            "w-4 h-4 flex items-center justify-center",
            hasChildren ? "cursor-pointer" : "opacity-0"
          )}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            ))}
        </div>

        <div
          className={cn(
            "flex-1 flex items-center gap-2",
            !page.published && "text-muted-foreground"
          )}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">
            {language === "vi" ? page.title_vi : page.title_en}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            /{page.slug}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onTogglePublish(page)}
          >
            {page.published ? (
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
              <DropdownMenuItem onClick={() => onEdit(page)}>
                <Edit className="h-4 w-4 mr-2" />
                {language === "vi" ? "Chỉnh sửa" : "Edit"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAdd(page.id)}>
                <Plus className="h-4 w-4 mr-2" />
                {language === "vi" ? "Thêm trang con" : "Add child page"}
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
                ? `Bạn có chắc chắn muốn xóa trang "${page.title_vi}"? Thao tác này không thể hoàn tác.`
                : `Are you sure you want to delete the page "${page.title_en}"? This action cannot be undone.`}
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
                onDelete(page.id);
                setConfirmDelete(false);
              }}
            >
              {language === "vi" ? "Xóa" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Render children if expanded */}
      {isExpanded && hasChildren && (
        <div
          className="pl-8 border-l border-muted ml-4 mt-1"
          style={{ marginLeft: `${depth * 8 + 16}px` }}
        >
          {page.children.map((child) => (
            <SortablePageItem
              key={child.id}
              page={child}
              depth={depth + 1}
              onToggle={onToggle}
              onEdit={onEdit}
              onAdd={onAdd}
              onDelete={onDelete}
              onTogglePublish={onTogglePublish}
              expanded={expanded}
            />
          ))}
        </div>
      )}
    </>
  );
}

// Item for drag overlay
function PageItem({ page }: { page: Page }) {
  const { language } = useI18n();
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50 border border-accent">
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === "vi" ? page.title_vi : page.title_en}
      </span>
    </div>
  );
}

export default function PageTree({
  pages,
  onEditPage,
  onCreatePage,
  onDeletePage,
  onTogglePublish,
  onReorderPages,
}: PageTreeProps) {
  const { language } = useI18n();
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Page | null>(null);
  const [treePages, setTreePages] = useState<PageWithChildren[]>([]);

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

  // Build the tree whenever pages change
  useEffect(() => {
    setTreePages(buildPageTree(pages) as PageWithChildren[]);
  }, [pages]);

  // Toggle expanded state for a page
  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  // Handle start of drag operation
  const handleDragStart = (event: DragStartEvent) => {
    const { id, page } = event.active.data.current as { id: string; page: Page };
    setActiveId(id);
    setActiveItem(page);
  };

  // Handle end of drag operation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find the indices of the items
      const oldIndex = pages.findIndex(
        (page) => page.id.toString() === active.id
      );
      const newIndex = pages.findIndex(
        (page) => page.id.toString() === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the pages
        const reorderedPages = arrayMove(pages, oldIndex, newIndex);
        
        // Update menu_order for each page
        const updatedPages = reorderedPages.map((page, index) => ({
          ...page,
          menu_order: index + 1,
        }));
        
        onReorderPages(updatedPages);
      }
    }

    setActiveId(null);
    setActiveItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">
          {language === "vi" ? "Cây trang" : "Page Tree"}
        </h2>
        <Button onClick={() => onCreatePage()}>
          <Plus className="h-4 w-4 mr-2" />
          {language === "vi" ? "Trang mới" : "New Page"}
        </Button>
      </div>

      <div className="border rounded-md">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((page) => page.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="p-2 space-y-1">
              {treePages.map((page) => (
                <SortablePageItem
                  key={page.id}
                  page={page}
                  onToggle={toggleExpanded}
                  onEdit={onEditPage}
                  onAdd={onCreatePage}
                  onDelete={onDeletePage}
                  onTogglePublish={onTogglePublish}
                  expanded={expanded}
                />
              ))}
              {pages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {language === "vi"
                    ? "Chưa có trang nào. Tạo trang mới để bắt đầu."
                    : "No pages yet. Create a new page to get started."}
                </div>
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? <PageItem page={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}