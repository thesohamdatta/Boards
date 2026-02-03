import { cn } from "@/lib/utils";

interface AppLogoProps {
    className?: string;
    iconOnly?: boolean;
}

export function AppLogo({ className, iconOnly = false }: AppLogoProps) {
    return (
        <div className={cn("flex items-center gap-4", className)}>
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a1c20] to-[#0a0b0d] shadow-2xl ring-1 ring-white/10 overflow-hidden group">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                {/* The professional aperture icon (using SVG for sharpness/control) */}
                <svg
                    viewBox="0 0 100 100"
                    className="h-7 w-7 text-white/90 relative z-10 transition-transform duration-700 group-hover:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="50" cy="50" r="40" strokeDasharray="10 6" className="opacity-40" />
                    <path d="M50 10 L50 30 M50 70 L50 90 M10 50 L30 50 M70 50 L90 50 M21.7 21.7 L35.8 35.8 M64.2 64.2 L78.3 78.3 M21.7 78.3 L35.8 64.2 M64.2 35.8 L78.3 21.7" />
                    <circle cx="50" cy="50" r="12" className="fill-primary/20" />
                </svg>
            </div>

            {!iconOnly && (
                <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter text-foreground uppercase leading-none">Boards</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mt-1">Cinematic Orchestration</span>
                </div>
            )}
        </div>
    );
}
