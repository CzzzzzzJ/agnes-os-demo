const BASE = process.env.AGNES_BASE_URL!;
const KEY = process.env.AGNES_API_KEY!;

export type RecognizeResult = {
  product: string;
  category: string;
  features: string[];
  tags: string[];
  summary: string;
};

export async function recognizeScreenshot(imageBase64: string): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "你是一个 AI 产品识别模块。用户发给你一张截图，你必须只返回如下严格 JSON，不要任何多余文字：\n{\"product\":\"产品名\",\"category\":\"分类\",\"features\":[\"功能1\",\"功能2\"],\"tags\":[\"#标签1\",\"#标签2\"],\"summary\":\"一句话摘要\"}",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "识别这张 AI 产品截图，返回 JSON。" },
            {
              type: "image_url",
              image_url: { url: `data:image/png;base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Agnes API error: ${res.status}`);
  return res.body!;
}

export async function judgeAndClassify(
  summary: string,
  judgment: string
): Promise<{ tags: string[]; category: string }> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      messages: [
        {
          role: "system",
          content:
            "根据产品摘要和用户判断，返回更新后的分类和标签。只返回 JSON：{\"category\":\"分类\",\"tags\":[\"#标签1\",\"#标签2\"]}，最多 4 个标签。",
        },
        {
          role: "user",
          content: `产品摘要：${summary}\n用户判断：${judgment}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Agnes API error: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    return { tags: [], category: "未分类" };
  }
}
