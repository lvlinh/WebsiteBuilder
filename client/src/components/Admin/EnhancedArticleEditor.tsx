import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ChevronLeft, ImageIcon } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { slugify } from "@/lib/utils";
import type { Article, ArticleCategory } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EnhancedArticleEditorProps {
  article: Partial<Article>;
  onBack: () => void;
  isNew?: boolean;
}

export default function EnhancedArticleEditor({
  article,
  onBack,
  isNew = false,
}: EnhancedArticleEditorProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [tabValue, setTabValue] = useState<string>("vi");
  const [title_vi, setTitleVi] = useState(article.title_vi || "");
  const [title_en, setTitleEn] = useState(article.title_en || "");
  const [content_vi, setContentVi] = useState(article.content_vi || "");
  const [content_en, setContentEn] = useState(article.content_en || "");
  const [summary_vi, setSummaryVi] = useState(article.summary_vi || "");
  const [summary_en, setSummaryEn] = useState(article.summary_en || "");
  const [slug, setSlug] = useState(article.slug || "");
  const [published, setPublished] = useState(article.published !== false);
  const [featuredImage, setFeaturedImage] = useState(article.featuredImage || "");
  const [categoryId, setCategoryId] = useState<number | null>(article.categoryId || null);
  const [publishDate, setPublishDate] = useState<Date>(
    article.publishedAt ? new Date(article.publishedAt) : new Date()
  );
  const [autoSlug, setAutoSlug] = useState(isNew);

  // Fetch all categories
  const { data: categories = [] } = useQuery<ArticleCategory[]>({
    queryKey: ["/api/article-categories"],
  });

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
    mutationFn: async (data: Omit<Article, "id" | "createdAt" | "updatedAt">) => {
      const res = await apiRequest("POST", "/api/admin/articles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "vi" ? "Tạo bài viết thành công" : "Article created successfully",
      });
      onBack();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Tạo bài viết thất bại" : "Failed to create article",
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Article> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/articles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: language === "vi" ? "Cập nhật thành công" : "Update successful",
      });
      onBack();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Cập nhật thất bại" : "Update failed",
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Vietnamese title is always required
    if (!title_vi.trim() || !slug.trim()) {
      toast({
        variant: "destructive",
        title: language === "vi" ? "Thiếu thông tin" : "Missing information",
        description:
          language === "vi"
            ? "Vui lòng điền tiêu đề tiếng Việt và đường dẫn"
            : "Please fill in the Vietnamese title and slug",
      });
      return;
    }

    // Create the article data with Vietnamese content required
    const articleData = {
      title_vi,
      title_en: title_en.trim() || title_vi, // Fallback to Vietnamese if English is empty
      content_vi,
      content_en: content_en.trim() || content_vi, // Fallback to Vietnamese if English is empty
      summary_vi,
      summary_en: summary_en.trim() || summary_vi, // Fallback to Vietnamese if English is empty
      slug,
      published,
      featuredImage,
      categoryId: categoryId || undefined,
      publishedAt: publishDate.toISOString(),
    };

    if (isNew) {
      createMutation.mutate(articleData as any);
    } else if (article.id) {
      updateMutation.mutate({ id: article.id, ...articleData });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack} className="flex-shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isNew
            ? language === "vi"
              ? "Tạo bài viết mới"
              : "Create New Article"
            : language === "vi"
            ? "Chỉnh sửa bài viết"
            : "Edit Article"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <Tabs value={tabValue} onValueChange={setTabValue}>
              <TabsList className="w-full">
                <TabsTrigger value="vi" className="flex-1">
                  {language === "vi" ? "Tiếng Việt" : "Vietnamese"}
                  <span className="ml-1 text-xs bg-red-500 text-white rounded px-1">
                    {language === "vi" ? "Bắt buộc" : "Required"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="en" className="flex-1">
                  {language === "vi" ? "Tiếng Anh" : "English"}
                  <span className="ml-1 text-xs bg-gray-500 text-white rounded px-1">
                    {language === "vi" ? "Tùy chọn" : "Optional"}
                  </span>
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

                <div className="space-y-2">
                  <Label htmlFor="summary_vi">
                    {language === "vi" ? "Tóm tắt tiếng Việt" : "Vietnamese Summary"}
                  </Label>
                  <textarea
                    id="summary_vi"
                    name="summary_vi"
                    value={summary_vi}
                    onChange={(e) => setSummaryVi(e.target.value)}
                    className="w-full min-h-[100px] p-2 border rounded-md resize-y"
                    placeholder={language === "vi" ? "Tóm tắt ngắn gọn về bài viết" : "Brief summary of the article"}
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
                    placeholder={language === "vi" ? "(Tùy chọn)" : "(Optional)"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary_en">
                    {language === "vi" ? "Tóm tắt tiếng Anh" : "English Summary"}
                  </Label>
                  <textarea
                    id="summary_en"
                    name="summary_en"
                    value={summary_en}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    className="w-full min-h-[100px] p-2 border rounded-md resize-y"
                    placeholder={language === "vi" ? "(Tùy chọn)" : "(Optional)"}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                {language === "vi" ? "Danh mục" : "Category"}
              </Label>
              <Select
                value={categoryId?.toString() || "none"}
                onValueChange={(value) => setCategoryId(value === "none" ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === "vi" ? "Chọn danh mục" : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {language === "vi" ? "Không có danh mục" : "No category"}
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {language === "vi" ? cat.title_vi : cat.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  ? "Đường dẫn sẽ được sử dụng trong URL, ví dụ: /articles/bai-viet-moi"
                  : "The slug will be used in the URL, e.g., /articles/new-article"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">
                {language === "vi" ? "Hình ảnh đại diện" : "Featured Image"}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="featuredImage"
                  name="featuredImage"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  title={language === "vi" ? "Xem trước" : "Preview"}
                  disabled={!featuredImage}
                  onClick={() => window.open(featuredImage, '_blank')}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === "vi"
                  ? "URL của hình ảnh đại diện cho bài viết này"
                  : "URL of the featured image for this article"}
              </p>
              {featuredImage && (
                <div className="mt-2 relative border rounded-md overflow-hidden aspect-video">
                  <img 
                    src={featuredImage} 
                    alt={language === "vi" ? title_vi : title_en}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishDate">
                {language === "vi" ? "Ngày xuất bản" : "Publish Date"}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {publishDate ? (
                      format(publishDate, "PPP")
                    ) : (
                      <span>
                        {language === "vi" ? "Chọn ngày" : "Pick a date"}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={publishDate}
                    onSelect={(date) => date && setPublishDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                  ? "Bài viết chưa xuất bản sẽ không hiển thị cho người dùng"
                  : "Unpublished articles will not be visible to users"}
              </p>
            </div>
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
                ? "Tạo bài viết"
                : "Create Article"
              : language === "vi"
              ? "Lưu thay đổi"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}