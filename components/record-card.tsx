"use client";

import { OsRecord } from "@/lib/seed";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function RecordCard({ record }: { record: OsRecord }) {
  return (
    <Link href={`/records/${record.id}`}>
      <div className="group border border-border rounded-lg p-4 hover:border-foreground/30 hover:bg-muted/40 transition-all cursor-pointer h-full flex flex-col gap-2">
        <div className="w-full aspect-video bg-muted rounded overflow-hidden">
          <img
            src={record.screenshotUrl}
            alt={record.productName}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium">{record.productName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{record.category}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{record.summary}</p>
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {record.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
