import { Link } from "wouter";
import { format } from "date-fns";
import { Copy, TerminalSquare, Search, FileCode2 } from "lucide-react";
import { useListSnippets } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { data: snippets, isLoading, error } = useListSnippets();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.preventDefault(); // Prevent navigation when clicking copy
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard!",
      description: "Code is ready to paste into your IDE.",
      duration: 2000,
    });
  };

  const filteredSnippets = snippets?.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.language.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-12 w-full max-w-md bg-card/50 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-card/50 animate-pulse rounded-2xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <TerminalSquare className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold">Failed to load snippets</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            There was an error connecting to the API. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Your Snippets</h1>
          <p className="text-muted-foreground mt-1">Manage and copy your ESP micro-controller code.</p>
        </div>
        
        <div className="relative w-full md:w-auto min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card/40 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border-dashed">
          <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <FileCode2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No snippets found</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            {search ? "No snippets match your search criteria." : "You haven't saved any code snippets yet. Create your first snippet to get started."}
          </p>
          {!search && (
            <Link 
              href="/snippet/new"
              className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              Create New Snippet
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSnippets.map((snippet, idx) => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                layout
              >
                <Link 
                  href={`/snippet/${snippet.id}`}
                  className="group block h-full bg-card rounded-2xl p-5 border border-white/5 hover:border-primary/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-1 pr-4">
                      {snippet.title || "Untitled Snippet"}
                    </h3>
                    <button
                      onClick={(e) => handleCopy(e, snippet.code)}
                      className="p-2 -mt-1 -mr-1 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="bg-[#0d1117] rounded-xl p-3 mb-4 h-32 overflow-hidden relative border border-black/50">
                    <pre className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                      <code>{snippet.code || "// Empty"}</code>
                    </pre>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1117] pointer-events-none" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {snippet.language}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(snippet.updatedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
