# 研发面试知识体系 C 方案设计

日期：2026-06-29

## 1. 背景

当前项目已经实现了一个偏 AI Agent 的本地学习站点：页面主线是知识结构图，数据模型围绕 `Topic`、`InterviewQuestion`、`ProjectEvidence`、`KnowledgeEdge` 和 `LearningPath` 展开。这个方向能服务 AI Agent 面试冲刺，但它还不够符合新的核心目标。

新的目标是：建设一个为了面试提升知识深度和广度的研发知识训练系统。它不是概念速查站，也不是只讲 AI Agent 的专题站。用户原本是 Java 高级工程师，过去用过 Elasticsearch、MQ、Redis、数据库、Prometheus 和监控体系等技术；这些能力在新的 AI Agent、RAG、对话助手、智能体平台工作中仍然会高频出现。因此站点必须同时覆盖 AI 新能力和传统后端工程能力，并且把它们组织成可学习、可复盘、可面试追问的体系。

选择 C 方案：先重构整体架构，同时选 AI 和 Elasticsearch 两类做深度样板内容。后续 MQ、Redis、数据库、监控、Java 并发、系统设计等专题按相同标准扩展。

## 2. 产品定位

产品定位从 **AI Agent 面试知识脑** 升级为 **研发面试知识体系**。

它服务三个目标：

1. **知识深度**：每个知识点必须讲清原理、机制、边界、业界方案、真实场景和工程取舍。
2. **知识广度**：AI Agent 只是一个一级专题，还要覆盖 ES、MQ、Redis、数据库、监控、Java 工程和系统设计。
3. **面试训练**：面试题和知识分开组织，但必须互相引用。每道题要有答题结构、追问链、场景延伸和继续深挖的方向。

不做的事情：

- 不把知识点写成两三句话的概念卡片。
- 不把面试题混进知识正文里，导致学习和刷题都不清晰。
- 不优先做营销首页、公开作品集包装、登录系统或后端服务。
- 不为了页面效果牺牲内容密度。

## 3. 顶层信息架构

第一层保留两个主入口。

### 3.1 知识体系

知识体系按技术专题组织，每个专题可以有多个模块和路径。

首批一级专题：

1. AI Agent 与 RAG
2. Elasticsearch
3. MQ
4. Redis
5. 数据库
6. Prometheus 与监控体系
7. Java 并发与 JVM
8. 分布式与系统设计
9. 工程质量、可观测性与故障治理

第一阶段只要求 AI 和 ES 有深度样板；其他专题先出现为规划入口和空状态，明确标记为待补齐，避免伪造完整内容。

### 3.2 面试训练

面试训练按题目组织，不按文章组织。题目可以按专题、难度、岗位方向、频率和掌握状态筛选。

每道面试题必须绑定：

- 关联知识点
- 标准答题结构
- 关键结论
- 多轮追问链
- 真实业务场景
- 系统设计延伸
- 常见误区
- 可以迁移的项目经验

面试训练页不替代知识页。它的职责是把知识转成能在面试中说出来的表达。

## 4. 内容深度标准

每个知识点使用统一结构，确保内容不是浅层摘要。

### 4.1 必备字段

每个知识点必须包含：

1. **定义和边界**：它是什么，不是什么，和相邻概念如何区分。
2. **核心原理**：底层机制、关键流程和为什么这样设计。
3. **业界方案**：常见实现方式、主流组件或架构模式。
4. **真实技术场景**：在什么业务或系统里会遇到，为什么会用到。
5. **系统设计案例**：如何从需求、容量、链路、数据模型、失败模式推到设计。
6. **工程落地细节**：接口、数据结构、配置、异常、降级、迁移和发布要点。
7. **性能与稳定性**：吞吐、延迟、容量、热点、资源、SLA、成本和可观测性。
8. **安全与权限**：涉及外部动作、数据隔离、敏感信息、越权和审计时必须写清。
9. **常见坑**：真实开发和面试中容易犯的错误。
10. **经验连接**：如何把 Java 高级工程师经验迁移到 AI Agent 或新岗位表达。

### 4.2 内容验收标准

一个知识点只有满足以下标准，才算第一阶段合格：

- 能支持 3 分钟口述，不只是记名词。
- 至少有 1 个真实业务场景。
- 至少有 1 个系统设计或架构案例。
- 至少覆盖 1 个性能、稳定性或成本取舍。
- 至少能关联 2 道面试题或追问。
- 能解释它和相邻知识点的关系。

## 5. 数据模型调整

当前模型可以保留，但需要扩展为通用研发知识体系。

### 5.1 第一阶段实体定义

第一阶段新增 `Domain`：

```ts
type Domain = {
  id: string;
  title: string;
  description: string;
  status: "sample_ready" | "planned" | "draft";
  priority: "core" | "important" | "later";
};
```

第一阶段把当前 `Category` 扩展为专题内模块，新增 `domainId`：

```ts
type Category = {
  id: string;
  domainId: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
};
```

扩展 `Topic`，加入深度内容结构：

```ts
type Topic = {
  id: string;
  domainId: string;
  categoryId: string;
  title: string;
  summary: string;
  definition: string[];
  principles: string[];
  industrySolutions: string[];
  scenarios: ScenarioCase[];
  systemDesignCases: SystemDesignCase[];
  engineeringDetails: string[];
  tradeoffs: string[];
  pitfalls: string[];
  experienceBridge: string[];
  questionIds: string[];
};
```

新增 `ScenarioCase`：

```ts
type ScenarioCase = {
  id: string;
  title: string;
  context: string;
  problem: string;
  design: string[];
  failureModes: string[];
  metrics: string[];
};
```

新增 `SystemDesignCase`：

```ts
type SystemDesignCase = {
  id: string;
  title: string;
  requirements: string[];
  architecture: string[];
  dataFlow: string[];
  scalingPoints: string[];
  observability: string[];
  tradeoffs: string[];
};
```

扩展 `InterviewQuestion`，新增结构化追问：

```ts
type FollowUpStep = {
  question: string;
  answerHint: string;
  probes: string[];
  relatedTopicIds: string[];
};
```

第一阶段不要求一次性迁移所有旧字段。可以先兼容旧字段，新增深度字段只在 AI 和 ES 样板中使用。

## 6. AI 样板专题

AI 专题不是只保留 Agent 定义，而是按面试和工程落地拆成深度模块。

第一阶段 AI 样板覆盖：

1. Agent 的定义、Workflow 边界和 Agent Loop。
2. Tool Calling、工具 schema、工具权限和错误恢复。
3. RAG 全流程、Hybrid Search、Rerank、Grounding。
4. Memory：短期记忆、长期记忆、记忆污染、记忆衰退、用户画像。
5. Context Engineering：上下文分层、压缩、token 预算、证据保真。
6. Evaluation 与 Observability：组件评测、轨迹评测、Trace、回放、失败归因。

AI 样板必须额外体现和传统后端经验的连接：

- RAG 检索和 ES 索引设计的关系。
- Agent 工具调用和后端 API 契约、权限、审计的关系。
- Trace / Eval 和 Prometheus / 日志 / 链路追踪的关系。
- Memory 和数据库、缓存、用户状态建模的关系。

## 7. Elasticsearch 样板专题

ES 是第一个传统后端深度样板，用来证明站点不是只讲 AI。

第一阶段 ES 样板覆盖：

1. ES 使用场景和边界：全文检索、日志检索、近实时分析，不适合强事务。
2. 倒排索引：term、posting list、doc values、分词、mapping。
3. 索引设计：字段类型、analyzer、dynamic mapping、nested、join 的取舍。
4. 分片和副本：容量规划、路由、扩缩容、热点分片。
5. 写入链路：refresh、translog、flush、merge、bulk 写入。
6. 查询优化：filter/query、bool、分页、search_after、scroll、profile。
7. 聚合与分析：terms、histogram、cardinality、pipeline aggregation。
8. 稳定性治理：慢查询、GC、磁盘水位、线程池、熔断、限流。
9. ES 与 RAG：BM25、向量检索、Hybrid Search、Rerank、Grounding 的连接。

ES 样板必须包含至少 3 个场景：

- 商品或内容搜索系统。
- 日志检索和故障排查系统。
- RAG 知识库检索链路。

## 8. 面试题与追问链设计

面试题不再从 topic 自动生成两道浅题。AI 和 ES 样板题必须手写关键题。

每道题结构：

1. 题目。
2. 考察点。
3. 答题框架。
4. 关键细节。
5. 常见错误。
6. 追问链。
7. 场景延伸。
8. 关联知识点。

追问链示例结构：

```text
基础问题：ES 为什么适合全文检索？
追问 1：倒排索引和 B+ 树索引有什么区别？
追问 2：分词器设计不当会造成什么问题？
追问 3：如果查询延迟突然升高，你会如何定位？
追问 4：如果用于 RAG 检索，你会如何做 Hybrid Search 和 Rerank？
```

训练目标不是背答案，而是形成“面试官继续问下去也能接住”的表达能力。

## 9. 页面改造

第一阶段页面不追求花哨，重点是让内容结构清晰。

### 9.1 首页

首页显示：

- 当前目标：研发面试知识体系。
- 两条主线：知识体系、面试训练。
- 样板专题：AI Agent 与 RAG、Elasticsearch。
- 待扩展专题：MQ、Redis、数据库、监控、Java 并发、系统设计。
- 内容标准提示：深度知识、真实场景、系统设计、追问链。

### 9.2 知识体系页

知识体系页以 `Domain` 为入口。用户先选专题，再看模块和知识点。

AI 和 ES 显示为可进入专题；其他专题显示为待补齐空状态，说明后续覆盖范围。

### 9.3 知识点详情页

详情页按深度结构展示：

- 定义和边界
- 原理机制
- 业界方案
- 场景案例
- 系统设计
- 工程细节
- 取舍与坑
- 面试题入口
- Java 后端经验迁移

### 9.4 面试训练页

面试训练页以题目为主，支持按专题筛选。

题目详情展示：

- 标准答案骨架
- 追问链
- 场景延伸
- 关联知识点
- 自测状态

## 10. 第一阶段实施范围

第一阶段必须交付：

1. 新增通用 `Domain` 和深度内容类型，兼容现有数据。
2. 首页文案和导航从 AI Agent 单专题改为研发面试知识体系。
3. 新增 AI 和 ES 两个样板专题入口。
4. 为 AI 样板保留并增强至少 3 个深度主题。
5. 为 ES 样板新增至少 5 个深度主题。
6. 新增至少 8 道手写面试题，其中 AI 4 道、ES 4 道。
7. 每道样板面试题必须有至少 3 层追问。
8. 搜索和详情页能展示新深度字段。
9. 现有数据校验脚本继续通过，并新增必要校验。
10. `npm run validate:all` 和 `npm run build` 通过。

不纳入第一阶段：

- 后端存储。
- 登录和多用户。
- AI 自动生成内容。
- 所有专题一次性补齐。
- 大规模图谱自动布局。

## 11. 风险与约束

### 11.1 内容质量风险

最大风险不是页面，而是内容变薄。解决方式是把内容结构和校验写进数据模型与脚本：样板专题必须有场景、系统设计、追问链和经验迁移字段。

### 11.2 迁移风险

现有 Topic 数据很多，如果一次性重构会影响页面。第一阶段采用兼容策略：旧字段继续可读，新字段只在 AI 和 ES 样板强制要求。

### 11.3 范围风险

完整体系很大。第一阶段只证明架构和样板质量，不承诺补完所有专题。未完成专题必须显示为待补齐，不伪装成已完成。

### 11.4 事实准确性风险

ES、RAG、Agent 等内容涉及具体工程细节。第一阶段先写工程常识层面的稳定内容；涉及版本变化、具体 API 或新标准时，后续补内容前需要查阅官方文档或权威资料。

## 12. 验收标准

第一阶段完成时，应能验证：

- 站点标题、首页和导航不再把产品限定为 AI Agent 单专题。
- 用户能从知识体系进入 AI 和 ES 两个样板专题。
- AI 样板能体现 Agent、RAG、Memory、Context、Eval 等深度方向。
- ES 样板能体现倒排索引、索引设计、分片副本、写入链路、查询优化、RAG 检索连接。
- 用户能从面试训练进入 AI/ES 手写题，并看到多轮追问链。
- 知识点详情能展示真实场景、系统设计、工程取舍和 Java 后端经验迁移。
- 待扩展专题不会展示虚假完整内容。
- 校验脚本和构建命令通过。
