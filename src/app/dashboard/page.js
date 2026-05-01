'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ListTodo, 
  Plus, 
  ArrowUpRight, 
  Users,
  LayoutGrid,
  Calendar,
  Lock,
  Zap,
  Target,
  User,
  ExternalLink
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie 
} from 'recharts'
import CreateTaskModal from '@/components/CreateTaskModal'
import Link from 'next/link'
import { format, isAfter, isBefore, startOfWeek, endOfWeek, subDays, startOfDay } from 'date-fns'

export default function UnifiedDashboard() {
  const supabase = createClient()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(data)
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return profile?.role === 'admin' ? <AdminDashboard /> : <MemberDashboard profile={profile} />
}

// --- ADMIN DASHBOARD ---
function AdminDashboard() {
  const supabase = createClient()
  const [adminStats, setAdminStats] = useState({ totalTasks: 0, activeUsers: 0, completionRate: 0, overdue: 0 })
  const [chartData, setChartData] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAdminData() {
      setIsLoading(true)
      
      // 1. Fetch Basic Counts
      const { count: totalTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true })
      const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: doneTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done')
      const { count: overdueTasks } = await supabase.from('tasks').select('*', { count: 'exact', head: true })
        .lt('due_date', new Date().toISOString())
        .neq('status', 'done')

      setAdminStats({
        totalTasks: totalTasks || 0,
        activeUsers: activeUsers || 0,
        completionRate: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        overdue: overdueTasks || 0
      })

      // 2. Fetch Recent Tasks with Assignee info
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (name),
          profiles:assigned_to (email)
        `)
        .order('created_at', { ascending: false })
        .limit(6)
      
      if (tasks) setRecentTasks(tasks)

      // 3. Fetch Productivity Chart Data
      const last7Days = [...Array(7)].map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        return { name: format(d, 'EEE'), date: startOfDay(d), completed: 0 }
      })

      const { data: recentCompleted } = await supabase
        .from('tasks')
        .select('created_at')
        .eq('status', 'done')
        .gte('created_at', subDays(new Date(), 7).toISOString())

      if (recentCompleted) {
        recentCompleted.forEach(task => {
          const taskDate = format(new Date(task.created_at), 'EEE')
          const day = last7Days.find(d => d.name === taskDate)
          if (day) day.completed += 1
        })
      }
      setChartData(last7Days)
      setIsLoading(false)
    }

    fetchAdminData()
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Console</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Organization Wide</Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Global oversight of all projects and resources.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateTaskModal onTaskCreated={() => window.location.reload()} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Tasks" value={adminStats.totalTasks} subValue="+5%" subLabel="this month" icon={<ListTodo className="size-4" />} />
        <StatCard title="Active Users" value={adminStats.activeUsers} subValue="+2" subLabel="new this week" icon={<Users className="size-4" />} color="blue" />
        <StatCard title="Global Completion" value={`${adminStats.completionRate}%`} subValue="System" subLabel="Health" icon={<CheckCircle2 className="size-4" />} color="emerald" />
        <StatCard title="Critical Overdue" value={adminStats.overdue} subValue="Action" subLabel="Required" icon={<AlertCircle className="size-4" />} color="red" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-md rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Global Task Feed</CardTitle>
              <CardDescription className="font-medium">Recent tasks across all projects with assignee tracking</CardDescription>
            </div>
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="text-xs font-black uppercase text-primary gap-2">
                View All Tasks
                <ArrowUpRight className="size-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentTasks.map(task => (
                <div key={task.id} className="group p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`size-10 rounded-2xl flex items-center justify-center ${
                      task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                      task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-400'
                    }`}>
                      {task.status === 'done' ? <CheckCircle2 className="size-5" /> : 
                       task.status === 'in_progress' ? <Clock className="size-5" /> : <AlertCircle className="size-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{task.projects?.name}</span>
                        <div className="size-1 rounded-full bg-zinc-700" />
                        <div className="flex items-center gap-1.5">
                          <User className="size-3 text-muted-foreground" />
                          <span className={task.profiles?.email ? "text-[10px] font-bold text-blue-400/80" : "text-[10px] font-black text-red-500/50 uppercase"}>
                            {task.profiles?.email || 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href={`/dashboard/projects/${task.project_id}`}>
                    <Button variant="ghost" size="icon" className="size-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="size-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-2xl bg-card/40 backdrop-blur-md rounded-[2.5rem] flex flex-col">
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-bold">Productivity</CardTitle>
            <CardDescription className="font-medium">System-wide daily completions</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 px-4 pb-8">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height={240} minWidth={0}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888888', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} 
                  />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3 px-4">
              <HealthItem label="System Uptime" value="99.9%" icon={<Zap className="size-4" />} />
              <HealthItem label="Auth Security" value="Active" icon={<Lock className="size-4" />} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- MEMBER DASHBOARD ---
function MemberDashboard({ profile }) {
  const supabase = createClient()
  const [stats, setStats] = useState({ myTasks: 0, doneThisWeek: 0, upcoming: 0 })
  const [focusTasks, setFocusTasks] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchMemberData() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: allMyTasks } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .eq('assigned_to', user.id)

      if (allMyTasks) {
        const myTasks = allMyTasks.filter(t => t.status !== 'done').length
        const upcoming = allMyTasks.filter(t => t.due_date && isAfter(new Date(t.due_date), new Date())).length
        const start = startOfWeek(new Date())
        const end = endOfWeek(new Date())
        const doneThisWeek = allMyTasks.filter(t => 
          t.status === 'done' && 
          t.created_at && 
          isAfter(new Date(t.created_at), start) && 
          isBefore(new Date(t.created_at), end)
        ).length

        setStats({ myTasks, doneThisWeek, upcoming })
        setFocusTasks(allMyTasks.filter(t => t.status === 'in_progress').slice(0, 3))
        const sortedDeadlines = allMyTasks
          .filter(t => t.due_date && t.status !== 'done')
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 4)
        setDeadlines(sortedDeadlines)
      }
      setIsLoading(false)
    }

    fetchMemberData()
  }, [])

  if (isLoading) return <DashboardSkeleton />

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome, {profile?.email?.split('@')[0]}</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium italic">Your personalized workspace is synced and ready.</p>
        </div>
        <Link href="/dashboard/tasks">
          <Button className="rounded-xl font-bold px-6 shadow-lg shadow-primary/20 bg-white text-black hover:bg-white/90">
            View My Tasks
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PersonalStatCard title="My Tasks" value={stats.myTasks} icon={<ListTodo className="size-5" />} color="blue" />
        <PersonalStatCard title="Done this week" value={stats.doneThisWeek} icon={<CheckCircle2 className="size-5" />} color="emerald" />
        <PersonalStatCard title="Upcoming" value={stats.upcoming} icon={<Clock className="size-5" />} color="amber" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-border/50 shadow-xl bg-card/40 backdrop-blur-md overflow-hidden rounded-[2rem]">
          <CardHeader className="border-b border-border/50 bg-muted/10 p-6">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <Target className="size-5 text-primary" />
              Focus Areas
            </CardTitle>
            <CardDescription className="text-xs font-medium">Your tasks currently in progress</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {focusTasks.length > 0 ? focusTasks.map(task => (
                <FocusItem key={task.id} title={task.title} project={task.projects?.name || 'No Project'} progress={50} />
              )) : (
                <div className="p-10 text-center text-sm text-muted-foreground italic font-medium">
                  No tasks in progress. Pick one from your list!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-xl bg-card/40 backdrop-blur-md overflow-hidden rounded-[2rem]">
          <CardHeader className="border-b border-border/50 bg-muted/10 p-6">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <Calendar className="size-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription className="text-xs font-medium">Urgent tasks sorted by due date</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-5">
              {deadlines.length > 0 ? deadlines.map(task => (
                <DeadlineItem key={task.id} title={task.title} date={format(new Date(task.due_date), 'MMM d')} priority={task.priority} />
              )) : (
                <div className="py-10 text-center text-sm text-muted-foreground italic font-medium">
                  All clear! No upcoming deadlines.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- HELPER COMPONENTS ---

function StatCard({ title, value, subValue, subLabel, icon, color = "primary" }) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    red: "text-red-500 bg-red-500/10"
  }
  return (
    <Card className="border-border/50 shadow-2xl bg-card/40 backdrop-blur-md rounded-[2rem] hover:scale-105 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <div className={`size-10 rounded-xl flex items-center justify-center shadow-lg ${colorMap[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black">{value}</div>
        <p className="text-[10px] font-bold mt-2">
          <span className={color === 'red' ? 'text-red-500' : 'text-emerald-500'}>{subValue}</span> {subLabel}
        </p>
      </CardContent>
    </Card>
  )
}

function PersonalStatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: "from-blue-500/20 to-blue-500/5 text-blue-500 border-blue-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-500 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-500 border-amber-500/20"
  }
  return (
    <div className={`p-6 rounded-[2rem] bg-gradient-to-br border ${colorMap[color]} flex items-center justify-between shadow-lg`}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{title}</p>
        <h3 className="text-4xl font-black">{value}</h3>
      </div>
      <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
        {icon}
      </div>
    </div>
  )
}

function HealthItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="size-8 rounded-xl bg-black/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-xs font-bold text-white/80">{label}</span>
      </div>
      <span className="text-xs font-black text-white">{value}</span>
    </div>
  )
}

function FocusItem({ title, project, progress }) {
  return (
    <div className="p-6 hover:bg-white/5 transition-colors group">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">{project}</p>
        </div>
        <Badge variant="outline" className="text-[10px] font-black border-primary/20 text-primary">{progress}%</Badge>
      </div>
      <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

function DeadlineItem({ title, date, priority }) {
  const priorityMap = {
    high: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    medium: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    low: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
  }
  return (
    <div className="flex items-center justify-between p-1">
      <div className="flex items-center gap-3">
        <div className={`size-2.5 rounded-full ${priorityMap[priority]}`} />
        <span className="text-sm font-bold text-white/90">{title}</span>
      </div>
      <span className="text-xs font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">{date}</span>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-80 w-full rounded-[40px]" />
        <Skeleton className="h-80 w-full rounded-[40px]" />
      </div>
    </div>
  )
}
