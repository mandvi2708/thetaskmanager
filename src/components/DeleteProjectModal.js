'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Trash2, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export default function DeleteProjectModal({ project }) {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const handleDelete = async () => {
    if (confirmation !== project.name) {
      toast.error("Project name does not match")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      toast.success("Project deleted successfully")
      setIsOpen(false)
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Error deleting project:', error.message)
      toast.error('Error deleting project: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-xs font-bold text-red-500 hover:bg-red-500/10 hover:text-red-500 px-4 rounded-lg h-9 gap-2 transition-all" />}>
        <Trash2 className="size-3.5" />
        Delete Project
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-red-500/20 bg-black/90 backdrop-blur-xl">
        <DialogHeader>
          <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="size-6 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">Delete Project</DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            This action is irreversible. All tasks, members, and data associated with <span className="text-white font-bold">"{project.name}"</span> will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Type the project name to confirm:</p>
          <input 
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder={project.name}
            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">
            Keep Project
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading || confirmation !== project.name}
            className="rounded-xl font-bold shadow-lg shadow-red-500/20"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
