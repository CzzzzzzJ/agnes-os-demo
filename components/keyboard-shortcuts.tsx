"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SHORTCUTS = [
  { key: "N", desc: "新捕获" },
  { key: "/", desc: "搜索" },
  { key: "Cmd+V", desc: "粘贴截图（在捕获页）" },
  { key: "Cmd+Enter", desc: "保存记录（在捕获页）" },
  { key: "?", desc: "显示快捷键" },
  { key: "Esc", desc: "关闭面板" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const inInput = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable;

      if (e.key === "Escape") {
        setShowPanel(false);
        return;
      }

      if (inInput) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        router.push("/capture");
      } else if (e.key === "/") {
        e.preventDefault();
        router.push("/search");
      } else if (e.key === "?") {
        setShowPanel((v) => !v);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!showPanel) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={() => setShowPanel(false)}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-80 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-4">快捷键</h3>
        <div className="flex flex-col gap-2.5">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.desc}</span>
              <kbd className="text-xs bg-muted border border-border rounded px-2 py-0.5 font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/50 mt-4 text-center">按 Esc 关闭</p>
      </div>
    </div>
  );
}
