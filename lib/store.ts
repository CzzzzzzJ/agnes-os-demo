import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OsRecord, seedRecords } from "./seed";

type Store = {
  records: OsRecord[];
  addRecord: (r: OsRecord) => void;
  updateJudgment: (id: string, judgment: string, tags?: string[]) => void;
  getById: (id: string) => OsRecord | undefined;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      records: seedRecords,
      addRecord: (r) =>
        set((s) => ({ records: [r, ...s.records] })),
      updateJudgment: (id, judgment, tags) =>
        set((s) => ({
          records: s.records.map((r) =>
            r.id === id
              ? { ...r, myJudgment: judgment, ...(tags ? { tags } : {}) }
              : r
          ),
        })),
      getById: (id) => get().records.find((r) => r.id === id),
    }),
    { name: "agnes-os-records" }
  )
);
