import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Archive, Trash2, RotateCcw, Calendar } from 'lucide-react';
import { getProjects, deleteProject } from '@/lib/api';

interface ArchivedProject {
    id: string;
    title: string;
    archivedAt: string;
    genre?: string;
    shotCount: number;
}

interface ArchivedModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ArchivedModal({ open, onOpenChange }: ArchivedModalProps) {
    const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);

    useEffect(() => {
        if (open) {
            loadArchivedProjects();
        }
    }, [open]);

    const loadArchivedProjects = () => {
        const archived = localStorage.getItem('scene_weaver_archived');
        if (archived) {
            setArchivedProjects(JSON.parse(archived));
        }
    };

    const handleRestore = async (projectId: string) => {
        const archived = archivedProjects.filter(p => p.id !== projectId);
        localStorage.setItem('scene_weaver_archived', JSON.stringify(archived));
        setArchivedProjects(archived);
        toast.success('Project restored successfully');
    };

    const handlePermanentDelete = async (projectId: string) => {
        if (confirm('Permanently delete this project? This cannot be undone.')) {
            try {
                await deleteProject(projectId);
                const archived = archivedProjects.filter(p => p.id !== projectId);
                localStorage.setItem('scene_weaver_archived', JSON.stringify(archived));
                setArchivedProjects(archived);
                toast.success('Project permanently deleted');
            } catch (error) {
                toast.error('Failed to delete project');
            }
        }
    };

    const handleClearAll = () => {
        if (confirm('Permanently delete all archived projects? This cannot be undone.')) {
            archivedProjects.forEach(project => {
                deleteProject(project.id).catch(() => { });
            });
            localStorage.removeItem('scene_weaver_archived');
            setArchivedProjects([]);
            toast.success('All archived projects deleted');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        Archived Projects
                    </DialogTitle>
                    <DialogDescription>
                        Restore or permanently delete archived projects
                    </DialogDescription>
                </DialogHeader>

                {archivedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">No archived projects</h3>
                        <p className="text-sm text-muted-foreground">
                            Projects you archive will appear here
                        </p>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {archivedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium">{project.title}</h3>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    {project.genre && (
                                                        <span className="flex items-center gap-1">
                                                            {project.genre}
                                                        </span>
                                                    )}
                                                    <span>{project.shotCount} shots</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(project.archivedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleRestore(project.id)}
                                                >
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Restore
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handlePermanentDelete(project.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="flex justify-between pt-4 border-t">
                            <Button variant="destructive" onClick={handleClearAll}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete All
                            </Button>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
