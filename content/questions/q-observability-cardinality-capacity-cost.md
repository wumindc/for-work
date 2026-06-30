# Prometheus 指标高基数会带来什么问题？如何治理观测成本？

## 面试定位

这道题关联 指标基数、采集容量与观测成本治理、Prometheus 指标建模、PromQL 与 SLO，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「指标基数、采集容量与观测成本治理」切入：观测成本题要从标签基数、series 数、scrape、rule 计算、日志摄入、Trace 采样、存储保留和团队配额回答。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把真实 URL 或 user_id 放进 label
- 只在事故后删指标
- 采样把错误链路也丢了

## 30 秒回答

高基数会让时间序列数量爆炸，影响 Prometheus 采集、存储、查询和 rule evaluation，严重时监控系统自身不可用。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 高基数会让时间序列数量爆炸，影响 Prometheus 采集、存储、查询和 rule evaluation，严重时监控系统自身不可用。
- 治理从指标设计开始：label 只放低基数、稳定、可聚合的维度；禁止 user_id、request_id、trace_id、document_id、run_id 进入指标标签。
- 高基数字段放到日志或 Trace，通过采样、索引和保留周期治理；指标侧用 route 模板、tenant_tier、status、error_code 等有限维度。
- 平台侧要监控 active_series、scrape_duration、rule_eval_duration、remote_write_lag、log_ingestion_bytes、dropped_spans，并做配额、review 和清理。
- 观测成本题要从标签基数、series 数、scrape、rule 计算、日志摄入、Trace 采样、存储保留和团队配额回答。
- 标签基数是某个标签或标签组合可能产生的不同取值数量。
- 时间序列数量通常由 metric 名称和所有标签组合决定，是 Prometheus 成本核心变量。
- 观测成本治理是在保留关键故障证据的前提下控制采集、存储、索引和查询成本。
- 指标标签只放低基数、稳定、对聚合有价值的维度。
- 高基数字段应进入日志或 Trace，并通过采样、索引和保留策略控制成本。
- Recording rules 可以降低查询成本，但也会增加 rule 计算和存储成本。
- 观测平台自身必须被观测，否则故障时可能先失明。
- Prometheus 的成本很大程度来自时间序列数量，标签组合爆炸会影响采集、存储、查询和规则计算。
- 日志和 Trace 也有摄入、索引、采样、保留和查询成本，不能无限全量保存。
- Prometheus 题要从指标类型、标签基数、PromQL、RED/USE、告警、SLO 和 AI/RAG 质量指标一起回答。
- Prometheus 指标建模是把系统状态表达成可采集、可聚合、可告警的时间序列。
- SLO 是面向用户承诺的可靠性目标，告警应围绕 SLO 消耗和用户影响。
- 指标名称和标签要稳定。
- 高基数标签必须受控。
- Histogram 适合延迟分布和分位数。
- 告警要有窗口、阈值、抑制和 runbook。
- AI 系统要同时观测服务指标和质量指标。
- Counter、Gauge、Histogram 和 Summary 的语义不同。
- PromQL 要围绕 rate、histogram_quantile、聚合和窗口设计。


### 数据流怎么讲

可以按业务 SLO、指标、日志、Trace、事件、告警、Dashboard、Runbook、事故复盘和回归验证来讲。数据流通常是服务暴露 metrics、写结构化日志、传播 trace context；Collector/Prometheus/日志系统采集后执行 recording rules、采样、索引和告警，Incident Console 把症状、路径、日志细节、发布变更和用户影响串成时间线。


### 落地实现细节

- Cardinality review：新增指标前评估 label 组合和预期 series 数。
- Relabel/drop rules：采集时清理高风险标签或无用指标。
- Remote write / long-term storage：冷热分层保存长期趋势。
- Tail sampling：优先保留错误、慢请求和高价值 trace。
- route 标签要使用模板路径 `/orders/:id`，不能使用真实 URL `/orders/123`。
- 多租户系统可用 tenant_tier 或 plan，而不是 tenant_id 作为默认指标标签。
- AI/RAG 指标要避免把 prompt_id、document_id、run_id 放进指标标签。
- 容量规划要估算 samples_per_second、retention、replication、query concurrency 和 dashboard refresh。
- 指标标签要建立 allowlist 和 cardinality review，禁止 request_id、user_id、trace_id 这类无限维度进入标签。
- 观测平台要监控自身 scrape duration、series count、rule eval duration、dropped spans 和日志摄入量。
- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
- RED/USE 方法。
- PromQL rate/increase/histogram_quantile。
- Multi-window burn rate alert。
- Recording rules。
- Grafana dashboard + runbook。
- 不要把 user_id/request_id 放进标签。
- Histogram bucket 要按 SLA 和实际分布设计。
- AI 质量指标要有样本来源和评测窗口。
- 指标标签要控制 cardinality，避免 user_id、request_id 进入高基数字段。
- 告警要区分症状和根因，优先围绕 SLO 和用户影响。
- 关键接口要有 schema、version、timeout、retry、幂等键和审计字段。

## 可画图

```mermaid
flowchart LR
  Q[面试问题] --> Boundary[先划边界]
  Boundary --> Mechanism[解释机制]
  Mechanism --> Design[落到系统设计]
  Design --> Incident[补事故排障]
  Incident --> Tradeoff[总结取舍]
```

图 1：这类题不要直接背结论，先划清边界，再沿机制、设计、事故和取舍回答。

## 系统设计案例

### 服务与 AI 质量指标平台

**需求与边界**
- 统一服务指标和 AI 质量指标。
- 支持 SLO 告警和事故复盘。
- 控制标签基数和采集成本。

**架构拆解**
- Service Exporter 暴露指标。
- Prometheus 抓取并执行 rules。
- Grafana 展示 SLO 和质量面板。
- Alertmanager 路由告警。

**数据流**
- 服务暴露 metrics。
- Prometheus 拉取。
- Recording rules 聚合。
- 告警触发 runbook。

**扩展点与观测指标**
- 按服务分片采集。
- 限制标签基数。
- 长期指标下沉到远端存储。
- 监控 scrape duration、series count、rule eval duration。

**取舍**
- 指标越细定位越好，但成本和基数越高。
- 告警越敏感发现越早，但噪声更高。

## 真实问题与排障

真实线上问题一般从用户影响、错误率、p95/p99、slo_burn_rate、consumer_lag、gc_pause、redis_latency、span_error_rate、log_error_code、recent_deploy、series_count 和 dropped_spans 看起。回答时要先用指标确认症状，再用 Trace 定位路径，日志补局部细节，最后用复盘和回归防止复发。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- active_series
- scrape_duration
- rule_eval_duration
- log_ingestion_bytes
- dropped_spans
- http_request_duration_p95
- error_rate
- slo_burn_rate
- tool_error_rate
- retrieval_recall_at_k
- http_p95
- citation_precision
- eval_pass_rate

## 多轮追问模拟

### 延伸追问 1：route 标签怎么设计？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲多租户服务、RAG workspace、Agent run trace、高流量 API 的观测治理。；用 label allowlist、cardinality review、采样策略、保留周期和成本看板作为项目证据。

### 延伸追问 2：Recording rule 是省成本还是增成本？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲多租户服务、RAG workspace、Agent run trace、高流量 API 的观测治理。；用 label allowlist、cardinality review、采样策略、保留周期和成本看板作为项目证据。

### 延伸追问 3：Agent/RAG 的 workspace/run 维度怎么观测？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲多租户服务、RAG workspace、Agent run trace、高流量 API 的观测治理。；用 label allowlist、cardinality review、采样策略、保留周期和成本看板作为项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲多租户服务、RAG workspace、Agent run trace、高流量 API 的观测治理。
- 用 label allowlist、cardinality review、采样策略、保留周期和成本看板作为项目证据。

**取舍总结**
可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Cardinality review：新增指标前评估 label 组合和预期 series 数。
- Relabel/drop rules：采集时清理高风险标签或无用指标。
- Remote write / long-term storage：冷热分层保存长期趋势。
- Tail sampling：优先保留错误、慢请求和高价值 trace。
- route 标签要使用模板路径 `/orders/:id`，不能使用真实 URL `/orders/123`。
- 多租户系统可用 tenant_tier 或 plan，而不是 tenant_id 作为默认指标标签。
- AI/RAG 指标要避免把 prompt_id、document_id、run_id 放进指标标签。
- 容量规划要估算 samples_per_second、retention、replication、query concurrency 和 dashboard refresh。
- 指标标签要建立 allowlist 和 cardinality review，禁止 request_id、user_id、trace_id 这类无限维度进入标签。
- 观测平台要监控自身 scrape duration、series count、rule eval duration、dropped spans 和日志摄入量。
- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
- RED/USE 方法。
- PromQL rate/increase/histogram_quantile。
- Multi-window burn rate alert。
- Recording rules。
- Grafana dashboard + runbook。
- 不要把 user_id/request_id 放进标签。
- Histogram bucket 要按 SLA 和实际分布设计。
- AI 质量指标要有样本来源和评测窗口。
- 指标标签要控制 cardinality，避免 user_id、request_id 进入高基数字段。
- 告警要区分症状和根因，优先围绕 SLO 和用户影响。
- 观测成本题要从标签基数、series 数、scrape、rule 计算、日志摄入、Trace 采样、存储保留和团队配额回答。

## 边界条件与反例

反例一：如果业务需要强事务一致性，不能只靠缓存、搜索索引或异步读模型承载最终正确性。

反例二：如果没有指标、trace 和回归样例，方案在线上出问题时只能靠猜，不能证明稳定性。

反例三：为了追求低延迟而省略权限、幂等、超时或降级，会把局部性能优化变成系统性风险。

## 深问准备

被追问时优先沿四条线展开：为什么需要这个方案、关键数据结构是什么、失败后如何止血和定位、最终用什么指标证明修复有效。

- 准备一个线上事故：影响面、止血、根因、修复、回归。
- 准备一个系统设计：入口、状态、执行、存储、观测。
- 准备一个取舍：一致性、延迟、吞吐、成本和可维护性。

## 来源与延伸阅读

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
- [Grafana Documentation: Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
