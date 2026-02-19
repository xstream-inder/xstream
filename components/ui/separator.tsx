// Mock UI Component for now as I don't see it in tree
export function Separator({ className }: { className?: string }) {
  return <div className={`h-[1px] w-full bg-gray-200 dark:bg-dark-800 ${className || ''}`} />;
}
