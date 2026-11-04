import { Link } from '@inertiajs/react';
import { Pill } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-background p-6 font-sans md:p-10">
            {/* Background decorative glows using primary theme variables */}
            <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl backdrop-blur-md">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-2"
                        >
                            {/* <div className="rounded-xl bg-primary p-3 text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                                <Pill className="h-6 w-6" />
                            </div> */}
                            <AppLogoIcon />
                            <span className="text-lg font-bold tracking-tight text-foreground">
                                RxPOS Terminal
                            </span>
                        </Link>

                        <div className="space-y-1.5 text-center">
                            <h1 className="text-xl font-bold tracking-tight text-foreground">
                                {title}
                            </h1>
                            <p className="mx-auto max-w-[280px] text-xs leading-normal text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Auth Form Children */}
                    <div className="mt-2">{children}</div>
                </div>
            </div>

            {/* Footer secure sign-in badge */}
            <div className="z-10 mt-6 flex items-center gap-1.5 text-center font-mono text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                <span>Secure SSL Terminal Session</span>
            </div>
        </div>
    );
}
