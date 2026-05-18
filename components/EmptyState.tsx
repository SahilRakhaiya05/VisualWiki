import { Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center text-[#5a6f68]">
      <div className="grid h-16 w-16 place-items-center rounded-full border border-[#23352f]/20 bg-[#edf5f1]">
        <Sparkles className="h-7 w-7 text-[#274f46]" />
      </div>
      <div>
        <p className="text-xl font-semibold text-[#172b27]">Start with any topic</p>
        <p className="ui-font mt-2 max-w-sm text-sm">
          VisualWiki turns it into a clickable 16:9 explainer image.
        </p>
      </div>
    </div>
  );
}
