"use client";

import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

export default function RecordPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const getById = useStore((s) => s.getById);
  const updateJudgment = useStore((s) => s.updateJudgment);

  const record = getById(id);
  const [judgment, setJudgment] = useState(record?.myJudgment ?? "");
  const [tags, setTags] = useState(record?.tags ?? []);
  const [classifying, setClassifying] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (record) {
      setJudgment(record.myJudgment);
      setTags(record.tags);
    }
  }, [record]);

  if (!record) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        记录不存在{" "}
        <button onClick={() => router.push("/")} className="ml-2 underline">
          回首页
        </button>
      </div>
    );
  }

  const handleBlur = async () => {
    if (!judgment.trim() || judgment === record.myJudgment) return;
    setClassifying(true);
    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: record.summary, judgment }),
      });
      const data = await res.json();
      if (data.tags) setTags(data.tags);
      updateJudgment(record.id, judgment, data.tags);
    } catch {
      updateJudgment(record.id, judgment);
    } finally {
      setClassifying(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="flex flex-1 gap-0 overflow-hidden">
      {/* 左：截图 */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden bg-muted/10">
        <img
          src={record.screenshotUrl}
          alt={record.productName}
          className="max-h-full max-w-full object-contain rounded-lg border border-border"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "";
            (e.target as HTMLImageElement).alt = "截图不可用";
          }}
        />
      </div>

      {/* 右：详情 */}
      <div className="w-[420px] border-l border-border flex flex-col overflow-y-auto shrink-0">
        <div className="p-6 flex flex-col gap-5">
          {/* 标题行 */}
          <div>
            <h1 className="text-lg font-semibold">{record.productName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{record.category}</p>
          </div>

          {/* AI 摘要 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">AI 摘要</label>
            <p className="text-sm text-foreground/80 leading-relaxed">{record.summary}</p>
          </div>

          {/* 功能点 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">关键功能</label>
            <div className="flex flex-wrap gap-1.5">
              {record.features.map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
              ))}
            </div>
          </div>

          {/* 分类标签（动态更新） */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">分类标签</label>
              {classifying && (
                <span className="text-xs text-muted-foreground animate-pulse">重新归类中…</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
          </div>

          {/* 我的判断 */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">我的判断</label>
              {saved && <span className="text-xs text-muted-foreground">已保存</span>}
            </div>
            <Textarea
              placeholder="写下你的判断，失焦后自动重新归类…"
              className="text-sm resize-none bg-muted/30 border-border"
              rows={4}
              value={judgment}
              onChange={(e) => setJudgment(e.target.value)}
              onBlur={handleBlur}
            />
          </div>

          {/* 时间 */}
          <p className="text-xs text-muted-foreground">
            捕获于 {new Date(record.createdAt).toLocaleString("zh-CN")}
          </p>
        </div>
      </div>
    </div>
  );
}
