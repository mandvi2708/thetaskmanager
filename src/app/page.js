"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#000000] text-white relative">
      {/* Background Decorative Elements - Neon Cyberpunk Palette */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-magenta-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-lime-400/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Navbar */}
      <header className="flex h-20 items-center px-8 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 font-bold text-2xl tracking-tighter"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            TaskFlow
          </span>
        </motion.div>
        
        <nav className="ml-auto hidden md:flex gap-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link className="text-sm font-medium text-white/70 hover:text-cyan-400 transition-colors" href="/about">
              About
            </Link>
          </motion.div>
        </nav>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-auto md:ml-10 flex items-center gap-4"
        >
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-cyan-400">Log in</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-cyan-500 via-magenta-500 to-lime-500 hover:scale-105 transition-all border-none shadow-[0_0_20px_rgba(217,70,239,0.4)] px-6 font-black text-black">
              Get Started
            </Button>
          </Link>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl space-y-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/5 px-4 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            ⚡️ POWERING THE NEXT GENERATION
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
          >
            Master your <br />
            <span className="bg-gradient-to-r from-cyan-400 via-magenta-400 to-lime-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(217,70,239,0.3)] italic">
              Workflow.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg sm:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            The fastest, most electric task management system ever built. 
            Designed for those who live on the edge of efficiency.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-full bg-white text-black hover:bg-cyan-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                ENTER THE FLOW
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-12 text-xl font-black rounded-full border-white/20 bg-white/5 backdrop-blur-md hover:border-magenta-500 hover:text-magenta-400 transition-all">
                THE SPECS
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 flex items-center justify-center border-t border-white/5 text-[10px] uppercase tracking-[0.4em] text-white/20">
        <p>© {new Date().getFullYear()} TaskFlow Neural Systems // Connection Stable</p>
      </footer>
    </div>
  );
}
