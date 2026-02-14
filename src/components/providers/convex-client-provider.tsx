"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode, useMemo } from "react";

interface ConvexClientProviderProps {
    children: ReactNode;
}

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    const client = useMemo(() => {
        if (!convexUrl) return null;
        return new ConvexReactClient(convexUrl);
    }, [convexUrl]);

    // If no Convex URL is configured, render children without the provider
    if (!client) {
        return <>{children}</>;
    }

    return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
