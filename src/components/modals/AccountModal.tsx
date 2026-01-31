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
            const keys = Object.keys(localStorage).filter(key => key.startsWith('scene_weaver_'));
            keys.forEach(key => localStorage.removeItem(key));
            toast.success('All data cleared');
            onOpenChange(false);
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const data = {
            profile,
            projects: localStorage.getItem('scene_weaver_projects'),
            scenes: localStorage.getItem('scene_weaver_scenes'),
            shots: localStorage.getItem('scene_weaver_shots'),
            characters: localStorage.getItem('scene_weaver_characters'),
            panels: localStorage.getItem('scene_weaver_panels'),
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                        Manage your profile and account data
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                    {profile.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="font-medium">{profile.name}</h3>
                                <p className="text-sm text-muted-foreground">{profile.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">
                                <User className="inline h-4 w-4 mr-2" />
                                Display Name
                            </Label>
                            <Input
                                id="name"
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                <Mail className="inline h-4 w-4 mr-2" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>

                        <Button onClick={handleSaveProfile} className="w-full">
                            Save Profile
                        </Button>
                    </div>

                    <Separator />

                    {/* Stats Section */}
                    <div className="space-y-2">
                        <h3 className="font-medium">Usage Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Projects</p>
                                <p className="font-medium">{stats.projectsCreated}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Shots</p>
                                <p className="font-medium">{stats.totalShots}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Total Scenes</p>
                                <p className="font-medium">{stats.totalScenes}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Storage Used</p>
                                <p className="font-medium">{stats.storageUsed}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Data Management */}
                    <div className="space-y-2">
                        <h3 className="font-medium">Data Management</h3>
                        <div className="space-y-2">
                            <Button onClick={handleExportData} variant="outline" className="w-full">
                                Export All Data
                            </Button>
                            <Button
                                onClick={handleClearData}
                                variant="destructive"
                                className="w-full"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All Data
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Note: This app stores all data locally in your browser. Clearing browser data will delete all projects.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
