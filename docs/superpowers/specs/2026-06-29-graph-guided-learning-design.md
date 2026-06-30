# Graph Guided Learning 改造设计

日期：2026-06-29

## 1. 背景与方向调整

当前 `AI Agent 面试知识脑` 已经具备完整的列表式学习工作台：47 个知识点、94 道面试题、4 条项目证据线、14 天冲刺计划、Review Queue、Cheat Sheet、Mock Interview、Project Track，以及本地进度状态。

新的产品方向调整为 **Graph Guided Learning**：以结构化知识图谱和学习路径作为主体验，列表页降级为辅助入口。产品目标不变：服务两周内高效准备 AI Agent 研发工程师面试，但主交互从“我在菜单里找内容”变成“系统用知识图谱引导我沿路径学习、复习、追问和项目化表达”。

核心变化：

- 从模块列表变成知识图谱：知识点之间的前置、依赖、相似、追问、项目落点都显式成边。
- 从每日列表变成路径导航：每天不是一组卡片，而是一条图上的学习路线。
- 从 Dashboard 变成 Guided Home：首页直接告诉用户当前所在节点、下一步路径、阻塞点和面试准备缺口。
- 从多页面并列变成三栏主界面：左侧路径，中间图谱，右侧节点详情/训练动作。

## 2. 当前实现基线

当前已有实体：

- `Topic`：知识点，已有 `prerequisites`、`questionIds`、`projectEvidenceIds`、`sourceIds`、`deepDive`。
- `InterviewQuestion`：面试题，已有 `topicIds`、难度、频率、答题结构、追问、项目提示。
- `ProjectEvidence`：项目证据，已有项目类型、架构点、工具、评测、安全、关联知识点。
- `SprintTask`：14 天任务，已有 day、topicIds、questionIds、projectEvidenceIds。
- `ProgressState`：本地进度，已有 topicMastery、questionStatus、completedSprintTaskIds、selectedDay。

这些数据已经可以支撑 Graph Mode 的第一阶段，不需要立刻引入后端或图数据库。第一阶段应先在前端派生图结构，再逐步把显式边沉淀到数据文件中。

## 3. 数据结构：如何表示知识点关系边

### 3.1 图节点

第一阶段图谱只把 `Topic` 作为主要节点，其他实体作为右侧详情和边的证据，不必全部绘成同级节点。

节点类型：

- `topic`：主节点，代表一个知识点。
- `question`：可选轻节点，第一阶段不在主图常驻，只在右侧详情和悬浮关系中出现。
- `project`：可选聚合节点，用于显示 Paper/Web/Travel/Coding Agent 四条项目线。
- `milestone`：路径节点，例如 Day 1、Day 7、面前总复盘。

第一阶段推荐只渲染 `topic` + 少量 `milestone/project` 聚合节点，避免图谱信息过载。

### 3.2 图边类型

建议新增显式边类型 `KnowledgeEdge`：

```ts
type KnowledgeEdgeKind =
  | "prerequisite"
  | "builds_on"
  | "contrasts"
  | "extends"
  | "interview_followup"
  | "project_evidence"
  | "same_path"
  | "review_after";

type KnowledgeEdge = {
  id: string;
  from: string;
  to: string;
  kind: KnowledgeEdgeKind;
  label: string;
  strength: 1 | 2 | 3;
  reason: string;
  pathIds?: string[];
};
```

边的含义：

- `prerequisite`：强前置，例如 `agent-definition -> workflow-vs-agent`。
- `builds_on`：能力递进，例如 `tool-schema -> tool-registry`。
- `contrasts`：对比理解，例如 `workflow-vs-agent <-> react-loop`。
- `extends`：扩展主题，例如 `rag-pipeline -> agentic-rag`。
- `interview_followup`：面试追问关系，例如 `function-calling -> tool-permissions`。
- `project_evidence`：知识点落到项目，例如 `browser-observation -> web-agent-project`。
- `same_path`：同一学习路径中的相邻节点。
- `review_after`：复习/错题触发的临时边，不一定写入静态数据。

### 3.3 边的来源

第一阶段不要求手写所有边，可以分三层生成：

1. **已有字段派生边**
   - `Topic.prerequisites` -> `prerequisite`
   - `Topic.projectEvidenceIds` -> `project_evidence`
   - `SprintTask.topicIds` 相邻项 -> `same_path`
   - `Question.topicIds` 多主题共现 -> `interview_followup` 候选

2. **人工补充核心边**
   - 对 47 个 topic 手写 80-120 条高价值边即可。
   - 只补面试学习真正需要的关系，不追求百科图谱。

3. **进度派生临时边**
   - 错题 -> 关联 topic 的 `review_after`
   - 未掌握前置 -> 当前节点的 blocker
   - 项目表达不足 -> `project_evidence` 高亮

### 3.4 边的优先级

图谱中边不能平均展示。推荐显示策略：

- 默认只展示 `strength >= 2` 的边。
- 当前节点周围展示全部一跳边。
- 学习路径模式只展示当前路径边和阻塞边。
- 面试模式高亮 `interview_followup`。
- 项目模式高亮 `project_evidence`。

## 4. 学习路径如何组织

### 4.1 路径不是菜单，而是图上的路线

学习路径应是图谱中的有序节点序列，并携带每日目标、面试目标、项目目标。建议新增 `LearningPath`：

```ts
type LearningPath = {
  id: string;
  title: string;
  mode: "foundation" | "interview" | "project" | "sprint";
  description: string;
  nodeIds: string[];
  dayRange?: [number, number];
  exitCriteria: string[];
};
```

### 4.2 第一批路径

第一阶段保留 14 天冲刺，但把它重组为 4 条主路径：

1. **Agent 工程主干路径**
   - Agent 定义 -> Workflow 边界 -> Agent 核心模块 -> ReAct Loop -> Tool Schema -> State -> Context -> Eval/Safety
   - 目标：形成面试中的总框架。

2. **RAG / Memory / Context 深挖路径**
   - RAG Pipeline -> Hybrid Search -> Rerank -> Citation Grounding -> Long-term Memory -> Memory Decay -> Context Compression
   - 目标：应对高频 RAG 和上下文追问。

3. **Tool / MCP / Multi-Agent 工程路径**
   - Function Calling -> Tool Registry -> Tool Error Recovery -> MCP -> Skills -> Handoff -> Multi-Agent Roles
   - 目标：讲清 Agent 工程落地。

4. **Web/Coding Agent + 项目表达路径**
   - Browser Observation -> Playwright Actions -> Web Eval -> Coding Harness -> Sandbox -> SWE-bench -> Project Storytelling
   - 目标：把知识变成项目证据和简历话术。

### 4.3 两周计划如何映射

`SprintTask` 不再是首页列表，而是路径进度上的时间切片：

- Day 1-3：主干路径打底。
- Day 4-6：工具、状态、上下文。
- Day 7-9：RAG、Memory、Eval。
- Day 10-12：MCP、多 Agent、安全、Browser/Coding Agent。
- Day 13：项目表达和 Mock Interview。
- Day 14：全图复盘、薄弱节点、面试前速查。

每日目标仍然保留，但展示为“今日路径段”：

- 当前路径段节点。
- 前置阻塞节点。
- 今日必须答过的题。
- 今日必须项目化的节点。

### 4.4 路径推进规则

节点状态由 `topicMastery` 决定：

- `new`：未开启。
- `learning`：正在学。
- `can_explain`：节点基础通关。
- `can_answer_followups`：面试追问通关。
- `project_ready`：能落项目表达。

路径不是只要求节点变绿，而是分三层通关：

1. **知识通关**：核心定义和实现能复述。
2. **面试通关**：关联题至少一题 `passed`，且能接追问。
3. **项目通关**：能讲进至少一条项目线。

## 5. 首页如何从列表仪表盘改成引导式学习

### 5.1 新首页定位

首页从 Dashboard 改为 **Guided Home**。它不再先显示统计卡片，而是先回答：

- 我现在在图谱哪一段？
- 下一步应该学哪个节点？
- 为什么是这个节点？
- 学完后立刻做什么训练？
- 哪些前置或项目证据还没补？

### 5.2 首页首屏结构

首屏建议为三块：

1. **当前路径段**
   - 显示路径名称、Day、当前节点、下一节点。
   - 用一条短路径线展示 5-7 个节点，不展示全图。

2. **Next Best Node**
   - 推荐下一知识点。
   - 推荐原因：高频、前置阻塞、错题关联、项目缺口。
   - 主按钮：`开始这个节点`。
   - 副按钮：`先看前置`、`直接做题`。

3. **今日闭环**
   - 学节点。
   - 看速查。
   - 答题。
   - Mock。
   - 项目表达。
   - 不是列表堆叠，而是与当前节点相关的一组动作。

### 5.3 首页下半区

下半区保留少量辅助信息：

- 图谱覆盖度：内容是否完整。
- 路径进度：每条路径完成度。
- 面试风险节点：高频但未过题、前置缺失、项目表达缺失。
- 快速入口：Review Queue / Mock Interview / Cheat Sheet。

现有统计卡片不删除，但从主视觉降级为 compact summary。

## 6. 三栏式主界面设计

### 6.1 总体布局

Graph Mode 的主界面建议使用三栏：

```text
┌───────────────┬──────────────────────────────┬────────────────────┐
│ Path Rail     │ Graph Canvas                 │ Node Inspector     │
│ 学习路径/筛选 │ 结构化知识图谱                │ 节点详情/训练动作   │
└───────────────┴──────────────────────────────┴────────────────────┘
```

### 6.2 左栏：Path Rail

左栏不是菜单，而是学习路径控制台。

内容：

- 当前 Day 和两周倒计时。
- 4 条主路径切换。
- 当前路径节点列表，按图谱顺序展示。
- 节点状态：未学、学习中、能复述、能接追问、能项目化。
- 路径过滤：基础 / 面试 / 项目 / 薄弱。

左栏保留少量固定辅助入口：

- Review Queue
- Mock Interview
- Cheat Sheet
- Project Track

这些入口不再与 Graph 主体验平级，而是作为路径学习的工具。

### 6.3 中栏：Graph Canvas

中栏是主体验。

图谱要求：

- 节点按模块分层或路径分段布局，不做自由散乱力导向。
- 当前路径节点高亮。
- 当前节点居中。
- 前置节点在左/上游，后续节点在右/下游。
- 高频节点更醒目。
- 未掌握前置用 amber/红色边提示。
- 项目证据缺口用小项目标记提示。

交互：

- 点击节点 -> 右栏打开 Node Inspector。
- 点击边 -> 解释为什么两个知识点相关。
- 切换路径 -> 图谱聚焦该路径。
- 切换模式 -> 显示不同边：
  - Learn：前置/递进边。
  - Interview：追问边。
  - Project：项目证据边。
  - Review：错题和薄弱边。

第一阶段不需要复杂缩放、拖拽、布局编辑。使用固定布局 + scroll/zoom 即可。

### 6.4 右栏：Node Inspector

右栏承接现有 `Topic Detail`，但更紧凑、更行动导向。

内容顺序：

1. 节点标题、状态、优先级、高频程度。
2. 为什么现在学它：前置、路径、错题、项目缺口。
3. 一句话定义和必背结论。
4. 速查 tab：心智模型、面试角度、实现清单、指标、项目挂钩。
5. 关联题：基础题、深挖题、追问。
6. 项目证据：Paper/Web/Travel/Coding 中的落点。
7. 状态按钮：学习中、能复述、能接追问、能项目化。

右栏动作：

- `标记能复述`
- `练关联题`
- `进入 Mock`
- `看项目表达`
- `打开前置节点`
- `跳到下一节点`

### 6.5 响应式

桌面：

- 三栏常驻。

小屏：

- 左栏折叠为路径抽屉。
- 中栏仍是主画布。
- 右栏变成底部 sheet 或独立详情页。

两周冲刺以桌面使用为主，移动端第一阶段只需可用，不追求完整图谱编辑体验。

## 7. 现有页面保留与降级

### 7.1 保留但改名/改职责

- `Dashboard`
  - 改为 `Guided Home`。
  - 不再是统计仪表盘，而是图谱学习入口。

- `Knowledge Map`
  - 升级为 `Graph Mode` 主界面。
  - 原卡片式模块地图可以作为 `Module Overview` 辅助视图。

- `Topic Detail`
  - 降级为右栏 `Node Inspector`。
  - 保留完整详情页作为深度阅读模式。

### 7.2 保留为辅助工具

- `Review Queue`
  - 保留，但入口从侧边主菜单降级到 Path Rail 工具区。
  - 后续 Review Queue 应直接驱动图谱中的 review edges。

- `Interview Drill`
  - 保留为题库训练工具。
  - 入口由节点右栏和路径阶段触发，而不是用户先去筛选列表。

- `Mock Interview`
  - 保留为路径阶段动作。
  - 应支持从当前路径抽题，而不是只按全局薄弱题抽题。

- `Cheat Sheet`
  - 保留为面前速查工具。
  - 可增加“当前路径速查”和“薄弱节点速查”。

- `Project Track`
  - 保留为项目表达工具。
  - 应从图谱 `project_evidence` 边进入，显示某条项目线覆盖了哪些节点。

- `Search Panel`
  - 保留为全局搜索。
  - 搜索结果点击后应聚焦图谱节点，而不是只打开详情页。

### 7.3 暂不继续扩展

以下方向暂缓：

- 继续增加菜单/列表页。
- 继续堆 Dashboard 卡片。
- 独立 Resource Library 页面。
- 复杂后端、账号系统、公开发布包装。
- 图谱编辑器、自由拖拽布局、多人协作。

## 8. 第一阶段最小可落地切片

第一阶段目标：**在不重写全站的前提下，让 Graph Guided Learning 成为打开后的主体验。**

### 8.1 数据切片

新增：

- `src/data/graphEdges.ts`
  - 先手写 80-120 条核心边。
  - 同时从 `prerequisites`、`SprintTask`、`projectEvidenceIds` 派生边。

- `src/data/learningPaths.ts`
  - 定义 4 条主路径。
  - 每条路径包含 nodeIds、目标、退出标准。

新增工具：

- `src/utils/knowledgeGraph.ts`
  - 合并 topic、edge、path、progress。
  - 输出当前路径、当前节点、阻塞节点、下一节点、相关题和项目证据。

验证：

- 每条边 from/to 必须存在。
- 每条路径 nodeIds 必须存在。
- 每个 topic 至少出现在一条路径中。
- 每条路径必须有 exitCriteria。

### 8.2 UI 切片

新增一个主视图：

- `GraphLearning`
  - 左栏：Path Rail。
  - 中栏：固定布局 Graph Canvas。
  - 右栏：Node Inspector。

改造 App：

- 默认打开 `GraphLearning`，原 `Dashboard` 降级为辅助或移入 Graph Home summary。
- 左侧导航减少为：
  - Graph Learning
  - Review
  - Mock
  - Cheat Sheet
  - Projects

第一阶段 Graph Canvas 不需要引入大型图引擎。可用 SVG/HTML 固定布局：

- 按 pathIndex 和 depth 计算节点位置。
- 用 SVG line/path 画边。
- 点击节点更新 selectedTopicId。
- 高亮当前路径和当前节点。

### 8.3 学习闭环切片

第一阶段只做当前路径闭环：

1. 选择路径。
2. 自动定位下一节点。
3. 右栏学习该节点。
4. 标记状态。
5. 做关联题。
6. 进入项目表达。
7. 回到图谱，下一节点自动前进。

暂不做：

- AI 自动生成路径。
- 复杂图布局算法。
- 复杂复习间隔算法。
- 多图层资源库。

### 8.4 验收标准

第一阶段完成时，应满足：

- 打开应用默认看到 Graph Guided Learning，而不是列表仪表盘。
- 至少 4 条路径可以切换。
- 47 个 topic 都在图谱/路径中可达。
- 当前节点右栏可以完成学习、题目、项目动作。
- 路径能基于 `topicMastery` 和 `questionStatus` 推荐下一节点。
- 旧的 Review、Mock、Cheat Sheet、Project Track 仍可使用。
- `npm run validate:data` 增加 graph/path 校验并通过。
- 浏览器检查桌面布局无重叠，三栏可用。

## 9. 推荐实施顺序

1. **只加数据层**
   - `graphEdges.ts`
   - `learningPaths.ts`
   - `knowledgeGraph.ts`
   - validation

2. **加 GraphLearning 页面骨架**
   - Path Rail
   - Graph Canvas
   - Node Inspector

3. **把默认首页切到 GraphLearning**
   - Dashboard 降级。
   - 原页面入口收敛。

4. **把现有训练工具接入节点动作**
   - 右栏按钮打开题目、Mock、项目线。
   - 现有页面不删除，只改变入口优先级。

5. **做第一轮浏览器验收**
   - Graph 默认加载。
   - 路径切换。
   - 节点选择。
   - 状态更新。
   - 旧工具入口仍可用。

## 10. 关键设计取舍

### 10.1 不上图数据库

第一阶段数据规模只有 47 个 topic，前端静态图足够。图数据库、后端检索、动态导入都不是两周面试复习的瓶颈。

### 10.2 不追求花哨图谱

学习图谱的目标是降低认知负担，不是做可视化炫技。固定布局、路径聚焦和右栏行动比复杂力导向更适合复习。

### 10.3 不删除现有页面

现有页面已经有价值，不应推倒重来。Graph Mode 应成为主入口，旧页面成为工具箱。

### 10.4 路径优先于全图

全图适合查漏补缺，但两周冲刺需要路径。默认展示当前路径和一跳关系，完整图谱作为可选视图。

## 11. 风险与规避

- 风险：图谱节点太多，首屏混乱。  
  规避：默认路径视图，只显示当前路径 + 一跳关系。

- 风险：边太多，用户看不懂。  
  规避：按模式过滤边，Learn/Interview/Project/Review 分开。

- 风险：改造影响现有学习功能。  
  规避：第一阶段保留旧页面，Graph 只作为新主入口组合它们。

- 风险：路径推荐逻辑过复杂。  
  规避：先用规则：前置未过优先、高频优先、错题优先、项目缺口优先。

- 风险：实现过度追求图谱视觉。  
  规避：验收重点放在学习闭环：选路径 -> 学节点 -> 练题 -> 项目化 -> 下一节点。

## 12. 第一阶段完成后的效果

用户打开应用后，不再面对一组列表和菜单，而是看到：

- 当前两周路径进行到哪里。
- 下一个最应该攻克的知识节点。
- 该节点为什么重要、前置是什么、会被怎么追问。
- 学完后应该立刻练哪道题、讲哪个项目证据。
- 整个 AI Agent 面试知识体系中自己还有哪些结构性缺口。

这会更贴近“快速构建完整面试知识大脑”的目标：不是把资料摆整齐，而是让知识点之间的关系、路径和训练动作一起驱动复习。
