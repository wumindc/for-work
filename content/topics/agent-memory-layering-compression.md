# Agent Memory 分层与压缩

## 面试定位

Agent Memory 分层与压缩 属于 AI 工程趋势与实战方案 / Agent Memory 与 Context 压缩。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Agent Memory 正在从聊天摘要升级为短期状态、长期经验、符号化压缩、证据引用和按需恢复的分层系统。

**必须讲清楚**
- Agent Memory 正在从聊天摘要升级为短期状态、长期经验、符号化压缩、证据引用和按需恢复的分层系统。
- memory 不是无限上下文
- 摘要不是事实源
- 分层压缩要保留约束和证据引用

**常见追问方向**
- Agent Memory 如何分层。
- 长期记忆、RAG 和 context compaction 的边界。
- 如何证明压缩没有丢掉关键约束。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 短期记忆服务当前任务，长期记忆保存稳定偏好和经验，RAG 保存外部知识。
- 压缩的目标是降低 token，同时不丢硬约束和可验证证据。


### 通用数据流

可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。


### 工程落点

- 把 memory 分成 working state、episodic memory、semantic memory、external evidence 和 user preference。
- 每条 memory 保存 scope、ttl、confidence、source_trace、privacy_level 和 last_used_at。
- 写入前做重要性评分、去重、敏感信息过滤和用户授权。
- 压缩后用 lost constraint eval、resume case 和 artifact refs 验证质量。
- Memory item 字段包含 scope、ttl、confidence、source_trace、privacy_level、last_used_at。
- 压缩质量用 lost_constraint_rate、resume_success_rate、token_saving_ratio 评估。
- 把每个关键步骤都映射到可观测指标，避免只描述功能。
- 回答时主动说明哪些信息是强一致状态，哪些只是上下文或缓存视图。

## 可画图

```mermaid
flowchart LR
  Input[业务请求 / 面试场景] --> Contract[边界与数据结构]
  Contract --> Mechanism[核心机制]
  Mechanism --> Failure[失败模式]
  Failure --> Metrics[指标与 Trace]
  Metrics --> Decision[取舍与项目表达]
```

图 1：Agent Memory 分层与压缩 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Agent Memory 分层与压缩 的面试级设计题

典型设计题是企业内部 Agent、Coding Agent、Paper Agent 或 Web Agent：外层 deterministic workflow 管理权限、预算、审批和最终提交，内层 Agent loop 处理开放探索，Eval Gate 根据 golden case、轨迹评分、工具结果和人工反馈决定是否继续。

**可画架构**
- 入口层校验用户请求、权限、租户、参数和幂等键。
- 业务服务层决定同步处理、异步处理、缓存读写、数据库回源或降级返回。
- 状态层保存业务状态、缓存版本、事件状态和恢复点。
- 执行层处理存储访问、下游调用、异步任务和补偿动作，并把结构化结果写入 trace。
- 观测层用指标、日志和链路追踪证明系统可运行、可排障、可复盘。

**数据流**
- 请求进入入口层后生成 request_id/run_id。
- 业务服务读取缓存、数据库或异步事件状态，选择执行路径。
- 执行结果写回状态存储，并向监控系统上报延迟、错误和业务结果。
- 保护策略根据成功标准、失败次数、SLA 和风险等级决定继续、降级、补偿或停止。

## 真实问题与排障

真实线上问题一般从任务成功率、工具调用成功率、invalid args、上下文漂移、幻觉率、引用准确率、token 成本、延迟、guardrail block rate 和 human handoff rate 看起。回答时要把模型问题、检索问题、工具问题、状态问题和权限问题分开归因。

**排查顺序**
- 先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。
- 再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。
- 对比最近发布、配置变更、流量变化、数据倾斜和下游限流。
- 先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。
- 最后把失败样例进入 regression/eval，避免同类问题复发。

**重点指标**
- token_saving_ratio
- resume_success_rate
- lost_constraint_rate
- memory_precision
- privacy_violation_count

**常见误区**
- 把所有历史都写进长期记忆
- 无隐私分级
- 压缩后无法恢复证据

## 业界方案与技术取舍

AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。

**方案对比**
- Agent Memory 是分层状态系统，不是无限聊天历史。
- 短期状态、长期偏好、外部知识和经验总结的生命周期完全不同。
- 压缩的目标是省 token，同时保留约束、证据和恢复能力。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Agent Memory 正在从聊天摘要升级为短期状态、长期经验、符号化压缩、证据引用和按需恢复的分层系统。真正的 memory item 不应该只是“用户说过的一句话”，而要包含 `memory_id`、`scope`、`layer`、`content`、`source_trace_id`、`artifact_refs`、`confidence`、`ttl`、`privacy_level`、`created_at`、`last_used_at` 和 `decay_reason`。这样系统才能判断它服务当前任务、长期偏好、项目经验还是外部证据。

写入链路要比读取链路更谨慎。用户输入、工具 observation、代码 diff、测试结果和人工反馈进入候选池后，先做重要性评分、去重、敏感信息过滤、作用域判断和冲突检测；只有稳定偏好、可复用经验、明确项目约束和可追溯事实才进入长期记忆。短期工作状态可以自动写，长期用户偏好和跨项目经验最好有更严格的授权、审计和删除能力。

压缩不是简单摘要。一个可恢复的 resume packet 至少要包含目标、不可破坏约束、已完成步骤、未完成队列、关键决策、失败尝试、artifact refs、测试证据和下一步建议。压缩后要能重新启动任务、定位文件和复用证据；如果只剩“用户想做一个项目”这种笼统摘要，就会造成重复工作、丢约束和幻觉补全。评测上要用 lost_constraint_rate、resume_success_rate、artifact_ref_missing_rate、duplicate_work_rate 和 token_saving_ratio 衡量。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `request_id` | 请求 | 串联入口、缓存、DB 和下游调用 | 定位单次异常 |
| `key_schema` | Redis/存储 | 固定业务域、实体和版本 | 排查误删、串租户和旧版本 |
| `source_version` | value/event | 标识事实源版本 | 防止旧值覆盖新值 |
| `ttl_policy` | 缓存策略 | 控制过期、抖动和刷新 | 排查击穿、雪崩和旧值窗口 |
| `trace_id` | 观测链路 | 串联服务、存储和异步任务 | 复盘慢请求和失败分支 |

## 生产验收清单

Memory 系统上线前要先划清事实源边界。RAG 文档、数据库记录、代码仓库和工单系统仍然是事实源；Memory 只是执行上下文、偏好和经验缓存。任何会影响权限、金额、用户身份、线上发布或安全策略的结论，都不能只从长期记忆读取后直接执行，必须回源验证或要求人工确认。

压缩验收要设计可复现任务。可以选 20 个长程 Coding Agent、研究 Agent 或客服 Agent case，在上下文接近上限时生成压缩包，再开启新会话恢复执行。验收不是看摘要是否通顺，而是看是否保留了用户硬约束、文件路径、关键证据、失败分支、测试命令和下一步动作。每个失败 case 都要标注丢失的是 goal、constraint、artifact、decision 还是 permission。

隐私和治理验收同样重要。Memory item 必须有租户、用户、项目和会话作用域；敏感信息要脱敏或禁止写入；用户偏好要能查看、撤销和过期；跨项目复用要默认关闭或经过 policy gate。指标上要看 `memory_write_accept_rate`、`memory_precision`、`memory_reuse_rate`、`lost_constraint_rate`、`privacy_block_count`、`resume_success_rate` 和 `manual_delete_count`。这些指标能证明 memory 是受治理的状态系统，而不是把聊天记录无限堆进向量库。

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 趋势落地补充

Agent Memory 的趋势不是“记住越多越好”，而是把不同生命周期的信息放在不同层里：working state 保存当前任务，episodic memory 保存可复盘经历，semantic memory 保存稳定知识，user preference 保存长期偏好，external evidence 仍由 RAG 或数据库承担。每层都要有 scope、ttl、confidence、privacy_level 和 source_trace。

动手实验可以构造一个长 coding 任务，让 Agent 在上下文快满时生成 resume packet，再在新会话恢复。评估时看 resume_success_rate、lost_constraint_rate、artifact_ref_missing_rate、duplicate_work_rate 和 token_saving_ratio。这个实验能说明 memory compression 的目标不是压短文字，而是保留可继续执行的状态。

## 来源与延伸阅读

- [OpenAI: A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于确认 Agent 编排、工具、guardrails、人工确认和运行时治理框架。
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于说明 workflow 与 agent 边界、上下文组织和可控执行循环。
