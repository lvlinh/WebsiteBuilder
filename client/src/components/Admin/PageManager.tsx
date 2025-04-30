import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import EnhancedPageEditor from "./EnhancedPageEditor";
import PageTree from "./PageTree";
import type { Page } from "@shared/schema";

export default function PageManager() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<Partial<Page> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch pages from the API
  const { data: pages = [], isLoading } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  // Filter pages based on search term
  const filteredPages = pages.filter((page) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      page.title_vi.toLowerCase().includes(searchLower) ||
      page.title_en.toLowerCase().includes(searchLower) ||
      page.slug.toLowerCase().includes(searchLower)
    );
  });

  // Delete page mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete page");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: language === "vi" ? "Xóa trang thành công" : "Page deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Xóa trang thất bại" : "Failed to delete page",
        description: error.message,
      });
    },
  });

  // Toggle page publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, published }: { id: number; published: boolean }) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error("Failed to update page");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: language === "vi" ? "Cập nhật trạng thái thành công" : "Status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Cập nhật trạng thái thất bại" : "Failed to update status",
        description: error.message,
      });
    },
  });

  // Reorder pages mutation
  const reorderPagesMutation = useMutation({
    mutationFn: async (updatedPages: Page[]) => {
      // Update pages one by one with their new order
      const promises = updatedPages.map((page) => 
        fetch(`/api/admin/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menu_order: page.menu_order }),
        })
      );
      
      await Promise.all(promises);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: language === "vi" ? "Sắp xếp thành công" : "Pages reordered successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Sắp xếp thất bại" : "Failed to reorder pages",
        description: error.message,
      });
    },
  });

  // Handle creating a new page
  const handleCreatePage = (parentId?: number) => {
    setSelectedPage(parentId ? { parentId } : {});
    setIsNew(true);
  };

  // Handle editing an existing page
  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setIsNew(false);
  };

  // Handle deleting a page
  const handleDeletePage = (pageId: number) => {
    deleteMutation.mutate(pageId);
  };

  // Handle toggling page publish status
  const handleTogglePublish = (page: Page) => {
    togglePublishMutation.mutate({
      id: page.id,
      published: !page.published,
    });
  };

  // Handle reordering pages
  const handleReorderPages = (reorderedPages: Page[]) => {
    reorderPagesMutation.mutate(reorderedPages);
  };

  if (selectedPage) {
    return (
      <EnhancedPageEditor
        page={selectedPage}
        onBack={() => {
          setSelectedPage(null);
          setIsNew(false);
        }}
        isNew={isNew}
      />
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>{language === "vi" ? "Quản lý trang" : "Page Management"}</CardTitle>
          <Button onClick={() => handleCreatePage()}>
            {language === "vi" ? "Tạo trang mới" : "Create New Page"}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              language === "vi" ? "Tìm kiếm trang..." : "Search pages..."
            }
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <PageTree
            pages={filteredPages}
            onEditPage={handleEditPage}
            onCreatePage={handleCreatePage}
            onDeletePage={handleDeletePage}
            onTogglePublish={handleTogglePublish}
            onReorderPages={handleReorderPages}
          />
        )}
      </CardContent>
    </Card>
  );
}