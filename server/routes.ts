import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArticleSchema, insertNewsSchema, insertStudentSchema, insertCourseSchema, insertEnrollmentSchema, insertEventSchema, insertEventRegistrationSchema, insertPageSchema, insertBannerSlideSchema, updateArticleSchema, insertArticleCategorySchema, updateArticleCategorySchema, insertContentBlockSchema, insertQuickLinkSchema } from "@shared/schema"; // Added import
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";

const SessionStore = MemoryStore(session);

const sessionSecret = process.env.SESSION_SECRET || 'your-secret-key-min-32-chars-long-here';

// Initialize some sample events if none exist
async function initializeSampleEvents() {
  const events = await storage.getEvents();
  if (events.length === 0) {
    await storage.createEvent({
      title_vi: "Lễ Khai Giảng Năm Học 2025-2026",
      title_en: "Opening Ceremony Academic Year 2025-2026",
      description_vi: "Buổi lễ khai giảng năm học mới với sự tham gia của toàn thể giảng viên và sinh viên.",
      description_en: "Opening ceremony for the new academic year with participation from all faculty and students.",
      startDate: new Date("2025-09-15T08:00:00"),
      endDate: new Date("2025-09-15T11:00:00"),
      location: "Hội trường chính / Main Hall",
      capacity: 200,
      registrationDeadline: new Date("2025-09-10T23:59:59"),
      category: "academic",
      status: "upcoming"
    });

    await storage.createEvent({
      title_vi: "Tĩnh Tâm Mùa Vọng",
      title_en: "Advent Retreat",
      description_vi: "Chương trình tĩnh tâm chuẩn bị tâm hồn cho mùa Giáng Sinh.",
      description_en: "Spiritual retreat program to prepare for the Christmas season.",
      startDate: new Date("2025-12-01T09:00:00"),
      endDate: new Date("2025-12-03T17:00:00"),
      location: "Trung tâm Mục vụ / Pastoral Center",
      capacity: 100,
      registrationDeadline: new Date("2025-11-25T23:59:59"),
      category: "spiritual",
      status: "upcoming"
    });

    await storage.createEvent({
      title_vi: "Hội Thảo: Thần Học Đương Đại",
      title_en: "Symposium: Contemporary Theology",
      description_vi: "Hội thảo chuyên đề về các xu hướng thần học hiện đại.",
      description_en: "Symposium on modern theological trends and perspectives.",
      startDate: new Date("2025-10-20T08:30:00"),
      endDate: new Date("2025-10-21T16:30:00"),
      location: "Phòng Hội thảo / Conference Room",
      capacity: 150,
      registrationDeadline: new Date("2025-10-15T23:59:59"),
      category: "academic",
      status: "upcoming"
    });
  }
}

async function initializeAdminUser() {
  const admins = await storage.getAdmins();
  if (admins.length === 0) {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createAdmin({
      email: "admin@sjjs.edu.vn",
      password: hashedPassword,
      name: "Admin",
      role: "admin"
    });
  }
}

// Add this function after initializeAdminUser
async function initializeDefaultPages() {
  try {
    // Check if we have pages with the needed slugs already
    const existingSlugs = new Set();
    let pages = [];
    
    try {
      pages = await storage.getPages();
      for (const page of pages) {
        existingSlugs.add(page.slug);
      }
    } catch (err) {
      console.error("Error getting existing pages:", err);
    }
    
    // Only initialize pages if we're missing the essential ones
    if (pages.length === 0 || (!existingSlugs.has("gioi-thieu") && !existingSlugs.has("tuyen-sinh"))) {
      // Create main sections first
      const mainSections = [
      {
        slug: "gioi-thieu",
        title_vi: "Giới Thiệu",
        title_en: "About",
        content_vi: "Thông tin giới thiệu về Học Viện",
        content_en: "Introduction to the Institute",
        menu_order: 1,
        isSection: true,
        published: true
      },
      {
        slug: "tuyen-sinh",
        title_vi: "Tuyển Sinh",
        title_en: "Admissions",
        content_vi: "Thông tin tuyển sinh",
        content_en: "Admissions Information",
        menu_order: 2,
        isSection: true,
        published: true
      },
      {
        slug: "dao-tao",
        title_vi: "Đào Tạo",
        title_en: "Education",
        content_vi: "Chương trình đào tạo",
        content_en: "Educational Programs",
        menu_order: 3,
        isSection: true,
        published: true
      },
      {
        slug: "ban-giang-huan",
        title_vi: "Ban Giảng Huấn",
        title_en: "Faculty",
        content_vi: "Thông tin về ban giảng huấn",
        content_en: "Faculty Information",
        menu_order: 4,
        isSection: true,
        published: true
      },
      {
        slug: "nghien-cuu-xuat-ban",
        title_vi: "Nghiên Cứu và Xuất Bản",
        title_en: "Research & Publications",
        content_vi: "Nghiên cứu và xuất bản",
        content_en: "Research and Publications",
        menu_order: 5,
        isSection: true,
        published: true
      },
      {
        slug: "gia-dinh-sjjs",
        title_vi: "Gia Đình SJJS",
        title_en: "SJJS Family",
        content_vi: "Cộng đồng SJJS",
        content_en: "SJJS Community",
        menu_order: 6,
        isSection: true,
        published: true
      },
      {
        slug: "tien-ich",
        title_vi: "Tiện Ích",
        title_en: "Resources",
        content_vi: "Tiện ích và tài nguyên",
        content_en: "Resources and Utilities",
        menu_order: 7,
        isSection: true,
        published: true
      }
    ];

    // Create main sections and store their IDs
    const sectionIds = {};
    
    // First, find existing sections
    for (const section of mainSections) {
      if (existingSlugs.has(section.slug)) {
        try {
          const existingPage = await storage.getPageBySlug(section.slug);
          if (existingPage) {
            sectionIds[section.slug] = existingPage.id;
            continue;
          }
        } catch (err) {
          console.error(`Error finding page with slug ${section.slug}:`, err);
        }
      }
      
      try {
        const createdSection = await storage.createPage(section);
        sectionIds[section.slug] = createdSection.id;
      } catch (err) {
        console.error(`Error creating section ${section.slug}:`, err);
      }
    }

    // Create subsections with parent IDs
    const subsections = [
      // Giới Thiệu (About) subsections
      {
        slug: "tuyen-ngon-tam-nhan",
        title_vi: "Tuyên Ngôn Tầm Nhìn",
        title_en: "Vision Statement",
        content_vi: "Tuyên ngôn và tầm nhìn của học viện",
        content_en: "Institute's vision statement",
        menu_order: 1,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },
      {
        slug: "lich-su",
        title_vi: "Lịch Sử",
        title_en: "History",
        content_vi: "Lịch sử phát triển",
        content_en: "Development history",
        menu_order: 2,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },
      {
        slug: "su-menh",
        title_vi: "Sứ Mệnh",
        title_en: "Mission",
        content_vi: "Sứ mệnh của học viện",
        content_en: "Institute's mission",
        menu_order: 3,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },
      {
        slug: "muc-tieu",
        title_vi: "Mục Tiêu",
        title_en: "Objectives",
        content_vi: "Mục tiêu của học viện",
        content_en: "Institute's objectives",
        menu_order: 4,
        parentId: sectionIds["gioi-thieu"],
        published: true
      },

      // Tuyển Sinh (Admissions) subsections
      {
        slug: "thong-bao",
        title_vi: "Thông Báo",
        title_en: "Announcements",
        content_vi: "Thông báo tuyển sinh",
        content_en: "Admission announcements",
        menu_order: 1,
        parentId: sectionIds["tuyen-sinh"],
        published: true
      },
      {
        slug: "tuyen-sinh-cao-hoc",
        title_vi: "Tuyển Sinh Cao Học",
        title_en: "Graduate Admissions",
        content_vi: "Thông tin tuyển sinh cao học",
        content_en: "Graduate admission information",
        menu_order: 2,
        parentId: sectionIds["tuyen-sinh"],
        published: true
      },
      {
        slug: "hoc-phi-tai-tro",
        title_vi: "Học Phí & Tài Trợ",
        title_en: "Tuition & Financial Aid",
        content_vi: "Thông tin về học phí và tài trợ",
        content_en: "Tuition and financial aid information",
        menu_order: 3,
        parentId: sectionIds["tuyen-sinh"],
        published: true
      },

      // Đào Tạo (Education) subsections
      {
        slug: "chuong-trinh-toan-hoc",
        title_vi: "Chương Trình Toàn Học",
        title_en: "Full Programs",
        content_vi: "Thông tin về chương trình toàn học",
        content_en: "Full program information",
        menu_order: 1,
        parentId: sectionIds["dao-tao"],
        published: true
      },
      {
        slug: "cac-mon-hoc",
        title_vi: "Các Môn Học",
        title_en: "Courses",
        content_vi: "Thông tin về các môn học",
        content_en: "Course information",
        menu_order: 2,
        parentId: sectionIds["dao-tao"],
        published: true
      },
      {
        slug: "lich-hoc",
        title_vi: "Lịch Học",
        title_en: "Schedule",
        content_vi: "Lịch học của học viện",
        content_en: "Academic schedule",
        menu_order: 3,
        parentId: sectionIds["dao-tao"],
        published: true
      },
      {
        slug: "quy-che-hoc-tap",
        title_vi: "Quy Chế Học Tập",
        title_en: "Academic Policies",
        content_vi: "Quy chế học tập của học viện",
        content_en: "Academic policies and regulations",
        menu_order: 4,
        parentId: sectionIds["dao-tao"],
        published: true
      },

      // Ban Giảng Huấn (Faculty) subsections
      {
        slug: "ban-giang-huan",
        title_vi: "Ban Giảng Huấn",
        title_en: "Faculty List",
        content_vi: "Danh sách giảng viên",
        content_en: "List of faculty members",
        menu_order: 1,
        parentId: sectionIds["ban-giang-huan"],
        published: true
      },
      {
        slug: "cac-bo-mon",
        title_vi: "Các Bộ Môn",
        title_en: "Departments",
        content_vi: "Thông tin về các bộ môn",
        content_en: "Department information",
        menu_order: 2,
        parentId: sectionIds["ban-giang-huan"],
        published: true
      },
      {
        slug: "hoi-thao",
        title_vi: "Hội Thảo",
        title_en: "Seminars",
        content_vi: "Thông tin về các hội thảo",
        content_en: "Seminar information",
        menu_order: 3,
        parentId: sectionIds["ban-giang-huan"],
        published: true
      },

      // Nghiên Cứu và Xuất Bản (Research & Publications) subsections
      {
        slug: "bai-viet",
        title_vi: "Bài Viết",
        title_en: "Articles",
        content_vi: "Các bài viết nghiên cứu",
        content_en: "Research articles",
        menu_order: 1,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },
      {
        slug: "tap-chi",
        title_vi: "Tạp Chí",
        title_en: "Journal",
        content_vi: "Tạp chí nghiên cứu",
        content_en: "Research journal",
        menu_order: 2,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },
      {
        slug: "luan-van",
        title_vi: "Luận Văn",
        title_en: "Theses",
        content_vi: "Luận văn nghiên cứu",
        content_en: "Research theses",
        menu_order: 3,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },
      {
        slug: "sach",
        title_vi: "Sách",
        title_en: "Books",
        content_vi: "Sách xuất bản",
        content_en: "Published books",
        menu_order: 4,
        parentId: sectionIds["nghien-cuu-xuat-ban"],
        published: true
      },

      // Gia Đình SJJS (SJJS Family) subsections
      {
        slug: "su-kien",
        title_vi: "Sự Kiện",
        title_en: "Events",
        content_vi: "Sự kiện cộng đồng",
        content_en: "Community events",
        menu_order: 1,
        parentId: sectionIds["gia-dinh-sjjs"],
        published: true
      },
      {
        slug: "ban-tin",
        title_vi: "Bản Tin",
        title_en: "News",
        content_vi: "Tin tức cộng đồng",
        content_en: "Community news",
        menu_order: 2,
        parentId: sectionIds["gia-dinh-sjjs"],
        published: true
      },
      {
        slug: "van-hoa-sjjs",
        title_vi: "Văn Hóa SJJS",
        title_en: "SJJS Culture",
        content_vi: "Văn hóa học viện",
        content_en: "Institute culture",
        menu_order: 3,
        parentId: sectionIds["gia-dinh-sjjs"],
        published: true
      },

      // Tiện Ích (Resources) subsections
      {
        slug: "phong-tu",
        title_vi: "Phòng Tư",
        title_en: "Library",
        content_vi: "Thông tin thư viện",
        content_en: "Library information",
        menu_order: 1,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "co-so-hoc-tap",
        title_vi: "Cơ Sở Học Tập",
        title_en: "Study Facilities",
        content_vi: "Thông tin cơ sở vật chất",
        content_en: "Facility information",
        menu_order: 2,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "giao-an-videos",
        title_vi: "Giáo Án/Videos",
        title_en: "Lessons/Videos",
        content_vi: "Tài liệu học tập",
        content_en: "Learning materials",
        menu_order: 3,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "tai-lieu",
        title_vi: "Tài Liệu",
        title_en: "Documents",
        content_vi: "Tài liệu tham khảo",
        content_en: "Reference materials",
        menu_order: 4,
        parentId: sectionIds["tien-ich"],
        published: true
      },
      {
        slug: "cac-lien-ket",
        title_vi: "Các Liên Kết",
        title_en: "Links",
        content_vi: "Liên kết hữu ích",
        content_en: "Useful links",
        menu_order: 5,
        parentId: sectionIds["tien-ich"],
        published: true
      }

    ];

    for (const subsection of subsections) {
      // Skip if this page already exists
      if (existingSlugs.has(subsection.slug)) {
        continue;
      }
      
      try {
        await storage.createPage(subsection);
      } catch (err) {
        console.error(`Error creating subsection ${subsection.slug}:`, err);
      }
    }
    } // Close the if block
  } catch (error) {
    console.error("Error initializing default pages:", error);
  }
}

// Add after the other initialization functions
async function initializeSampleBannerSlides() {
  try {
    const slides = await storage.getBannerSlides();
    if (slides.length === 0) {
      try {
        await storage.createBannerSlide({
      imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f",
      title_vi: "Chào mừng đến với SJJS",
      title_en: "Welcome to SJJS",
      description_vi: "Học viện thần học Dòng Tên",
      description_en: "Jesuit School of Theology",
      textVerticalAlign: "center",
      textHorizontalAlign: "center",
      darkOverlay: true,
      buttonLink: "/about",
      buttonText_vi: "Tìm hiểu thêm",
      buttonText_en: "Learn More",
      order: 1,
      active: true
    });

    await storage.createBannerSlide({
      imageUrl: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0",
      title_vi: "Đào tạo lãnh đạo tương lai",
      title_en: "Forming Future Leaders",
      description_vi: "Phát triển toàn diện con người",
      description_en: "Developing the whole person",
      textVerticalAlign: "bottom",
      textHorizontalAlign: "start",
      darkOverlay: true,
      order: 2,
      active: true
    });

    await storage.createBannerSlide({
      imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
      title_vi: "Học tập suốt đời",
      title_en: "Lifelong Learning",
      description_vi: "Kết hợp truyền thống và hiện đại",
      description_en: "Combining tradition and innovation",
      textVerticalAlign: "top",
      textHorizontalAlign: "end",
      darkOverlay: false,
      order: 3,
      active: true
    });
      } catch (err) {
        console.error("Error creating banner slide:", err);
      }
    }
  } catch (error) {
    console.error("Error initializing sample banner slides:", error);
  }
}

// Add this function after other initialization functions
async function initializeSampleArticles() {
  try {
    const articles = await storage.getArticles();
    if (articles.length === 0) {
      try {
        // Get all categories to use in article creation
        const categories = await storage.getArticleCategories();
        
        // Function to create an article with proper schema fields
        const createSampleArticle = async (index, categorySlug) => {
          try {
            // Find category by slug
            const category = categories.find(c => c.slug === categorySlug);
            if (!category) return;
            
            const categoryId = category.id;
            const isFeatured = index % 7 === 0; // Make some articles featured
            
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days
            
            // Create unique slugs by combining category and index
            const slug = `${categorySlug}-article-${index}`;
            
            await storage.createArticle({
              slug,
              title_vi: `Bài viết ${index} của danh mục ${category.title_vi}`,
              title_en: `Article ${index} of category ${category.title_en}`,
              summary_vi: `Tóm tắt bài viết ${index} thuộc danh mục ${category.title_vi}`,
              summary_en: `Summary of article ${index} in the ${category.title_en} category`,
              content_vi: `<p>Đây là nội dung bài viết ${index} thuộc danh mục ${category.title_vi}. Bài viết này được tạo để kiểm tra phân trang và tính năng liên kết danh mục.</p><p>Nội dung chi tiết của bài viết sẽ hiển thị ở đây, bao gồm nhiều đoạn văn để làm cho bài viết trông đầy đủ và thực tế hơn.</p><p>Đối với bài viết này, chúng tôi đang kiểm tra khả năng hiển thị nội dung dài, định dạng HTML, và cách các liên kết giữa bài viết và danh mục hoạt động.</p>`,
              content_en: `<p>This is the content of article ${index} in the ${category.title_en} category. This article was created to test pagination and category linking functionality.</p><p>The detailed content of the article will be displayed here, including multiple paragraphs to make the article look more complete and realistic.</p><p>For this article, we are testing the ability to display long content, HTML formatting, and how links between articles and categories work.</p>`,
              categoryId,
              featured: isFeatured,
              published: true,
              author: "Admin SJJS"
            });
          } catch (err) {
            console.error(`Error creating article for ${categorySlug}:`, err);
          }
        };
    
        // Create 5 articles for each category (60 total articles for 12 categories)
        for (const category of categories) {
          for (let i = 1; i <= 5; i++) {
            await createSampleArticle((categories.indexOf(category) * 5) + i, category.slug);
          }
        }
    
        // Add a few special featured articles
        try {
          await storage.createArticle({
            slug: "welcome-to-sjjs-2025",
            title_vi: "Chào mừng đến với SJJS năm học 2025",
            title_en: "Welcome to SJJS Academic Year 2025",
            summary_vi: "Thông điệp chào mừng từ Ban Giám đốc Học viện",
            summary_en: "Welcome message from the Institute's Board of Directors",
            content_vi: "<p>Kính gửi quý thầy cô, các sinh viên và cộng đồng SJJS,</p><p>Nhân dịp khởi đầu năm học mới 2025-2026, thay mặt Ban Giám đốc Học viện, tôi xin gửi lời chào mừng nồng nhiệt và lời chúc tốt đẹp nhất đến tất cả các thành viên của cộng đồng SJJS. Một năm học với nhiều cơ hội và thách thức mới đang chờ đón chúng ta.</p>",
            content_en: "<p>Dear faculty members, students, and SJJS community,</p><p>On the occasion of the beginning of the new academic year 2025-2026, on behalf of the Institute's Board of Directors, I would like to extend my warmest welcome and best wishes to all members of the SJJS community. A year with many new opportunities and challenges awaits us.</p>",
            categoryId: categories.find(c => c.slug === "announcement")?.id,
            featured: true,
            published: true,
            author: "Ban Giám đốc / Board of Directors"
          });

          await storage.createArticle({
            slug: "theology-symposium-2025",
            title_vi: "Hội thảo Thần học: Đối thoại Liên tôn trong Thế giới Hiện đại",
            title_en: "Theology Symposium: Interfaith Dialogue in the Modern World",
            summary_vi: "Hội thảo chuyên đề về vai trò của đối thoại liên tôn",
            summary_en: "Symposium on the role of interfaith dialogue",
            content_vi: "<p>Học viện SJJS tổ chức hội thảo chuyên đề về đối thoại liên tôn trong thế giới hiện đại. Hội thảo sẽ diễn ra từ ngày 15-17 tháng 8 năm 2025 tại Học viện SJJS.</p>",
            content_en: "<p>SJJS Institute is organizing a symposium on interfaith dialogue in the modern world. The symposium will take place from August 15-17, 2025, at the SJJS Institute.</p>",
            categoryId: categories.find(c => c.slug === "academic")?.id,
            featured: true,
            published: true,
            author: "Ban Học thuật / Academic Board"
          });
        } catch (error) {
          console.error("Error creating special featured articles:", error);
        }
      } catch (error) {
        console.error("Error initializing article categories:", error);
      }
    }
  } catch (error) {
    console.error("Error initializing sample articles:", error);
  }
}

// Initialize sample content blocks and quick links
async function initializeSampleContent() {
  try {
    // Initialize content blocks
    let contentBlocks = [];
    try {
      contentBlocks = await storage.getContentBlocks();
    } catch (err) {
      console.error("Error getting content blocks:", err);
    }
    
    if (contentBlocks.length === 0) {
      try {
        // Create sample welcome message
        await storage.createContentBlock({
          identifier: "home_welcome",
          title_vi: "Chào mừng đến với SJJS",
          title_en: "Welcome to SJJS",
          content_vi: "<p>Chào mừng đến với Học viện Thần học Dòng Tên Saint Joseph, nơi nuôi dưỡng những người lãnh đạo tâm linh và học thuật trong tinh thần Ignatius!</p><p>Chúng tôi cung cấp nền giáo dục toàn diện và xuất sắc mà các sinh viên của chúng tôi cần để phục vụ trong thế giới phức tạp và luôn thay đổi.</p>",
          content_en: "<p>Welcome to the Saint Joseph Jesuit Seminary, where spiritual and academic leaders are nurtured in the Ignatian tradition!</p><p>We provide the comprehensive and excellent education our students need to serve in a complex and ever-changing world.</p>",
          type: "rich_text",
          section: "home",
          order: 1
        });
        
        // Create sample mission statement
        await storage.createContentBlock({
          identifier: "home_mission",
          title_vi: "Sứ mệnh của chúng tôi",
          title_en: "Our Mission",
          content_vi: "<p>Học viện Thần học Dòng Tên Saint Joseph cam kết đào tạo các nhà lãnh đạo tâm linh và trí tuệ thông qua giáo dục xuất sắc, nghiên cứu học thuật nghiêm túc và đối thoại liên văn hóa.</p>",
          content_en: "<p>The Saint Joseph Jesuit Seminary is committed to forming spiritual and intellectual leaders through excellent education, rigorous academic research, and intercultural dialogue.</p>",
          type: "rich_text",
          section: "home",
          order: 2
        });
        
        // Create sample upcoming events section
        await storage.createContentBlock({
          identifier: "home_events_intro",
          title_vi: "Sự kiện sắp tới",
          title_en: "Upcoming Events",
          content_vi: "<p>Khám phá các sự kiện và hoạt động sắp tới tại SJJS. Tham gia vào cộng đồng học thuật và tâm linh của chúng tôi!</p>",
          content_en: "<p>Discover upcoming events and activities at SJJS. Join our academic and spiritual community!</p>",
          type: "rich_text",
          section: "home",
          order: 3
        });
        
        // Create sample news section introduction
        await storage.createContentBlock({
          identifier: "home_news_intro",
          title_vi: "Tin tức mới nhất",
          title_en: "Latest News",
          content_vi: "<p>Cập nhật thông tin mới nhất về các hoạt động, thành tựu và sự kiện tại Học viện Thần học Dòng Tên Saint Joseph.</p>",
          content_en: "<p>Get updated with the latest information about activities, achievements, and events at the Saint Joseph Jesuit Seminary.</p>",
          type: "rich_text",
          section: "home",
          order: 4
        });
      } catch (err) {
        console.error("Error creating content blocks:", err);
      }
    }
  
    // Initialize quick links
    try {
      let quickLinks = [];
      try {
        quickLinks = await storage.getQuickLinks();
      } catch (err) {
        console.error("Error getting quick links:", err);
      }
      
      if (quickLinks.length === 0) {
        try {
          // Create sample quick links
          await storage.createQuickLink({
            title_vi: "Tuyển sinh",
            title_en: "Admissions",
            url: "/tuyen-sinh",
            description_vi: "Thông tin tuyển sinh",
            description_en: "Admissions information",
            icon: "GraduationCap",
            order: 1
          });
          
          await storage.createQuickLink({
            title_vi: "Chương trình học",
            title_en: "Programs",
            url: "/dao-tao",
            description_vi: "Khám phá các chương trình học",
            description_en: "Explore our educational programs",
            icon: "BookOpen",
            order: 2
          });
          
          await storage.createQuickLink({
            title_vi: "Lịch học",
            title_en: "Schedule",
            url: "/dao-tao/lich-hoc",
            description_vi: "Lịch học và sự kiện",
            description_en: "Class schedule and events",
            icon: "Calendar",
            order: 3
          });
          
          await storage.createQuickLink({
            title_vi: "Thư viện",
            title_en: "Library",
            url: "/tien-ich",
            description_vi: "Nguồn tài liệu học tập",
            description_en: "Learning resources",
            icon: "Library",
            order: 4
          });
          
          await storage.createQuickLink({
            title_vi: "Liên hệ",
            title_en: "Contact",
            url: "/contact",
            description_vi: "Thông tin liên hệ",
            description_en: "Contact information",
            icon: "Mail",
            order: 5
          });
        } catch (err) {
          console.error("Error creating quick links:", err);
        }
      }
    } catch (err) {
      console.error("Error initializing quick links:", err);
    }
  } catch (error) {
    console.error("Error initializing sample content:", error);
  }
}

// Add the initialization function
async function initializeArticleCategories() {
  try {
    // Get existing categories
    let categories = [];
    try {
      categories = await storage.getArticleCategories();
    } catch (err) {
      console.error("Error getting article categories:", err);
    }
    
    // Only create default categories if none exist
    if (categories.length === 0) {
      const defaultCategories = [
        {
          slug: "news",
          title_vi: "Tin tức",
          title_en: "News",
          order: 1
        },
        {
          slug: "announcement",
          title_vi: "Thông báo",
          title_en: "Announcements",
          order: 2
        },
        {
          slug: "internal",
          title_vi: "Tin nội bộ",
          title_en: "Internal News",
          order: 3
        },
        {
          slug: "catholic",
          title_vi: "Tin công giáo",
          title_en: "Catholic News",
          order: 4
        },
        {
          slug: "admission",
          title_vi: "Tin tuyển sinh",
          title_en: "Admission News",
          order: 5
        },
        {
          slug: "academic",
          title_vi: "Tin học viện",
          title_en: "Academic News",
          order: 6
        },
        // Additional categories for testing
        {
          slug: "events",
          title_vi: "Sự kiện",
          title_en: "Events",
          order: 7
        },
        {
          slug: "research",
          title_vi: "Nghiên cứu học thuật",
          title_en: "Academic Research",
          order: 8
        },
        {
          slug: "student-life",
          title_vi: "Đời sống sinh viên",
          title_en: "Student Life",
          order: 9
        },
        {
          slug: "publications",
          title_vi: "Ấn phẩm",
          title_en: "Publications",
          order: 10
        },
        {
          slug: "faculty",
          title_vi: "Giảng viên",
          title_en: "Faculty",
          order: 11
        },
        {
          slug: "community-outreach",
          title_vi: "Cộng đồng",
          title_en: "Community Outreach",
          order: 12
        }
      ];

      // Create each category
      for (const category of defaultCategories) {
        try {
          await storage.createArticleCategory(category);
        } catch (err) {
          console.error(`Error creating category ${category.slug}:`, err);
        }
      }
    }
  } catch (error) {
    console.error("Error initializing article categories:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup with better security
  app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  await initializeSampleEvents();
  await initializeAdminUser();
  await initializeDefaultPages();
  await initializeSampleBannerSlides();
  await initializeArticleCategories();
  await initializeSampleArticles();
  await initializeSampleContent(); // Initialize content blocks and quick links

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const student = await storage.getStudentByEmail(email);
        if (!student) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, student.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, student);
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const student = await storage.getStudent(id);
      if (!student) {
        return done(null, false);
      }
      done(null, student);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  // Articles routes
  app.get("/api/articles", async (_req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  // Get articles by category ID
  app.get("/api/articles/by-category/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId, 10);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const articles = await storage.getArticles();
      const categoryArticles = articles.filter(
        article => article.published && article.categoryId === categoryId
      );
      
      res.json(categoryArticles);
    } catch (error) {
      console.error("Error fetching articles by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get article by slug or ID - keep this after the by-category route to avoid route conflicts
  app.get("/api/articles/:slugOrId", async (req, res) => {
    const slugOrId = req.params.slugOrId;
    let article;

    // Try to get by ID first
    if (!isNaN(Number(slugOrId))) {
      article = await storage.getArticle(Number(slugOrId));
    }

    // If not found by ID, try to get by slug
    if (!article) {
      article = await storage.getArticleBySlug(slugOrId);
    }

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
    try {
      console.log('Update article request body:', req.body);
      const parseResult = updateArticleSchema.safeParse(req.body);

      if (!parseResult.success) {
        console.error('Article update validation errors:', parseResult.error.errors);
        return res.status(400).json({
          message: "Invalid article data",
          errors: parseResult.error.errors
        });
      }

      // If category is being updated, validate it exists
      if (req.body.category) {
        const categoryExists = await storage.getArticleCategoryBySlug(req.body.category);
        if (!categoryExists) {
          return res.status(400).json({ message: "Invalid category" });
        }
      }

      const article = await storage.updateArticle(Number(req.params.id), parseResult.data);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ message: "Failed to update article" });
    }
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

  // Student Portal Routes with improved error handling
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const { password, ...safeUser } = user;
        return res.json(safeUser);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.logout(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  app.post("/api/students/register", async (req, res) => {
    try {
      const parseResult = insertStudentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid student data",
          errors: parseResult.error.errors
        });
      }

      // Check if email already exists
      const existingStudent = await storage.getStudentByEmail(parseResult.data.email);
      if (existingStudent) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(parseResult.data.password, 10);
      const student = await storage.createStudent({
        ...parseResult.data,
        password: hashedPassword
      });

      // Remove password from response
      const { password, ...safeStudent } = student;
      res.status(201).json(safeStudent);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.get("/api/students/me", isAuthenticated, async (req: any, res) => {
    const student = await storage.getStudent(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const { password, ...safeStudent } = student;
    res.json(safeStudent);
  });

  app.get("/api/students/me/courses", isAuthenticated, async (req: any, res) => {
    const enrollments = await storage.getEnrollments(req.user.id);
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await storage.getCourse(enrollment.courseId);
        return {
          ...course,
          enrollment: {
            enrolledAt: enrollment.enrolledAt,
            status: enrollment.status,
            grade: enrollment.grade
          }
        };
      })
    );
    res.json(courses);
  });

  app.post("/api/courses", async (req, res)=> {
    const parseResult = insertCourseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid course data" });
    }
    const course = await storage.createCourse(parseResult.data);
    res.status(201).json(course);
  });

  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    const parseResult = insertEnrollmentSchema.safeParse({
      ...req.body,
      studentId: req.user.id
    });
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid enrollment data" });
    }
    const enrollment = await storage.createEnrollment(parseResult.data);
    res.status(201).json(enrollment);
  });

  // Event routes
  app.get("/api/events", async (_req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/upcoming", async (_req, res) => {
    const events = await storage.getUpcomingEvents();
    res.json(events);
  });

  app.get("/api/events/:id", async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  app.post("/api/events", async (req, res) => {
    const parseResult = insertEventSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid event data",
        errors: parseResult.error.errors
      });
    }
    const event = await storage.createEvent(parseResult.data);
    res.status(201).json(event);
  });

  app.patch("/api/events/:id", async (req, res) => {
    const parseResult = insertEventSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid event data" });
    }
    const event = await storage.updateEvent(Number(req.params.id), parseResult.data);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  });

  // Event Registration routes
  app.get("/api/events/:id/registrations", async (req, res) => {
    const registrations = await storage.getEventRegistrations(Number(req.params.id));
    res.json(registrations);
  });

  app.get("/api/events/:id/registration-status", isAuthenticated, async (req: any, res) => {
    const registration = await storage.getEventRegistrationStatus(
      Number(req.params.id),
      req.user.id
    );
    res.json({ registered: !!registration, registration });
  });

  app.get("/api/students/me/event-registrations", isAuthenticated, async (req: any, res) => {
    const registrations = await storage.getStudentEventRegistrations(req.user.id);
    const eventsWithDetails = await Promise.all(
      registrations.map(async (registration) => {
        const event = await storage.getEvent(registration.eventId);
        return {
          ...registration,
          event
        };
      })
    );
    res.json(eventsWithDetails);
  });

  app.post("/api/events/:id/register", isAuthenticated, async (req: any, res) => {
    const eventId = Number(req.params.id);

    // Check if event exists and registration is still open
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ message: "Registration deadline has passed" });
    }

    // Check if user is already registered
    const existingRegistration = await storage.getEventRegistrationStatus(eventId, req.user.id);
    if (existingRegistration) {
      return res.status(400).json({ message: "Already registered for this event" });
    }

    // Check if event is at capacity
    const registrations = await storage.getEventRegistrations(eventId);
    if (registrations.length >= event.capacity) {
      return res.status(400).json({ message: "Event is at full capacity" });
    }

    const parseResult = insertEventRegistrationSchema.safeParse({
      eventId,
      studentId: req.user.id,
      status: "registered",
      notes: req.body.notes
    });

    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }

    const registration = await storage.createEventRegistration(parseResult.data);
    res.status(201).json(registration);
  });

  app.patch("/api/events/:eventId/registrations/:id", async (req, res) => {
    const parseResult = insertEventRegistrationSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }

    const registration = await storage.updateEventRegistration(
      Number(req.params.id),
      parseResult.data
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.json(registration);
  });

  // Search routes - completely rewritten to fix async issues
  app.get("/api/search", async (req, res) => {
    const { query, type, category } = req.query;
    let results = [];

    try {
      // Handle articles
      if (!type || type === 'article') {
        const articles = await storage.getArticles();
        const articleResults = [];
        
        for (const article of articles) {
          // Match by content
          const matchesQuery = !query || 
            article.title_vi.toLowerCase().includes(String(query).toLowerCase()) ||
            article.title_en.toLowerCase().includes(String(query).toLowerCase()) ||
            article.content_vi.toLowerCase().includes(String(query).toLowerCase()) ||
            article.content_en.toLowerCase().includes(String(query).toLowerCase());
          
          // Get category info
          let categorySlug = null;
          if (article.categoryId) {
            const categoryObj = await storage.getArticleCategory(article.categoryId);
            if (categoryObj) {
              categorySlug = categoryObj.slug;
            }
          }
          
          // Match by category
          const matchesCategory = !category || categorySlug === category;
          
          // Add to results if matches
          if (matchesQuery && matchesCategory) {
            articleResults.push({
              type: 'article',
              id: article.id,
              title: article.title_en || article.title_vi,
              description: article.content_en || article.content_vi,
              category: categorySlug,
              date: article.publishedAt
            });
          }
        }
        
        results = [...results, ...articleResults];
      }
      
      // Handle events
      if (!type || type === 'event') {
        const events = await storage.getEvents();
        const eventResults = [];
        
        for (const event of events) {
          const matchesQuery = !query ||
            event.title_vi.toLowerCase().includes(String(query).toLowerCase()) ||
            event.title_en.toLowerCase().includes(String(query).toLowerCase()) ||
            event.description_vi.toLowerCase().includes(String(query).toLowerCase()) ||
            event.description_en.toLowerCase().includes(String(query).toLowerCase());
          
          const matchesCategory = !category || event.category === category;
          
          if (matchesQuery && matchesCategory) {
            eventResults.push({
              type: 'event',
              id: event.id,
              title: event.title_en || event.title_vi,
              description: event.description_en || event.description_vi,
              category: event.category,
              date: event.startDate
            });
          }
        }
        
        results = [...results, ...eventResults];
      }
      
      // Handle courses
      if (!type || type === 'course') {
        const courses = await storage.getCourses();
        const courseResults = [];
        
        for (const course of courses) {
          const matchesQuery = !query ||
            course.name_vi.toLowerCase().includes(String(query).toLowerCase()) ||
            course.name_en.toLowerCase().includes(String(query).toLowerCase()) ||
            course.description_vi.toLowerCase().includes(String(query).toLowerCase()) ||
            course.description_en.toLowerCase().includes(String(query).toLowerCase());
          
          const matchesCategory = !category || course.semester === category;
          
          if (matchesQuery && matchesCategory) {
            courseResults.push({
              type: 'course',
              id: course.id,
              title: course.name_en || course.name_vi,
              description: course.description_en || course.description_vi,
              category: course.semester
            });
          }
        }
        
        results = [...results, ...courseResults];
      }

      res.json(results);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ message: "Search failed" });
    }
  });


  // Add these routes after the existing routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);

      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set admin session
      req.session.adminId = admin.id;

      // Remove password from response
      const { password: _, ...safeAdmin } = admin;
      res.json(safeAdmin);
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.adminId = undefined;
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Add this route near the other admin routes
  app.get("/api/admin/me", async (req: any, res) => {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await storage.getAdmin(adminId);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Remove sensitive data before sending
    const { password, ...safeAdmin } = admin;
    res.json(safeAdmin);
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    const adminId = req.session.adminId;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const admin = await storage.getAdmin(adminId);
    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.admin = admin;
    next();
  };

  // Pages API
  app.get("/api/pages", async (_req, res) => {
    const pages = await storage.getPages();
    res.json(pages);
  });

  app.get("/api/pages/:slug", async (req, res) => {
    const page = await storage.getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  });

  // Admin protected routes
  app.get("/api/admin/pages", isAdmin, async (_req, res) => {
    const pages = await storage.getPages();
    res.json(pages);
  });

  app.get("/api/admin/pages/:id", isAdmin, async (req, res) => {
    const pageId = Number(req.params.id);
    const page = await storage.getPage(pageId);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  });

  app.post("/api/admin/pages", isAdmin, async (req, res) => {
    const parseResult = insertPageSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid page data",
        errors: parseResult.error.errors
      });
    }
    const page = await storage.createPage(parseResult.data);
    res.status(201).json(page);
  });

  app.patch("/api/admin/pages/:id", isAdmin, async (req, res) => {
    const parseResult = insertPageSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid page data" });
    }
    const page = await storage.updatePage(Number(req.params.id), parseResult.data);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(page);
  });

  app.delete("/api/admin/pages/:id", isAdmin, async (req, res) => {
    const success = await storage.deletePage(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.status(204).end();
  });
  
  // Admin Article routes (protected)
  app.get("/api/admin/articles", isAdmin, async (_req, res) => {
    const articles = await storage.getArticles();
    res.json(articles);
  });

  app.post("/api/admin/articles", isAdmin, async (req, res) => {
    try {
      // Make a copy of the request body to modify it
      const requestData = { ...req.body };
      
      // Handle date conversion if needed
      if (requestData.publishedAt && typeof requestData.publishedAt === 'string') {
        requestData.publishedAt = new Date(requestData.publishedAt);
      }
      
      const parseResult = insertArticleSchema.safeParse(requestData);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid article data",
          errors: parseResult.error.errors
        });
      }
      const article = await storage.createArticle(parseResult.data);
      res.status(201).json(article);
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/admin/articles/:id", isAdmin, async (req, res) => {
    try {
      // Make a copy of the request body to modify it
      const requestData = { ...req.body };
      
      // Handle date conversion if needed
      if (requestData.publishedAt && typeof requestData.publishedAt === 'string') {
        requestData.publishedAt = new Date(requestData.publishedAt);
      }
      
      const parseResult = updateArticleSchema.safeParse(requestData);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid article data",
          errors: parseResult.error.errors
        });
      }

      if (requestData.slug) {
        const existingArticle = await storage.getArticleBySlug(requestData.slug);
        if (existingArticle && existingArticle.id !== Number(req.params.id)) {
          return res.status(400).json({ message: "Article with this slug already exists" });
        }
      }

      const article = await storage.updateArticle(Number(req.params.id), parseResult.data);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/admin/articles/:id", isAdmin, async (req, res) => {
    const success = await storage.deleteArticle(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(204).end();
  });

  // Add after existing API endpoints but before registerRoutes function
  app.get("/api/banner-slides", async (_req, res) => {
    try {
      const slides = await storage.getBannerSlides();
      console.log('Fetched banner slides:', slides); // Debug log
      res.json(slides);
    } catch (error) {
      console.error('Error fetching banner slides:', error);
      res.status(500).json({ message: "Failed to fetch banner slides" });
    }
  });

  app.post("/api/banner-slides", isAdmin, async (req, res) => {
    const parseResult = insertBannerSlideSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Invalid banner slide data",
        errors: parseResult.error.errors
      });
    }
    const slide = await storage.createBannerSlide(parseResult.data);
    res.status(201).json(slide);
  });

  app.patch("/api/banner-slides/:id", isAdmin, async (req, res) => {
    const parseResult = insertBannerSlideSchema.partial().safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid banner slide data" });
    }
    const slide = await storage.updateBannerSlide(Number(req.params.id), parseResult.data);
    if (!slide) {
      return res.status(404).json({ message: "Banner slide not found" });
    }
    res.json(slide);
  });

  app.delete("/api/banner-slides/:id", isAdmin, async (req, res) => {
    const success = await storage.deleteBannerSlide(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Banner slide not found" });
    }
    res.status(204).end();
  });

  // Add article category routes for public (non-admin) access
  app.get("/api/article-categories", async (_req, res) => {
    const categories = await storage.getArticleCategories();
    res.json(categories);
  });
  
  // Get article category by ID (public route)
  app.get("/api/article-categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id, 10);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getArticleCategory(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching article category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add article category routes for admin access
  app.get("/api/admin/article-categories", isAdmin, async (_req, res) => {
    const categories = await storage.getArticleCategories();
    res.json(categories);
  });

  app.post("/api/admin/article-categories", isAdmin, async (req, res) => {
    try {
      console.log("Received category data:", req.body);
      
      // Handle string input that might not be valid JSON
      let categoryData = req.body;
      if (typeof categoryData === 'string') {
        try {
          categoryData = JSON.parse(categoryData);
        } catch (err) {
          console.error("Error parsing category data:", err);
          return res.status(400).json({
            message: "Invalid JSON format",
            error: "The provided data is not valid JSON"
          });
        }
      }
      
      const parseResult = insertArticleCategorySchema.safeParse(categoryData);
      if (!parseResult.success) {
        console.error("Category validation failed:", parseResult.error.errors);
        return res.status(400).json({
          message: "Invalid category data",
          errors: parseResult.error.errors
        });
      }

      const existingCategory = await storage.getArticleCategoryBySlug(parseResult.data.slug);
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this slug already exists" });
      }

      const category = await storage.createArticleCategory(parseResult.data);
      console.log("Category created successfully:", category);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/article-categories/:id", isAdmin, async (req, res) => {
    try {
      console.log("Received update category data:", req.body);
      
      // Handle string input that might not be valid JSON
      let categoryData = req.body;
      if (typeof categoryData === 'string') {
        try {
          categoryData = JSON.parse(categoryData);
        } catch (err) {
          console.error("Error parsing category data:", err);
          return res.status(400).json({
            message: "Invalid JSON format",
            error: "The provided data is not valid JSON"
          });
        }
      }
      
      const parseResult = updateArticleCategorySchema.safeParse(categoryData);
      if (!parseResult.success) {
        console.error("Category validation failed:", parseResult.error.errors);
        return res.status(400).json({
          message: "Invalid category data",
          errors: parseResult.error.errors
        });
      }

      if (categoryData.slug) {
        const existingCategory = await storage.getArticleCategoryBySlug(categoryData.slug);
        if (existingCategory && existingCategory.id !== Number(req.params.id)) {
          return res.status(400).json({ message: "Category with this slug already exists" });
        }
      }

      const category = await storage.updateArticleCategory(Number(req.params.id), parseResult.data);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      console.log("Category updated successfully:", category);
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/article-categories/:id", isAdmin, async (req, res) => {
    // Before deleting, check if any articles are using this category
    const articles = await storage.getArticles();
    const category = await storage.getArticleCategory(Number(req.params.id));

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (articles.some(article => article.categoryId === category.id)) {
      return res.status(400).json({
        message: "Cannot delete category that is being used by articles"
      });
    }

    const success = await storage.deleteArticleCategory(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(204).end();
  });

  // Content Blocks API endpoints
  app.get("/api/content-blocks", async (_req, res) => {
    try {
      const blocks = await storage.getContentBlocks();
      res.json(blocks);
    } catch (error) {
      console.error('Error fetching content blocks:', error);
      res.status(500).json({ message: "Failed to fetch content blocks" });
    }
  });

  app.get("/api/content-blocks/:id", async (req, res) => {
    try {
      const block = await storage.getContentBlock(Number(req.params.id));
      if (!block) {
        return res.status(404).json({ message: "Content block not found" });
      }
      res.json(block);
    } catch (error) {
      console.error('Error fetching content block:', error);
      res.status(500).json({ message: "Failed to fetch content block" });
    }
  });

  app.post("/api/content-blocks", isAdmin, async (req, res) => {
    try {
      const parseResult = insertContentBlockSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid content block data",
          errors: parseResult.error.errors
        });
      }
      const block = await storage.createContentBlock(parseResult.data);
      res.status(201).json(block);
    } catch (error) {
      console.error('Error creating content block:', error);
      res.status(500).json({ message: "Failed to create content block" });
    }
  });

  app.patch("/api/content-blocks/:id", isAdmin, async (req, res) => {
    try {
      const parseResult = insertContentBlockSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid content block data",
          errors: parseResult.error.errors
        });
      }
      const block = await storage.updateContentBlock(Number(req.params.id), parseResult.data);
      if (!block) {
        return res.status(404).json({ message: "Content block not found" });
      }
      res.json(block);
    } catch (error) {
      console.error('Error updating content block:', error);
      res.status(500).json({ message: "Failed to update content block" });
    }
  });

  app.delete("/api/content-blocks/:id", isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteContentBlock(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Content block not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting content block:', error);
      res.status(500).json({ message: "Failed to delete content block" });
    }
  });

  // Quick Links API endpoints
  app.get("/api/quick-links", async (_req, res) => {
    try {
      const links = await storage.getQuickLinks();
      res.json(links);
    } catch (error) {
      console.error('Error fetching quick links:', error);
      res.status(500).json({ message: "Failed to fetch quick links" });
    }
  });

  app.get("/api/quick-links/:id", async (req, res) => {
    try {
      const link = await storage.getQuickLink(Number(req.params.id));
      if (!link) {
        return res.status(404).json({ message: "Quick link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error('Error fetching quick link:', error);
      res.status(500).json({ message: "Failed to fetch quick link" });
    }
  });

  app.post("/api/quick-links", isAdmin, async (req, res) => {
    try {
      const parseResult = insertQuickLinkSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid quick link data",
          errors: parseResult.error.errors
        });
      }
      const link = await storage.createQuickLink(parseResult.data);
      res.status(201).json(link);
    } catch (error) {
      console.error('Error creating quick link:', error);
      res.status(500).json({ message: "Failed to create quick link" });
    }
  });

  app.patch("/api/quick-links/:id", isAdmin, async (req, res) => {
    try {
      const parseResult = insertQuickLinkSchema.partial().safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          message: "Invalid quick link data",
          errors: parseResult.error.errors
        });
      }
      const link = await storage.updateQuickLink(Number(req.params.id), parseResult.data);
      if (!link) {
        return res.status(404).json({ message: "Quick link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error('Error updating quick link:', error);
      res.status(500).json({ message: "Failed to update quick link" });
    }
  });

  app.delete("/api/quick-links/:id", isAdmin, async (req, res) => {
    try {
      const success = await storage.deleteQuickLink(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Quick link not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting quick link:', error);
      res.status(500).json({ message: "Failed to delete quick link" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}