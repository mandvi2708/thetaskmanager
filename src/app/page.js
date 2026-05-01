import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="flex h-16 items-center px-6 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          TaskFlow
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            About
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
            ✨ Introducing TaskFlow 2.0
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
            Manage your tasks with <span className="text-primary block mt-2">effortless ease.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A beautiful, modern, and intuitive task management platform designed for teams and individuals to boost productivity and organize work beautifully.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/25 rounded-full">
                Start for free
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base rounded-full bg-white">
                View Features
              </Button>
            </Link>
          </div>
          
          <div className="pt-16 sm:pt-24">
            <div className="relative mx-auto max-w-5xl rounded-xl border bg-white/50 backdrop-blur-md shadow-2xl overflow-hidden ring-1 ring-gray-900/5">
              <div className="flex items-center border-b bg-gray-50/80 px-4 py-3">
                <div className="flex space-x-1.5">
                  <div className="size-3 rounded-full bg-red-400"></div>
                  <div className="size-3 rounded-full bg-amber-400"></div>
                  <div className="size-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="bg-white p-6 md:p-10 min-h-[400px] flex flex-col items-center justify-center text-gray-400">
                [ Dashboard Preview Graphic / UI Mockup ]
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0 md:h-16 flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
