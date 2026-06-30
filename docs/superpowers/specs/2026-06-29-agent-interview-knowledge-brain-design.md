# AI Agent 面试知识脑设计文档

日期：2026-06-29

## 1. 背景与目标

用户正在准备两周内开始的 AI Agent 研发工程师类岗位面试。用户不是零基础，学习和复习速度较快，但大量细节需要重新唤醒、系统整理和反复训练。因此产品目标不是做公开展示型作品集，也不是做普通教程站，而是做一个服务个人高效复习的学习工作台。

本产品暂名为 **AI Agent 面试知识脑**。它要把 AgentGuide 等资料中的系统知识、面试题、项目路线和外部权威实践建议重组为一个可检索、可追问、可打卡、可复盘的个人学习系统。

核心目标：

- 两周内帮助用户高强度复习 AI Agent 研发工程师岗位所需知识。
- 全量覆盖重要知识体系，避免为了冲刺而漏掉细节。
- 将知识点和面试题、追问链、工程实现、项目话术绑定。
- 用掌握状态、每日任务和追问训练减少传统学习路径的低效率。
- 第一版本地运行，先保证学习效率，不优先考虑公开发布、SEO、账号系统和复杂后端。

## 2. 设计原则

### 2.1 知识不做薄，入口做聚焦

内容层要覆盖完整的 Agent 工程知识，包括基础概念、RAG、Memory、Context Engineering、Tool Use、Agent Loop、MCP、Multi-Agent、Browser Agent、Coding Agent、评测、安全、部署和简历表达。

界面层按两周面试冲刺重排优先级，把高频必会内容放到首页和每日计划中，扩展内容默认收起但可随时展开。

### 2.2 每个知识点都要能进入面试状态

知识点页面不能只是教程。每个知识点必须包含：

- 核心定义
- 必背结论
- 原理细节
- 工程实现
- 常见坑
- 高频面试题
- 连环追问
- 项目落点
- 推荐资料
- 掌握状态

### 2.3 以 Agent 工程能力为主轴，不以框架名为主轴

框架选型是结果，不是学习主线。主线应该围绕 Agent 系统能力展开：

`Agent 基础 -> Loop -> Tool Use -> State/Memory -> Context Engineering -> RAG -> Planning -> Multi-Agent -> MCP/Skills -> Eval/Observability -> Guardrails/Safety -> Browser/Coding Agent -> 项目表达`

### 2.4 先个人效率，再公开包装

第一版不做营销首页，不做公开作品集包装，不做复杂权限系统。第一屏就是学习工作台，用户打开后直接知道今天学什么、哪里薄弱、哪些题还没过。

### 2.5 知识、题库、项目证据三线互通

同一个主题应在三个视角中出现：

- 知识视角：概念、原理、实现和坑。
- 面试视角：高频题、追问、参考答题结构。
- 项目视角：如何在 Paper Agent、Travel Agent、Web Agent 或 Coding Agent 作品中体现。

## 3. 内容来源与参考材料

首批内容来源：

- AgentGuide: Agent 学习地图  
  https://github.com/adongwanai/AgentGuide/blob/main/docs/00-getting-started/01-agent-map.md
- AgentGuide: 前 7 天学习计划  
  https://github.com/adongwanai/AgentGuide/blob/main/docs/00-getting-started/02-first-7-days.md
- AgentGuide: 高质量资源筛选清单  
  https://github.com/adongwanai/AgentGuide/blob/main/docs/00-getting-started/03-resource-quality-checklist.md
- AgentGuide: 2026 Agent 求职通关路线  
  https://github.com/adongwanai/AgentGuide/blob/main/docs/05-roadmaps/agent-job-ready-roadmap-2026.md
- AgentGuide: Agent 核心面试题库  
  https://github.com/adongwanai/AgentGuide/blob/main/docs/04-interview/03-agent-questions.md
- AgentGuide: Paper Agent / Travel Agent / Web Agent 项目路线  
  https://github.com/adongwanai/AgentGuide/tree/main/projects
- Anthropic: Building effective agents  
  https://www.anthropic.com/engineering/building-effective-agents
- OpenAI: A practical guide to building agents  
  https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf

参考材料的定位：

- AgentGuide 用作中文学习内容、面试题和项目路线的主要骨架。
- Anthropic 用作 Agent / Workflow 边界、简单优先、工具接口设计和可测试性原则参考。
- OpenAI Agent Guide 用作 Agent 组成、工具类型、编排、handoff、guardrails 和生产化思路参考。

## 4. 用户与使用场景

### 4.1 用户画像

用户是有基础的 AI / 后端 / 工程研发人员，目标岗位偏 AI Agent 研发工程师。用户需要快速恢复知识细节，并建立能应对中国技术面试的细密知识网。

### 4.2 主要使用场景

1. 每天打开首页，查看两周冲刺计划和今天必须攻克的主题。
2. 从知识地图进入某个主题，快速复盘核心概念、工程细节和常见坑。
3. 切到面试模式，按题目和追问树训练表达。
4. 对薄弱知识点标记掌握状态，系统在后续每日任务中重复安排。
5. 面试前按岗位方向快速筛选高频题和项目话术。
6. 在项目视图里把知识点映射到 Paper Agent、Web Agent、Travel Agent 或 Coding Agent 的可讲证据。

## 5. 产品路线选择

### 5.1 方案 A：冲刺题库型

以面试题为入口，倒推知识点和答题结构。

优点：

- 两周内见效最快。
- 很适合临面前刷高频问法。
- 页面和数据模型简单。

缺点：

- 知识体系容易碎。
- 题目之间的依赖关系不够清楚。
- 容易背答案而不是形成工程认知。

### 5.2 方案 B：全量知识地图型

以完整知识体系为入口，做成系统化学习地图。

优点：

- 体系完整，适合查漏补缺。
- 长期复用价值高。
- 容易沉淀成个人知识库。

缺点：

- 两周冲刺时焦点不够强。
- 如果没有面试训练层，容易变成漂亮目录。
- 不能直接解决“追问怎么答”的问题。

### 5.3 方案 C：知识地图 + 面试追问 + 每日冲刺

以完整知识体系为底座，上层提供两周冲刺视图和面试追问训练。

优点：

- 不牺牲知识完整度。
- 对两周面试冲刺最友好。
- 知识点、题库和项目表达可以互相跳转。
- 后续可以自然升级为 AI 辅助学习系统。

缺点：

- 首版数据结构比纯题库复杂。
- 需要先整理一批高质量种子内容。

选择：采用方案 C。

## 6. 信息架构

### 6.1 顶层导航

第一版包含 5 个主页面：

1. Dashboard：两周冲刺仪表盘。
2. Knowledge Map：AI Agent 知识地图。
3. Topic Detail：知识点详情。
4. Interview Drill：面试追问训练。
5. Project Track：项目证据路线。

后续可增加：

- Resource Library：资料库。
- Review Queue：遗忘曲线复习队列。
- Mock Interview：模拟面试。
- Content Importer：资料导入和自动结构化。

### 6.2 Dashboard

首页用于回答三个问题：

- 今天学什么？
- 哪些知识点还没掌握？
- 哪些高频题和项目表达还没准备？

主要模块：

- 今日冲刺任务：显示 3-5 个重点主题。
- 两周进度条：显示当前是第几天、整体完成率。
- 掌握度概览：按必会、追问、扩展三层统计。
- 高频题待训练：列出今日需要练的题。
- 薄弱知识点：根据掌握状态和错题自动聚合。
- 项目话术缺口：提示哪些知识还没有绑定项目证据。

### 6.3 Knowledge Map

知识地图以能力模块展示，不按文章目录展示。

一级模块：

1. Agent 基础与边界
2. Agent Loop 与 ReAct
3. Tool Use 与工具接口设计
4. State、Memory 与会话状态
5. Context Engineering
6. RAG 与知识检索
7. Planning 与任务分解
8. Multi-Agent 与协调
9. MCP、Skills、A2A、ACP
10. Evaluation、Observability 与 Trace
11. Guardrails、权限与安全
12. Browser Agent 与 Computer Use
13. Coding Agent 与 Agent Harness
14. 框架选型与生态
15. 项目表达与简历面试

每个模块显示：

- 必会知识点数量
- 已掌握数量
- 高频面试题数量
- 项目证据数量
- 当前优先级

### 6.4 Topic Detail

知识点详情页是学习的核心页面。

固定结构：

1. 一句话定义：用面试时能说出口的方式定义。
2. 必背结论：3-6 条短句，适合临面前快速复习。
3. 原理细节：解释机制、边界和取舍。
4. 工程实现：数据结构、接口、流程、异常处理和性能要点。
5. 常见坑：面试中容易被追问或实际开发中容易踩的点。
6. 高频面试题：直接关联题库。
7. 连环追问树：从基础问题一路追到系统设计和项目细节。
8. 项目落点：这个知识点如何在 Paper/Web/Travel/Coding Agent 中体现。
9. 推荐资料：原始文档、官方指南和阅读顺序。
10. 掌握状态：未学、学习中、能复述、能应答追问、能项目化表达。

### 6.5 Interview Drill

面试训练页按题目、追问链和岗位标签组织。

筛选维度：

- 岗位：开发岗、算法岗、通用。
- 难度：基础、高频、深挖、系统设计。
- 公司：字节、阿里、腾讯、通用。
- 模块：RAG、Memory、Tool Use、Multi-Agent、Eval、Safety 等。
- 状态：未练、答错、待复习、已通过。

训练方式：

- 单题模式：显示一个问题，用户先自己回答，再查看答题结构。
- 追问树模式：按面试官追问方式连续展开。
- 快速复盘模式：只看必背结论和答题骨架。
- 错题模式：重复练习未掌握问题。

每道题绑定：

- 对应知识点
- 标准答题结构
- 面试官可能追问
- 项目化回答模板
- 常见错误回答

### 6.6 Project Track

项目路线不是第一版的主要开发目标，但必须支撑面试表达。

首批项目路线：

- Paper Agent：论文检索、PDF 解析、证据引用、综述生成、幻觉控制。
- Travel Agent：多约束规划、多工具编排、预算和天气、human-in-the-loop。
- Web Agent：Playwright 工具封装、页面观察、动作 trace、网页任务评测。
- Coding Agent：代码库读写、shell、测试反馈、权限确认、上下文压缩、harness。

每条项目线包含：

- 场景价值
- MVP 能力
- 推荐架构
- 工具列表
- 权限边界
- Eval case 类型
- 可讲指标
- 简历 bullet
- 关联知识点

第一版不要求实现这些 Agent，只要求把知识点映射到可讲项目证据，帮助面试表达。

## 7. 两周冲刺策略

用户有基础，因此采用高强度复习节奏。每天默认包含：

- 2-3 个必会主题
- 1 个系统设计/工程深挖主题
- 10-20 道高频题或追问
- 1 个项目表达练习
- 1 次错题和薄弱点回看

### 7.1 第 1 周：主干知识恢复

Day 1：Agent 边界与整体架构

- Chatbot、Workflow、Agent、Multi-Agent、Computer-Use Agent 的区别。
- Goal、State、Context、Tools、Loop、Guardrails、Eval 七模块。
- 为什么很多场景不应该直接上 Agent。

Day 2：Agent Loop、ReAct 与工具调用

- observe -> think -> act -> observe。
- ReAct、Plan-and-Solve、Reflection 的差异。
- tool call / function calling 的 schema、错误和重试。

Day 3：RAG 与知识检索

- chunk、embedding、retrieval、rerank、generation。
- 引用、幻觉、召回率、上下文污染。
- Graph RAG、multimodal RAG 和 agentic RAG 的面试边界。

Day 4：Memory、State 与会话管理

- 短期记忆、长期记忆、工作记忆、用户画像。
- 历史记录多时的检索和压缩。
- 记忆衰退、多用户隔离、并发一致性。

Day 5：Context Engineering

- Prompt Engineering 和 Context Engineering 的区别。
- system、task、memory、retrieved evidence、recent trace 分层。
- 上下文压缩、引用保留、token 成本控制。

Day 6：Evaluation、Trace 与 Observability

- component eval、trajectory eval、end-to-end eval。
- 成功率、步数、成本、延迟、失败类型。
- trace、回放、失败归因和回归测试。

Day 7：Guardrails、安全与权限

- 输入过滤、输出检查、工具权限、human-in-the-loop。
- prompt injection、数据泄漏、越权工具调用、MCP 风险。
- 最小权限、审计日志、sandbox。

### 7.2 第 2 周：深挖、项目化和临面表达

Day 8：MCP、Skills、A2A、ACP

- Tool、Skill、MCP、A2A、ACP 的职责边界。
- MCP server/client、resources、tools、prompts。
- 能力复用、工具发现、权限和安全边界。

Day 9：Multi-Agent 与编排

- planner、executor、reviewer、critic、router。
- supervisor graph、manager pattern、handoff。
- 多 Agent 的上下文隔离、循环、争论和成本膨胀。

Day 10：Browser Agent 与 Computer Use

- DOM、accessibility tree、screenshot、action trace。
- Playwright 工具封装。
- 页面变化、验证码、登录、支付等边界。

Day 11：Coding Agent 与 Harness Engineering

- 真实代码库、shell、文件编辑、测试反馈。
- 权限确认、上下文压缩、子任务、trace。
- SWE-bench、OpenHands、SWE-agent、Claude Code / Codex-style agent 的工程启发。

Day 12：框架选型与生态

- LangGraph、OpenAI Agents SDK、Pydantic AI、AutoGen、CrewAI、LlamaIndex。
- 框架选型不能只背名字，要讲状态、工具、编排、追踪、评测和生产化。
- 什么时候原生 API 更合适，什么时候引入框架。

Day 13：项目表达和系统设计

- Paper Agent、Travel Agent、Web Agent、Coding Agent 四条项目线。
- 每条项目线准备架构、工具、trace、eval、安全、指标。
- 形成可在面试中讲 3-5 分钟的项目故事。

Day 14：总复盘和模拟面试

- 高频题全量回看。
- 薄弱点二次训练。
- 项目话术演练。
- 准备面试开场、自我介绍和反问问题。

## 8. 首批知识体系目录

### 8.1 Agent 基础

- Agent 的定义
- Agent 与 Workflow 的边界
- Agent 与 Chatbot 的区别
- Agent 的核心模块
- Agent 失败模式
- 什么场景不该用 Agent

### 8.2 Agent Loop 与规划

- ReAct
- CoT / ToT / GoT
- Plan-and-Solve
- Reflection
- self-critique
- max steps 和停止条件
- 任务分解和恢复

### 8.3 Tool Use

- Function calling
- tool schema
- tool registry
- tool dispatch
- error code
- retry / timeout
- pagination / truncation
- requires_confirmation
- 工具返回值压缩
- 工具调用评测

### 8.4 State 与 Memory

- session state
- working memory
- short-term memory
- long-term memory
- episodic memory
- semantic memory
- memory retrieval
- memory decay
- memory isolation
- consistency under concurrency

### 8.5 Context Engineering

- context layers
- context builder
- context compression
- retrieved evidence
- recent trace
- citation preservation
- token budget
- prompt injection through context
- context drift

### 8.6 RAG

- chunking
- embedding
- vector database
- hybrid search
- rerank
- query rewrite
- answer grounding
- citation precision
- hallucination detection
- RAG eval
- multimodal RAG
- agentic RAG

### 8.7 Multi-Agent

- planner / executor / reviewer
- supervisor
- manager pattern
- handoff
- decentralized agents
- message protocol
- context isolation
- coordination overhead
- failure recovery

### 8.8 MCP / Skills / 协议

- Tool vs Skill
- MCP client/server
- MCP resources
- MCP tools
- MCP prompts
- A2A
- ACP
- skill packaging
- permission model
- MCP security risks

### 8.9 Eval / Observability

- component eval
- trajectory eval
- end-to-end eval
- LLM-as-judge
- rubric
- benchmark drift
- trace
- replay
- cost tracking
- latency
- failure taxonomy

### 8.10 Guardrails / Safety

- input guardrails
- output guardrails
- tool risk level
- human-in-the-loop
- sandbox
- secret management
- prompt injection
- data exfiltration
- audit log
- least privilege

### 8.11 Browser / Computer Use

- browser observe
- accessibility tree
- DOM summary
- screenshot
- Playwright
- action selector
- verifier
- web task eval
- unsafe web actions
- OSWorld / WebArena

### 8.12 Coding Agent / Harness

- repository context
- file editing
- shell tools
- test feedback
- patch generation
- permissions
- subagents
- context compaction
- issue-to-PR workflow
- SWE-bench

### 8.13 框架与生态

- LangGraph
- OpenAI Agents SDK
- Pydantic AI
- LlamaIndex
- AutoGen
- CrewAI
- DeepEval
- Promptfoo
- Inspect
- BrowserGym

### 8.14 项目与简历表达

- Paper Agent
- Travel Agent
- Web Agent
- Coding Agent
- README
- eval report
- demo script
- 简历 bullet
- 项目追问

## 9. 数据模型

第一版使用前端本地结构化数据，优先 JSON 或 TypeScript 常量。后续可迁移到 SQLite、IndexedDB 或轻量后端。

### 9.1 Topic

```ts
type Topic = {
  id: string;
  title: string;
  category: string;
  priority: "must" | "follow_up" | "extension";
  interviewFrequency: "high" | "medium" | "low";
  roleTags: Array<"development" | "algorithm" | "general">;
  prerequisites: string[];
  summary: string;
  mustRemember: string[];
  details: string[];
  engineeringNotes: string[];
  commonPitfalls: string[];
  questionIds: string[];
  projectEvidenceIds: string[];
  sourceIds: string[];
  mastery: "new" | "learning" | "can_explain" | "can_answer_followups" | "project_ready";
};
```

### 9.2 InterviewQuestion

```ts
type InterviewQuestion = {
  id: string;
  topicIds: string[];
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  roleTags: Array<"development" | "algorithm" | "general">;
  companyTags: string[];
  frequency: "high" | "medium" | "low";
  answerOutline: string[];
  followUps: string[];
  projectAnswerHints: string[];
  commonMistakes: string[];
  status: "new" | "practicing" | "missed" | "passed";
};
```

### 9.3 ProjectEvidence

```ts
type ProjectEvidence = {
  id: string;
  project: "paper-agent" | "travel-agent" | "web-agent" | "coding-agent";
  title: string;
  scenario: string;
  architecturePoints: string[];
  tools: string[];
  evalPoints: string[];
  safetyPoints: string[];
  resumeBullet: string;
  relatedTopicIds: string[];
};
```

### 9.4 SprintTask

```ts
type SprintTask = {
  id: string;
  day: number;
  title: string;
  topicIds: string[];
  questionIds: string[];
  projectEvidenceIds: string[];
  expectedOutcome: string;
  status: "todo" | "doing" | "done";
};
```

## 10. 首版页面交互

### 10.1 Dashboard 交互

- 点击今日主题进入知识点详情。
- 点击高频题进入 Interview Drill。
- 点击薄弱点切换到复习队列。
- 修改掌握状态后，首页统计立即更新。

### 10.2 Knowledge Map 交互

- 支持按必会、追问、扩展过滤。
- 支持按开发岗、算法岗、通用过滤。
- 点击模块展开知识点。
- 点击知识点进入详情页。

### 10.3 Topic Detail 交互

- 支持切换：学习、面试、项目、资料。
- 掌握状态可手动修改。
- 高频题可直接进入训练。
- 项目落点可跳到 Project Track。

### 10.4 Interview Drill 交互

- 用户先看到问题，不立即展示答案。
- 点击后展示答题结构、追问和项目化回答。
- 用户可以标记：答对、模糊、答错。
- 答错题进入复习队列。

### 10.5 Project Track 交互

- 按项目路线查看能力图。
- 每个项目能力点显示关联知识。
- 每条简历 bullet 可展开为面试讲述结构。

## 11. MVP 范围

第一版必须完成：

- 本地可运行 React 单页应用。
- 5 个主页面：Dashboard、Knowledge Map、Topic Detail、Interview Drill、Project Track。
- 至少 40 个核心知识点。
- 至少 80 道面试题或追问。
- 至少 4 条项目证据路线。
- 两周冲刺计划完整呈现。
- 掌握状态和题目状态可在当前浏览器内保存。
- 页面适配桌面优先，同时保证移动端能阅读。

第一版不做：

- 登录注册。
- 云同步。
- 后台管理系统。
- 自动导入 GitHub 全仓内容。
- AI 自动生成答案。
- 公开作品集首页。
- 真实 Agent 项目执行环境。

## 12. 技术方案建议

项目从空目录开始，建议使用：

- Vite
- React
- TypeScript
- Tailwind CSS
- lucide-react
- 本地 JSON / TypeScript 数据文件
- localStorage 保存掌握状态

理由：

- 启动快，适合两周冲刺工具。
- 数据结构稳定后再考虑后端。
- React 状态和组件拆分足够支撑当前交互。
- TypeScript 有利于维护知识点、题库和项目证据的引用关系。

推荐目录：

```text
src/
  app/
    App.tsx
  components/
    dashboard/
    knowledge/
    interview/
    project/
    shared/
  data/
    topics.ts
    questions.ts
    projects.ts
    sprint.ts
    sources.ts
  hooks/
    useProgressStore.ts
  types/
    knowledge.ts
  styles/
    index.css
```

## 13. 视觉与体验方向

整体风格应像高密度学习工作台，而不是营销页。

设计要求：

- 信息密度高，但不拥挤。
- 首页直接进入学习状态。
- 使用清晰的分栏、标签、进度条和状态标记。
- 少用装饰性大图和营销式 hero。
- 用图标区分学习、面试、项目、资料、状态。
- 每个页面保持稳定布局，避免动态内容导致跳动。
- 颜色不做单一蓝紫渐变，使用克制但有层级的中性色和少量强调色。

推荐布局：

- 左侧固定导航。
- 主区域显示当前页面。
- 右侧在详情页中显示目录、掌握状态和关联题目。
- 移动端收起左侧导航，使用顶部切换。

## 14. 验收标准

功能验收：

- 打开网站后能看到两周冲刺计划和今日任务。
- 能从知识地图进入任一核心知识点。
- 任一知识点都能看到学习、面试、项目三个视角。
- 能按模块、岗位、难度筛选题目。
- 能标记知识点掌握状态和题目训练状态。
- 刷新页面后掌握状态不丢失。
- 能查看 Paper Agent、Travel Agent、Web Agent、Coding Agent 四条项目证据线。

内容验收：

- 首批知识体系覆盖 Agent 基础、Loop、Tool Use、Memory、Context、RAG、Multi-Agent、MCP、Eval、Safety、Browser/Coding Agent、框架选型和项目表达。
- 高频题覆盖 AgentGuide 中核心 Agent 面试题，并补足工程追问。
- 每个必会主题至少有 3 个追问和 1 个项目落点。

体验验收：

- 桌面端首屏不出现营销页。
- 主要学习路径不超过 2 次点击。
- 字体、卡片和按钮在移动端不重叠。
- 题库训练不会一次性暴露答案。

工程验收：

- `npm run build` 成功。
- 无 TypeScript 类型错误。
- 数据引用关系能通过简单校验脚本检查：题目引用的 topicId、项目引用的 topicId 都存在。
- 本地 dev server 可访问并完成基本交互。

## 15. 风险与应对

风险 1：内容量过大导致第一版开发拖慢。

应对：第一版先放 40 个核心知识点和 80 道题，数据结构支持继续扩展。

风险 2：做成知识目录，不能提升面试表现。

应对：每个知识点强制绑定面试题、追问和项目落点。

风险 3：两周冲刺过于焦虑，学习顺序混乱。

应对：首页只显示当天最重要任务，扩展内容默认折叠。

风险 4：后续想自动导入资料时数据结构不够用。

应对：Topic、Question、ProjectEvidence、Source 分离，避免把内容写死在组件中。

风险 5：本地状态丢失。

应对：第一版用 localStorage；后续可导出 JSON 备份。

## 16. 后续演进

第二阶段可以增加：

- 资料导入器：从 GitHub markdown 拉取内容并映射到 Topic。
- AI 辅助总结：把长文压缩成必背结论和追问。
- 模拟面试：按岗位连续提问并记录回答。
- 错题复习算法：按遗忘曲线安排复习。
- 本地 SQLite 或 IndexedDB：存储更细粒度学习记录。
- 个人知识导出：生成面试前速查手册。

第三阶段可以增加：

- 真实项目工作台：跟踪 Paper Agent / Web Agent 的实现进度。
- Eval case 管理：为项目准备可展示的评测表。
- 简历 bullet 生成和项目讲述训练。

## 17. 下一步实施计划入口

设计获批后进入实施计划阶段。建议实施顺序：

1. 初始化 Vite + React + TypeScript 项目。
2. 建立类型和种子数据。
3. 搭建主布局和导航。
4. 实现 Dashboard。
5. 实现 Knowledge Map 和 Topic Detail。
6. 实现 Interview Drill。
7. 实现 Project Track。
8. 增加 localStorage 进度保存。
9. 增加数据引用校验脚本。
10. 运行 build 和浏览器验收。

