# 你会如何设计一个线上服务的 Dashboard 和告警 Runbook？

## 面试定位

这道题关联 Dashboard 分层、Runbook 与事故复盘闭环、SLO、错误预算与多窗口 Burn Rate 告警，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Dashboard 分层、Runbook 与事故复盘闭环」切入：Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 大屏只展示资源水位
- Runbook 没有具体查询和动作
- 面板没有 owner

## 30 秒回答

Dashboard 要分层：用户影响层看 SLO、流量、错误率、延迟；服务层看接口、实例、版本；依赖层看 DB/Redis/MQ/外部 API；资源层看 CPU、内存、GC、线程池。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- Dashboard 要分层：用户影响层看 SLO、流量、错误率、延迟；服务层看接口、实例、版本；依赖层看 DB/Redis/MQ/外部 API；资源层看 CPU、内存、GC、线程池。
- 面板不是越多越好，要围绕值班决策设计，从告警入口能快速下钻到 Trace、日志、发布和依赖。
- Runbook 要可执行：告警含义、影响面、PromQL/日志/Trace 查询、常见根因、止血动作、风险、回滚、升级联系人和复盘入口。
- Runbook 要定期演练和更新，验证 runbook_success_rate、MTTR、false positive 和行动项完成率。
- Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。
- Dashboard 是围绕用户影响、服务健康、依赖状态和资源水位组织的可视化诊断入口。
- Runbook 是告警触发后可执行的排查、止血、升级和回滚手册。
- 事故复盘闭环是把事故样本转化为监控、代码、流程和测试改进。
- 面板应该从症状到根因逐层下钻，而不是按技术组件孤立堆图。
- Runbook 要可执行、可验证、可维护，最好绑定告警和 Dashboard 链接。
- 复盘关注系统改进，不追责个人；行动项要有 owner、deadline 和验证方式。
- 事故样本要进入压测、回归、eval 或演练，而不是只写复盘文档。
- Dashboard 不是越多越好，核心是让值班人员从用户影响快速下钻到服务、依赖和资源。
- 事故复盘要输出可验证行动项，例如告警调整、限流开关、压测用例、回归样本和代码修复。
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


### 数据流怎么讲

可以按业务 SLO、指标、日志、Trace、事件、告警、Dashboard、Runbook、事故复盘和回归验证来讲。数据流通常是服务暴露 metrics、写结构化日志、传播 trace context；Collector/Prometheus/日志系统采集后执行 recording rules、采样、索引和告警，Incident Console 把症状、路径、日志细节、发布变更和用户影响串成时间线。


### 落地实现细节

- Golden signals dashboard：流量、错误、延迟、饱和度。
- Dependency dashboard：展示 DB、Redis、MQ、外部 API 和模型服务状态。
- Incident timeline：按时间合并告警、发布、指标、Trace 和人工动作。
- Postmortem action tracking：跟踪行动项完成和有效性。
- Dashboard 要区分值班入口、服务详情、依赖详情、容量规划和业务质量面板。
- Runbook 中 PromQL、日志查询和 trace 查询要可复制，避免值班时临场猜。
- 复盘要记录 detection、mitigation、root cause、rollback、blast radius 和 prevention。
- Agent/RAG 事故要把 run trace、tool call、retrieval eval 和用户反馈一起进入时间线。
- 核心面板要固定入口、SLO、错误率、延迟、流量、依赖、发布、告警和业务结果。
- Runbook 要写明判断条件、查询语句、止血动作、风险、回滚和升级联系人。
- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
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

### 面试可展开的系统设计

典型设计题是订单服务可观测体系、MQ 消费积压排障、JVM/Redis 联动事故、RAG 质量退化或 Agent tool 调用失败。架构上要包含 RED/USE 指标、SLO burn rate、trace_id 日志关联、错误链路保留、告警路由、Dashboard 分层、Runbook、复盘任务和 regression/eval 样本。

**答题时建议画出的模块**
- 入口层：参数校验、权限、租户、幂等和 request_id。
- 业务服务层：决定同步流程、异步流程、缓存读写、数据库回源、下游调用或降级返回。
- 执行层：封装存储访问、外部调用和异步任务，统一 timeout、retry、error code 和审计。
- 状态层：保存任务状态、业务状态、checkpoint 和版本。
- 观测层：指标、日志、trace、回放和 regression case。

**数据流**
- 请求进入系统后生成唯一标识，并把用户约束和业务上下文落入状态。
- 业务服务读取缓存、数据库、异步事件或下游状态，选择执行路径。
- 执行结果以结构化结果写回状态，同时上报指标。
- 保护策略判断是否完成、重试、降级、补偿或转人工。

## 真实问题与排障

真实线上问题一般从用户影响、错误率、p95/p99、slo_burn_rate、consumer_lag、gc_pause、redis_latency、span_error_rate、log_error_code、recent_deploy、series_count 和 dropped_spans 看起。回答时要先用指标确认症状，再用 Trace 定位路径，日志补局部细节，最后用复盘和回归防止复发。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- incident_mttr
- time_to_detect
- time_to_mitigate
- runbook_success_rate
- regression_case_added_count
- slo_burn_rate
- error_budget_remaining
- alert_noise_rate
- time_to_ack
- false_positive_rate

## 多轮追问模拟

### 延伸追问 1：Dashboard 里为什么要放发布信息？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲 JVM/Redis/MQ 联动事故、Agent tool 失败率、RAG 服务质量面板。；用值班入口、告警链接、Runbook 演练和事故复盘行动项作为项目证据。

### 延伸追问 2：Runbook 怎么保持不过期？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲 JVM/Redis/MQ 联动事故、Agent tool 失败率、RAG 服务质量面板。；用值班入口、告警链接、Runbook 演练和事故复盘行动项作为项目证据。

### 延伸追问 3：什么样的面板是坏面板？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲 JVM/Redis/MQ 联动事故、Agent tool 失败率、RAG 服务质量面板。；用值班入口、告警链接、Runbook 演练和事故复盘行动项作为项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲 JVM/Redis/MQ 联动事故、Agent tool 失败率、RAG 服务质量面板。
- 用值班入口、告警链接、Runbook 演练和事故复盘行动项作为项目证据。

**取舍总结**
可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Golden signals dashboard：流量、错误、延迟、饱和度。
- Dependency dashboard：展示 DB、Redis、MQ、外部 API 和模型服务状态。
- Incident timeline：按时间合并告警、发布、指标、Trace 和人工动作。
- Postmortem action tracking：跟踪行动项完成和有效性。
- Dashboard 要区分值班入口、服务详情、依赖详情、容量规划和业务质量面板。
- Runbook 中 PromQL、日志查询和 trace 查询要可复制，避免值班时临场猜。
- 复盘要记录 detection、mitigation、root cause、rollback、blast radius 和 prevention。
- Agent/RAG 事故要把 run trace、tool call、retrieval eval 和用户反馈一起进入时间线。
- 核心面板要固定入口、SLO、错误率、延迟、流量、依赖、发布、告警和业务结果。
- Runbook 要写明判断条件、查询语句、止血动作、风险、回滚和升级联系人。
- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
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
- Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。

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

- [Grafana Documentation: Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)：用于确认官方语义边界、命令行为和工程约束。
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Alertmanager Documentation](https://prometheus.io/docs/alerting/latest/alertmanager/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
