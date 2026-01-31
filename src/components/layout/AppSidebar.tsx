import { useState } from 'react';
import { FileText, Grid3X3, Film, List, Archive, Settings, HelpCircle, LogOut, Search, Plus, User } from 'lucide-react';
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
  const { projects, currentProject, activeView, setActiveView } = useStoryboardStore();

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
      <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-1">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="h-2 w-2 bg-sidebar-foreground" />
              <div className="h-2 w-2 bg-sidebar-foreground" />
              <div className="h-2 w-2 bg-sidebar-foreground" />
              <div className="h-2 w-2 bg-sidebar-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">story</span>
          </div>
          <span className="text-sidebar-foreground/60">boarder</span>
          <span className="text-sidebar-primary font-medium">.ai</span>
        </div>

        {/* Your Storyboards Button */}
        <div className="p-4">
          <Button
            onClick={onNewProject}
            className="w-full justify-start gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 font-medium"
          >
            <Grid3X3 className="h-4 w-4" />
            Your Storyboards
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
            <Input
              placeholder="Search..."
              className="pl-9 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
            />
          </div>
        </div>

        {/* Storyboards Section */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-sidebar-foreground/60">Storyboards</span>
            <button
              onClick={onNewProject}
              className="rounded p-1 hover:bg-sidebar-accent"
            >
              <Plus className="h-4 w-4 text-sidebar-foreground/60" />
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-sm text-sidebar-foreground/50 py-2">No projects yet</p>
          ) : (
            <ul className="space-y-1">
              {projects.map((project) => (
                <li key={project.id}>
                  <button
                    className={cn(
                      'w-full truncate rounded px-2 py-1.5 text-left text-sm transition-colors',
                      currentProject?.id === project.id
                        ? 'bg-sidebar-accent text-sidebar-foreground'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Navigation when in project */}
          {currentProject && (
            <nav className="mt-6 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded px-2 py-2 text-sm transition-colors',
                    activeView === item.id
                      ? 'bg-sidebar-accent text-sidebar-foreground border-l-2 border-sidebar-primary'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="border-t border-sidebar-border p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setTutorialsOpen(true)}
              className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              Tutorials
            </button>
            <button
              onClick={() => setArchivedOpen(true)}
              className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Archive className="h-4 w-4" />
              Archived
            </button>
            <button
              onClick={() => setAccountOpen(true)}
              className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <User className="h-4 w-4" />
              Account
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded px-2 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      </aside>

      {/* Modals */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AccountModal open={accountOpen} onOpenChange={setAccountOpen} />
      <TutorialsModal open={tutorialsOpen} onOpenChange={setTutorialsOpen} />
      <ArchivedModal open={archivedOpen} onOpenChange={setArchivedOpen} />
    </>
  );
}
