"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const terms = query.trim().split(/\s+/);
  const regex = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-foreground/20 text-foreground rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const PLACEHOLDER_QUERIES = [
  "我之前测试过哪些多模态产品？",
  "有哪些 Agent 工具？",
  "字节的产品",
  "视频生成",
];

export default function SearchPage() {
  const records = useStore((s) => s.records);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const haystack = [
        r.productName,
        r.category,
        r.summary,
        r.myJudgment,
        ...r.features,
        ...r.tags,
      ]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((term) => haystack.includes(term));
    });
  }, [records, query]);

  return (
    <div className="flex flex-col flex-1 max-w-3xl mx-auto w-full px-6 py-8 gap-6">
      <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">搜索 / 找回</h1>

      {/* 搜索框 */}
      <div className="relative">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={PLACEHOLDER_QUERIES[0]}
          className="w-full bg-muted/30 border border-border rounded-xl px-5 py-3.5 text-sm outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground/50"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            清空
          </button>
        )}
      </div>

      {/* 快捷搜索词 */}
      {!query && (
        <div className="flex flex-wrap gap-2">
          {PLACEHOLDER_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q.replace("？", "").replace("？", ""))}
              className="text-xs border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 结果数 */}
      <p className="text-xs text-muted-foreground -mb-2">
        {query ? `找到 ${results.length} 条` : `共 ${records.length} 条记录`}
      </p>

      {/* 结果列表 */}
      <div className="flex flex-col gap-3">
        {results.map((r) => (
          <Link key={r.id} href={`/records/${r.id}`}>
            <div className="group border border-border rounded-xl p-4 hover:border-foreground/30 hover:bg-muted/30 transition-all flex gap-4">
              {/* 缩略图 */}
              <div className="w-20 h-14 bg-muted rounded overflow-hidden shrink-0">
                <img
                  src={r.screenshotUrl}
                  alt={r.productName}
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>

              {/* 内容 */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {highlight(r.productName, query)}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{r.category}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {highlight(r.summary, query)}
                </p>
                {r.myJudgment && (
                  <p className="text-xs text-foreground/60 line-clamp-1 italic">
                    「{highlight(r.myJudgment, query)}」
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {r.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs px-1.5 py-0">
                      {highlight(t, query)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}

        {results.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            没有找到相关记录
          </div>
        )}
      </div>
    </div>
  );
}
