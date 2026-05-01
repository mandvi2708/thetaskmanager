'use client'

import React, { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  Users, 
  Calendar, 
  MoreVertical, 
  LayoutList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Layout,
  ShieldCheck,
  User as UserIcon,
  Lock,
  Sparkles
} from "lucide-react"
import Link from 'next/link'
import KanbanBoard from '@/components/KanbanBoard'
import CreateTaskModal from '@/components/CreateTaskModal'
import InviteMemberModal from '@/components/InviteMemberModal'
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function ProjectPage({ params }) {
  const { id } = use(params)
  const supabase = createClient()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [tasks, setTasks] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState('member')
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjectData = async (silent = false) => {
    if (!silent) setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      // Parallel fetching for performance
      const [projectRes, memberRes, taskRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', id).single(),
        supabase.from('project_members').select('*').eq('project_id', id),
        supabase.from('tasks').select('*').eq('project_id', id).order('created_at', { ascending: false })
      ])
      
      // Fetch profile role for global admin check
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
      const isGlobalAdmin = profile?.role === 'admin'

      if (!projectRes.error) setProject(projectRes.data)
      
      if (!memberRes.error && memberRes.data) {
        setMembers(memberRes.data)
        const membership = memberRes.data.find(m => m.user_id === user?.id)
        
        // Priority: Global Admin > Project-specific role > member
        if (isGlobalAdmin) {
          setUserRole('admin')
        } else if (membership) {
          setUserRole(membership.role)
        } else {
          setUserRole('member')
        }
      }

      if (!taskRes.error) setTasks(taskRes.data || [])
    } catch (err) {
      toast.error("Failed to fetch project data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const handleTaskCreated = () => {
    fetchProjectData(true)
    toast.success("Task created successfully!", {
      icon: <Sparkles className="size-4 text-emerald-500" />,
      description: "Your new task has been added to the board."
    })
  }

  const isAdmin = userRole === 'admin'

  if (isLoading) {
    return <ProjectSkeleton />
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="size-20 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="size-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Project not found</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">This project might have been deleted or you don't have access.</p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground">Projects</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{project.name}</h1>
              <Badge variant="outline" className="h-6 px-2 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-primary/5 text-primary border-primary/20">
                Live
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">{project.description || "Building the future, one task at a time."}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 pb-1">
          {isAdmin ? (
            <>
              <InviteMemberModal projectId={id} onMemberAdded={() => fetchProjectData(true)} />
              <CreateTaskModal projectId={id} onTaskCreated={handleTaskCreated} />
            </>
          ) : (
            <div className="text-xs text-muted-foreground font-medium flex items-center gap-2 bg-muted/30 px-4 py-2.5 rounded-xl border border-border italic">
              <Lock className="size-3.5" />
              Member access only
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content: Kanban Board */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Layout className="size-5 text-primary" />
            Project Board
            <span className="ml-2 bg-muted text-muted-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">{tasks.length}</span>
          </h3>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border">
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase h-8 px-4 rounded-lg text-muted-foreground">List</Button>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase h-8 px-4 rounded-lg bg-background shadow-sm text-primary">Kanban</Button>
          </div>
        </div>

        {tasks.length > 0 ? (
          <KanbanBoard 
            tasks={tasks} 
            onTaskUpdated={() => fetchProjectData(true)} 
            currentUser={currentUser}
            isAdmin={isAdmin}
          />
        ) : (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-border shadow-sm"
          >
            <div className="size-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
              <Layout className="size-10 text-muted-foreground opacity-50" />
            </div>
            <h4 className="text-xl font-bold tracking-tight">Your board is empty</h4>
            <p className="text-muted-foreground text-sm max-w-[280px] text-center mt-2 font-medium">
              {isAdmin ? "Ready to launch? Start by adding your first task." : "No tasks have been assigned yet."}
            </p>
            {isAdmin && (
              <div className="mt-8">
                <CreateTaskModal projectId={id} onTaskCreated={handleTaskCreated} />
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Footer / Team Members Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-8 border-t"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <Users className="size-5 text-primary" />
            Team Members
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
              isAdmin ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted text-muted-foreground border-border'
            }`}>
              {userRole}
            </div>
          </h3>
          {isAdmin && <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5 px-4 rounded-lg h-9">Manage Team</Button>}
        </div>
        <div className="flex flex-wrap gap-4">
          <AnimatePresence>
            {members.map((member, i) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 bg-card border p-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-default group border-border hover:border-primary/20"
              >
                <Avatar className="size-10 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`} />
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
                <div className="pr-2">
                  <p className="text-xs font-bold truncate max-w-[100px]">
                    {member.user_id === currentUser?.id ? "You" : "Contributor"}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isAdmin && (
            <InviteMemberModal projectId={id} onMemberAdded={() => fetchProjectData(true)} />
          )}
        </div>
      </motion.div>
    </div>
  )
}

function ProjectSkeleton() {
  return (
    <div className="space-y-12 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-5 w-96 rounded-xl" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-px bg-border w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <div className="space-y-3">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
