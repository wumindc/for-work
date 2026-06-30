# 企业 Agent 方案地图

## 面试定位

企业 Agent 方案地图 属于 AI 工程趋势与实战方案 / 企业 Agent 应用方案。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：企业 Agent 方案可按问数、问文档、问代码、问业务流程、操作系统和质量治理六类组织，每类都有不同的工具、数据和评测边界。

**必须讲清楚**
- 企业 Agent 方案可按问数、问文档、问代码、问业务流程、操作系统和质量治理六类组织，每类都有不同的工具、数据和评测边界。
- 先分场景再选架构
- 企业方案核心是数据与权限
- 项目表达要讲指标和失败

**常见追问方向**
- 企业 Agent 方案如何分类和选型。
- DataAgent、知识库问答、AI Code Review 和自动化测试有什么不同。
- 如何定义一个 Agent 项目的边界、数据和成功指标。
- 如果这个点落到 Paper Agent：论文研读与可追溯综述、Coding Agent：代码库任务 Harness、Web Agent：公开网页任务自动化与评测，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- DataAgent/Text2SQL、知识库客服、AI Code Review、回归测试和项目管理 Agent 都不是同一种系统。
- 面试里要能把业务目标映射到数据源、工具、权限、评测和上线边界。


### 通用数据流

可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。


### 工程落点

- 为每个方案卡定义 scenario、users、data_sources、tools、risk_level、eval_metrics 和 fallback。
- 先做 deterministic workflow 或 RAG baseline，再证明 Agent loop 的收益。
- 权限、审计、human review 和 unsupported state 必须前置设计。
- 上线后跟踪业务成功率、人工接管率、成本、延迟和安全拦截。
- 方案卡字段包含 scenario、users、data_sources、tools、risk_level、eval_metrics、fallback、human_review。
- 先用 workflow baseline，再证明 Agent 带来收益。
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

图 1：企业 Agent 方案地图 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### 企业 Agent 方案地图 的面试级设计题

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
- business_success_rate
- manual_handoff_rate
- unsupported_request_rate
- cost_per_success
- risk_block_rate

**常见误区**
- 所有场景都套 Agent
- 没有权限和审计
- 没有业务指标

## 业界方案与技术取舍

AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。

**方案对比**
- 企业 Agent 方案要先按场景分类，再选架构，不能所有业务都套 autonomous agent。
- 数据、权限、评测、回滚和人工审核决定方案能不能生产落地。
- 项目表达要从业务问题、数据源、工具、指标和失败模式展开。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

企业 Agent 方案可按问数、问文档、问代码、问业务流程、操作系统和质量治理六类组织，每类都有不同的工具、数据和评测边界。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `request_id` | 请求 | 串联入口、缓存、DB 和下游调用 | 定位单次异常 |
| `key_schema` | Redis/存储 | 固定业务域、实体和版本 | 排查误删、串租户和旧版本 |
| `source_version` | value/event | 标识事实源版本 | 防止旧值覆盖新值 |
| `ttl_policy` | 缓存策略 | 控制过期、抖动和刷新 | 排查击穿、雪崩和旧值窗口 |
| `trace_id` | 观测链路 | 串联服务、存储和异步任务 | 复盘慢请求和失败分支 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 趋势落地补充

企业 Agent 方案地图要先回答“这是不是 Agent 问题”。问数更像语义层、权限和 SQL 约束问题；问文档更像解析、检索和 citation 问题；问代码需要 diff、测试和 review pipeline；问流程才可能需要 planner、tool runtime 和 human gate。把这些场景都写成 autonomous loop，会让方案成本、风险和验收指标失真。

落地时可以用 solution card 管理每类方案：`scenario`、`user_role`、`data_sources`、`permission_scope`、`tool_set`、`risk_level`、`success_metric`、`fallback`、`human_review` 和 `unsupported_state`。先做 workflow/RAG baseline，再用数据证明 Agent loop 带来了更高成功率或更低人工成本。没有 baseline 的“Agent 升级”很难说服面试官。

## 生产验收清单

- 每个方案都要明确事实源、权限模型、读写边界、审计要求和不可支持请求的返回方式。
- 高风险写操作必须有 approval、dry-run、rollback 或补偿路径，不把模型决策直接接生产写入。
- 指标要落到业务成功率、人工接管率、unsupported_request_rate、成本、延迟和风险拦截率。
- 复盘材料要保留成功样例、失败样例、人工修正和上线后指标变化，避免只展示 demo。

## 来源与延伸阅读

- [OpenAI: A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于确认官方语义边界、命令行为和工程约束。
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于确认官方语义边界、命令行为和工程约束。
