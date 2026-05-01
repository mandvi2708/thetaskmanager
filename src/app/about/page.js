"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Users, Shield, Zap } from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <Target className="size-6 text-cyan-400" />,
      title: "Goal Oriented",
      description: "Stay focused on what matters most with our objective-driven task tracking system."
    },
    {
      icon: <Users className="size-6 text-magenta-400" />,
      title: "Team Synergy",
      description: "Collaborate in real-time with your team members, assigning tasks and sharing progress instantly."
    },
    {
      icon: <Shield className="size-6 text-lime-400" />,
      title: "Enterprise Security",
      description: "Your data is protected with industrial-grade encryption and role-based access control."
    },
    {
      icon: <Zap className="size-6 text-cyan-500" />,
      title: "Ultra Fast",
      description: "Built on a modern stack for lightning-fast performance and a seamless user experience."
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-magenta-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="flex h-20 items-center px-8 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            TaskFlow
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-cyan-400">Log in</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-cyan-500 via-magenta-500 to-lime-500 hover:scale-105 transition-all border-none shadow-[0_0_20px_rgba(217,70,239,0.3)] px-6 font-black text-black">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 flex flex-col justify-center relative z-10 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-cyan-400 transition-colors mb-2 group font-bold uppercase">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            BACK TO NEURAL CORE
          </Link>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight uppercase">
              The <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] italic">TaskFlow</span> Protocol
            </h1>
            <p className="text-lg text-white/50 max-w-3xl leading-relaxed font-medium">
              TaskFlow is a high-performance productivity ecosystem engineered for elite operators. 
              Efficiency is not just a feature—it's our core directive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:border-cyan-500/30 transition-all group"
              >
                <div className="mb-4 p-3 rounded-2xl bg-white/5 w-fit group-hover:bg-cyan-500/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-1 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-white/5 text-[10px] uppercase tracking-[0.4em] text-white/10">
        <p>© {new Date().getFullYear()} TaskFlow Neural Systems // Connection Stable</p>
      </footer>
    </div>
  );
}
