import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Trash2, Copy, ArrowLeft, Terminal, Check } from "lucide-react";
import { 
  useGetSnippet, 
  useCreateSnippet, 
  useUpdateSnippet, 
  useDeleteSnippet,
  getGetSnippetQueryKey,
  getListSnippetsQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  "Arduino/C++",
  "C",
  "Python",
  "JavaScript",
  "Plain Text"
];

export default function SnippetEditor() {
  const [, params] = useRoute("/snippet/:id");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const isNew = params?.id === "new";
  const snippetId = isNew ? 0 : Number(params?.id);

  const { data: snippet, isLoading: isFetching } = useGetSnippet(snippetId, {
    query: { enabled: !isNew && snippetId > 0 }
  });

  const createMutation = useCreateSnippet();
  const updateMutation = useUpdateSnippet();
  const deleteMutation = useDeleteSnippet();

  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (snippet && !isNew) {
      setTitle(snippet.title);
      setLanguage(snippet.language);
      setCode(snippet.code);
    }
  }, [snippet, isNew]);

  const handleSave = () => {
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Title is required", variant: "destructive" });
      return;
    }

    const payload = { title, language, code };

    if (isNew) {
      createMutation.mutate(
        { data: payload },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: getListSnippetsQueryKey() });
            toast({ title: "Success", description: "Snippet created successfully!" });
            setLocation(`/snippet/${data.id}`);
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to create snippet", variant: "destructive" });
          }
        }
      );
    } else {
      updateMutation.mutate(
        { id: snippetId, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSnippetsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetSnippetQueryKey(snippetId) });
            toast({ title: "Success", description: "Snippet updated successfully!" });
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to update snippet", variant: "destructive" });
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this snippet? This action cannot be undone.")) {
      deleteMutation.mutate(
        { id: snippetId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListSnippetsQueryKey() });
            toast({ title: "Deleted", description: "Snippet has been removed." });
            setLocation("/");
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to delete snippet", variant: "destructive" });
          }
        }
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Code has been copied to your clipboard.",
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isFetching && !isNew) {
    return (
      <div className="flex-1 flex flex-col gap-4 animate-pulse">
        <div className="h-14 bg-card/50 rounded-xl" />
        <div className="flex-1 bg-card/50 rounded-xl min-h-[400px]" />
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setLocation("/")}
            className="p-2 text-muted-foreground hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Snippet Title..."
            className="text-2xl font-bold bg-transparent border-none outline-none text-white placeholder:text-white/20 w-full focus:ring-0 p-0"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 overflow-x-auto pb-2 md:pb-0">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-card border border-white/10 text-white text-sm rounded-lg px-3 py-2 appearance-none outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 cursor-pointer min-w-[140px]"
          >
            {LANGUAGES.map(l => (
              <option key={l} value={l} className="bg-card text-foreground">{l}</option>
            ))}
          </select>
          
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors disabled:opacity-50"
              title="Delete Snippet"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? "Saving..." : "Save"}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-medium rounded-lg shadow-lg shadow-primary/25 transition-all active:scale-95"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#0d1117] border-b border-white/5 text-xs text-muted-foreground font-mono">
          <Terminal className="w-4 h-4" />
          <span>{language.toLowerCase().replace(/[^a-z0-9]/g, '')}</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
            <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
            <span className="w-2 h-2 rounded-full bg-green-500/80"></span>
          </span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Paste your ESP micro-controller code here..."
          spellCheck={false}
          className="flex-1 w-full p-6 bg-[#0d1117]/80 text-[#c9d1d9] font-mono text-sm leading-relaxed resize-none outline-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground/30"
        />
      </div>
    </div>
  );
}
