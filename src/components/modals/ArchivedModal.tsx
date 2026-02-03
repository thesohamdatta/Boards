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
        const archived = localStorage.getItem('boards_archived');
        if (archived) {
            setArchivedProjects(JSON.parse(archived));
        }
    };

    const handleRestore = async (projectId: string) => {
        const archived = archivedProjects.filter(p => p.id !== projectId);
        localStorage.setItem('boards_archived', JSON.stringify(archived));
        setArchivedProjects(archived);
        toast.success('Project restored successfully');
    };

    const handlePermanentDelete = async (projectId: string) => {
        if (confirm('Permanently delete this project? This cannot be undone.')) {
            try {
                await deleteProject(projectId);
                const archived = archivedProjects.filter(p => p.id !== projectId);
                localStorage.setItem('boards_archived', JSON.stringify(archived));
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
            localStorage.removeItem('boards_archived');
            setArchivedProjects([]);
            toast.success('All archived projects deleted');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-card border-border/50 shadow-3 rounded-[var(--radius-xl)] p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 border-b border-border/20">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-3">
                            <Archive className="h-6 w-6 text-primary" />
                            Director's Vault
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary/80">
                            Manage Preserved & Decommissioned Assets
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="p-8">
                    {archivedProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-[var(--radius-xl)] border border-dashed border-border/30 bg-muted/5">
                            <div className="h-20 w-20 rounded-full bg-muted/10 flex items-center justify-center border border-border/20">
                                <Archive className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Vault Empty</h3>
                                <p className="text-xs text-muted-foreground font-medium max-w-[200px]">
                                    Your decommissioned narratives will appear here for restoration
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-3">
                                    {archivedProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="p-5 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-primary/20 transition-all group"
                                        >
                                            <div className="flex items-center justify-between gap-6">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{project.title}</h3>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        {project.genre && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 bg-muted/20 px-2 py-0.5 rounded-md">
                                                                {project.genre}
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">{project.shotCount} SHOTS</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest border-l border-border/20 pl-4">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(project.archivedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRestore(project.id)}
                                                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                        Restore
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handlePermanentDelete(project.id)}
                                                        className="h-9 w-9 p-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="flex items-center justify-between pt-6 border-t border-border/20">
                                <Button
                                    variant="ghost"
                                    onClick={handleClearAll}
                                    className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Purge Vault
                                </Button>
                                <Button
                                    onClick={() => onOpenChange(false)}
                                    className="btn-filled px-10 rounded-xl"
                                >
                                    DISMISS
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
