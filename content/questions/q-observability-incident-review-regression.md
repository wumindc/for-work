# 一次线上事故复盘应该包含什么？如何确保问题不再发生？

## 面试定位

这道题关联 Dashboard 分层、Runbook 与事故复盘闭环、Tracing、日志与事故复盘，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Dashboard 分层、Runbook 与事故复盘闭环」切入：Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 复盘只写根因不写影响
- 行动项没有 owner
- 没有回归验证

## 30 秒回答

复盘先写事实时间线：发现、确认、影响面、止血、根因、修复、恢复、沟通和回滚，避免一上来归责。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 复盘先写事实时间线：发现、确认、影响面、止血、根因、修复、恢复、沟通和回滚，避免一上来归责。
- 内容要包括用户影响、SLO 消耗、告警是否及时、Trace/日志/指标证据、发布变更、直接原因、系统性原因和哪些防线失效。
- 行动项要可验证：代码修复、告警调整、Runbook 更新、压测/演练、回归用例、权限或配置治理，每项有 owner、deadline 和验收指标。
- 对 Agent/RAG 事故，还要把失败 run trace、tool args hash、retrieval/eval 样本加入 regression/eval，防止只修 prompt 不修系统。
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
- Tracing 题要讲清 trace/span、上下文传播、采样、日志关联、事故时间线、根因定位和回归验证。
- Tracing 是用 trace/span 表达一次请求跨组件执行路径的观测方法。
- 事故复盘是把影响面、止血、根因、修复、回滚和回归沉淀成可复用流程。
- 上下文传播必须跨线程和异步边界。
- 日志字段要和 trace/span 对齐。
- 采样要保留错误和慢请求。
- 事故时间线比单点日志更重要。
- 复盘必须产出回归验证。
- Trace 适合看跨服务调用路径和耗时分布。
- 日志适合保存局部状态、错误码和关键字段。


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
- OpenTelemetry trace context。
- Structured logging。
- Error sampling and tail sampling。
- Incident timeline。
- Trace replay / run replay。
- MQ 消息 header 要携带 traceparent。
- 线程池要传播和清理上下文。
- Agent trace 要保存 tool、args hash、observation、verdict。
- trace_id 要跨线程、MQ、HTTP 和异步任务传播。
- 采样策略要兼顾成本和故障样本保留。
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

### 事故 Trace 与复盘系统

**需求与边界**
- 跨 HTTP、MQ、线程池和 Agent run 传播 trace。
- 支持错误链路保留和回放。
- 复盘输出回归用例。

**架构拆解**
- Trace SDK 注入上下文。
- Log Appender 写结构化日志。
- Collector 接收 trace/log/metric。
- Incident Console 聚合时间线。

**数据流**
- 请求创建 trace。
- 跨服务传播。
- 错误链路保留。
- 复盘生成 runbook。

**扩展点与观测指标**
- tail sampling。
- 敏感字段脱敏。
- 冷热存储分层。
- 监控 trace ingestion、dropped spans、sampling rate。

**取舍**
- 全量 trace 成本高，采样可能漏证据。
- 日志越详细越利于排障但隐私风险越高。

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
- trace_coverage
- span_error_rate
- replay_success_rate
- root_cause_found_rate
- tool_error_rate
- policy_block_count

## 多轮追问模拟

### 延伸追问 1：如何做无责复盘？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲一次缓存雪崩、MQ 积压、JVM GC 或 Agent 工具失败事故。；用 incident timeline、action item、regression case 和演练结果作为项目证据。

### 延伸追问 2：复盘行动项怎么验收？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲一次缓存雪崩、MQ 积压、JVM GC 或 Agent 工具失败事故。；用 incident timeline、action item、regression case 和演练结果作为项目证据。

### 延伸追问 3：Agent 事故如何进入 eval？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲一次缓存雪崩、MQ 积压、JVM GC 或 Agent 工具失败事故。；用 incident timeline、action item、regression case 和演练结果作为项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲一次缓存雪崩、MQ 积压、JVM GC 或 Agent 工具失败事故。
- 用 incident timeline、action item、regression case 和演练结果作为项目证据。

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
- OpenTelemetry trace context。
- Structured logging。
- Error sampling and tail sampling。
- Incident timeline。
- Trace replay / run replay。
- MQ 消息 header 要携带 traceparent。
- 线程池要传播和清理上下文。
- Agent trace 要保存 tool、args hash、observation、verdict。
- trace_id 要跨线程、MQ、HTTP 和异步任务传播。
- 采样策略要兼顾成本和故障样本保留。
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
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
