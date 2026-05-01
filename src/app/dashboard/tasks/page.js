'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  LayoutGrid,
  Search,
  ArrowRight,
  Filter,
  MoreVertical,
  Loader2,
  Calendar
} from "lucide-react"
import Link from 'next/link'
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function AllTasksPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState([])
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(profileData)
        fetchTasks()
      }
    }
    fetchData()
  }, [])

  const fetchTasks = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects (
          id,
          name
        )
      `)
      .order('due_date', { ascending: true })
    
    if (!error && data) {
      setTasks(data)
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)
      
      if (error) throw error
      
      toast.success("Status updated!")
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (error) {
      toast.error("Failed to update status: " + error.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const isAdmin = profile?.role === 'admin'

  if (isLoading) return <TasksSkeleton />

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">All Tasks</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Keep track of everything across your workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 px-3 rounded-lg font-bold bg-muted/50 border-none">
            {tasks.length} TOTAL TASKS
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm pl-10 h-10"
          />
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl font-bold gap-2">
          <Filter className="size-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => {
          const isAssignedToMe = task.assigned_to === user?.id
          const canEditStatus = isAdmin || isAssignedToMe

          return (
            <Card key={task.id} className="group relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-[1.5rem]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-2xl flex items-center justify-center shadow-inner ${
                      task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                      task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.status === 'done' ? <CheckCircle2 className="size-6" /> : 
                       task.status === 'in_progress' ? <Clock className="size-6" /> : <AlertCircle className="size-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</span>
                        {canEditStatus ? (
                          <Select 
                            value={task.status} 
                            onValueChange={(val) => handleStatusChange(task.id, val)}
                            disabled={updatingId === task.id}
                          >
                            <SelectTrigger className={cn(
                              "h-7 w-fit px-3 rounded-full border-none text-[10px] font-black uppercase tracking-tighter transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm",
                              task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 ring-1 ring-emerald-500/20' :
                              task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 ring-1 ring-blue-500/20' : 
                              'bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 ring-1 ring-zinc-500/20'
                            )}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl">
                              <SelectItem value="todo" className="text-[10px] font-bold uppercase">To Do</SelectItem>
                              <SelectItem value="in_progress" className="text-[10px] font-bold uppercase">In Progress</SelectItem>
                              <SelectItem value="done" className="text-[10px] font-bold uppercase">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary" className="h-6 px-2 text-[9px] font-black uppercase tracking-tighter">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        )}
                        {updatingId === task.id && <Loader2 className="size-3 animate-spin text-primary" />}
                      </div>
                      <h3 className="text-lg font-bold leading-none">{task.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <LayoutGrid className="size-3 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          {task.projects?.name || 'Unknown Project'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 self-end md:self-center">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Due Date</p>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <Calendar className="size-4 text-muted-foreground" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'No date'}
                      </div>
                    </div>

                    <Badge className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase border-none ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {task.priority}
                    </Badge>

                    <Link href={`/dashboard/projects/${task.project_id}`}>
                      <Button variant="ghost" size="icon" className="size-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                        <ArrowRight className="size-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {tasks.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/10">
            <div className="size-16 bg-muted/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-8 text-muted-foreground opacity-20" />
            </div>
            <h3 className="text-xl font-bold">No tasks found</h3>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Start by creating a task in one of your projects.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
      </div>
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-24 w-full rounded-[1.5rem]" />
      ))}
    </div>
  )
}
