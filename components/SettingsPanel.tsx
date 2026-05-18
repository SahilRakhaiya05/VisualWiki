"use client";

import type { VisualWikiSettings } from "@/types";

const options = {
  style: [
    "Soft Technical Infographic",
    "Clean Diagram",
    "Storybook Explainer",
    "Scientific Plate",
    "Minimal Visual Map",
    "Premium Magazine Explainer"
  ],
  detailLevel: ["Simple", "Balanced", "Deep", "Expert"],
  textDensity: ["Very Low", "Low", "Medium"],
  clickBehavior: [
    "Fast hotspot mode",
    "Smart interpretation mode",
    "Ask before diving"
  ],
  contextSource: [
    "Session only",
    "Uploaded knowledge",
    "Global tenant knowledge",
    "Session + uploaded + global"
  ],
  imageMode: [
    "Generate new visual page",
    "Edit uploaded image into visual page",
    "Use uploaded image as style reference"
  ],
  exportScope: ["Current path only", "Full session"]
} as const;

function SelectRow({
  label,
  value,
  values,
  onChange
}: {
  label: string;
  value: string;
  values: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="ui-font grid gap-2 text-sm font-bold text-[#172b27]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[#23352f]/20 bg-[#edf5f1] px-3 py-2 font-semibold text-[#274f46] outline-none"
      >
        {values.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

export function SettingsPanel({
  open,
  settings,
  onClose,
  onSave
}: {
  open: boolean;
  settings: VisualWikiSettings;
  onClose: () => void;
  onSave: (settings: VisualWikiSettings) => void;
}) {
  if (!open) return null;

  function patch(update: Partial<VisualWikiSettings>) {
    onSave({ ...settings, ...update });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#172b27]/25">
      <aside className="h-full w-full max-w-md overflow-y-auto border-l border-[#23352f]/20 bg-[#fffaf0] p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#172b27]">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="ui-font rounded-xl border border-[#23352f]/20 px-3 py-2 text-sm font-bold text-[#274f46]"
          >
            Close
          </button>
        </div>
        <div className="grid gap-4">
          <SelectRow label="Visual Style" value={settings.style} values={options.style} onChange={(value) => patch({ style: value as VisualWikiSettings["style"] })} />
          <SelectRow label="Detail Level" value={settings.detailLevel} values={options.detailLevel} onChange={(value) => patch({ detailLevel: value as VisualWikiSettings["detailLevel"] })} />
          <SelectRow label="Text Density" value={settings.textDensity} values={options.textDensity} onChange={(value) => patch({ textDensity: value as VisualWikiSettings["textDensity"] })} />
          <SelectRow label="Click Behavior" value={settings.clickBehavior} values={options.clickBehavior} onChange={(value) => patch({ clickBehavior: value as VisualWikiSettings["clickBehavior"] })} />
          <SelectRow label="Context Source" value={settings.contextSource} values={options.contextSource} onChange={(value) => patch({ contextSource: value as VisualWikiSettings["contextSource"] })} />
          <SelectRow label="Image Mode" value={settings.imageMode} values={options.imageMode} onChange={(value) => patch({ imageMode: value as VisualWikiSettings["imageMode"] })} />
          <SelectRow label="Export" value={settings.exportScope} values={options.exportScope} onChange={(value) => patch({ exportScope: value as VisualWikiSettings["exportScope"] })} />
          <label className="ui-font flex items-center gap-2 text-sm font-bold text-[#172b27]">
            <input
              type="checkbox"
              checked={settings.includeMetadata}
              onChange={(event) => patch({ includeMetadata: event.target.checked })}
            />
            Include metadata
          </label>
          <label className="ui-font flex items-center gap-2 text-sm font-bold text-[#172b27]">
            <input
              type="checkbox"
              checked={settings.includeClickMap}
              onChange={(event) => patch({ includeClickMap: event.target.checked })}
            />
            Include click map
          </label>
          <div className="rounded-2xl border border-[#23352f]/15 bg-[#edf5f1] p-4 text-sm text-[#5a6f68]">
            Safety is always enabled: no unrelated examples, no copied reference content, no blank templates.
          </div>
        </div>
      </aside>
    </div>
  );
}
