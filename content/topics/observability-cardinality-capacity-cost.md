# 指标基数、采集容量与观测成本治理

## 面试定位

指标基数、采集容量与观测成本治理 属于 Prometheus 与监控体系 / Dashboard、容量与成本治理。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：观测成本题要从标签基数、series 数、scrape、rule 计算、日志摄入、Trace 采样、存储保留和团队配额回答。

**必须讲清楚**
- 标签基数是某个标签或标签组合可能产生的不同取值数量。
- 时间序列数量通常由 metric 名称和所有标签组合决定，是 Prometheus 成本核心变量。
- 观测成本治理是在保留关键故障证据的前提下控制采集、存储、索引和查询成本。
- 观测成本题要从标签基数、series 数、scrape、rule 计算、日志摄入、Trace 采样、存储保留和团队配额回答。
- 高基数会拖垮系统
- 观测也要容量规划
- 成本治理不能牺牲故障证据

**常见追问方向**
- Prometheus 题先讲指标建模和标签基数，再讲 PromQL、告警和 SLO。
- Trace 题先讲上下文传播、span 设计、采样和跨服务根因定位。
- AI 场景要主动连接 tool_error_rate、retrieval_recall@k、citation_precision 和 eval_pass_rate。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 指标标签只放低基数、稳定、对聚合有价值的维度。
- 高基数字段应进入日志或 Trace，并通过采样、索引和保留策略控制成本。
- Recording rules 可以降低查询成本，但也会增加 rule 计算和存储成本。
- 观测平台自身必须被观测，否则故障时可能先失明。
- Prometheus 的成本很大程度来自时间序列数量，标签组合爆炸会影响采集、存储、查询和规则计算。
- 日志和 Trace 也有摄入、索引、采样、保留和查询成本，不能无限全量保存。
- Cardinality review：新增指标前评估 label 组合和预期 series 数。
- Relabel/drop rules：采集时清理高风险标签或无用指标。
- Remote write / long-term storage：冷热分层保存长期趋势。
- Tail sampling：优先保留错误、慢请求和高价值 trace。
- route 标签要使用模板路径 `/orders/:id`，不能使用真实 URL `/orders/123`。
- 多租户系统可用 tenant_tier 或 plan，而不是 tenant_id 作为默认指标标签。
- AI/RAG 指标要避免把 prompt_id、document_id、run_id 放进指标标签。
- 容量规划要估算 samples_per_second、retention、replication、query concurrency 和 dashboard refresh。


### 通用数据流

可以按业务 SLO、指标、日志、Trace、事件、告警、Dashboard、Runbook、事故复盘和回归验证来讲。数据流通常是服务暴露 metrics、写结构化日志、传播 trace context；Collector/Prometheus/日志系统采集后执行 recording rules、采样、索引和告警，Incident Console 把症状、路径、日志细节、发布变更和用户影响串成时间线。


### 工程落点

- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
- 指标标签要建立 allowlist 和 cardinality review，禁止 request_id、user_id、trace_id 这类无限维度进入标签。
- 观测平台要监控自身 scrape duration、series count、rule eval duration、dropped spans 和日志摄入量。
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

图 1：指标基数、采集容量与观测成本治理 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### 指标基数、采集容量与观测成本治理 的面试级设计题

典型设计题是订单服务可观测体系、MQ 消费积压排障、JVM/Redis 联动事故、RAG 质量退化或 Agent tool 调用失败。架构上要包含 RED/USE 指标、SLO burn rate、trace_id 日志关联、错误链路保留、告警路由、Dashboard 分层、Runbook、复盘任务和 regression/eval 样本。

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

真实线上问题一般从用户影响、错误率、p95/p99、slo_burn_rate、consumer_lag、gc_pause、redis_latency、span_error_rate、log_error_code、recent_deploy、series_count 和 dropped_spans 看起。回答时要先用指标确认症状，再用 Trace 定位路径，日志补局部细节，最后用复盘和回归防止复发。

**排查顺序**
- 先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。
- 再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。
- 对比最近发布、配置变更、流量变化、数据倾斜和下游限流。
- 先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。
- 最后把失败样例进入 regression/eval，避免同类问题复发。

**重点指标**
- active_series
- scrape_duration
- rule_eval_duration
- log_ingestion_bytes
- dropped_spans

**常见误区**
- 把用户 ID 放进 metric label
- 只关注业务容量不关注观测平台容量
- 采样策略导致错误链路丢失

## 业界方案与技术取舍

可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。

**方案对比**
- Cardinality review：新增指标前评估 label 组合和预期 series 数。
- Relabel/drop rules：采集时清理高风险标签或无用指标。
- Remote write / long-term storage：冷热分层保存长期趋势。
- Tail sampling：优先保留错误、慢请求和高价值 trace。
- 更细标签提升定位能力，但增加存储和查询成本。
- 更低采样率节省成本，但可能丢失罕见故障证据。
- 更长保留周期利于趋势分析，但会增加存储和合规压力。
- 先把观测体系看成指标、日志、Trace、事件和复盘流程的组合，而不是一套监控大屏。
- 指标负责趋势和告警，Trace 负责跨服务路径，日志负责局部细节，事件负责时间线。
- 回答观测题要把业务 SLA、系统资源、依赖、Agent/RAG 指标和事故回归连起来。
- 基数成本治理是很多人忽略的高级面试点，能体现你真的运营过监控系统。
- 把 Agent/RAG 的 workspace/run/document 维度如何落日志而不是指标讲清楚，会非常贴近本项目。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

观测成本题要从标签基数、series 数、scrape、rule 计算、日志摄入、Trace 采样、存储保留和团队配额回答。 标签基数是某个标签或标签组合可能产生的不同取值数量。 时间序列数量通常由 metric 名称和所有标签组合决定，是 Prometheus 成本核心变量。 观测成本治理是在保留关键故障证据的前提下控制采集、存储、索引和查询成本。 指标标签只放低基数、稳定、对聚合有价值的维度。 高基数字段应进入日志或 Trace，并通过采样、索引和保留策略控制成本。 Recording rules 可以降低查询成本，但也会增加 rule 计算和存储成本。 观测平台自身必须被观测，否则故障时可能先失明。

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

## 来源与延伸阅读

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
- [Grafana Documentation: Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)：用于确认官方语义边界、命令行为和工程约束。
