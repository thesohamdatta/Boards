import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Grid3X3, Calendar, MoreHorizontal, Loader2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useRequireAuth } from '@/hooks/useAuth';
import { getProjects, deleteProject, importProject, getProjectFull } from '@/lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  title: string;
  genre: string | null;
  aspect_ratio: string | null;
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRequireAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data || []);
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
        setProjects(projects.filter((p) => p.id !== projectId));
        toast.success('Project deleted');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleImportClick = () => {
    document.getElementById('import-file')?.click();
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

      <main className="flex-1 overflow-y-auto bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Your Storyboards</h1>
              <p className="mt-1 text-muted-foreground">
                Create and manage your AI-powered storyboards
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                id="import-file"
                className="hidden"
                accept=".json"
                onChange={handleFileChange}
              />
              <Button onClick={handleImportClick} variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button onClick={handleNewProject} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                New Storyboard
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {projects.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 rounded-full bg-muted p-6">
                <Grid3X3 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">No storyboards yet</h2>
              <p className="mb-6 text-center text-muted-foreground">
                Create your first AI-powered storyboard by uploading a script<br />
                or describing your story idea.
              </p>
              <Button onClick={handleNewProject} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Create New Storyboard
              </Button>
            </div>
          ) : (
            // Project grid
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* New Project Card */}
              <button
                onClick={handleNewProject}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card transition-colors hover:border-primary hover:bg-muted/50"
              >
                <Plus className="mb-2 h-8 w-8 text-muted-foreground" />
                <span className="font-medium text-foreground">New Storyboard</span>
              </button>

              {/* Existing Projects */}
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
                  onClick={() => navigate(`/project/${project.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] bg-muted">
                    <div className="flex h-full items-center justify-center">
                      <Grid3X3 className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{project.title}</h3>
                        {project.genre && (
                          <span className="mt-1 inline-block rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {project.genre}
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleExportProject(e, project.id)}>
                            Export JSON
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => handleDeleteProject(e, project.id)} className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString()}
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
