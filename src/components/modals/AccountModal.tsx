import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, Mail, Key, Trash2 } from 'lucide-react';

interface AccountModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AccountModal({ open, onOpenChange }: AccountModalProps) {
    const [profile, setProfile] = useState({
        name: 'Local User',
        email: 'user@storyboarder.local',
        avatar: '',
    });

    const [stats] = useState({
        projectsCreated: 0,
        totalShots: 0,
        totalScenes: 0,
        storageUsed: '0 MB',
    });

    const handleSaveProfile = () => {
        localStorage.setItem('storyboarder_profile', JSON.stringify(profile));
        toast.success('Profile updated successfully');
    };

    const handleClearData = () => {
        if (confirm('This will delete all your local projects and data. Are you sure?')) {
            // Clear all localStorage data
            const keys = Object.keys(localStorage).filter(key => key.startsWith('boards_'));
            keys.forEach(key => localStorage.removeItem(key));
            toast.success('All data cleared');
            onOpenChange(false);
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const data = {
            profile,
            projects: localStorage.getItem('boards_projects'),
            scenes: localStorage.getItem('boards_scenes'),
            shots: localStorage.getItem('boards_shots'),
            characters: localStorage.getItem('boards_characters'),
            panels: localStorage.getItem('boards_panels'),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `storyboarder-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Data exported successfully');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-card border-border/50 shadow-3 rounded-[var(--radius-xl)] p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-6 border-b border-border/20">
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-black tracking-tight text-foreground uppercase">
                            Director Profile
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-primary/80">
                            Manage your Production Credentials
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Profile Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 p-4 rounded-3xl bg-muted/20 border border-border/10">
                            <Avatar className="h-20 w-20 ring-4 ring-primary/10 shadow-lg">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-black">
                                    {profile.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <h3 className="text-xl font-bold tracking-tight text-foreground">{profile.name}</h3>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{profile.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"> Screen Name </Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-background/50 border-border/50 text-sm font-bold tracking-tight"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"> Contact Channel </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className="h-12 pl-12 rounded-xl bg-background/50 border-border/50 text-sm font-bold tracking-tight"
                                    />
                                </div>
                            </div>

                            <Button onClick={handleSaveProfile} className="btn-filled w-full h-12 shadow-primary/20">
                                COMMIT CHANGES
                            </Button>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="p-5 rounded-2xl bg-muted/20 border border-border/20 space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Creative Footprint</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-background/30 border border-border/10">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Narratives</p>
                                <p className="text-xl font-black text-foreground">{stats.projectsCreated}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-background/30 border border-border/10">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Visual Units</p>
                                <p className="text-xl font-black text-foreground">{stats.totalShots}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-background/30 border border-border/10">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Sequence Count</p>
                                <p className="text-xl font-black text-foreground">{stats.totalScenes}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-background/30 border border-border/10">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Data Weight</p>
                                <p className="text-xl font-black text-foreground">{stats.storageUsed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="space-y-4 pt-6 border-t border-border/20">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Studio Maintenance</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={handleExportData} variant="outline" className="h-11 rounded-xl text-xs font-bold uppercase tracking-widest border-border/50 hover:bg-primary/5 hover:text-primary transition-all">
                                EXPORT BACKUP
                            </Button>
                            <Button
                                onClick={handleClearData}
                                variant="ghost"
                                className="h-11 rounded-xl text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                WIPE STORAGE
                            </Button>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground/60 leading-relaxed italic text-center px-4">
                            All narrative data is stored locally within this environment’s architecture. Clearing cache will result in permanent loss.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
