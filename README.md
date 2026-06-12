# 麦当 OS · 个人智能

> 看见、记住、找回来

麦当 OS 是一个 AI 产品捕获与记录工具。截图丢进来，自动识别产品名称、分类、功能点和标签，加上你自己的判断，沉淀成可搜索的个人知识库。

---

## 核心功能

- **截图捕获** — 粘贴或上传任意 AI 产品截图，一键触发识别
- **AI 自动解析** — 基于 Agnes 2.0 Flash 模型，流式返回产品名、分类、功能列表、标签和一句话摘要
- **个人判断** — 在每条记录上写下自己的观点，AI 会据此更新分类和标签
- **卡片墙 + 时间线** — 首页双栏布局，左侧浏览全部记录，右侧快速回顾最近判断
- **键盘快捷键** — 全局快捷键导航，减少鼠标操作
- **本地持久化** — 数据存在浏览器 localStorage，无需账号，隐私优先

---

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | Next.js 16 + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 组件 | shadcn/ui + Base UI |
| 状态 | Zustand (persist) |
| AI | Agnes 2.0 Flash (streaming) |

---

## 本地运行

```bash
pnpm install
```

配置环境变量：

```bash
# .env.local
AGNES_BASE_URL=https://your-agnes-endpoint
AGNES_API_KEY=your-api-key
```

启动开发服务器：

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

---

## 页面结构

```
/           首页卡片墙 + 最近判断时间线
/capture    新建捕获，粘贴截图触发 AI 识别
/search     全文搜索记录
/records/[id]  单条记录详情 + 编辑判断
```

---

## 作者

麦当 mdldm · 个人 OS
