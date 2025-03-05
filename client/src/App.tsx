import { Switch, Route } from "wouter"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./lib/queryClient"
import { Toaster } from "@/components/ui/toaster"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Admissions from "@/pages/Admissions"
import Education from "@/pages/Education"
import Faculty from "@/pages/Faculty"
import Articles from "@/pages/Articles"
import Family from "@/pages/Family"
import Resources from "@/pages/Resources"
import StudentLogin from "@/pages/StudentPortal/Login"
import StudentRegister from "@/pages/StudentPortal/Register"
import StudentDashboard from "@/pages/StudentPortal/Dashboard"
import Events from "@/pages/Events"
import Search from "@/pages/Search"
import AdminLogin from "@/pages/Admin/Login"
import AdminDashboard from "@/pages/Admin/Dashboard" //New import
import NotFound from "@/pages/not-found"

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/admissions" component={Admissions} />
        <Route path="/education" component={Education} />
        <Route path="/faculty" component={Faculty} />
        <Route path="/articles" component={Articles} />
        <Route path="/family" component={Family} />
        <Route path="/resources" component={Resources} />
        <Route path="/student/login" component={StudentLogin} />
        <Route path="/student/register" component={StudentRegister} />
        <Route path="/student/dashboard" component={StudentDashboard} />
        <Route path="/events" component={Events} />
        <Route path="/search" component={Search} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} /> //New Route
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