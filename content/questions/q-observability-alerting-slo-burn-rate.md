# 如何基于 SLO 和错误预算设计告警？Burn rate 告警怎么理解？

## 面试定位

这道题关联 SLO、错误预算与多窗口 Burn Rate 告警、Prometheus 指标建模、PromQL 与 SLO，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「SLO、错误预算与多窗口 Burn Rate 告警」切入：告警题要从用户影响、SLI/SLO、错误预算、burn rate、多窗口阈值、告警路由、抑制和 Runbook 回答。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 告警只看机器资源
- 没有错误预算概念
- 告警无人认领或没有处理手册

## 30 秒回答

我会先定义 SLI/SLO：例如可用性、延迟、业务成功率或 RAG eval pass rate；告警要围绕用户影响，而不是只看 CPU。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先定义 SLI/SLO：例如可用性、延迟、业务成功率或 RAG eval pass rate；告警要围绕用户影响，而不是只看 CPU。
- 错误预算是允许失败的空间，burn rate 是预算消耗速度。高 burn rate 表示如果持续下去会很快耗尽预算，需要告警和升级。
- 多窗口多 burn rate 同时覆盖快故障和慢性消耗，例如短窗口高阈值抓大事故，长窗口低阈值抓持续退化。
- 告警落地要有 PromQL/recording rule、严重级别、路由、抑制、静默、owner、Runbook、止血动作和复盘。
- 告警题要从用户影响、SLI/SLO、错误预算、burn rate、多窗口阈值、告警路由、抑制和 Runbook 回答。
- SLI 是可量化的服务健康指标，SLO 是围绕 SLI 设定的可靠性目标。
- 错误预算是 100% 与 SLO 之间允许失败的空间。
- burn rate 是错误预算被消耗的速度，用于判断是否需要告警和升级。
- 告警应该触发行动，不应只是信息提示。
- 症状告警优先于根因告警，因为用户影响更明确。
- 短窗口发现快故障，长窗口发现慢性消耗，多窗口组合能平衡灵敏度和噪声。
- 告警路由、静默、抑制和升级策略要避免告警风暴。
- SLO 告警比 CPU/内存阈值更接近用户体验，因为它关注服务是否正在消耗可靠性预算。
- 多窗口 burn rate 能同时发现快速大故障和慢性小故障，降低单一窗口误报或漏报。
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

- Multi-window multi-burn-rate alerting：多窗口多 burn rate 告警。
- Alertmanager routing/inhibition：按服务、严重级别和团队路由、抑制和静默。
- Runbook automation：告警附带排查步骤和止血命令。
- Error budget policy：错误预算消耗影响发布节奏和修复优先级。
- 可用性 SLI 要明确分母和失败条件，例如 5xx、超时和业务失败码是否计入。
- 延迟 SLO 要基于直方图分布，而不是平均延迟。
- AI/RAG 质量 SLO 要定义评测窗口、样本来源和质量阈值，不能和服务可用性混在一起。
- 告警降噪要定期复盘 false positive、重复告警、无人认领和无行动告警。
- 告警要分症状告警和根因告警，值班优先处理用户影响明确的症状告警。
- 每条告警必须有 owner、严重级别、影响面、排查入口、临时止血和升级路径。
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
- slo_burn_rate
- error_budget_remaining
- alert_noise_rate
- time_to_ack
- false_positive_rate
- http_request_duration_p95
- error_rate
- tool_error_rate
- retrieval_recall_at_k
- http_p95
- citation_precision
- eval_pass_rate

## 多轮追问模拟

### 延伸追问 1：症状告警和根因告警怎么区分？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲接口错误率、MQ 积压、Agent tool_error_rate、RAG 召回质量下降。；用 SLO burn rate、Alertmanager 路由、runbook 和 false positive 复盘作为项目证据。

### 延伸追问 2：错误预算和发布节奏有什么关系？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲接口错误率、MQ 积压、Agent tool_error_rate、RAG 召回质量下降。；用 SLO burn rate、Alertmanager 路由、runbook 和 false positive 复盘作为项目证据。

### 延伸追问 3：AI/RAG 质量 SLO 怎么设？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲接口错误率、MQ 积压、Agent tool_error_rate、RAG 召回质量下降。；用 SLO burn rate、Alertmanager 路由、runbook 和 false positive 复盘作为项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲接口错误率、MQ 积压、Agent tool_error_rate、RAG 召回质量下降。
- 用 SLO burn rate、Alertmanager 路由、runbook 和 false positive 复盘作为项目证据。

**取舍总结**
可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Multi-window multi-burn-rate alerting：多窗口多 burn rate 告警。
- Alertmanager routing/inhibition：按服务、严重级别和团队路由、抑制和静默。
- Runbook automation：告警附带排查步骤和止血命令。
- Error budget policy：错误预算消耗影响发布节奏和修复优先级。
- 可用性 SLI 要明确分母和失败条件，例如 5xx、超时和业务失败码是否计入。
- 延迟 SLO 要基于直方图分布，而不是平均延迟。
- AI/RAG 质量 SLO 要定义评测窗口、样本来源和质量阈值，不能和服务可用性混在一起。
- 告警降噪要定期复盘 false positive、重复告警、无人认领和无行动告警。
- 告警要分症状告警和根因告警，值班优先处理用户影响明确的症状告警。
- 每条告警必须有 owner、严重级别、影响面、排查入口、临时止血和升级路径。
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
- 告警题要从用户影响、SLI/SLO、错误预算、burn rate、多窗口阈值、告警路由、抑制和 Runbook 回答。

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

- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
