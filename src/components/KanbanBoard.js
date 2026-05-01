'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MoreVertical, CheckCircle2, Clock, AlertCircle, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from "framer-motion"

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-400 dark:bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500 dark:bg-blue-600' },
  { id: 'done', title: 'Done', color: 'bg-emerald-500 dark:bg-emerald-600' },
]

export default function KanbanBoard({ tasks: initialTasks, onTaskUpdated, currentUser, isAdmin }) {
  const supabase = createClient()
  const [tasks, setTasks] = useState(initialTasks)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const taskToMove = tasks.find(t => t.id === draggableId)
    const isAssignedToMe = taskToMove?.assigned_to === currentUser?.id
    
    if (!isAdmin && !isAssignedToMe) {
      return // Backend RLS handles this, but we block UI move too
    }

    // Reorder locally
    const newTasks = Array.from(tasks)
    const taskIndex = newTasks.findIndex(t => t.id === draggableId)
    const [movedTask] = newTasks.splice(taskIndex, 1)
    const updatedTask = { ...movedTask, status: destination.droppableId }
    newTasks.push(updatedTask)
    setTasks(newTasks)

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: destination.droppableId })
        .eq('id', draggableId)
      
      if (error) throw error
      if (onTaskUpdated) onTaskUpdated()
    } catch (error) {
      setTasks(initialTasks) // rollback
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col h-full min-h-[600px] group">
            <div className="flex items-center justify-between mb-5 px-2">
              <div className="flex items-center gap-2.5">
                <div className={`size-2.5 rounded-full shadow-sm ${column.color}`} />
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.15em]">{column.title}</h3>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-lg font-black border border-border/50">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:bg-accent rounded-lg">
                <MoreVertical className="size-4" />
              </Button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 space-y-4 p-3 rounded-2xl transition-all duration-300 border-2 border-transparent ${
                    snapshot.isDraggingOver ? 'bg-muted/50 border-dashed border-primary/20' : 'bg-transparent'
                  }`}
                >
                  <AnimatePresence mode="popLayout">
                    {tasks
                      .filter(t => t.status === column.id)
                      .map((task, index) => {
                        const isAssignedToMe = task.assigned_to === currentUser?.id
                        const canMove = isAdmin || isAssignedToMe

                        return (
                          <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                            isDragDisabled={!canMove}
                          >
                            {(provided, snapshot) => (
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "outline-none",
                                  snapshot.isDragging && "z-50"
                                )}
                              >
                                <Card className={`group/card relative transition-all duration-300 shadow-sm border-border bg-card hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary/20 border-primary/40 rotate-[1deg]' : ''
                                } ${!canMove ? 'opacity-80' : 'cursor-grab active:cursor-grabbing hover:border-primary/30'}`}>
                                  <CardContent className="p-5 space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <h4 className="font-bold text-[13px] text-foreground leading-tight tracking-tight group-hover/card:text-primary transition-colors">{task.title}</h4>
                                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                                        <Badge variant="secondary" className={`text-[9px] font-black uppercase px-2 h-4.5 border-none rounded-md tracking-tighter ${
                                          task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                                          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                          {task.priority}
                                        </Badge>
                                        {!canMove && (
                                          <div className="bg-muted text-muted-foreground p-1 rounded-md border border-border" title="View Only">
                                            <Lock className="size-2.5" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {task.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{task.description}</p>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <Calendar className="size-3 text-primary/60" />
                                        {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isAssignedToMe && (
                                          <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded-md tracking-tighter shadow-sm border border-primary/10">Mine</span>
                                        )}
                                        <Avatar className={`size-7 border-2 shadow-sm transition-transform group-hover/card:scale-110 ${isAssignedToMe ? 'border-primary/30' : 'border-background'}`}>
                                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assigned_to || task.id}`} />
                                          <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </Draggable>
                        )
                      })}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
