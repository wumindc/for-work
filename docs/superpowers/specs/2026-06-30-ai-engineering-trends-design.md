# AI 工程趋势与实战方案设计

日期：2026-06-30

## 1. 背景

当前站点已经具备比较扎实的研发面试知识骨架：`AI Agent 与 RAG`、`Elasticsearch`、`MQ`、`Redis`、`数据库`、`Prometheus 与监控体系`、`Java 并发与 JVM`、`分布式与系统设计`、`Web 工程` 均已通过覆盖率门禁。问题不再是“有没有基础知识”，而是缺少一层能反映 2026 年 AI 工程真实演进的材料：开源项目、工程模式、工具链选型、行业 benchmark、实际方案和可复用工作流。

用户提供的图片和 X 文章集中指向几个变化：

- Agent 讨论从 ReAct、Plan-and-Execute 这类基础范式，转向 Loop Engineering、state file、verifier、schedule、subagent 和 runtime 设计。
- Coding Agent 从“让模型写代码”转向工作区隔离、上下文压缩、skills、hooks、测试反馈、AI Code Review 和 repo memory。
- RAG 从“接向量库”下沉到文档解析、PDF/HTML/Office 结构化、知识库自生长、本地向量索引、引用验证和企业知识治理。
- Agent Memory、Context Compression、本地模型服务和本地向量检索正在变成降低 token、成本、隐私风险和延迟的工程基础设施。
- Skill 化、DESIGN.md、架构图生成、Taste Skill 等项目说明：AI 编程的竞争力不只在模型，而在可加载的过程资产、设计资产和团队约定。

因此新增内容不应写成新闻流，也不应把短视频里的每个项目都堆成知识点。它应该成为站点里的“趋势到方案”的桥：用真实项目解释趋势，再把趋势映射回可面试、可实践、可复盘的工程知识。

## 2. 目标

新增一级域：`AI 工程趋势与实战方案`。

这个域的目标是：

- 解释最新 AI 工程趋势背后的共同模式，而不是只罗列项目。
- 将开源项目拆解成可复用架构、关键数据结构、指标、失败模式和面试表达。
- 把趋势内容连接回现有知识点：Agent Loop、Tool Use、Memory、Context、RAG、Coding Agent、Browser Agent、Eval、后端基础设施。
- 提供第一批可落地的 12 个高价值 topic，形成后续持续扩展的内容模板。

不做的事：

- 不做每日新闻聚合。
- 不复制社交媒体营销话术。
- 不把 star 数、转发数当成技术价值判断。
- 不在未验证来源的情况下写确定性性能结论。

## 3. 信息架构

### 3.1 新增 Domain

`ai-engineering-trends`

标题：AI 工程趋势与实战方案

描述：Loop Engineering、Coding Agent、RAG 基础设施、Agent Memory、本地 AI、Skill 化和企业 Agent 方案。

状态：第一批内容落地后为 `sample_ready`。

优先级：`core`。

### 3.2 二级目录

| 分类 | 关注问题 | 典型材料 |
| --- | --- | --- |
| Loop Engineering 与 Agent Runtime | 如何把 prompt 变成可持续运行、可验证、可恢复的循环系统 | 0xCodez Loop Engineering、Addy Osmani Loop Engineering、OpenAI/Anthropic Agent 指南 |
| Coding Agent 工程化 | Codex/Claude Code 类工具如何管理仓库、上下文、测试、patch、review 和记忆 | Codex 工作流、Claude Code hooks/subagents、AI Code Review、repo memory |
| RAG 数据基础设施 | 文档如何变成 AI 可检索、可引用、可评测的知识资产 | WeKnora、OpenDataLoader PDF、LiteParse、TurboVec |
| Agent Memory 与 Context 压缩 | 长任务如何保留状态、约束、经验和证据，同时降低 token | TencentDB Agent Memory、OpenViking、Headroom/ECC 类压缩思路 |
| Tool / Protocol / Skill 生态 | 如何把工具、协议、模板、设计约定和工作流封装成 Agent 能力 | MCP、book-to-skill、taste-skill、fireworks-tech-graph |
| Computer Use 与 Browser Agent | 真实电脑/浏览器操作 Agent 如何观察、执行、验证和评测 | Agent S3、OSWorld、Browser Agent eval |
| Local-first AI 工程栈 | 本地模型、本地 ASR、本地向量索引如何降低成本、延迟和隐私风险 | Rapid-MLX、Qwen coder、小模型 tool calling、TurboVec |
| 企业 Agent 应用方案 | 如何把趋势落到业务系统和面试项目表达 | DataAgent/Text2SQL、AI Code Review、客服知识库、回归测试平台 |

## 4. 第一批 Topic

第一批控制在 12 个 topic，避免一次扩散成工具大全。

| Topic ID | 标题 | 分类 | 为什么值得做 |
| --- | --- | --- | --- |
| `loop-engineering-runtime` | Loop Engineering 与 Agent Runtime | Loop Engineering 与 Agent Runtime | 连接 0xCodez/Addy 的核心趋势，把 Agent 从 prompt 调用讲到 state/verifier/schedule |
| `agent-state-file-verifier` | State File、Verifier 与 Schedule | Loop Engineering 与 Agent Runtime | 把 autonomous loop 的“跑起来”落到数据结构和恢复机制 |
| `codex-context-workflow` | Codex/Claude Code 上下文工作流 | Coding Agent 工程化 | 解释用户截图里的 Codex prompt、sub-agent、上下文压缩和复盘模式 |
| `ai-code-review-pipeline` | AI Code Review Pipeline | Coding Agent 工程化 | 拆解 Open Code Review / code-review-graph 的确定性规则 + LLM review 组合 |
| `rag-document-ingestion-stack` | RAG 文档解析与入库栈 | RAG 数据基础设施 | 把 OpenDataLoader、LiteParse、PDF-to-Markdown 等材料连接到 RAG 质量 |
| `self-growing-knowledge-base` | 自生长知识库与企业 Wiki | RAG 数据基础设施 | 以 WeKnora 为代表，讲文档到 RAG/Agent/Wiki 的自动化链路 |
| `agent-memory-layering` | Agent Memory 分层与压缩 | Agent Memory 与 Context 压缩 | 连接短期记忆、长期记忆、符号化压缩、分层总结和 token 成本 |
| `skill-packaging-workflow` | Skill 化工作流与能力封装 | Tool / Protocol / Skill 生态 | 把 book-to-skill、taste-skill、架构图 skill 统一成过程资产主题 |
| `design-assets-for-ai-coding` | DESIGN.md 与 AI 可读设计资产 | Tool / Protocol / Skill 生态 | 把“让 AI 学会产品级 UI 风格”纳入前端/产品工程能力 |
| `computer-use-agent-benchmark` | Computer Use Agent 与 OSWorld | Computer Use 与 Browser Agent | 连接 Agent S3、OSWorld、桌面操作、安全边界和 benchmark |
| `local-ai-inference-stack` | Local-first 模型服务与兼容 API | Local-first AI 工程栈 | 解释 Rapid-MLX、本地 coder、小模型、本地 OpenAI-compatible API |
| `enterprise-agent-solution-map` | 企业 Agent 方案地图 | 企业 Agent 应用方案 | 把 DataAgent、客服知识库、代码审查、回归测试等方案串成项目表达入口 |

## 5. 内容模板

每篇趋势专题采用固定骨架：

```markdown
# 标题

## 趋势判断

用 2-3 句话说明这个趋势解决的工程问题，以及为什么现在值得关注。

## 代表材料

列出 2-4 个来源，区分官方、开源项目、工程文章、社交媒体线索。社交媒体只作为线索，不作为唯一事实来源。

## 核心架构

使用 Mermaid 画出系统边界、状态、工具、评测和反馈闭环。

## 可复用模式

抽象出可迁移到其他项目的 pattern，例如 state projection、verifier、tool contract、evidence lifecycle。

## 关键数据结构与指标

列出 topic 里最核心的状态字段、trace 字段、索引字段、eval 指标或运行时指标。

## 失败模式与排障

给出一条真实风格的事故链路：症状、影响面、证据、止血、根因、修复、回归。

## 与本站知识点的连接

列出相关 topic、问题和学习路径，说明它补强的是哪条已有主线。

## 面试追问

给出 3-5 个追问、考察点和回答方向。

## 动手实验

给一个低风险实验，例如本地解析 PDF、构建 Skill、做一个 repo review eval、实现一个 state file verifier。

## 来源与延伸阅读
```

## 6. 数据模型影响

优先复用现有数据模型，不为了趋势内容单独做复杂新 UI。

需要修改：

- `src/data/domains.ts`：新增 `ai-engineering-trends`。
- `src/data/categories.ts`：新增 8 个分类。
- `src/data/deepSamples.ts` 或新增拆分文件：新增 12 个 topic seed。
- `src/data/questions.ts`：新增每个 topic 对应的核心题与深问题，第一批至少 12-24 道。
- `src/data/learningPaths.ts`：新增一条 `ai-engineering-trends-review` 路径。
- `src/data/sources.ts`：补充 OpenAI/Anthropic/Addy/项目 GitHub 等来源。
- `content/topics/*.md` 与 `content/questions/*.md`：由生成器或手写样板产出。
- `scripts/audit-coverage-map.mjs`：若 domain 门槛按固定数量判断，需要纳入新 domain 的覆盖要求。

可选修改：

- `src/data/projects.ts`：新增 `pe-enterprise-agent-stack` 或扩展现有 `pe-coding-agent` / `pe-paper-agent`。
- `src/components/project/ProjectTrack.tsx`：如果后续要展示趋势项目雷达，再考虑扩展，不作为第一批必要项。

## 7. 验收标准

第一批完成后必须满足：

- `npm run validate:data` 通过。
- `npm run validate:graph` 通过。
- `npm run validate:markdown-content` 通过。
- `npm run validate:content-quality` 通过。
- `npm run audit:technical-depth` 通过。
- `npm run audit:coverage-map` 对新增 domain 通过。
- `npm run validate:all` 通过。
- `npm run build` 通过。

内容侧抽样验收：

- 至少 12 个 topic。
- 至少 12 道核心面试题，最好 24 道题。
- 每篇 topic 至少有 1 张 Mermaid 图、1 张取舍表、1 个关键数据结构表、1 个失败模式、3 个面试追问、3 个来源。
- 至少 8 个外部项目/文章被映射到 topic，但每个来源都说明“支持了什么结论”。
- 社交媒体内容只能作为趋势线索，不能作为性能或事实结论的唯一来源。

## 8. 推荐落地顺序

1. 新增 domain、categories、sources 和 coverage gate。
2. 新增 12 个 topic seed 与学习路径。
3. 新增 12-24 道面试题。
4. 生成 Markdown。
5. 对 3 个样板 topic 手工升级到 L2/L3：`loop-engineering-runtime`、`rag-document-ingestion-stack`、`ai-code-review-pipeline`。
6. 跑完整校验与 build。
7. 抽样浏览器检查移动端渲染、Mermaid、长标题和来源链接。
