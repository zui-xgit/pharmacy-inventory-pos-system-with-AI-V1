import { Head, Link } from '@inertiajs/react';
import { LogIn, ShieldAlert } from 'lucide-react';

import { login } from '@/routes';

export default function Suspended() {
    return (
        <>
            <Head title="Account suspended" />

            <main className="flex min-h-screen w-screen items-center justify-center bg-muted/20 px-4 py-10">
                <div className="w-full max-w-md overflow-hidden rounded-2xl border border-destructive/30 bg-card shadow-xs">
                    <div className="h-1 w-full bg-destructive" />

                    <div className="p-8 text-center">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <ShieldAlert className="h-8 w-8" />
                        </span>

                        <h1 className="mt-6 text-xl font-semibold text-foreground">
                            Your account is suspended
                        </h1>

                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            Your access to all pharmacy branches has been
                            blocked. Contact an administrator to find out why
                            and how to restore it.
                        </p>

                        <Link
                            href={login()}
                            className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                        >
                            <LogIn className="h-4 w-4" />
                            Try logging in again
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
