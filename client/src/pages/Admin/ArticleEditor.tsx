import { useI18n } from "@/lib/i18n"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import type { Article, ArticleCategory } from "@shared/schema"

interface ArticleEditorProps {
  article?: Article
  onBack: () => void
}

export default function ArticleEditor({ article, onBack }: ArticleEditorProps) {
  const { language } = useI18n()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch article categories
  const { data: categories } = useQuery<ArticleCategory[]>({
    queryKey: ['/api/article-categories']
  })

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Article, 'id' | 'publishedAt' | 'viewCount'>) => {
      console.log('Creating article with data:', data)
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create article')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] })
      toast({
        title: language === 'vi' ? 'Tạo bài viết thành công' : 'Article created successfully',
      })
      onBack()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Tạo bài viết thất bại' : 'Failed to create article',
        description: error.message
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Article) => {
      const { id, publishedAt, viewCount, ...updateData } = data
      // When updating, include the original slug
      const payload = {
        ...updateData,
        slug: article?.slug // Keep the original slug during updates
      }
      console.log('Updating article with data:', payload)

      const res = await fetch(`/api/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update article')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] })
      toast({
        title: language === 'vi' ? 'Cập nhật bài viết thành công' : 'Article updated successfully',
      })
      onBack()
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Cập nhật bài viết thất bại' : 'Failed to update article',
        description: error.message
      })
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const selectedCategory = formData.get('category') as string
    if (!selectedCategory || !categories?.some(cat => cat.slug === selectedCategory)) {
      toast({
        variant: "destructive",
        title: language === 'vi' ? 'Lỗi danh mục' : 'Category Error',
        description: language === 'vi' ? 'Vui lòng chọn danh mục hợp lệ' : 'Please select a valid category'
      })
      return
    }

    // Get form values
    const content_vi = document.getElementById('content_vi') as HTMLInputElement
    const content_en = document.getElementById('content_en') as HTMLInputElement

    const data = {
      title_vi: formData.get('title_vi') as string,
      title_en: formData.get('title_en') as string,
      excerpt_vi: formData.get('excerpt_vi') as string,
      excerpt_en: formData.get('excerpt_en') as string,
      content_vi: content_vi.value,
      content_en: content_en.value,
      thumbnail: formData.get('thumbnail') as string || null,
      category: selectedCategory,
      featured: formData.get('featured') === 'on',
      published: formData.get('published') === 'on',
      author: formData.get('author') as string || null,
    }

    // Log form data for debugging
    console.log('Form submission data:', {
      ...data,
      content_vi_length: data.content_vi.length,
      content_en_length: data.content_en.length
    })

    if (article?.id) {
      // For updates, include the ID, publishedAt, and viewCount from the original article
      updateMutation.mutate({ 
        ...data, 
        id: article.id,
        slug: article.slug, // Keep the original slug
        publishedAt: article.publishedAt,
        viewCount: article.viewCount || 0
      })
    } else {
      // For new articles, include the slug from the form
      const slug = formData.get('slug') as string
      if (!slug) {
        toast({
          variant: "destructive",
          title: language === 'vi' ? 'Lỗi đường dẫn' : 'Slug Error',
          description: language === 'vi' ? 'Vui lòng nhập đường dẫn' : 'Please enter a slug'
        })
        return
      }
      createMutation.mutate({ ...data, slug })
    }
  }

  // Ensure categories are loaded before rendering
  if (!categories) {
    return <div>Loading categories...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {article?.id
            ? language === 'vi' ? 'Chỉnh sửa bài viết' : 'Edit Article'
            : language === 'vi' ? 'Tạo bài viết mới' : 'Create New Article'
          }
        </CardTitle>
        {article?.id && (
          <CardDescription>
            Slug: {article.slug}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!article?.id && (
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" required />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title_vi">
                {language === 'vi' ? 'Tiêu đề tiếng Việt' : 'Vietnamese Title'}
              </Label>
              <Input 
                id="title_vi" 
                name="title_vi" 
                defaultValue={article?.title_vi}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title_en">
                {language === 'vi' ? 'Tiêu đề tiếng Anh' : 'English Title'}
              </Label>
              <Input 
                id="title_en" 
                name="title_en" 
                defaultValue={article?.title_en}
                required 
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="excerpt_vi">
                {language === 'vi' ? 'Tóm tắt tiếng Việt' : 'Vietnamese Excerpt'}
              </Label>
              <Input 
                id="excerpt_vi" 
                name="excerpt_vi" 
                defaultValue={article?.excerpt_vi}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt_en">
                {language === 'vi' ? 'Tóm tắt tiếng Anh' : 'English Excerpt'}
              </Label>
              <Input 
                id="excerpt_en" 
                name="excerpt_en" 
                defaultValue={article?.excerpt_en}
                required 
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input 
                id="thumbnail" 
                name="thumbnail" 
                defaultValue={article?.thumbnail || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">
                {language === 'vi' ? 'Danh mục' : 'Category'}
              </Label>
              <Select name="category" defaultValue={article?.category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {language === 'vi' ? category.title_vi : category.title_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_vi">
              {language === 'vi' ? 'Nội dung tiếng Việt' : 'Vietnamese Content'}
            </Label>
            <input 
              type="hidden" 
              name="content_vi" 
              id="content_vi" 
              defaultValue={article?.content_vi || ''} 
            />
            <RichTextEditor
              content={article?.content_vi || ''}
              onChange={(html) => {
                const input = document.getElementById('content_vi') as HTMLInputElement
                if (input) input.value = html
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_en">
              {language === 'vi' ? 'Nội dung tiếng Anh' : 'English Content'}
            </Label>
            <input 
              type="hidden" 
              name="content_en" 
              id="content_en" 
              defaultValue={article?.content_en || ''} 
            />
            <RichTextEditor
              content={article?.content_en || ''}
              onChange={(html) => {
                const input = document.getElementById('content_en') as HTMLInputElement
                if (input) input.value = html
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="author">
                {language === 'vi' ? 'Tác giả' : 'Author'}
              </Label>
              <Input 
                id="author" 
                name="author" 
                defaultValue={article?.author || ''}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="featured" 
                name="featured"
                defaultChecked={article?.featured ?? false}
              />
              <Label htmlFor="featured">
                {language === 'vi' ? 'Nổi bật' : 'Featured'}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="published" 
                name="published"
                defaultChecked={article?.published ?? true}
              />
              <Label htmlFor="published">
                {language === 'vi' ? 'Xuất bản' : 'Published'}
              </Label>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline"
              onClick={onBack}
            >
              {language === 'vi' ? 'Quay lại' : 'Back'}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {article?.id
                ? language === 'vi' ? 'Cập nhật bài viết' : 'Update Article'
                : language === 'vi' ? 'Tạo bài viết' : 'Create Article'
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}