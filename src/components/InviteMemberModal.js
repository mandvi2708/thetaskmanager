'use client'

import React, { useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function InviteMemberModal({ projectId, onMemberAdded }) {
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('member')

  const handleInvite = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you'd look up the user by email. 
      // For this implementation, we use User ID directly for reliability with Supabase Auth.
      const { error } = await supabase
        .from('project_members')
        .insert([{ 
          project_id: projectId, 
          user_id: userId, 
          role: role 
        }])

      if (error) throw error

      setUserId('')
      setIsOpen(false)
      if (onMemberAdded) onMemberAdded()
      toast.success("Member added to project!", {
        icon: <Sparkles className="size-4 text-emerald-500" />
      })
    } catch (error) {
      toast.error("Could not add member. Ensure the User ID is valid.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="outline" className="rounded-xl border-border bg-card shadow-sm font-semibold h-11 px-5 hover:bg-accent transition-all" />}>
        <Users className="mr-2 size-4" />
        Invite
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleInvite}>
          <DialogHeader>
            <DialogTitle>Invite to Project</DialogTitle>
            <DialogDescription>
              Add a teammate to this project by their Supabase User ID.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">User ID</Label>
              <Input 
                id="userId" 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                placeholder="Paste Supabase User ID..." 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label>Access Level</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (Can update assigned tasks)</SelectItem>
                  <SelectItem value="admin">Admin (Full project control)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !userId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
