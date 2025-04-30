import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { slugify } from "@/lib/utils";
import type { Page } from "@shared/schema";

interface EnhancedPageEditorProps {
  page: Partial<Page>;
  onBack: () => void;
  isNew?: boolean;
}

export default function EnhancedPageEditor({
  page,
  onBack,
  isNew = false,
}: EnhancedPageEditorProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState<string>("vi");
  const [title_vi, setTitleVi] = useState(page.title_vi || "");
  const [title_en, setTitleEn] = useState(page.title_en || "");
  const [content_vi, setContentVi] = useState(page.content_vi || "");
  const [content_en, setContentEn] = useState(page.content_en || "");
  const [slug, setSlug] = useState(page.slug || "");
  const [published, setPublished] = useState(page.published !== false);
  const [parentId, setParentId] = useState<number | null>(page.parentId || null);
  const [autoSlug, setAutoSlug] = useState(isNew);

  // Fetch all pages for parent selection
  const { data: pages } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
  });

  // List of valid parent pages (can't select itself or its descendants)
  const validParentPages = pages?.filter(
    (p) => p.id !== page.id && (!page.id || !isDescendantOf(p, page.id))
  ) || [];

  // Check if a page is a descendant of another page
  function isDescendantOf(potentialParent: Page, pageId: number): boolean {
    if (potentialParent.parentId === pageId) return true;
    if (!potentialParent.parentId) return false;
    
    const parent = pages?.find((p) => p.id === potentialParent.parentId);
    if (!parent) return false;
    
    return isDescendantOf(parent, pageId);
  }

  // Auto-generate slug from title when auto-slug is enabled
  useEffect(() => {
    if (autoSlug) {
      if (tabValue === "vi" && title_vi) {
        setSlug(slugify(title_vi));
      } else if (tabValue === "en" && title_en) {
        setSlug(slugify(title_en));
      }
    }
  }, [title_vi, title_en, tabValue, autoSlug]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: Omit<Page, "id" | "createdAt" | "updatedAt">) => {
      const res = await fetch(`/api/admin/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create page");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: language === "vi" ? "Tạo trang thành công" : "Page created successfully",
      });
      onBack();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Tạo trang thất bại" : "Failed to create page",
        description: error.message,
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Page> & { id: number }) => {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update page");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pages"] });
      toast({
        title: language === "vi" ? "Cập nhật thành công" : "Update successful",
      });
      onBack();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Cập nhật thất bại" : "Update failed",
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title_vi.trim() || !title_en.trim() || !slug.trim()) {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Thiếu thông tin" : "Missing information",
        description:
          language === "vi"
            ? "Vui lòng điền đầy đủ tiêu đề và đường dẫn"
            : "Please fill in all titles and slug",
      });
      return;
    }

    const pageData = {
      title_vi,
      title_en,
      content_vi,
      content_en,
      slug,
      published,
      parentId: parentId || undefined,
    };

    if (isNew) {
      createMutation.mutate(pageData as any);
    } else if (page.id) {
      updateMutation.mutate({ id: page.id, ...pageData });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew
            ? language === "vi"
              ? "Tạo trang mới"
              : "Create New Page"
            : language === "vi"
            ? "Chỉnh sửa trang"
            : "Edit Page"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentId">
                {language === "vi" ? "Trang cha" : "Parent Page"}
              </Label>
              <Select
                value={parentId?.toString() || "none"}
                onValueChange={(value) => setParentId(value === "none" ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === "vi" ? "Chọn trang cha" : "Select parent page"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {language === "vi" ? "Không có (trang gốc)" : "None (root page)"}
                  </SelectItem>
                  {validParentPages.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {language === "vi" ? p.title_vi : p.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {language === "vi"
                  ? "Để trống nếu đây là trang chính"
                  : "Leave empty if this is a main page"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                {language === "vi" ? "Đường dẫn" : "Slug"}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1"
                  disabled={autoSlug}
                  required
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-slug"
                    checked={autoSlug}
                    onCheckedChange={setAutoSlug}
                  />
                  <Label htmlFor="auto-slug" className="text-sm">
                    {language === "vi" ? "Tự động" : "Auto"}
                  </Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "vi"
                  ? "Đường dẫn sẽ được sử dụng trong URL, ví dụ: /gioi-thieu"
                  : "The slug will be used in the URL, e.g., /about"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  name="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
                <Label htmlFor="published">
                  {language === "vi" ? "Xuất bản" : "Published"}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "vi"
                  ? "Trang chưa xuất bản sẽ không hiển thị cho người dùng"
                  : "Unpublished pages will not be visible to users"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Tabs value={tabValue} onValueChange={setTabValue}>
              <TabsList className="w-full">
                <TabsTrigger value="vi" className="flex-1">
                  {language === "vi" ? "Tiếng Việt" : "Vietnamese"}
                </TabsTrigger>
                <TabsTrigger value="en" className="flex-1">
                  {language === "vi" ? "Tiếng Anh" : "English"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vi" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="title_vi">
                    {language === "vi" ? "Tiêu đề tiếng Việt" : "Vietnamese Title"}
                  </Label>
                  <Input
                    id="title_vi"
                    name="title_vi"
                    value={title_vi}
                    onChange={(e) => setTitleVi(e.target.value)}
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="en" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="title_en">
                    {language === "vi" ? "Tiêu đề tiếng Anh" : "English Title"}
                  </Label>
                  <Input
                    id="title_en"
                    name="title_en"
                    value={title_en}
                    onChange={(e) => setTitleEn(e.target.value)}
                    required
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            {tabValue === "vi"
              ? language === "vi"
                ? "Nội dung tiếng Việt"
                : "Vietnamese Content"
              : language === "vi"
              ? "Nội dung tiếng Anh"
              : "English Content"}
          </Label>
          <div className="min-h-[400px] border rounded-md">
            <RichTextEditor
              content={tabValue === "vi" ? content_vi : content_en}
              onChange={(html) => {
                if (tabValue === "vi") {
                  setContentVi(html);
                } else {
                  setContentEn(html);
                }
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            {language === "vi" ? "Hủy" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={
              createMutation.isPending || updateMutation.isPending
            }
          >
            {isNew
              ? language === "vi"
                ? "Tạo trang"
                : "Create Page"
              : language === "vi"
              ? "Lưu thay đổi"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}