'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  LogOut, 
  User as UserIcon, 
  Settings, 
  Activity, 
  Search, 
  Bell, 
  ChevronRight,
  FolderOpen,
  ShieldCheck
} from "lucide-react";
import CreateProjectModal from "@/components/CreateProjectModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        // Fetch profile first to know the role
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        setProfile(profileData);
        // Fetch projects using the role info
        fetchProjects(profileData);
      }
    }
    fetchData();
  }, []);

  const fetchProjects = async (currentProfile) => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    if (currentProfile?.role === 'admin') {
      // Admins see EVERYTHING
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setProjects(data);
    } else {
      // Members only see their own projects
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          projects (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', authUser.id);
      
      if (!error && data) {
        setProjects(data.map(item => item.projects).filter(Boolean));
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isGlobalAdmin = profile?.role === 'admin';

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`w-64 border-r bg-card flex-shrink-0 hidden md:flex flex-col shadow-sm transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-64'}`}>
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-xl group">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
            </div>
            TaskFlow
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-7">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Main Menu</p>
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                pathname === '/dashboard' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <LayoutDashboard className="size-4.5" />
              Dashboard
            </Link>
            <Link 
              href="/dashboard/tasks" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                pathname === '/dashboard/tasks' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <CheckSquare className="size-4.5" />
              All Tasks
            </Link>
            <Link 
              href="/dashboard/team" 
              className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                pathname === '/dashboard/team' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Users className="size-4.5" />
              Team
            </Link>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {isGlobalAdmin ? 'All Projects' : 'My Projects'}
              </p>
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{projects.length}</span>
            </div>
            
            <div className="space-y-0.5 max-h-[300px] overflow-y-auto pr-1">
              {projects.map((project) => (
                <Link 
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`} 
                  className={`flex items-center justify-between group px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === `/dashboard/projects/${project.id}` ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="truncate max-w-[120px]">{project.name}</span>
                  </div>
                  <ChevronRight className={`size-3 opacity-0 transition-all ${
                    pathname === `/dashboard/projects/${project.id}` ? 'opacity-100' : 'group-hover:opacity-100 group-hover:translate-x-1'
                  }`} />
                </Link>
              ))}
              {projects.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <FolderOpen className="size-8 text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] text-muted-foreground font-medium italic">No projects created</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/30">
          {isGlobalAdmin ? (
            <CreateProjectModal onProjectCreated={() => fetchProjects(profile)} />
          ) : (
            <div className="px-4 py-3 rounded-xl border border-dashed border-border flex items-center gap-3 text-xs text-muted-foreground font-medium">
              <ShieldCheck className="size-4 text-primary/40" />
              Project creation restricted
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">Overview</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="h-9 w-64 rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm focus:bg-background focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
              />
            </div>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent relative">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2.5 size-2 bg-primary rounded-full border-2 border-background" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="relative h-9 w-9 rounded-xl border border-border shadow-sm p-0 overflow-hidden hover:opacity-90 transition-opacity" />
              }>
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} alt="@user" />
                  <AvatarFallback className="rounded-none">JD</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 shadow-xl border-border" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || 'User'}</p>
                        <Badge variant="outline" className={`text-[8px] font-black uppercase px-1.5 h-4 border-none rounded-md ${
                          isGlobalAdmin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {profile?.role || 'member'}
                        </Badge>
                      </div>
                      <p className="text-[10px] leading-none text-muted-foreground font-medium">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-3 gap-3 cursor-pointer rounded-lg m-1">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span className="text-xs font-bold">Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 gap-3 cursor-pointer rounded-lg m-1">
                    <Activity className="size-4 text-muted-foreground" />
                    <span className="text-xs font-bold">Activity Log</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="p-3 gap-3 cursor-pointer rounded-lg m-1 text-red-500 focus:bg-red-500/10 focus:text-red-500 transition-colors">
                  <LogOut className="size-4" />
                  <span className="text-xs font-bold">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
