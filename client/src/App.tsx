import { Switch, Route } from "wouter"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { Toaster } from "@/components/ui/toaster"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Home from "@/pages/Home"
import DynamicPage from "@/pages/DynamicPage"
import StudentLogin from "@/pages/StudentPortal/Login"
import StudentRegister from "@/pages/StudentPortal/Register"
import StudentDashboard from "@/pages/StudentPortal/Dashboard"
import Events from "@/pages/Events"
import Search from "@/pages/Search"
import AdminLogin from "@/pages/Admin/Login"
import AdminDashboard from "@/pages/Admin/Dashboard"
import NotFound from "@/pages/not-found"

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        {/* Special routes that need specific handling */}
        <Route path="/events" component={Events} />
        <Route path="/student/login" component={StudentLogin} />
        <Route path="/student/register" component={StudentRegister} />
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/search" component={Search} />
        {/* Dynamic page routes */}
        <Route path="/:section/:subsection" component={DynamicPage} />
        <Route path="/:section" component={DynamicPage} />
        {/* 404 route */}
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App