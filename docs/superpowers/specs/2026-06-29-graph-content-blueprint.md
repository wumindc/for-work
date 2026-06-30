# Graph Guided Learning 内容蓝图

日期：2026-06-29

## 1. 目标

这份蓝图用于把当前 47 个 AI Agent 面试知识点重组为 Graph Guided Learning 的第一版内容骨架。它不改产品代码，只定义后续可直接转成 `learningPaths.ts` 和 `graphEdges.ts` 的路径、边、展示规则与验收标准。

核心目标：

- 两周内服务高效复习，而不是做百科式知识库。
- 主体验从“菜单里找列表”切换为“沿图谱路径推进”。
- 图谱必须能回答：先学什么、为什么学这个、学完接哪个追问、如何落到项目表达。
- 旧列表页保留为辅助入口，但不再驱动主学习流。

## 2. 图谱对象边界

第一阶段只把 `Topic` 作为主图节点，其他对象作为证据和动作挂在节点详情中。

主节点：

- `topic`：47 个知识点，是 Graph Canvas 的主要节点。

辅助节点：

- `project`：4 条项目证据线，用于展示知识点如何落到项目。
- `milestone`：Day 1-14、路径 checkpoint、面前总复盘，可从 `SprintTask` 派生。
- `question`：不常驻主图，只在右侧 Node Inspector 里作为训练动作出现。

第一阶段不引入后端、图数据库、复杂自动布局。用静态路径、静态边和固定布局即可。

## 3. 学习路径

路径不是菜单分类，而是“有顺序、有通关条件、有面试目的”的图上路线。每个 topic 第一阶段至少进入一条主路径。

### Path A：Agent 工程主干

定位：两周冲刺的默认主线，先建立 Agent 面试的总框架。

节点序列：

1. `agent-definition`：Agent 的定义
2. `workflow-vs-agent`：Workflow 与 Agent 的边界
3. `agent-core-modules`：Agent 七个核心模块
4. `agent-failure-modes`：Agent 常见失败模式
5. `react-loop`：ReAct 与 Agent Loop
6. `planning-methods`：规划方法：CoT / ToT / Plan-and-Solve
7. `reflection-review`：Reflection 与自我审查
8. `tool-schema`：工具 Schema 设计
9. `function-calling`：Function Calling 机制
10. `tool-registry`：工具注册与调度
11. `tool-error-recovery`：工具失败恢复
12. `state-management`：Agent State 管理
13. `short-term-memory`：短期记忆与工作记忆
14. `context-layers`：Context 分层
15. `component-eval`：Component Eval
16. `trajectory-eval`：Trajectory Eval
17. `trace-replay`：Trace 与回放
18. `guardrails`：Guardrails 分层防护

通关标准：

- 能用“定义、边界、模块、循环、工具、状态、上下文、评测、安全”讲清 Agent 工程全局。
- 能解释 Workflow 和 Agent 的区别，以及什么场景不该用 Agent。
- 至少通过 6 道本路径高频题。
- 能把失败模式和评测/Trace/Guardrails 连接成排障叙事。

### Path B：RAG / Memory / Context 深挖

定位：覆盖中国面试里高频追问的 RAG、记忆、上下文和证据可靠性。

节点序列：

1. `long-term-memory`：长期记忆
2. `memory-decay`：记忆衰退与污染控制
3. `context-compression`：上下文压缩与保真
4. `rag-pipeline`：RAG 全流程
5. `hybrid-search`：混合检索
6. `rerank`：Rerank 与证据筛选
7. `citation-grounding`：引用与 Grounding
8. `agentic-rag`：Agentic RAG

通关标准：

- 能从数据摄入、切分、索引、检索、重排、生成、引用、评测讲完整 RAG。
- 能说明长期记忆和 RAG 的边界：一个偏用户/任务状态，一个偏外部知识证据。
- 能回答上下文压缩为什么会损伤事实一致性，以及如何评估保真。
- 能把 Paper Agent 项目线讲成可追溯、可评测、可防幻觉的系统。

### Path C：Tool / Protocol / Multi-Agent 工程

定位：把工具调用、协议、权限、多 Agent 和框架选型连成工程落地路径。

节点序列：

1. `mcp-fundamentals`：MCP 基础
2. `skills`：Skills 与能力封装
3. `a2a-acp`：A2A 与 ACP
4. `multi-agent-roles`：多 Agent 角色分工
5. `handoff-pattern`：Handoff 与编排模式
6. `tool-permissions`：工具权限与 Human-in-the-loop
7. `prompt-injection`：Prompt Injection 与数据泄漏
8. `sandbox`：Sandbox 与执行隔离
9. `framework-selection`：Agent 框架选型
10. `langgraph`：LangGraph
11. `openai-agents-sdk`：OpenAI Agents SDK

通关标准：

- 能讲清 Tool Schema、Function Calling、MCP、Skills 的边界关系。
- 能回答多 Agent 的收益、成本、失败模式和编排方式。
- 能解释 Human-in-the-loop、权限、安全隔离如何进入工具执行链。
- 能在 LangGraph / Agents SDK / 自研之间做有约束的技术选型。

### Path D：Web / Coding Agent 与项目表达

定位：把浏览器 Agent、Coding Agent 和项目讲述打通，形成面试里的项目证据。

节点序列：

1. `browser-observation`：Browser Agent 观察层
2. `playwright-actions`：Playwright 动作封装
3. `web-agent-eval`：Web Agent 评测
4. `coding-harness`：Coding Agent Harness
5. `context-compaction`：Coding Agent 上下文压缩
6. `swe-bench`：SWE-bench 与代码任务评测
7. `project-storytelling`：项目讲述结构
8. `paper-agent-project`：Paper Agent 项目线
9. `travel-agent-project`：Travel Agent 项目线
10. `web-agent-project`：Web Agent 项目线

通关标准：

- 能讲清 Browser Agent 的 observe-act-evaluate 闭环。
- 能说明 Coding Agent Harness 如何管理仓库上下文、shell、测试、补丁和回放。
- 能把 Paper / Travel / Web / Coding 四条项目线压缩成面试可讲的系统设计。
- 能把一个知识点映射到项目证据、指标、失败案例和改进动作。

## 4. 覆盖矩阵

| Category | 覆盖 topic | 主路径 |
| --- | --- | --- |
| Agent 基础与边界 | `agent-definition`, `workflow-vs-agent`, `agent-core-modules`, `agent-failure-modes` | A |
| Agent Loop 与 ReAct | `react-loop` | A |
| Planning 与任务分解 | `planning-methods`, `reflection-review` | A |
| Tool Use 与工具接口 | `tool-schema`, `function-calling`, `tool-registry`, `tool-error-recovery` | A |
| State 与 Memory | `state-management`, `short-term-memory`, `long-term-memory`, `memory-decay` | A, B |
| Context Engineering | `context-layers`, `context-compression` | A, B |
| RAG 与知识检索 | `rag-pipeline`, `hybrid-search`, `rerank`, `citation-grounding`, `agentic-rag` | B |
| Multi-Agent 与协调 | `multi-agent-roles`, `handoff-pattern` | C |
| MCP、Skills、A2A、ACP | `mcp-fundamentals`, `skills`, `a2a-acp` | C |
| Eval、Trace 与 Observability | `component-eval`, `trajectory-eval`, `trace-replay` | A |
| Guardrails 与安全 | `guardrails`, `tool-permissions`, `prompt-injection`, `sandbox` | A, C |
| Browser Agent 与 Computer Use | `browser-observation`, `playwright-actions`, `web-agent-eval` | D |
| Coding Agent 与 Harness | `coding-harness`, `context-compaction`, `swe-bench` | D |
| 框架选型与生态 | `framework-selection`, `langgraph`, `openai-agents-sdk` | C |
| 项目表达与简历面试 | `project-storytelling`, `paper-agent-project`, `travel-agent-project`, `web-agent-project` | D |

覆盖结论：47 个 topic 全部进入至少一条路径。第一阶段建议每个 topic 只放一条主路径，跨路径关系用边表达，避免路径本身变成重复列表。

## 5. 边的生成策略

边分为三层。

第一层：直接派生边。

- `Topic.prerequisites` 生成 `prerequisite`。
- `LearningPath.nodeIds` 相邻节点生成 `same_path`。
- `ProjectEvidence.relatedTopicIds` 和 `Topic.projectEvidenceIds` 生成 `project_evidence`。
- `SprintTask.topicIds` 相邻节点生成 `review_after` 或 `same_day` 候选，但第一阶段不必常驻主图。

第二层：人工核心边。

- 用 `builds_on` 表示工程递进。
- 用 `contrasts` 表示面试常见对比题。
- 用 `extends` 表示从基础主题扩展到专项主题。
- 用 `interview_followup` 表示一问之后最自然的追问。

第三层：进度临时边。

- 错题关联 topic，生成临时 `review_after`。
- 当前节点前置未掌握，生成 blocker 边。
- 项目表达不足，高亮 `project_evidence` 边。

## 6. 第一阶段边清单

### 6.1 `prerequisite` 派生边

这些边应全部从现有 `Topic.prerequisites` 自动生成，方向为“前置知识 -> 当前知识”。

- `agent-definition -> workflow-vs-agent`
- `agent-definition -> agent-core-modules`
- `agent-core-modules -> agent-failure-modes`
- `agent-definition -> react-loop`
- `react-loop -> planning-methods`
- `planning-methods -> reflection-review`
- `react-loop -> tool-schema`
- `tool-schema -> tool-registry`
- `tool-schema -> tool-error-recovery`
- `agent-failure-modes -> tool-error-recovery`
- `tool-schema -> function-calling`
- `agent-core-modules -> state-management`
- `state-management -> short-term-memory`
- `state-management -> long-term-memory`
- `long-term-memory -> memory-decay`
- `state-management -> context-layers`
- `context-layers -> context-compression`
- `context-layers -> rag-pipeline`
- `rag-pipeline -> hybrid-search`
- `hybrid-search -> rerank`
- `rag-pipeline -> citation-grounding`
- `rag-pipeline -> agentic-rag`
- `react-loop -> agentic-rag`
- `agent-definition -> multi-agent-roles`
- `planning-methods -> multi-agent-roles`
- `multi-agent-roles -> handoff-pattern`
- `tool-schema -> mcp-fundamentals`
- `tool-schema -> skills`
- `multi-agent-roles -> a2a-acp`
- `mcp-fundamentals -> a2a-acp`
- `rag-pipeline -> component-eval`
- `tool-schema -> component-eval`
- `react-loop -> trajectory-eval`
- `component-eval -> trajectory-eval`
- `react-loop -> trace-replay`
- `trajectory-eval -> trace-replay`
- `tool-schema -> guardrails`
- `guardrails -> tool-permissions`
- `tool-registry -> tool-permissions`
- `context-layers -> prompt-injection`
- `guardrails -> prompt-injection`
- `tool-permissions -> sandbox`
- `context-layers -> browser-observation`
- `tool-schema -> browser-observation`
- `browser-observation -> playwright-actions`
- `tool-permissions -> playwright-actions`
- `playwright-actions -> web-agent-eval`
- `trajectory-eval -> web-agent-eval`
- `tool-registry -> coding-harness`
- `state-management -> coding-harness`
- `sandbox -> coding-harness`
- `coding-harness -> context-compaction`
- `context-compression -> context-compaction`
- `coding-harness -> swe-bench`
- `trajectory-eval -> swe-bench`
- `agent-core-modules -> framework-selection`
- `react-loop -> framework-selection`
- `framework-selection -> langgraph`
- `state-management -> langgraph`
- `framework-selection -> openai-agents-sdk`
- `handoff-pattern -> openai-agents-sdk`
- `guardrails -> openai-agents-sdk`
- `agent-core-modules -> project-storytelling`
- `component-eval -> project-storytelling`
- `guardrails -> project-storytelling`
- `rag-pipeline -> paper-agent-project`
- `citation-grounding -> paper-agent-project`
- `trajectory-eval -> paper-agent-project`
- `tool-permissions -> travel-agent-project`
- `planning-methods -> travel-agent-project`
- `handoff-pattern -> travel-agent-project`
- `browser-observation -> web-agent-project`
- `playwright-actions -> web-agent-project`
- `web-agent-eval -> web-agent-project`

### 6.2 `same_path` 派生边

这些边从 4 条 `LearningPath.nodeIds` 的相邻节点生成。它们用于路径模式，不一定在全图默认展示。

Path A：

- `agent-definition -> workflow-vs-agent`
- `workflow-vs-agent -> agent-core-modules`
- `agent-core-modules -> agent-failure-modes`
- `agent-failure-modes -> react-loop`
- `react-loop -> planning-methods`
- `planning-methods -> reflection-review`
- `reflection-review -> tool-schema`
- `tool-schema -> function-calling`
- `function-calling -> tool-registry`
- `tool-registry -> tool-error-recovery`
- `tool-error-recovery -> state-management`
- `state-management -> short-term-memory`
- `short-term-memory -> context-layers`
- `context-layers -> component-eval`
- `component-eval -> trajectory-eval`
- `trajectory-eval -> trace-replay`
- `trace-replay -> guardrails`

Path B：

- `long-term-memory -> memory-decay`
- `memory-decay -> context-compression`
- `context-compression -> rag-pipeline`
- `rag-pipeline -> hybrid-search`
- `hybrid-search -> rerank`
- `rerank -> citation-grounding`
- `citation-grounding -> agentic-rag`

Path C：

- `mcp-fundamentals -> skills`
- `skills -> a2a-acp`
- `a2a-acp -> multi-agent-roles`
- `multi-agent-roles -> handoff-pattern`
- `handoff-pattern -> tool-permissions`
- `tool-permissions -> prompt-injection`
- `prompt-injection -> sandbox`
- `sandbox -> framework-selection`
- `framework-selection -> langgraph`
- `langgraph -> openai-agents-sdk`

Path D：

- `browser-observation -> playwright-actions`
- `playwright-actions -> web-agent-eval`
- `web-agent-eval -> coding-harness`
- `coding-harness -> context-compaction`
- `context-compaction -> swe-bench`
- `swe-bench -> project-storytelling`
- `project-storytelling -> paper-agent-project`
- `paper-agent-project -> travel-agent-project`
- `travel-agent-project -> web-agent-project`

### 6.3 `builds_on` 人工边

这些边表达“工程能力递进”，建议作为第一阶段显式边写入。

- `agent-definition -> agent-core-modules`：定义之后才能拆模块。
- `workflow-vs-agent -> agent-failure-modes`：边界不清会直接导致误用和失败。
- `agent-core-modules -> state-management`：状态是 Agent 模块协作的承载层。
- `react-loop -> tool-schema`：行动能力需要可调用的工具接口。
- `tool-schema -> function-calling`：Function Calling 是 Schema 落地形态。
- `function-calling -> tool-registry`：多个工具需要注册、选择和调度。
- `tool-registry -> tool-error-recovery`：工具系统必须处理失败和重试。
- `state-management -> context-layers`：上下文是状态进入模型窗口的表达。
- `context-layers -> context-compression`：分层之后才谈压缩策略。
- `context-layers -> rag-pipeline`：RAG 是外部证据进入上下文的通道。
- `rag-pipeline -> hybrid-search`：检索质量决定后续证据上限。
- `hybrid-search -> rerank`：重排是候选证据筛选的关键层。
- `rag-pipeline -> citation-grounding`：引用是 RAG 可解释性和可追溯性的出口。
- `citation-grounding -> agentic-rag`：Agentic RAG 需要可控证据闭环。
- `component-eval -> trajectory-eval`：先评组件，再评完整轨迹。
- `trajectory-eval -> trace-replay`：轨迹评测需要可回放材料支撑归因。
- `guardrails -> tool-permissions`：安全策略进入工具执行链。
- `tool-permissions -> sandbox`：权限之后是执行隔离。
- `mcp-fundamentals -> skills`：协议能力可以进一步封装为可复用技能。
- `multi-agent-roles -> handoff-pattern`：角色分工之后才有交接编排。
- `framework-selection -> langgraph`：LangGraph 是图式状态编排代表。
- `framework-selection -> openai-agents-sdk`：Agents SDK 是内置工具、安全和 handoff 的工程框架。
- `browser-observation -> playwright-actions`：浏览器任务先观察再行动。
- `playwright-actions -> web-agent-eval`：动作可控之后才能评测任务完成度。
- `coding-harness -> context-compaction`：Coding Agent 的长任务需要压缩上下文。
- `context-compaction -> swe-bench`：代码任务评测会暴露压缩和状态管理问题。
- `project-storytelling -> paper-agent-project`：先掌握讲述结构，再填项目证据。
- `project-storytelling -> travel-agent-project`
- `project-storytelling -> web-agent-project`

### 6.4 `contrasts` 人工边

这些边用于高频对比题和认知校准，建议双向展示，但数据里可只存一条并标记 `bidirectional` 或渲染时双向。

- `workflow-vs-agent <-> react-loop`：静态编排和动态循环的差异。
- `workflow-vs-agent <-> multi-agent-roles`：固定流程和协作式任务拆分的差异。
- `function-calling <-> mcp-fundamentals`：模型调用协议和外部工具协议的差异。
- `mcp-fundamentals <-> a2a-acp`：工具上下文协议和 Agent 间协议的差异。
- `short-term-memory <-> long-term-memory`：工作记忆和持久记忆的差异。
- `rag-pipeline <-> long-term-memory`：外部知识检索和用户/任务记忆的差异。
- `rag-pipeline <-> agentic-rag`：固定 RAG 流水线和主动检索规划的差异。
- `component-eval <-> trajectory-eval`：单组件指标和完整行为轨迹指标的差异。
- `guardrails <-> sandbox`：策略防护和执行隔离的差异。
- `prompt-injection <-> citation-grounding`：攻击面和证据约束的对抗关系。
- `langgraph <-> openai-agents-sdk`：图式编排框架和 Agent SDK 的选型差异。
- `browser-observation <-> playwright-actions`：观察层和动作层的边界。
- `web-agent-eval <-> swe-bench`：网页任务评测和代码任务评测的差异。

### 6.5 `extends` 人工边

这些边表达“从基础主题扩展到专项主题”。

- `planning-methods -> multi-agent-roles`：规划复杂度上升后进入角色分工。
- `planning-methods -> travel-agent-project`：旅行规划是多约束 planning 的项目化表达。
- `tool-schema -> mcp-fundamentals`：工具接口扩展到协议化工具上下文。
- `tool-schema -> skills`：工具接口扩展到能力封装。
- `tool-registry -> coding-harness`：工具调度扩展到代码任务执行环境。
- `context-layers -> browser-observation`：页面观察是上下文构造的一种场景化实现。
- `context-compression -> context-compaction`：通用压缩扩展到 Coding Agent 长上下文保真。
- `rag-pipeline -> agentic-rag`：RAG 扩展到主动计划和多轮检索。
- `guardrails -> prompt-injection`：安全框架扩展到注入与泄漏防护。
- `trajectory-eval -> web-agent-eval`：轨迹评测扩展到网页任务。
- `trajectory-eval -> swe-bench`：轨迹评测扩展到代码任务。
- `handoff-pattern -> openai-agents-sdk`：handoff 模式扩展到 SDK 实现。
- `citation-grounding -> paper-agent-project`：引用能力扩展到论文综述项目。
- `browser-observation -> web-agent-project`：观察能力扩展到 Web Agent 项目。
- `coding-harness -> web-agent-project`：自动化执行经验可复用到 Web Agent 项目叙事。

### 6.6 `interview_followup` 人工边

这些边驱动右侧 Node Inspector 的“下一道追问”。

- `agent-definition -> workflow-vs-agent`：如果你说 Agent 是自主系统，那和 Workflow 区别是什么？
- `workflow-vs-agent -> agent-failure-modes`：哪些场景不适合 Agent？
- `agent-core-modules -> framework-selection`：这些模块在框架里分别由谁负责？
- `react-loop -> planning-methods`：ReAct 不够时怎么做更复杂规划？
- `planning-methods -> reflection-review`：计划错了如何自我修正？
- `tool-schema -> function-calling`：Schema 如何约束模型输出？
- `function-calling -> tool-error-recovery`：工具调用失败时怎么恢复？
- `tool-registry -> tool-permissions`：工具很多时如何做权限和审批？
- `state-management -> short-term-memory`：会话内状态怎么维护？
- `state-management -> long-term-memory`：跨会话记忆如何设计？
- `long-term-memory -> memory-decay`：记忆污染和过期怎么处理？
- `context-layers -> prompt-injection`：不同上下文层如何避免污染？
- `context-compression -> context-compaction`：压缩后如何保证关键事实不丢？
- `rag-pipeline -> hybrid-search`：纯向量检索不够时怎么做？
- `hybrid-search -> rerank`：检索结果太多或不准如何筛？
- `rag-pipeline -> citation-grounding`：如何证明回答有依据？
- `rag-pipeline -> agentic-rag`：什么时候需要 Agentic RAG？
- `component-eval -> trajectory-eval`：单点指标通过但任务失败怎么办？
- `trajectory-eval -> trace-replay`：失败如何复现和归因？
- `trace-replay -> agent-failure-modes`：Trace 里怎么归类失败？
- `guardrails -> tool-permissions`：安全策略如何进入工具链？
- `tool-permissions -> sandbox`：高风险执行如何隔离？
- `mcp-fundamentals -> skills`：MCP 和 Skills 各自解决什么？
- `mcp-fundamentals -> a2a-acp`：MCP 和 A2A/ACP 的边界在哪里？
- `multi-agent-roles -> handoff-pattern`：多 Agent 怎么交接上下文和责任？
- `framework-selection -> langgraph`：什么场景适合 LangGraph？
- `framework-selection -> openai-agents-sdk`：什么场景适合 Agents SDK？
- `browser-observation -> playwright-actions`：观察结果如何转成动作？
- `playwright-actions -> web-agent-eval`：动作成功和任务成功如何区分？
- `coding-harness -> context-compaction`：长代码任务怎么保留关键上下文？
- `coding-harness -> swe-bench`：如何用 benchmark 评价 Coding Agent？
- `project-storytelling -> paper-agent-project`：RAG 知识怎么讲成项目？
- `project-storytelling -> travel-agent-project`：Planning / Handoff 怎么讲成项目？
- `project-storytelling -> web-agent-project`：Browser Agent 怎么讲成项目？

### 6.7 `project_evidence` 核心边

这些边用于项目模式高亮。第一阶段可从 `ProjectEvidence.relatedTopicIds` 生成核心边，再用 `Topic.projectEvidenceIds` 作为弱边补充。

Paper Agent：

- `rag-pipeline -> pe-paper-agent`
- `citation-grounding -> pe-paper-agent`
- `agentic-rag -> pe-paper-agent`
- `component-eval -> pe-paper-agent`
- `trajectory-eval -> pe-paper-agent`
- `paper-agent-project -> pe-paper-agent`

Travel Agent：

- `workflow-vs-agent -> pe-travel-agent`
- `planning-methods -> pe-travel-agent`
- `tool-permissions -> pe-travel-agent`
- `handoff-pattern -> pe-travel-agent`
- `travel-agent-project -> pe-travel-agent`

Web Agent：

- `browser-observation -> pe-web-agent`
- `playwright-actions -> pe-web-agent`
- `web-agent-eval -> pe-web-agent`
- `prompt-injection -> pe-web-agent`
- `trace-replay -> pe-web-agent`
- `web-agent-project -> pe-web-agent`

Coding Agent：

- `coding-harness -> pe-coding-agent`
- `context-compaction -> pe-coding-agent`
- `swe-bench -> pe-coding-agent`
- `tool-registry -> pe-coding-agent`
- `sandbox -> pe-coding-agent`
- `project-storytelling -> pe-coding-agent`

## 7. 边强度规则

`strength = 3`：

- 强前置关系。
- 高频面试追问关系。
- 项目表达的核心证据关系。
- 当前节点周围一跳必须展示。

`strength = 2`：

- 路径推进关系。
- 工程递进关系。
- 重要扩展关系。
- 默认全图可展示，但可被筛选。

`strength = 1`：

- 弱项目关联。
- 同日复习关系。
- 低频对比或远距离补充关系。
- 默认全图隐藏，只在当前节点详情或筛选模式展示。

默认展示规则：

- Guided Home：只展示当前路径段的 `same_path`、当前节点强前置、下一步追问。
- Graph Canvas：默认展示 `strength >= 2`，当前节点一跳展示全部。
- Interview Mode：优先展示 `interview_followup`。
- Project Mode：优先展示 `project_evidence`。
- Review Mode：优先展示错题触发的 `review_after` 和 blocker。

## 8. 首页内容重组

首页不再以统计和列表作为主体验，而是回答 5 个问题。

1. 当前在哪条路径、哪个节点？
2. 下一步推荐学什么？
3. 推荐原因是什么？
4. 学完立刻做哪道题或哪个追问？
5. 这个节点如何落到项目证据？

首页首屏建议：

- 当前路径段：展示 5-7 个节点的小型路线图。
- Next Best Node：展示推荐节点、原因、前置 blocker、主按钮。
- 今日闭环：学节点、答题、追问、项目表达、复盘。

首页下半区降级保留：

- 4 条路径进度。
- 高频未通关节点。
- 项目证据缺口。
- Review Queue、Mock Interview、Cheat Sheet、Project Track 快速入口。

## 9. 三栏式主界面内容

左栏 Path Rail：

- 4 条路径切换。
- 当前 Day 与两周倒计时。
- 路径节点序列和状态。
- 辅助入口：Review Queue、Mock、Cheat Sheet、Project。

中栏 Graph Canvas：

- 默认展示当前路径。
- 当前节点居中，前置节点在左，后续节点在右，项目证据在下方。
- 支持切换：路径视图、面试追问视图、项目证据视图、薄弱节点视图。

右栏 Node Inspector：

- 节点定义：一句话定义、核心模型、必须记住。
- 关系解释：为什么前置、为什么下一步。
- 面试训练：关联题、追问、常见坑。
- 项目表达：可挂到哪条项目线，怎么讲指标和失败案例。
- 动作按钮：标记掌握、去答题、加入复习、打开项目证据。

## 10. 现有页面处理

保留但降级为辅助入口：

- `KnowledgeMap`：后续可被 Graph Canvas 替代；第一阶段保留作为旧列表知识地图。
- `TopicDetail`：保留，Node Inspector 可复用其内容结构。
- `InterviewDrill`：保留，作为节点动作打开。
- `ReviewQueue`：保留，作为错题和薄弱节点入口。
- `CheatSheet`：保留，作为当前节点速查。
- `ProjectTrack`：保留，作为项目证据详情。
- `MockInterview`：保留，作为路径通关后的综合训练。

降级策略：

- 顶部导航不再把所有页面并列展示。
- 旧列表页入口放到 Path Rail 或首页下半区。
- 默认落点改为 Graph Guided Learning。
- 列表页不再继续做大规模菜单扩展。

## 11. 最小可落地切片

第一阶段只做“数据可验 + 三栏可用 + 旧页可达”。

必须包含：

- 4 条 `LearningPath`，覆盖 47 个 topic。
- `KnowledgeEdge` 类型和 `graphEdges` 数据。
- 从 `Topic.prerequisites`、`LearningPath.nodeIds`、`ProjectEvidence.relatedTopicIds` 派生边。
- 至少 100 条图谱边，包含 prerequisite、same_path、builds_on、contrasts、extends、interview_followup、project_evidence。
- `validate:graph` 校验所有节点引用、边引用、路径覆盖和边强度。
- 首页默认展示 Graph Guided Learning。
- 三栏布局可选择路径、选择节点、查看关系、进入答题/项目/复习。

暂不包含：

- 图数据库。
- 自动布局引擎。
- 登录和云同步。
- AI 自动生成路径。
- 大规模搜索和复杂过滤。
- 把 question/project 全部绘制成常驻节点。

## 12. 验收标准

内容验收：

- 47 个 topic 均被至少一条 LearningPath 覆盖。
- 每条路径有清晰面试目的和通关标准。
- 每个 `must` priority topic 至少有一条强边。
- 高频 topic 至少有一个面试追问出口。
- 4 条项目证据线均有 topic 入口。

数据验收：

- 所有 edge 的 `from` / `to` 都能解析到 topic 或 project evidence。
- 所有 path 的 `nodeIds` 都能解析到 topic。
- edge id 稳定且唯一，建议格式：`edge-<kind>-<from>-to-<to>`。
- `strength` 只能是 `1 | 2 | 3`。
- `reason` 不为空，且能解释这条边为什么对复习有用。

产品验收：

- 打开应用第一屏看到的是路径和下一节点，不是列表仪表盘。
- 用户无需理解菜单结构，就能开始今天的学习。
- 从任一节点能进入：知识详情、面试题、追问、项目表达。
- 旧页面仍可访问，但不抢主体验。

## 13. 两周节奏映射

- Day 1-2：Path A 前半段，Agent 边界、模块、Loop、Tool。
- Day 3：Path B 的 RAG 主体。
- Day 4：Path A/B 的 State、Memory、Context。
- Day 5：Path B 的压缩、Grounding、注入风险。
- Day 6：Path A 的 Eval、Trace、失败归因。
- Day 7：Path C 的权限、安全、Sandbox。
- Day 8：Path C 的 MCP、Skills、A2A/ACP。
- Day 9：Path C 的 Multi-Agent、Handoff、Reflection。
- Day 10：Path D 的 Browser Agent。
- Day 11：Path D 的 Coding Agent。
- Day 12：Path C 的框架选型。
- Day 13：Path D 的项目表达。
- Day 14：全图薄弱节点、Mock Interview、Cheat Sheet 总复盘。

这个节奏不要求用户每天只学当天节点。它只是 Graph Guided Learning 的默认推荐顺序；如果用户已有基础，可以跳过已掌握节点，但系统必须保留前置 blocker 和面试追问提示。
