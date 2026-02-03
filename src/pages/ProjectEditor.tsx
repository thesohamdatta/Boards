import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { StoryboardGrid } from '@/components/storyboard/StoryboardGrid';
import { ShotList } from '@/components/storyboard/ShotList';
import { StoryView } from '@/components/storyboard/StoryView';
import { CharacterModal } from '@/components/storyboard/CharacterModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ExportModal } from '@/components/modals/ExportModal';
import { Timeline } from '@/components/storyboard/Timeline';
import { ProjectWizard } from '@/components/wizard/ProjectWizard';
import { useStoryboardStore } from '@/stores/storyboardStore';
import { useRequireAuth } from '@/hooks/useAuth';
import { getProject, getScenes, getCharacters, getProjectFull, getProjects } from '@/lib/api';
import { toast } from 'sonner';

export default function ProjectEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const {
    activeView,
    isCharacterModalOpen,
    setIsCharacterModalOpen,
    wizardStep,
    resetWizard,
    setScenes,
    setShots,
    setCharacters,
    setCurrentProject,
    setStoryInput,
    setProjects,
  } = useStoryboardStore();

  const isNewProject = id === 'new';

  useEffect(() => {
    // Don't wait for user - proceed immediately
    if (isNewProject) {
      resetWizard();
      setLoading(false);
    } else if (id) {
      loadProjectData(id);
    } else {
      setLoading(false);
    }
  }, [id, isNewProject]);

  const loadProjectData = async (projectId: string) => {
    try {
      setLoading(true);

      // Refresh project list for sidebar
      const allProjects = await getProjects();
      const transformedProjects = allProjects.map(p => ({
        id: p.id,
        name: p.title,
        genre: p.genre || undefined,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        script_text: p.script_text,
      }));
      setProjects(transformedProjects);

      // Load specific project
      const project = allProjects.find(p => p.id === projectId);
      if (!project) {
        toast.error('Project not found');
        navigate('/app');
        return;
      }

      // Important: set content BEFORE current project trigger if possible, 
      // or ensure they are consistent in the same tick.
      setStoryInput(project.script_text || '');

      setCurrentProject({
        id: project.id,
        name: project.title,
        genre: project.genre || undefined,
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
        script_text: project.script_text,
      });

      // Load scenes with shots
      const scenesData = await getScenes(projectId);
      if (scenesData) {
        // Transform to store format
        const scenes = scenesData.map(s => ({
          id: s.id,
          projectId: s.project_id,
          sceneNumber: s.scene_number,
          location: s.location || '',
          lighting: s.time_of_day || 'DAY',
          description: s.description,
        }));
        setScenes(scenes);

        // Extract shots
        const allShots = scenesData.flatMap(scene =>
          (scene.shots || []).map(shot => ({
            id: shot.id,
            sceneId: shot.scene_id,
            shotNumber: shot.shot_number,
            description: shot.description,
            cameraAngle: shot.camera_angle,
            shotSize: shot.shot_size,
            movement: shot.movement || 'Static',
            equipment: shot.equipment || 'Tripod',
            duration: shot.duration,
            focalLength: shot.focal_length || '50mm',
            aspectRatio: '16:9',
            imageUrl: shot.storyboard_panels?.[0]?.image_url,
            promptUsed: shot.storyboard_panels?.[0]?.prompt_used,
          }))
        );
        setShots(allShots);
      }

      // Load characters
      const charactersData = await getCharacters(projectId);
      if (charactersData) {
        const characters = charactersData.map(c => ({
          id: c.id,
          projectId: c.project_id,
          name: c.name,
          description: c.description,
          imageUrl: c.reference_image_url || undefined,
        }));
        setCharacters(characters);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = async (projectId: string) => {
    // Load the project data immediately after wizard completes
    await loadProjectData(projectId);
    // Then navigate (replace: true prevents back button issues)
    navigate(`/project/${projectId}`, { replace: true });
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show wizard for new projects ONLY if we haven't completed generation yet
  // Once wizardStep is 'breakdown', we should show the main editor
  if (isNewProject && wizardStep !== 'breakdown') {
    return <ProjectWizard onComplete={handleWizardComplete} />;
  }

  return (
    <div className="flex h-screen">
      <AppSidebar onNewProject={() => navigate('/project/new')} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          onExport={() => setExportOpen(true)}
          onCharacterEditor={() => setIsCharacterModalOpen(true)}
          onSettings={() => setSettingsOpen(true)}
        />

        {/* Main content - light canvas area */}
        <div className="flex-1 overflow-hidden bg-background flex flex-col">
          {activeView === 'storyboard' && <StoryboardGrid />}
          {activeView === 'shotlist' && <ShotList />}
          {activeView === 'story' && <StoryView />}
          {activeView === 'animatic' && (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Animatic view coming soon...</p>
            </div>
          )}
          {activeView === 'storyboard' && <Timeline />}
        </div>
      </div>

      {/* Modals */}
      <CharacterModal
        open={isCharacterModalOpen}
        onOpenChange={setIsCharacterModalOpen}
      />
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
      />
    </div>
  );
}
