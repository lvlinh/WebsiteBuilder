import { Switch, Route } from "wouter"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider, useTheme } from "@/lib/theme-provider"
import { I18nProvider } from "@/hooks/use-i18n"
import { AdminProvider } from "@/hooks/use-admin"
import DirectThemeReset from "@/components/DirectThemeReset"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import BreadcrumbNav from "@/components/layout/BreadcrumbNav"
import Home from "@/pages/Home"
import DynamicPage from "@/pages/DynamicPage"
import StudentLogin from "@/pages/StudentPortal/Login"
import StudentRegister from "@/pages/StudentPortal/Register"
import StudentDashboard from "@/pages/StudentPortal/Dashboard"
import Articles from "@/pages/Articles"
import ArticleDetail from "@/pages/ArticleDetail"
import Events from "@/pages/Events"
import Search from "@/pages/Search"
import AdminLogin from "@/pages/Admin/Login"
import AdminDashboard from "@/pages/Admin/Dashboard"
import NotFound from "@/pages/not-found"
import PageManager from "@/pages/Admin/PageManager"
import ArticleManager from "@/pages/Admin/ArticleManager"
import ArticleCategories from "@/pages/Admin/ArticleCategories"
import BannerSlides from "@/pages/Admin/BannerSlides"
import ThemeSettings from "@/pages/Admin/ThemeSettings"

function Router() {
  const { resolvedTheme, theme, getContentWidthClass } = useTheme();
  
  // Get the appropriate content width class from the theme
  const containerClass = getContentWidthClass();

  return (
    <div className={`min-h-screen flex flex-col ${resolvedTheme === 'dark' ? 'dark' : ''} ${theme.variant ? `variant-${theme.variant}` : 'variant-professional'}`}>
      {/* Always visible header */}
      <Header />
      
      {/* Breadcrumb navigation - only visible on non-home pages */}
      <BreadcrumbNav />
      
      {/* Main content area with dynamic width based on theme */}
      <div className="flex-grow w-full">
        {/* Each page component now handles its own content width */}
        <Switch>
          <Route path="/" component={Home} />
          {/* Special routes that need specific handling */}
          <Route path="/articles" component={Articles} />
          <Route path="/articles/:slug" component={ArticleDetail} />
          <Route path="/events" component={Events} />
          <Route path="/student/login" component={StudentLogin} />
          <Route path="/student/register" component={StudentRegister} />
          <Route path="/student/dashboard" component={StudentDashboard} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/pages" component={PageManager} />
          <Route path="/admin/articles" component={ArticleManager} />
          <Route path="/admin/categories" component={ArticleCategories} />
          <Route path="/admin/banners" component={BannerSlides} />
          <Route path="/admin/theme" component={ThemeSettings} />
          <Route path="/search" component={Search} />
          {/* Dynamic page routes */}
          <Route path="/:section/:subsection" component={DynamicPage} />
          <Route path="/:section" component={DynamicPage} />
          {/* 404 route */}
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Always visible footer */}
      <Footer />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <AdminProvider>
            <Router />
            <Toaster />
            {/* Fixed position theme reset tool - always accessible */}
            <div className="fixed bottom-4 right-4 z-50">
              <DirectThemeReset />
            </div>
          </AdminProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}

export default App