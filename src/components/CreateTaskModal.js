'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Plus, Loader2, Globe, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CreateTaskModal({ projectId: initialProjectId, onTaskCreated }) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Form State
  const [projectId, setProjectId] = useState(initialProjectId || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('todo')
  const [assignedTo, setAssignedTo] = useState('unassigned')
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    if (isOpen) {
      checkAdminStatus()
      fetchProjects()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen, projectId, isAdmin])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      setIsAdmin(data?.role === 'admin')
    }
  }

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('id, name')
    if (data) setProjects(data)
  }

  const fetchMembers = async () => {
    if (isAdmin) {
      // Admins can assign to ANYONE in the website
      const { data, error } = await supabase.from('profiles').select('id, email')
      if (!error && data) {
        setMembers(data.map(p => ({ user_id: p.id, email: p.email })))
      }
    } else if (projectId) {
      // Regular users only see project members
      const { data, error } = await supabase
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)
      
      if (!error && data) {
        setMembers(data)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!projectId) {
      toast.error("Please select a project first.")
      return
    }
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title,
          description,
          priority,
          status,
          due_date: date.toISOString(),
          project_id: projectId,
          assigned_to: assignedTo === 'unassigned' ? null : assignedTo
        }])
        .select()
      
      if (error) throw error

      setTitle('')
      setDescription('')
      setAssignedTo('unassigned')
      setIsOpen(false)
      toast.success("Task created successfully!")
      if (onTaskCreated) onTaskCreated()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        initialProjectId ? (
          <Button className="rounded-xl shadow-lg shadow-primary/20 font-semibold px-6" />
        ) : (
          <Button className="h-10 px-4 rounded-lg bg-primary hover:opacity-90 shadow-lg shadow-primary/20 transition-all" />
        )
      }>
        <Plus className="mr-2 size-4" />
        New Task
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isAdmin && <ShieldCheck className="size-5 text-primary" />}
              Create New Task
            </DialogTitle>
            <DialogDescription>
              {isAdmin ? "Global Admin mode: Assign to anyone in the website." : "Define requirements and assign to a team member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            {!initialProjectId && (
              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-border/50">
                    <SelectValue placeholder="Which project is this for?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Task Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Finish project documentation..." 
                className="h-12 rounded-2xl bg-muted/30 border-border/50"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isAdmin ? "Global Assignee" : "Assignee"}
                </Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-border/50">
                    <SelectValue placeholder="Assign someone" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map(m => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.email ? m.email.split('@')[0] : `User: ${m.user_id.substring(0, 5)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-border/50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="low" className="text-blue-500 font-bold">Low</SelectItem>
                    <SelectItem value="medium" className="text-amber-500 font-bold">Medium</SelectItem>
                    <SelectItem value="high" className="text-red-500 font-bold">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-border/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Due Date</Label>
                <Popover>
                  <PopoverTrigger render={
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal rounded-2xl bg-muted/30 border-border/50",
                        !date && "text-muted-foreground"
                      )}
                    />
                  }>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What are the key deliverables?" 
                className="h-28 rounded-2xl bg-muted/30 border-border/50 resize-none pt-3"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" className="rounded-2xl h-12 font-bold" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !title} className="rounded-2xl h-12 px-8 shadow-lg shadow-primary/20 font-bold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
