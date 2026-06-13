"use client";

import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CreateDashboardModal } from "@/components/dashboard/CreateDashboardModal";
import { DeleteDashboardButton } from "@/components/dashboard/DeleteDashboardButton";
import type { Dashboard } from "@/types/database";

interface DashboardGridProps {
  dashboards: Dashboard[];
  userId: string;
}

function formatCreatedDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardGrid({ dashboards, userId }: DashboardGridProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your dashboards
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage your gamification systems
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New dashboard
        </Button>
      </div>

      {dashboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <p className="text-lg font-medium">No dashboards yet</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first dashboard to start building quests, XP bars, and
            achievements.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            New dashboard
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-full min-h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-muted-foreground transition-colors hover:border-primary hover:bg-muted/40 hover:text-foreground"
            >
              <Plus className="size-8" />
              <span className="text-sm font-medium">New dashboard</span>
            </button>
          </li>

          {dashboards.map((dashboard) => (
            <li key={dashboard.id}>
              <article className="flex h-full min-h-36 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-medium">{dashboard.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {formatCreatedDate(dashboard.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/builder/${dashboard.id}`}
                      aria-label={`Edit ${dashboard.name}`}
                    >
                      <Button variant="ghost" size="icon-sm" type="button">
                        <Pencil className="size-4" />
                      </Button>
                    </Link>
                    <DeleteDashboardButton
                      dashboardId={dashboard.id}
                      dashboardName={dashboard.name}
                    />
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      <CreateDashboardModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={userId}
      />
    </>
  );
}
