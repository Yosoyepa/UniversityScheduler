/**
 * Dashboard Layout.
 *
 * Wraps all dashboard pages with the DashboardLayout template.
 * Uses the App Router layout convention for nested persistence.
 */

"use client";

import { DashboardLayout } from "@/components";

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // TODO: Replace with real auth context
    const mockUser = null;

    return (
        <DashboardLayout user={mockUser} onLogout={() => {}}>
            {children}
        </DashboardLayout>
    );
}
