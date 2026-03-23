import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Code2, Github, Plus } from "lucide-react";
import { motion } from "framer-motion";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col w-full relative">
      {/* Decorative background image blended with CSS gradients */}
      <div 
        className="fixed inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.png)` }}
      />
      
      <header className="sticky top-0 z-50 glass-panel border-b-white/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
            <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              ESP Snippets
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-muted-foreground hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            
            {location !== "/snippet/new" && (
              <Link 
                href="/snippet/new"
                className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              >
                <Plus className="w-4 h-4" />
                <span>New Snippet</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
