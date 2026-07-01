# Prometheus 抓取模型、Exporter 与服务发现

## 面试定位

Prometheus 抓取模型、Exporter 与服务发现 属于 Prometheus 与监控体系 / 指标、PromQL 与 SLO。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Prometheus 默认以 pull/scrape 模型定期抓取 target 暴露的 metrics，服务发现负责动态找到 target，Exporter 负责把系统或中间件状态转换成指标。

**必须讲清楚**
- Scrape 是 Prometheus 周期性从 target 拉取指标的动作。
- Target 是一次抓取的目标地址和标签集合。
- Exporter 把被观测系统状态转换为 Prometheus 可抓取的文本指标格式。
- Prometheus 默认以 pull/scrape 模型定期抓取 target 暴露的 metrics，服务发现负责动态找到 target，Exporter 负责把系统或中间件状态转换成指标。
- Prometheus 默认主动拉取指标
- target 和 label 决定时间序列身份
- Exporter 是被观测对象到指标协议的适配层

**常见追问方向**
- Prometheus 题先讲指标建模和标签基数，再讲 PromQL、告警和 SLO。
- Trace 题先讲上下文传播、span 设计、采样和跨服务根因定位。
- AI 场景要主动连接 tool_error_rate、retrieval_recall@k、citation_precision 和 eval_pass_rate。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- Prometheus 关注时间序列，metric name 和 label 组合共同决定 series。
- 服务发现只负责发现 target，不替代指标语义设计。
- relabeling 是采集入口治理手段，可以补标签、改标签或丢弃 target。
- scrape interval 越短越实时，但采集和存储成本越高。
- 应用或 exporter 暴露 `/metrics`，Prometheus 根据 scrape_config 周期性抓取。
- 服务发现可以来自静态配置、Kubernetes、Consul、文件或云厂商接口。
- relabeling 用于在采集前调整 target 标签、过滤 target 或丢弃高风险标签。
- Kubernetes service discovery。
- Exporter pattern。
- Relabel/drop rules。
- Scrape interval by SLO。
- 每个 job 要定义 owner、scrape_interval、scrape_timeout、目标数量、预估 samples_per_second 和标签白名单。
- 对 blackbox/exporter 类目标要区分被探测服务和 exporter 自身健康。
- 发现 target 暴涨时先看服务发现规则、relabel 配置和最近发布。


### 通用数据流

可以按业务 SLO、指标、日志、Trace、事件、告警、Dashboard、Runbook、事故复盘和回归验证来讲。数据流通常是服务暴露 metrics、写结构化日志、传播 trace context；Collector/Prometheus/日志系统采集后执行 recording rules、采样、索引和告警，Incident Console 把症状、路径、日志细节、发布变更和用户影响串成时间线。


### 工程落点

- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
- 指标 owner 要定义 scrape interval、timeout、job、instance、label allowlist 和容量预估。
- Kubernetes 场景要避免把 pod uid、request id 或动态 URL 直接变成 label。
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

图 1：Prometheus 抓取模型、Exporter 与服务发现 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Prometheus 抓取模型、Exporter 与服务发现 的面试级设计题

典型设计题是订单服务可观测体系、MQ 消费积压排障、JVM/Redis 联动事故、RAG 质量退化或 Agent tool 调用失败。架构上要包含 RED/USE 指标、SLO burn rate、trace_id 日志关联、错误链路保留、告警路由、Dashboard 分层、Runbook、复盘任务和 regression/eval 样本。

**可画架构**
- 指标暴露层：应用或 exporter 暴露 `/metrics`，定义 metric name、type、unit 和 label allowlist。
- 采集层：Prometheus 通过 scrape_config 和 service discovery 找到 target 并定期抓取。
- 存储层：样本进入 head block、WAL 和本地 TSDB block，按 retention 保留。
- 计算层：recording rules 预聚合复杂查询，alerting rules 产生告警事件。
- 响应层：Alertmanager 分组、去重、抑制、静默和路由，Runbook 指导止血和复盘。

**数据流**
- 服务暴露 metrics，Prometheus 根据 job、target、interval 和 timeout 定期抓取。
- 样本带 metric name 和 label 进入 TSDB，recording rules 生成聚合序列。
- alerting rules 根据 SLO、错误率、延迟或容量阈值生成告警。
- Alertmanager 做 grouping/dedup/inhibition/routing，值班人员按 Runbook 处理并复盘。

## 真实问题与排障

真实线上问题一般从用户影响、错误率、p95/p99、slo_burn_rate、consumer_lag、gc_pause、redis_latency、span_error_rate、log_error_code、recent_deploy、series_count 和 dropped_spans 看起。回答时要先用指标确认症状，再用 Trace 定位路径，日志补局部细节，最后用复盘和回归防止复发。

**排查顺序**
- 先确认用户影响和 SLO：错误率、延迟、可用性、质量指标是否异常。
- 检查 `up`、scrape_duration、samples、target 数量和 active series，确认采集是否健康。
- 检查 rule evaluation duration、query duration、Alertmanager 路由和通知错误。
- 对比最近发布、label 变化、target 发现规则、remote write 和 retention 配置。
- 止血可以 drop 高基数标签、禁用问题 rule、回滚配置或切换只读/降级面板。

**重点指标**
- scrape_duration_seconds
- scrape_samples_scraped
- up
- target_sync_length_seconds
- active_series

**常见误区**
- 以为 Prometheus 会自动知道所有服务
- 把高基数字段放进 label
- Exporter 暴露大量无 owner 指标

## 业界方案与技术取舍

可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。

**方案对比**
- Kubernetes service discovery。
- Exporter pattern。
- Relabel/drop rules。
- Scrape interval by SLO。
- 短 scrape interval 发现更快但成本更高。
- Exporter 指标越多定位越细但基数更难控。
- 动态服务发现降低配置维护但容易引入标签漂移。
- 先把观测体系看成指标、日志、Trace、事件和复盘流程的组合，而不是一套监控大屏。
- 指标负责趋势和告警，Trace 负责跨服务路径，日志负责局部细节，事件负责时间线。
- 回答观测题要把业务 SLA、系统资源、依赖、Agent/RAG 指标和事故回归连起来。
- 可以把 scrape target 当成服务注册表里的可观测端点。
- Exporter 类似适配器，把 JVM、Redis、节点或业务状态转成统一指标协议。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Prometheus 默认以 pull/scrape 模型定期抓取 target 暴露的 metrics，服务发现负责动态找到 target，Exporter 负责把系统或中间件状态转换成指标。 Scrape 是 Prometheus 周期性从 target 拉取指标的动作。 Target 是一次抓取的目标地址和标签集合。 Exporter 把被观测系统状态转换为 Prometheus 可抓取的文本指标格式。 Prometheus 关注时间序列，metric name 和 label 组合共同决定 series。 服务发现只负责发现 target，不替代指标语义设计。 relabeling 是采集入口治理手段，可以补标签、改标签或丢弃 target。 scrape interval 越短越实时，但采集和存储成本越高。

面试深挖时要把指标语义、标签基数、scrape、TSDB/WAL、rules、Alertmanager 和 Runbook 串起来。不要只说会写 PromQL，也要说明监控系统自身如何不被打爆。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `job` | Scrape 配置 | 标识一组抓取目标 | 排查采集边界和 owner |
| `target` | 抓取目标 | 表示 instance 地址和标签集合 | 判断目标是否被发现和抓取 |
| `metric_name` | 时间序列 | 表达指标语义和单位 | 判断是否重复、废弃或误用 |
| `label_set` | 时间序列身份 | 决定 series 基数 | 排查高基数和查询成本 |
| `rule_group` | 规则 | 定义 recording/alerting 计算 | 排查 rule 超时、噪声和漏报 |
| `alert_fingerprint` | 告警 | 标识去重和分组后的告警 | 排查通知、抑制和静默 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 来源与延伸阅读

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation: Configuration](https://prometheus.io/docs/prometheus/latest/configuration/configuration/)：用于确认官方语义边界、命令行为和工程约束。
