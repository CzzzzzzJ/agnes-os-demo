"use client";

import { useStore } from "@/lib/store";
import { RecordCard } from "@/components/record-card";
import Link from "next/link";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function Home() {
  const records = useStore((s) => s.records);
  const recent = records.slice(0, 5);

  return (
    <div className="flex flex-1 gap-0 overflow-hidden">
      {/* 左侧：卡片墙 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">已捕获</h2>
          <Link
            href="/capture"
            className="text-xs border border-border rounded px-3 py-1.5 hover:bg-muted transition-colors"
          >
            + 新捕获
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {records.map((r) => (
            <RecordCard key={r.id} record={r} />
          ))}
        </div>
      </div>

      {/* 右侧：时间线 */}
      <div className="w-72 border-l border-border overflow-y-auto p-5 shrink-0">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-5">最近判断</h2>
        <div className="flex flex-col gap-4">
          {recent.map((r) => (
            <Link key={r.id} href={`/records/${r.id}`} className="group">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium group-hover:text-foreground text-muted-foreground transition-colors">
                    {r.productName}
                  </span>
                  <span className="text-xs text-muted-foreground/60">{formatTime(r.createdAt)}</span>
                </div>
                {r.myJudgment && (
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {r.myJudgment}
                  </p>
                )}
                <div className="w-full h-px bg-border mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
