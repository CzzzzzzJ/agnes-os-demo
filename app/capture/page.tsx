"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { OsRecord } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type RecognizeResult = {
  product: string;
  category: string;
  features: string[];
  tags: string[];
  summary: string;
};

function parseSSEChunks(text: string): string {
  // Extract content from SSE data lines
  const lines = text.split("\n");
  let result = "";
  for (const line of lines) {
    if (!line.startsWith("data: ")) continue;
    const data = line.slice(6).trim();
    if (data === "[DONE]") continue;
    try {
      const json = JSON.parse(data);
      const delta = json.choices?.[0]?.delta?.content;
      if (delta) result += delta;
    } catch {
      // ignore malformed chunks
    }
  }
  return result;
}

export default function CapturePage() {
  const router = useRouter();
  const addRecord = useStore((s) => s.addRecord);

  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<RecognizeResult | null>(null);
  const [judgment, setJudgment] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setRawText("");
      setResult(null);
      setJudgment("");
      setStreaming(true);

      const base64 = dataUrl.split(",")[1];
      try {
        const res = await fetch("/api/recognize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        const reader2 = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader2.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const parsed = parseSSEChunks(accumulated);
          if (parsed !== fullContent) {
            fullContent = parsed;
            setRawText(fullContent);
          }
        }

        // Try to parse JSON from the full content
        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]) as RecognizeResult;
            setResult(parsed);
          } catch {
            // leave as raw text
          }
        }
      } catch (err) {
        console.error(err);
        setRawText("识别失败，请检查网络或重试。");
      } finally {
        setStreaming(false);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) processFile(file);
    },
    [processFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleSave = useCallback(() => {
    if (!result || !preview) return;
    setSaving(true);
    const newRecord: OsRecord = {
      id: `rec-${Date.now()}`,
      productName: result.product,
      category: result.category,
      features: result.features,
      tags: result.tags,
      summary: result.summary,
      myJudgment: judgment,
      screenshotUrl: preview,
      createdAt: new Date().toISOString(),
    };
    addRecord(newRecord);
    router.push(`/records/${newRecord.id}`);
  }, [result, preview, judgment, addRecord, router]);

  // Cmd+V 粘贴截图
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) processFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [processFile]);

  // Cmd+Enter 保存
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave]);

  return (
    <div className="flex flex-1 gap-0 overflow-hidden">
      {/* 左半：拖拽上传 */}
      <div className="flex-1 flex flex-col p-6 gap-4 overflow-y-auto">
        <h1 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">新捕获</h1>

        <div
          className={`flex-1 min-h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragging
              ? "border-foreground/50 bg-muted/30"
              : "border-border hover:border-foreground/30 hover:bg-muted/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
          ) : (
            <div className="text-center text-muted-foreground select-none">
              <div className="text-4xl mb-3">↓</div>
              <p className="text-sm">拖入截图，或点击上传</p>
              <p className="text-xs mt-1 opacity-60">支持 PNG / JPG / WebP</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* 右半：识别结果 */}
      <div className="w-[480px] border-l border-border flex flex-col overflow-hidden shrink-0">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {!preview && !streaming && (
            <p className="text-muted-foreground text-sm mt-8 text-center">上传截图后，识别结果会在这里显示</p>
          )}

          {(streaming || rawText) && !result && (
            <div className="font-mono text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {streaming && (
                <span className="text-muted-foreground text-xs mb-2 block">识别中…</span>
              )}
              {rawText}
              {streaming && <span className="animate-pulse">▋</span>}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Row label="产品名" value={result.product} highlight />
                <Row label="类型" value={result.category} />
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">关键功能</span>
                  <div className="flex flex-wrap gap-1">
                    {result.features.map((f) => (
                      <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">自动标签</span>
                  <div className="flex flex-wrap gap-1">
                    {result.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <Row label="摘要" value={result.summary} />
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <label className="text-xs text-muted-foreground">+ 补一句判断</label>
                <Textarea
                  placeholder="写下你对这个产品的判断…"
                  className="text-sm resize-none bg-muted/30 border-border"
                  rows={3}
                  value={judgment}
                  onChange={(e) => setJudgment(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="border-t border-border p-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full text-sm bg-foreground text-background rounded-lg py-2.5 hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
            >
              {saving ? "保存中…" : "保存记录"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm ${highlight ? "font-semibold" : "text-foreground/80"}`}>{value}</span>
    </div>
  );
}
