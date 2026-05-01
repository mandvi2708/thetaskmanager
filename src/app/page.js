import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="flex h-16 items-center px-6 border-b border-white/10 bg-black sticky top-0 z-50 text-white">
        <div className="flex items-center gap-2 font-bold text-xl">

          TaskFlow
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors text-white/90 hover:text-white" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors text-white/90 hover:text-white" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors text-white/90 hover:text-white" href="#">
            About
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Log in</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-white/90">Get Started</Button>
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
