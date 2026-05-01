'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Users, 
  Mail, 
  ShieldCheck, 
  User as UserIcon,
  Search,
  ExternalLink,
  Plus
} from "lucide-react"
import Link from 'next/link'
import { motion, AnimatePresence } from "framer-motion"

export default function TeamPage() {
  const supabase = createClient()
  const [teammates, setTeammates] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTeam() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get all projects where the current user is a member
      const { data: myMemberships } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id)
      
      const projectIds = myMemberships?.map(m => m.project_id) || []

      if (projectIds.length > 0) {
        // 2. Get all unique members of those projects
        const { data, error } = await supabase
          .from('project_members')
          .select(`
            user_id,
            role,
            projects (
              name
            )
          `)
          .in('project_id', projectIds)

        if (!error && data) {
          // Group by user_id to avoid duplicates
          const uniqueTeammates = data.reduce((acc, current) => {
            const x = acc.find(item => item.user_id === current.user_id);
            if (!x) {
              return acc.concat([current]);
            } else {
              return acc;
            }
          }, []);
          setTeammates(uniqueTeammates)
        }
      }
      setIsLoading(false)
    }

    fetchTeam()
  }, [])

  if (isLoading) return <TeamSkeleton />

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Team</h1>
          <p className="text-muted-foreground font-medium mt-1">Collaborate with teammates across all your projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-9 px-4 rounded-xl font-bold uppercase text-[10px] tracking-[0.15em]">
            {teammates.length} Contributors
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {teammates.map((member, i) => (
            <motion.div
              key={member.user_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group border-border hover:border-primary/20 hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <Avatar className="size-16 border-4 border-background shadow-lg transition-transform group-hover:rotate-6">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <Badge variant="secondary" className={`h-6 px-2.5 rounded-lg font-black uppercase text-[9px] tracking-widest border-none ${
                      member.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.role === 'admin' ? <ShieldCheck className="size-3 mr-1" /> : <UserIcon className="size-3 mr-1" />}
                      {member.role}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-extrabold text-lg leading-none">Contributor</h3>
                      <p className="text-xs font-medium text-muted-foreground mt-1.5 flex items-center gap-2 truncate">
                        <Mail className="size-3 text-primary/60" />
                        ID: {member.user_id.substring(0, 18)}...
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Shared Projects</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-muted/30 border-border/60 text-[9px] font-bold py-1 px-2.5 rounded-lg">
                          {member.projects?.name || "Shared workspace"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" className="flex-1 rounded-xl h-9 text-xs font-bold border-border/60 hover:bg-primary/5 hover:text-primary">
                      View Profile
                    </Button>
                    <Button variant="outline" size="icon" className="size-9 rounded-xl border-border/60">
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {teammates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-card/20 rounded-[40px] border-2 border-dashed border-border/50">
          <div className="size-20 rounded-3xl bg-muted flex items-center justify-center mb-6">
            <Users className="size-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold">You're working solo</h3>
          <p className="text-muted-foreground font-medium text-sm mt-2 max-w-xs text-center">
            Invite teammates to your projects to see them appear here in your collaboration directory.
          </p>
        </div>
      )}
    </div>
  )
}

function TeamSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-5 w-96 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-64 w-full rounded-[40px]" />
        ))}
      </div>
    </div>
  )
}
