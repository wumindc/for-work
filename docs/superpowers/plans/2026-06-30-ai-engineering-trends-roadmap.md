# AI Engineering Trends Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `AI 工程趋势与实战方案` domain that turns current AI engineering trends, open-source projects, and real implementation patterns into interview-ready knowledge topics.

**Architecture:** Reuse the existing data-driven knowledge site architecture: domains, categories, topic seeds, handwritten questions, sources, learning paths, generated Markdown, graph validation, and content quality gates. The first release adds one domain, eight categories, twelve high-value topics, source mappings, a learning path, and generated topic/question Markdown without changing the UI surface.

**Tech Stack:** Vite, React, TypeScript data modules, Markdown content, Mermaid, Node/tsx validation scripts.

---

## File Structure

- Modify: `src/data/domains.ts`
  - Add the `ai-engineering-trends` domain.
- Modify: `src/data/categories.ts`
  - Add eight categories under the new domain.
- Modify: `src/data/sources.ts`
  - Add sources for Loop Engineering, OpenAI/Anthropic agent guidance, WeKnora, OpenDataLoader PDF, LiteParse, Open Code Review, Rapid-MLX, Agent S, taste-skill, awesome-design-md, and fireworks-tech-graph.
- Modify: `src/data/deepSamples.ts`
  - Add twelve topic seeds or a new exported topic array that is merged into `topicSeeds`.
- Modify: `src/data/topics.ts`
  - Import and merge the new topic seed array if `deepSamples.ts` is split.
- Modify: `src/data/questions.ts`
  - Add handwritten question seeds for the new domain.
- Modify: `src/data/learningPaths.ts`
  - Add `ai-engineering-trends-review`.
- Modify: `scripts/audit-coverage-map.mjs`
  - Add domain coverage rules if the script uses an explicit allowlist or required domain map.
- Generate: `content/topics/*.md`
  - Generate Markdown for the twelve new topics.
- Generate: `content/questions/*.md`
  - Generate Markdown for the new questions.

## Task 1: Add Domain, Categories, And Sources

**Files:**
- Modify: `src/data/domains.ts`
- Modify: `src/data/categories.ts`
- Modify: `src/data/sources.ts`

- [ ] **Step 1: Add the new domain**

In `src/data/domains.ts`, append:

```ts
  {
    id: "ai-engineering-trends",
    title: "AI 工程趋势与实战方案",
    description: "Loop Engineering、Coding Agent、RAG 基础设施、Agent Memory、本地 AI、Skill 化和企业 Agent 方案。",
    status: "sample_ready",
    priority: "core",
  },
```

- [ ] **Step 2: Add eight categories**

In `src/data/categories.ts`, append these category objects:

```ts
  {
    id: "loop-engineering-runtime",
    domainId: "ai-engineering-trends",
    title: "Loop Engineering 与 Agent Runtime",
    description: "State、verifier、schedule、subagent、恢复与持续运行。",
    icon: "RefreshCw",
    accent: "emerald",
  },
  {
    id: "coding-agent-engineering",
    domainId: "ai-engineering-trends",
    title: "Coding Agent 工程化",
    description: "仓库上下文、patch、测试、review、hooks、skills 和 repo memory。",
    icon: "Code2",
    accent: "slate",
  },
  {
    id: "rag-data-infrastructure",
    domainId: "ai-engineering-trends",
    title: "RAG 数据基础设施",
    description: "文档解析、结构化入库、知识库自生长、本地向量索引和引用验证。",
    icon: "Database",
    accent: "sky",
  },
  {
    id: "agent-memory-context",
    domainId: "ai-engineering-trends",
    title: "Agent Memory 与 Context 压缩",
    description: "短期记忆、长期记忆、分层总结、state projection 和 token 成本控制。",
    icon: "Layers",
    accent: "cyan",
  },
  {
    id: "tool-protocol-skill-ecosystem",
    domainId: "ai-engineering-trends",
    title: "Tool / Protocol / Skill 生态",
    description: "MCP、工具契约、Skill 包、设计资产和架构图生成能力。",
    icon: "Cable",
    accent: "violet",
  },
  {
    id: "computer-use-browser-agent",
    domainId: "ai-engineering-trends",
    title: "Computer Use 与 Browser Agent",
    description: "桌面操作、浏览器观察、动作执行、截图验证和 OSWorld 类评测。",
    icon: "MousePointerClick",
    accent: "blue",
  },
  {
    id: "local-first-ai-stack",
    domainId: "ai-engineering-trends",
    title: "Local-first AI 工程栈",
    description: "本地模型服务、本地 ASR、本地向量索引、兼容 API 和隐私部署。",
    icon: "Cpu",
    accent: "amber",
  },
  {
    id: "enterprise-agent-solutions",
    domainId: "ai-engineering-trends",
    title: "企业 Agent 应用方案",
    description: "DataAgent、AI Code Review、客服知识库、回归测试和项目管理 Agent。",
    icon: "Briefcase",
    accent: "stone",
  },
```

- [ ] **Step 3: Add sources**

In `src/data/sources.ts`, append sources using stable official or repository URLs:

```ts
  {
    id: "addy-loop-engineering",
    title: "Addy Osmani: Loop Engineering",
    url: "https://addyosmani.com/blog/loop-engineering/",
    kind: "engineering_blog",
  },
  {
    id: "anthropic-building-effective-agents",
    title: "Anthropic: Building effective agents",
    url: "https://www.anthropic.com/engineering/building-effective-agents",
    kind: "official",
  },
  {
    id: "anthropic-effective-tools",
    title: "Anthropic: Effective tools for agents",
    url: "https://www.anthropic.com/engineering/effective-tools-for-agents",
    kind: "official",
  },
  {
    id: "tencent-weknora",
    title: "Tencent WeKnora",
    url: "https://github.com/Tencent/WeKnora",
    kind: "github",
  },
  {
    id: "opendataloader-pdf",
    title: "OpenDataLoader PDF",
    url: "https://github.com/opendataloader-project/opendataloader-pdf",
    kind: "github",
  },
  {
    id: "llamaindex-liteparse",
    title: "LlamaIndex LiteParse",
    url: "https://github.com/run-llama/liteparse",
    kind: "github",
  },
  {
    id: "alibaba-open-code-review",
    title: "Alibaba Open Code Review",
    url: "https://github.com/alibaba/open-code-review",
    kind: "github",
  },
  {
    id: "rapid-mlx",
    title: "Rapid-MLX",
    url: "https://github.com/raullenchai/Rapid-MLX",
    kind: "github",
  },
  {
    id: "agent-s",
    title: "Agent S",
    url: "https://github.com/simular-ai/Agent-S",
    kind: "github",
  },
  {
    id: "taste-skill",
    title: "taste-skill",
    url: "https://github.com/Leonxlnx/taste-skill",
    kind: "github",
  },
  {
    id: "awesome-design-md",
    title: "awesome-design-md",
    url: "https://github.com/VoltAgent/awesome-design-md",
    kind: "github",
  },
  {
    id: "fireworks-tech-graph",
    title: "fireworks-tech-graph",
    url: "https://github.com/yizhiyanhua-ai/fireworks-tech-graph",
    kind: "github",
  },
```

- [ ] **Step 4: Run data validation**

Run:

```bash
npm run validate:data
```

Expected: PASS. If it fails because `Source.kind` does not allow `engineering_blog`, use `kind: "blog"` or the closest existing union value from `src/types/knowledge.ts`.

## Task 2: Add Twelve Topic Seeds

**Files:**
- Modify: `src/data/deepSamples.ts`
- Modify: `src/data/topics.ts` only if a new exported array is introduced

- [ ] **Step 1: Add a focused topic array**

In `src/data/deepSamples.ts`, add an exported `aiEngineeringTrendTopics` array with these ids and category mappings:

```ts
export const aiEngineeringTrendTopics = [
  {
    id: "loop-engineering-agent-runtime",
    title: "Loop Engineering 与 Agent Runtime",
    categoryId: "loop-engineering-runtime",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["general", "development"],
    prerequisites: ["react-loop", "planning-methods", "trajectory-eval"],
    summary: "Loop Engineering 把一次 prompt 调用升级为带状态、验证器、调度、恢复和反馈闭环的 Agent Runtime。",
    mustRemember: ["prompt 不是系统边界", "state 和 verifier 是循环可靠性的核心", "schedule 决定长任务能否持续推进"],
    details: ["核心问题是让 Agent 在多步任务中持续记录状态、检查结果并恢复失败。", "它连接 ReAct、Plan-and-Execute、反思、工具调用和轨迹评测。"],
    engineeringNotes: ["为每次 run 建立 state file、step log、verifier verdict 和 next action。", "把停止条件、预算、重试、人工确认写进 runtime，而不是交给模型自由判断。"],
    commonPitfalls: ["只写更长 prompt", "没有 verifier 就宣称 autonomous", "长任务无恢复点"],
    projectEvidenceIds: ["pe-coding-agent", "pe-web-agent"],
    sourceIds: ["addy-loop-engineering", "openai-agent-guide", "anthropic-building-effective-agents"],
    coreQuestion: "Loop Engineering 和传统 prompt engineering 的区别是什么？",
    deepQuestion: "如果让一个 Agent 自动跑半小时任务，你会如何设计 state、verifier、schedule 和恢复机制？",
    questionDifficulty: 4,
  },
  {
    id: "agent-state-file-verifier",
    title: "State File、Verifier 与 Schedule",
    categoryId: "loop-engineering-runtime",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["development"],
    prerequisites: ["state-management", "trace-replay", "component-eval"],
    summary: "State file 保存目标、约束、进度、证据和下一步动作，verifier 负责判定是否继续、回滚、重试或交给人。",
    mustRemember: ["state 是事实源索引", "verifier 要看外部证据", "schedule 要有预算和截止条件"],
    details: ["长任务 Agent 不能只依赖聊天历史。", "schedule 负责把任务推进、暂停、恢复和超时策略显式化。"],
    engineeringNotes: ["字段至少包含 goal、constraints、plan、completed_steps、open_risks、artifact_refs、verifier_verdict、next_actions。", "verifier 不接受模型自评，必须读取测试、截图、引用或工具 observation。"],
    commonPitfalls: ["摘要覆盖真实 trace", "verifier 只输出自然语言", "没有版本号导致旧状态覆盖新状态"],
    projectEvidenceIds: ["pe-coding-agent"],
    sourceIds: ["addy-loop-engineering", "openai-agent-guide"],
    coreQuestion: "Agent 的 state file 应该存什么？",
    deepQuestion: "如何设计一个不会被模型自我说服的 verifier？",
    questionDifficulty: 4,
  },
  {
    id: "codex-claude-context-workflow",
    title: "Codex / Claude Code 上下文工作流",
    categoryId: "coding-agent-engineering",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["development"],
    prerequisites: ["coding-harness", "context-compaction", "skills"],
    summary: "现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。",
    mustRemember: ["先读代码再改", "上下文要分层加载", "测试和 diff 是事实证据"],
    details: ["Codex/Claude Code 类工具把聊天界面变成代码任务 runtime。", "subagent、skill、hook 和 memory 都是在降低长任务中的上下文漂移。"],
    engineeringNotes: ["上下文分成任务目标、硬约束、相关文件、测试输出、diff 和历史决策。", "长任务触发 compaction 时要保存 evidence refs，而不是只写聊天摘要。"],
    commonPitfalls: ["把整个仓库塞给模型", "不跑测试就说修好了", "上下文压缩丢用户约束"],
    projectEvidenceIds: ["pe-coding-agent"],
    sourceIds: ["openai-agent-guide", "anthropic-effective-tools"],
    coreQuestion: "Coding Agent 为什么需要上下文工作流，而不是直接让模型写代码？",
    deepQuestion: "如何避免长时间 coding 任务里丢失用户约束和测试证据？",
    questionDifficulty: 4,
  },
  {
    id: "ai-code-review-pipeline",
    title: "AI Code Review Pipeline",
    categoryId: "coding-agent-engineering",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["development"],
    prerequisites: ["coding-harness", "reflection-review", "trace-replay"],
    summary: "AI Code Review 应是确定性规则、diff 分析、上下文检索、LLM review、行级评论和回归指标组成的 pipeline。",
    mustRemember: ["review 先看 diff", "规则和模型互补", "评论要可定位可复核"],
    details: ["好的 AI review 不只是让模型读完整仓库，而是围绕 changed files、dependency impact、test evidence 和风险规则组织上下文。", "LLM 负责语义风险和解释，规则负责确定性门禁。"],
    engineeringNotes: ["记录 finding_type、file、line、evidence、severity、confidence、rule_id、model_version。", "用误报率、漏报率、comment_action_rate 和 review_latency 评估。"],
    commonPitfalls: ["整仓暴力塞上下文", "只输出泛泛建议", "没有误报/漏报评估"],
    projectEvidenceIds: ["pe-coding-agent"],
    sourceIds: ["alibaba-open-code-review", "anthropic-effective-tools"],
    coreQuestion: "AI Code Review 系统应该如何设计？",
    deepQuestion: "如何让 AI Review 评论既能发现真实问题，又不变成噪声？",
    questionDifficulty: 4,
  },
  {
    id: "rag-document-ingestion-stack",
    title: "RAG 文档解析与入库栈",
    categoryId: "rag-data-infrastructure",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["development", "general"],
    prerequisites: ["rag-pipeline", "citation-grounding"],
    summary: "RAG 质量上限由文档解析、结构化、metadata、chunk、索引和引用定位共同决定。",
    mustRemember: ["PDF 解析影响召回上限", "metadata 是排障基础", "Markdown/JSON/HTML 是给 AI 读的中间层"],
    details: ["OpenDataLoader PDF、LiteParse 这类项目说明文档解析已经成为 RAG 基建核心。", "解析器要保留标题、表格、页码、坐标、图片、章节和内容 hash。"],
    engineeringNotes: ["chunk metadata 至少包含 doc_id、page、section、bbox、content_hash、parser_version、permission_scope。", "解析质量要用 table_accuracy、reading_order、citation_span_hit_rate 评估。"],
    commonPitfalls: ["把 PDF 当纯文本", "丢页码和章节", "不记录 parser 版本导致难以回归"],
    projectEvidenceIds: ["pe-paper-agent"],
    sourceIds: ["opendataloader-pdf", "llamaindex-liteparse"],
    coreQuestion: "为什么 PDF 解析会直接影响 RAG 效果？",
    deepQuestion: "如何设计一个可排障、可回归的 RAG 文档入库链路？",
    questionDifficulty: 4,
  },
  {
    id: "self-growing-knowledge-base",
    title: "自生长知识库与企业 Wiki",
    categoryId: "rag-data-infrastructure",
    priority: "follow_up",
    interviewFrequency: "medium",
    roleTags: ["general", "development"],
    prerequisites: ["agentic-rag", "long-term-memory", "citation-grounding"],
    summary: "自生长知识库把文档解析、RAG 问答、Agent 推理和 Wiki 结构化维护结合起来，让知识资产持续更新。",
    mustRemember: ["自动生长必须可追溯", "Wiki 结构不能只靠生成", "更新要有审核和版本"],
    details: ["WeKnora 代表了文档到 RAG、reasoning agent、自维护 Wiki 的趋势。", "企业场景要处理权限、版本、过期内容和知识冲突。"],
    engineeringNotes: ["知识条目保存 source_docs、claims、citations、owner、version、staleness、review_status。", "自动更新需要 human review 或 policy gate。"],
    commonPitfalls: ["让 Agent 自动改知识库但无审核", "无法解释某条知识从哪来", "旧文档污染新答案"],
    projectEvidenceIds: ["pe-paper-agent"],
    sourceIds: ["tencent-weknora", "openai-agent-guide"],
    coreQuestion: "自生长知识库和普通 RAG 有什么区别？",
    deepQuestion: "如何防止自动生成的 Wiki 把错误知识固化下来？",
    questionDifficulty: 4,
  },
  {
    id: "agent-memory-layering-compression",
    title: "Agent Memory 分层与压缩",
    categoryId: "agent-memory-context",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["general", "development"],
    prerequisites: ["short-term-memory", "long-term-memory", "context-compression"],
    summary: "Agent Memory 正在从聊天摘要升级为短期状态、长期经验、符号化压缩、证据引用和按需恢复的分层系统。",
    mustRemember: ["memory 不是无限上下文", "摘要不是事实源", "分层压缩要保留约束和证据引用"],
    details: ["短期记忆服务当前任务，长期记忆保存稳定偏好和经验，RAG 保存外部知识。", "压缩的目标是降低 token，同时不丢硬约束和可验证证据。"],
    engineeringNotes: ["Memory item 字段包含 scope、ttl、confidence、source_trace、privacy_level、last_used_at。", "压缩质量用 lost_constraint_rate、resume_success_rate、token_saving_ratio 评估。"],
    commonPitfalls: ["把所有历史都写进长期记忆", "无隐私分级", "压缩后无法恢复证据"],
    projectEvidenceIds: ["pe-coding-agent"],
    sourceIds: ["openai-agent-guide", "anthropic-building-effective-agents"],
    coreQuestion: "Agent Memory 应该如何分层？",
    deepQuestion: "怎样证明记忆压缩既省 token 又没有丢关键约束？",
    questionDifficulty: 4,
  },
  {
    id: "skill-packaging-workflow",
    title: "Skill 化工作流与能力封装",
    categoryId: "tool-protocol-skill-ecosystem",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["development"],
    prerequisites: ["skills", "mcp-fundamentals", "tool-schema"],
    summary: "Skill 把触发条件、执行步骤、工具契约、模板、参考资料和验证方法封装成 Agent 可加载能力。",
    mustRemember: ["Skill 不是长 prompt", "trigger 和 scope 决定能否稳定复用", "eval 证明 Skill 有价值"],
    details: ["book-to-skill、taste-skill、架构图 skill 都说明工程知识正在被打包成可加载过程资产。", "Skill 要渐进加载，不应把所有材料塞进上下文。"],
    engineeringNotes: ["Skill 包含 trigger、scope、instruction、references、templates、scripts、eval、version。", "指标看 task_success_rate、eval_pass_rate、user_revision_rate。"],
    commonPitfalls: ["trigger 过宽", "模板化严重", "没有版本和回归评测"],
    projectEvidenceIds: ["pe-coding-agent"],
    sourceIds: ["taste-skill", "fireworks-tech-graph", "anthropic-effective-tools"],
    coreQuestion: "Skill 和 Tool、Workflow 的区别是什么？",
    deepQuestion: "如何设计一个可版本化、可评测、不会污染上下文的 Skill？",
    questionDifficulty: 4,
  },
  {
    id: "design-assets-for-ai-coding",
    title: "DESIGN.md 与 AI 可读设计资产",
    categoryId: "tool-protocol-skill-ecosystem",
    priority: "follow_up",
    interviewFrequency: "medium",
    roleTags: ["development"],
    prerequisites: ["skills", "project-storytelling", "web-frontend-backend-contract-observability"],
    summary: "AI 编程质量越来越依赖可被模型读取的设计资产，例如 DESIGN.md、组件规范、视觉参考、交互规则和品牌约束。",
    mustRemember: ["设计资产要机器可读", "审美要变成约束和示例", "输出要能被视觉 QA 验证"],
    details: ["awesome-design-md 和 taste-skill 类项目说明前端 AI 生成正在从组件库转向设计说明和风格约束。", "高质量设计资产能减少默认模板味和返工。"],
    engineeringNotes: ["DESIGN.md 应包含颜色、字体、间距、组件状态、布局规则、禁用模式、示例截图和 QA checklist。", "验证要结合截图、移动端宽度、溢出检查和视觉回归。"],
    commonPitfalls: ["只给审美形容词", "没有负例", "缺少移动端和状态约束"],
    projectEvidenceIds: ["pe-web-agent"],
    sourceIds: ["awesome-design-md", "taste-skill"],
    coreQuestion: "为什么 AI 编程需要 DESIGN.md 这类设计资产？",
    deepQuestion: "如何把抽象审美要求变成 Agent 可执行、可验证的前端约束？",
    questionDifficulty: 3,
  },
  {
    id: "computer-use-agent-benchmark",
    title: "Computer Use Agent 与 OSWorld",
    categoryId: "computer-use-browser-agent",
    priority: "follow_up",
    interviewFrequency: "medium",
    roleTags: ["development", "general"],
    prerequisites: ["browser-observation", "playwright-actions", "web-agent-eval"],
    summary: "Computer Use Agent 把观察和动作扩展到真实桌面环境，评测重点从网页成功率扩展到跨应用任务完成和安全边界。",
    mustRemember: ["真实桌面比浏览器更开放", "benchmark 不等于生产可用", "安全边界必须前置"],
    details: ["Agent S 和 OSWorld 类 benchmark 代表桌面操作 Agent 的发展方向。", "桌面任务需要屏幕观察、窗口状态、文件系统、应用权限和动作恢复。"],
    engineeringNotes: ["trace 字段包含 screenshot_ref、active_app、action_type、target_region、verifier_state、unsafe_action_blocked。", "评测指标包括 task_success_rate、step_error_rate、recovery_rate、unsafe_action_rate。"],
    commonPitfalls: ["用 benchmark 分数替代产品安全评估", "没有敏感操作确认", "截图观察无法复盘"],
    projectEvidenceIds: ["pe-web-agent"],
    sourceIds: ["agent-s", "osworld"],
    coreQuestion: "Computer Use Agent 和 Browser Agent 的工程差异是什么？",
    deepQuestion: "如何评测一个能操作电脑的 Agent 是否可靠和安全？",
    questionDifficulty: 4,
  },
  {
    id: "local-ai-inference-stack",
    title: "Local-first 模型服务与兼容 API",
    categoryId: "local-first-ai-stack",
    priority: "follow_up",
    interviewFrequency: "medium",
    roleTags: ["development"],
    prerequisites: ["llm-foundation", "tool-schema"],
    summary: "Local-first AI 工程栈通过本地模型服务、OpenAI-compatible API、本地向量索引和本地 ASR 降低成本、延迟和隐私风险。",
    mustRemember: ["本地优先不是永远更好", "兼容 API 降低切换成本", "要评估质量、延迟、内存和隐私"],
    details: ["Rapid-MLX 类项目展示了 Apple Silicon 本地推理和 OpenAI-compatible server 的实用价值。", "企业侧常把敏感数据、本地检索、语音识别或小模型工具调用放在本地。"],
    engineeringNotes: ["网关记录 model_id、backend、latency_ms、tokens、memory_usage、fallback_reason、quality_verdict。", "需要 cloud fallback、模型能力探测和请求分级。"],
    commonPitfalls: ["只看成本不看质量", "没有 fallback", "本地服务无监控和限流"],
    projectEvidenceIds: ["pe-coding-agent"],
    sourceIds: ["rapid-mlx"],
    coreQuestion: "什么场景适合 Local-first AI？",
    deepQuestion: "如何设计本地模型和云模型混合的兼容 API 网关？",
    questionDifficulty: 3,
  },
  {
    id: "enterprise-agent-solution-map",
    title: "企业 Agent 方案地图",
    categoryId: "enterprise-agent-solutions",
    priority: "must",
    interviewFrequency: "high",
    roleTags: ["general", "development"],
    prerequisites: ["agent-core-modules", "rag-pipeline", "project-storytelling"],
    summary: "企业 Agent 方案可按问数、问文档、问代码、问业务流程、操作系统和质量治理六类组织，每类都有不同的工具、数据和评测边界。",
    mustRemember: ["先分场景再选架构", "企业方案核心是数据与权限", "项目表达要讲指标和失败"],
    details: ["DataAgent/Text2SQL、知识库客服、AI Code Review、回归测试和项目管理 Agent 都不是同一种系统。", "面试里要能把业务目标映射到数据源、工具、权限、评测和上线边界。"],
    engineeringNotes: ["方案卡字段包含 scenario、users、data_sources、tools、risk_level、eval_metrics、fallback、human_review。", "先用 workflow baseline，再证明 Agent 带来收益。"],
    commonPitfalls: ["所有场景都套 Agent", "没有权限和审计", "没有业务指标"],
    projectEvidenceIds: ["pe-paper-agent", "pe-coding-agent", "pe-web-agent"],
    sourceIds: ["openai-agent-guide", "anthropic-building-effective-agents"],
    coreQuestion: "企业 Agent 方案如何分类和选型？",
    deepQuestion: "如果让你设计一个企业知识库/代码审查/DataAgent，你会如何定义边界、数据和指标？",
    questionDifficulty: 4,
  },
] satisfies TopicSeed[];
```

- [ ] **Step 2: Merge the topic array**

If `src/data/topics.ts` imports topic arrays from `deepSamples.ts`, add `aiEngineeringTrendTopics` to the import and spread it into `topicSeeds`.

Run:

```bash
npm run validate:data
```

Expected: FAIL until questions are added, or PASS if generated questions are derived automatically from topic seeds. If it fails, confirm the failure references missing question bindings for new topics.

## Task 3: Add Interview Questions And Learning Path

**Files:**
- Modify: `src/data/questions.ts`
- Modify: `src/data/learningPaths.ts`

- [ ] **Step 1: Add handwritten question seeds**

Add at least one core question per new topic. Use ids:

```ts
"q-loop-engineering-agent-runtime"
"q-agent-state-file-verifier"
"q-codex-claude-context-workflow"
"q-ai-code-review-pipeline"
"q-rag-document-ingestion-stack"
"q-self-growing-knowledge-base"
"q-agent-memory-layering-compression"
"q-skill-packaging-workflow"
"q-design-assets-for-ai-coding"
"q-computer-use-agent-benchmark"
"q-local-ai-inference-stack"
"q-enterprise-agent-solution-map"
```

Each question must include:

- `topicIds` with the matching topic id.
- `difficulty` between 3 and 5.
- `frequency` aligned with the topic seed.
- A 30-second answer, standard answer, follow-ups, common mistakes, and project expression if the current question model supports those fields.

- [ ] **Step 2: Add the learning path**

In `src/data/learningPaths.ts`, append:

```ts
  {
    id: "ai-engineering-trends-review",
    title: "AI 工程趋势与实战方案复习",
    mode: "intensive",
    description:
      "把 Loop Engineering、Coding Agent、RAG 数据基建、Agent Memory、Skill 化、本地 AI 和企业方案串成能面试也能动手的趋势主线。",
    focusWindow: "趋势补强",
    nodeIds: [
      "loop-engineering-agent-runtime",
      "agent-state-file-verifier",
      "codex-claude-context-workflow",
      "ai-code-review-pipeline",
      "rag-document-ingestion-stack",
      "self-growing-knowledge-base",
      "agent-memory-layering-compression",
      "skill-packaging-workflow",
      "design-assets-for-ai-coding",
      "computer-use-agent-benchmark",
      "local-ai-inference-stack",
      "enterprise-agent-solution-map",
    ],
    exitCriteria: [
      "能把 2026 AI 工程趋势归纳为 loop、context、memory、RAG data、skill、local-first 和 enterprise solution 七条线。",
      "能从至少 6 个开源项目中抽象出可复用架构、指标、失败模式和项目表达。",
      "能把趋势内容连接回现有 Agent/RAG/Coding Agent/后端工程知识点。",
    ],
  },
```

- [ ] **Step 3: Run validation**

Run:

```bash
npm run validate:data
```

Expected: PASS for data shape and learning path node references.

## Task 4: Generate Markdown And Upgrade Three Samples

**Files:**
- Generate: `content/topics/loop-engineering-agent-runtime.md`
- Generate: `content/topics/rag-document-ingestion-stack.md`
- Generate: `content/topics/ai-code-review-pipeline.md`
- Generate: matching `content/questions/*.md`

- [ ] **Step 1: Generate Markdown**

Run:

```bash
npm run generate:markdown-content
```

Expected: topic and question Markdown files are generated for the new ids.

- [ ] **Step 2: Upgrade `loop-engineering-agent-runtime.md` manually**

Ensure it contains:

- `## 趋势判断`
- `## 代表材料`
- Mermaid graph showing goal, state file, planner, executor, verifier, scheduler, artifact store, and human gate.
- A state table with `run_id`, `goal`, `constraints`, `completed_steps`, `open_risks`, `artifact_refs`, `verifier_verdict`, `next_actions`.
- A failure story where the loop keeps executing after a stale state or weak verifier.

- [ ] **Step 3: Upgrade `rag-document-ingestion-stack.md` manually**

Ensure it contains:

- Mermaid flow from PDF/HTML/Docx to parser, structure extraction, chunk metadata, BM25/vector index, rerank, citation verifier.
- A metadata table with `doc_id`, `chunk_id`, `page`, `section_path`, `bbox`, `content_hash`, `parser_version`, `permission_scope`.
- A failure story where citation exists but does not support the claim because table structure or reading order was lost.

- [ ] **Step 4: Upgrade `ai-code-review-pipeline.md` manually**

Ensure it contains:

- Mermaid sequence from PR diff to static rules, context retriever, LLM reviewer, finding normalizer, line comment, metrics.
- A finding schema table with `finding_id`, `file`, `line`, `severity`, `evidence`, `confidence`, `rule_id`, `model_version`.
- A failure story around noisy review comments and how to measure false positive / false negative rates.

## Task 5: Update Coverage Gate And Run Full Verification

**Files:**
- Modify: `scripts/audit-coverage-map.mjs` if needed

- [ ] **Step 1: Inspect coverage gate rules**

Run:

```bash
sed -n '1,260p' scripts/audit-coverage-map.mjs
```

If the script has required domain ids or minimum thresholds, add `ai-engineering-trends` with:

- Minimum categories: 8
- Minimum topics: 12
- Minimum questions: 12

- [ ] **Step 2: Run coverage audit**

Run:

```bash
npm run audit:coverage-map
```

Expected: `ai-engineering-trends` appears with 8 categories, 12 topics, at least 12 questions, and no issues.

- [ ] **Step 3: Run full validation**

Run:

```bash
npm run validate:all
```

Expected: PASS.

- [ ] **Step 4: Run depth and rigor audits**

Run:

```bash
npm run audit:technical-depth
npm run audit:content-rigor
```

Expected: PASS. If `content-rigor` samples the new domain, fix missing diagrams, tables, sources, failure stories, and project expression.

- [ ] **Step 5: Build**

Run:

```bash
npm run build
```

Expected: PASS. The existing Vite large chunk warning is acceptable if exit code is 0.

## Task 6: Browser QA

**Files:**
- No source changes expected unless QA reveals layout issues

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --port 5179
```

Expected: Vite serves on `http://127.0.0.1:5179/`.

- [ ] **Step 2: Desktop smoke check**

Open the site and verify:

- New domain appears in the domain list.
- The `AI 工程趋势与实战方案复习` learning path appears.
- At least one topic detail page renders Mermaid and source links.
- At least one matching question renders answer sections and follow-ups.

- [ ] **Step 3: Mobile smoke check**

Use a 390x844 viewport and verify:

- Long titles do not overflow.
- Mermaid diagrams render as SVG.
- Source links and tables remain readable.
- No horizontal body overflow.

## Self-Review Notes

- Spec coverage: The plan covers domain creation, categories, sources, topics, questions, learning path, generated Markdown, quality upgrades, coverage gate, full validation, build, and browser QA.
- Reserved text scan: No implementation step relies on reserved filler text or an unspecified future action. The only conditional steps are tied to current script behavior and include exact commands.
- Scope check: This plan intentionally avoids adding a new UI. The first release uses existing knowledge/detail/question surfaces.
