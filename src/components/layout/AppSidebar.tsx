import { useState } from 'react';
import { FileText, Grid3X3, Film, List, Archive, Settings, HelpCircle, LogOut, Search, Plus, User, LayoutGrid, Palette } from 'lucide-react';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { AccountModal } from '@/components/modals/AccountModal';
import { TutorialsModal } from '@/components/modals/TutorialsModal';
import { ArchivedModal } from '@/components/modals/ArchivedModal';
import { toast } from 'sonner';

interface AppSidebarProps {
  onNewProject?: () => void;
}

export function AppSidebar({ onNewProject }: AppSidebarProps) {
  const { projects, currentProject, activeView, setActiveView, settings, updateSettings } = useStoryboardStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [tutorialsOpen, setTutorialsOpen] = useState(false);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const navItems = [
    { id: 'storyboard' as const, icon: Grid3X3, label: 'Storyboard' },
    { id: 'shotlist' as const, icon: List, label: 'Shotlist' },
    { id: 'story' as const, icon: FileText, label: 'Story' },
    { id: 'animatic' as const, icon: Film, label: 'Animatic' },
  ];

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out? Unsaved changes will be lost.')) {
      toast.success('Signed out successfully');
      window.location.href = '/';
    }
  };

  return (
    <>
      <aside className="flex h-screen w-80 flex-col bg-background/40 border-r border-border/10 backdrop-blur-2xl z-20">
        {/* Branding - High End Cinematic Logotype */}
        <div className="flex items-center gap-4 px-8 py-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent shadow-xl shadow-primary/20 ring-1 ring-white/10">
            <Film className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-foreground uppercase leading-none">Boards</span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mt-1">Studio Architecture</span>
          </div>
        </div>

        {/* Action: New Narrative Persistence */}
        <div className="px-6 mb-8">
          <button
            onClick={onNewProject}
            className="group relative flex w-full items-center justify-center gap-3 rounded-[24px] bg-primary px-6 py-5 text-primary-foreground shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
            <span className="font-black text-xs uppercase tracking-widest">Construct New Narrative</span>
          </button>
        </div>

        {/* Main Logic: Workspace Control */}
        <div className="px-6 mb-10">
          <p className="px-4 mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Workspace Modules</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => currentProject && setActiveView(item.id)}
                disabled={!currentProject}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all border border-transparent',
                  !currentProject ? 'opacity-20 cursor-not-allowed' : 'hover:bg-muted/30 hover:border-border/10',
                  activeView === item.id && currentProject
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5'
                    : 'text-muted-foreground/80'
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-colors", activeView === item.id && currentProject ? "text-primary" : "text-muted-foreground/50")} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Persistence: Recently Orchestrated */}
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar pb-6">
          <div className="flex items-center justify-between px-4 mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Recent Orchestration</span>
          </div>

          {projects.length === 0 ? (
            <div className="px-6 py-10 text-center rounded-3xl bg-muted/10 border border-dashed border-border/20">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Vault is Vacant</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all border',
                    currentProject?.id === project.id
                      ? 'bg-muted/30 text-foreground border-border/30 shadow-sm'
                      : 'text-muted-foreground/80 hover:text-foreground hover:bg-muted/10 border-transparent hover:border-border/10'
                  )}
                >
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)] transition-all",
                    currentProject?.id === project.id ? "bg-primary scale-[2]" : "bg-muted-foreground/30"
                  )} />
                  <span className="truncate flex-1 text-xs font-bold leading-none">{project.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Cinematic Orchestration: Visual Aesthetics */}
        <div className="px-6 mb-6">
          <p className="px-4 mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Cinematic Style</p>
          <div className="p-4 rounded-2xl bg-muted/20 border border-border/10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Palette className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-foreground uppercase tracking-tight leading-none">Global Aesthetic</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Vibe Consistency</span>
              </div>
            </div>
            <select
              value={settings.imageStyle}
              onChange={(e) => updateSettings({ imageStyle: e.target.value as any })}
              className="w-full h-10 px-4 rounded-xl bg-background/50 border border-border/20 text-[10px] font-black text-foreground uppercase tracking-widest outline-none focus:border-primary/50 transition-all cursor-pointer"
            >
              <option value="sketch" className="bg-background">Minimal Sketch</option>
              <option value="wireframe" className="bg-background">Tech Wireframe</option>
              <option value="detailed" className="bg-background">Cinematic Detailed</option>
              <option value="comic" className="bg-background">Noir Comic</option>
            </select>
          </div>
        </div>

        {/* Admin: Production Controls */}
        <div className="p-6 mt-auto border-t border-border/10 bg-background/20 backdrop-blur-3xl">
          <div className="grid grid-cols-5 gap-2">
            {[
              { icon: Settings, action: () => setSettingsOpen(true), color: 'primary' },
              { icon: HelpCircle, action: () => setTutorialsOpen(true), color: 'primary' },
              { icon: Archive, action: () => setArchivedOpen(true), color: 'primary' },
              { icon: User, action: () => setAccountOpen(true), color: 'primary' },
              { icon: LogOut, action: handleSignOut, color: 'destructive' },
            ].map((tool, i) => (
              <button
                key={i}
                onClick={tool.action}
                className={cn(
                  "flex h-11 items-center justify-center rounded-xl transition-all border border-transparent",
                  tool.color === 'destructive'
                    ? "text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                    : "text-muted-foreground/60 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                )}
              >
                <tool.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Modals remain the same but will pick up global CSS changes */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
      <TutorialsModal open={tutorialsOpen} onOpenChange={setTutorialsOpen} />
      <ArchivedModal open={archivedOpen} onOpenChange={setArchivedOpen} />
    </>
  );
}
