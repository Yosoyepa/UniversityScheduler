/**
 * Schedule Page Loading State.
 *
 * Shown while the schedule page is loading via Suspense boundary.
 */

export default function ScheduleLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-40" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-44" />
            </div>

            {/* Grid skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Day header */}
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="p-3">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        </div>
                    ))}
                </div>
                {/* Body grid lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-16 border-b border-gray-100 dark:border-gray-700/50"
                    />
                ))}
            </div>
        </div>
    );
}
