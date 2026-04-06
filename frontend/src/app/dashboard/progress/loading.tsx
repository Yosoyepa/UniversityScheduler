/* 
 * Design Rule: Always reference the corresponding visual mockup in `docs/mockups/` 
 * and strictly mirror its precise styling, layout, typography, and color palette 
 * using Tailwind CSS. Refer to the `frontend-mockup-implementation` skill for guidance. 
 */
export default function ProgressLoading() {
    return (
        <div className="animate-pulse p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full h-96">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-100 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded w-full"></div>
        </div>
    );
}
