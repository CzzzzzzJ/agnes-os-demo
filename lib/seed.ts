export type OsRecord = {
  id: string;
  productName: string;
  category: string;
  features: string[];
  tags: string[];
  summary: string;
  myJudgment: string;
  screenshotUrl: string;
  createdAt: string;
};

export const seedRecords: OsRecord[] = [];
