/**
 * Tasks Page — Loading State.
 *
 * Shown by Next.js Suspense while the page JS loads.
 * Shows 4 skeleton columns matching the Kanban layout.
 */

export default function TasksLoading() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            </div>

            {/* Four column skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 min-h-[500px] animate-pulse"
                    >
                        {/* Column header */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded" />
                            <div className="h-5 w-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        {/* Card skeletons */}
                        <div className="p-3 space-y-3">
                            {Array.from({ length: i % 2 === 0 ? 3 : 2 }).map(
                                (_, j) => (
                                    <div
                                        key={j}
                                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-2"
                                    >
                                        <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
                                        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                                        <div className="flex gap-2">
                                            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
