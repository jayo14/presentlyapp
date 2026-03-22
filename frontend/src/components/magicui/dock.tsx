import React from "react";

type DockItemConfig = {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

interface DockProps {
  items: DockItemConfig[];
}

export const Dock: React.FC<DockProps> = ({ items }) => {
  if (!items.length) return null;

  return (
    <div className="pointer-events-auto mx-auto flex h-16 items-end gap-3 rounded-[1.75rem] border border-outline/30 bg-white/95 dark:bg-surface/95 px-3 py-2 shadow-2xl backdrop-blur-xl transition-colors duration-300">
      {items.map((item) => {
        const isActive = !!item.active;

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="group flex flex-col items-center justify-end gap-1 min-w-[56px] py-1 outline-none transition-all duration-200"
          >
            <div
              className={[
                "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 ease-out",
                isActive
                  ? "scale-105 bg-surfaceContainer/50 text-text shadow-md"
                  : "bg-transparent text-textMuted hover:bg-surfaceContainer/50 hover:text-text hover:scale-105",
              ].join(" ")}
            >
              {item.icon}
            </div>
            <span
              className={[
                "text-[10px] font-semibold transition-colors duration-300 tracking-wide",
                isActive
                  ? "text-text"
                  : "text-textMuted group-hover:text-text",
              ].join(" ")}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export type { DockItemConfig as DockItem };

