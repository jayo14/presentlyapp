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
    <div className="pointer-events-auto mx-auto flex h-16 items-end gap-3 rounded-[1.75rem] border border-light-border bg-white/90 px-3 py-2 shadow-2xl shadow-black/20 backdrop-blur-md dark:border-dark-border dark:bg-dark-surface/90">
      {items.map((item) => {
        const isActive = !!item.active;

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className="group flex flex-col items-center justify-end gap-1 min-w-[56px] py-1 outline-none"
          >
            <div
              className={[
                "flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",
                "bg-transparent group-hover:bg-zinc-100/80 dark:group-hover:bg-zinc-800/80",
                isActive
                  ? "scale-105 text-primary dark:text-dark-primary bg-zinc-100/80 dark:bg-zinc-800/80"
                  : "text-light-text-tertiary dark:text-dark-text-tertiary",
              ].join(" ")}
            >
              {item.icon}
            </div>
            <span
              className={[
                "text-[10px] font-medium transition-colors duration-200",
                isActive
                  ? "text-primary dark:text-dark-primary"
                  : "text-light-text-tertiary dark:text-dark-text-tertiary",
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

