import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Grid3X3, Calendar, MoreHorizontal, Loader2, Upload, Download, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useRequireAuth } from '@/hooks/useAuth';
import { getProjects, deleteProject, importProject, getProjectFull } from '@/lib/api';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { Project } from '@/types/storyboard';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRequireAuth();
  const {
    projects,
    setProjects,
    deleteProject: storeDeleteProject,
    currentProject,
    setCurrentProject
  } = useStoryboardStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      const transformed = data.map(p => ({
        id: p.id,
        name: p.title,
        genre: p.genre || undefined,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        script_text: p.script_text,
        thumbnail: p.thumbnail || undefined,
      }));
      setProjects(transformed);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => {
    navigate('/project/new');
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        storeDeleteProject(projectId);
        toast.success('Project deleted');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleImportClick = () => {
    document.getElementById('dashboard-import-file')?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);
      await importProject(data);
      toast.success('Project imported successfully');
      loadProjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to import project');
    } finally {
      if (e.target) e.target.value = '';
      setLoading(false);
    }
  };

  const handleExportProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    try {
      const data = await getProjectFull(projectId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Project exported');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export project');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <AppSidebar onNewProject={handleNewProject} />

      <main className="flex-1 overflow-y-auto surface-dim">
        {/* Header */}
        <header className="border-b border-border/30 bg-background/40 backdrop-blur-xl px-12 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground uppercase">Vision Vault</h1>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/70">
                Orchestrate your cinematic narratives
              </p>
            </div>
            <div className="flex gap-4">
              <input
                type="file"
                id="dashboard-import-file"
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
              <button
                onClick={handleImportClick}
                className="btn-tonal h-12 px-8 border border-border/50"
              >
                <Upload className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Import Draft</span>
              </button>
              <button
                onClick={handleNewProject}
                className="btn-filled h-12 px-8 shadow-xl shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Construct New</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-12">
          {projects.length === 0 ? (
            // Premium Empty state
            <div className="flex flex-col items-center justify-center py-32 text-center max-w-xl mx-auto">
              <div className="mb-10 relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <div className="relative h-24 w-24 flex items-center justify-center rounded-[2rem] bg-card border border-border/50 shadow-2">
                  <Grid3X3 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="mb-4 text-2xl font-black tracking-tight text-foreground uppercase">Your Canvas Awaits</h2>
              <p className="mb-10 text-sm font-medium leading-relaxed text-muted-foreground/80">
                You haven't orchestrated any visuals yet. Begin by uploading a script or describing your cinematic vision, and let the AI assist in your creative breakdown.
              </p>
              <button
                onClick={handleNewProject}
                className="btn-filled h-14 px-10 shadow-2xl shadow-primary/25"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Begin First Narrative</span>
              </button>
            </div>
          ) : (
            // Project grid
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* New Project Card - Premium Shadow Style */}
              <button
                onClick={handleNewProject}
                className="group flex aspect-[16/11] flex-col items-center justify-center rounded-[var(--radius-xl)] border-2 border-dashed border-border/50 bg-card/30 transition-all hover:border-primary/50 hover:bg-primary/5 hover:scale-[1.02]"
              >
                <div className="mb-4 rounded-2xl bg-muted/50 p-4 transition-transform group-hover:rotate-90">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-foreground/70">Initialize New</span>
              </button>

              {/* Existing Projects */}
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer overflow-hidden rounded-[var(--radius-xl)] border border-border/30 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-3 hover:scale-[1.02]"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-10 w-10 text-muted-foreground/30 transition-colors group-hover:text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  {/* Project Metadata */}
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-sm uppercase tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2">
                          {project.genre && (
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
                              {project.genre}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-border/30">
                          <DropdownMenuItem onClick={(e) => handleExportProject(e, project.id)} className="text-xs font-bold uppercase py-2.5 cursor-pointer">
                            <Download className="mr-2 h-4 w-4" />
                            Export Sequence
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDeleteProject(e, project.id)} className="text-xs font-bold uppercase py-2.5 text-destructive cursor-pointer">
                            Remove Narrative
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
