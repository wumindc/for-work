# Dashboard 分层、Runbook 与事故复盘闭环

## 面试定位

Dashboard 分层、Runbook 与事故复盘闭环 属于 Prometheus 与监控体系 / Dashboard、容量与成本治理。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。

**必须讲清楚**
- Dashboard 是围绕用户影响、服务健康、依赖状态和资源水位组织的可视化诊断入口。
- Runbook 是告警触发后可执行的排查、止血、升级和回滚手册。
- 事故复盘闭环是把事故样本转化为监控、代码、流程和测试改进。
- Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。
- Dashboard 服务决策
- Runbook 必须可执行
- 复盘要落回归

**常见追问方向**
- Prometheus 题先讲指标建模和标签基数，再讲 PromQL、告警和 SLO。
- Trace 题先讲上下文传播、span 设计、采样和跨服务根因定位。
- AI 场景要主动连接 tool_error_rate、retrieval_recall@k、citation_precision 和 eval_pass_rate。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 面板应该从症状到根因逐层下钻，而不是按技术组件孤立堆图。
- Runbook 要可执行、可验证、可维护，最好绑定告警和 Dashboard 链接。
- 复盘关注系统改进，不追责个人；行动项要有 owner、deadline 和验证方式。
- 事故样本要进入压测、回归、eval 或演练，而不是只写复盘文档。
- Dashboard 不是越多越好，核心是让值班人员从用户影响快速下钻到服务、依赖和资源。
- 事故复盘要输出可验证行动项，例如告警调整、限流开关、压测用例、回归样本和代码修复。
- Golden signals dashboard：流量、错误、延迟、饱和度。
- Dependency dashboard：展示 DB、Redis、MQ、外部 API 和模型服务状态。
- Incident timeline：按时间合并告警、发布、指标、Trace 和人工动作。
- Postmortem action tracking：跟踪行动项完成和有效性。
- Dashboard 要区分值班入口、服务详情、依赖详情、容量规划和业务质量面板。
- Runbook 中 PromQL、日志查询和 trace 查询要可复制，避免值班时临场猜。
- 复盘要记录 detection、mitigation、root cause、rollback、blast radius 和 prevention。
- Agent/RAG 事故要把 run trace、tool call、retrieval eval 和用户反馈一起进入时间线。


### 通用数据流

可以按业务 SLO、指标、日志、Trace、事件、告警、Dashboard、Runbook、事故复盘和回归验证来讲。数据流通常是服务暴露 metrics、写结构化日志、传播 trace context；Collector/Prometheus/日志系统采集后执行 recording rules、采样、索引和告警，Incident Console 把症状、路径、日志细节、发布变更和用户影响串成时间线。


### 工程落点

- 定义服务级 RED/USE 指标、业务指标和 AI 质量指标。
- 为 Trace、日志和指标统一 trace_id、tenant、workspace 和 release 维度。
- 事故后沉淀告警阈值、仪表盘、回归用例和 runbook。
- 核心面板要固定入口、SLO、错误率、延迟、流量、依赖、发布、告警和业务结果。
- Runbook 要写明判断条件、查询语句、止血动作、风险、回滚和升级联系人。
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

图 1：Dashboard 分层、Runbook 与事故复盘闭环 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Dashboard 分层、Runbook 与事故复盘闭环 的面试级设计题

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
- incident_mttr
- time_to_detect
- time_to_mitigate
- runbook_success_rate
- regression_case_added_count

**常见误区**
- 大屏只有炫酷图
- Runbook 只写概念不写动作
- 复盘没有 owner 和 deadline

## 业界方案与技术取舍

可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。

**方案对比**
- Golden signals dashboard：流量、错误、延迟、饱和度。
- Dependency dashboard：展示 DB、Redis、MQ、外部 API 和模型服务状态。
- Incident timeline：按时间合并告警、发布、指标、Trace 和人工动作。
- Postmortem action tracking：跟踪行动项完成和有效性。
- 统一大屏减少入口，但容易信息过载。
- 细分面板定位更快，但维护成本更高。
- Runbook 自动化能缩短 MTTR，但错误自动化也可能放大事故。
- 先把观测体系看成指标、日志、Trace、事件和复盘流程的组合，而不是一套监控大屏。
- 指标负责趋势和告警，Trace 负责跨服务路径，日志负责局部细节，事件负责时间线。
- 回答观测题要把业务 SLA、系统资源、依赖、Agent/RAG 指标和事故回归连起来。
- Dashboard/Runbook 题能展示你不仅会写业务代码，也会运营生产系统。
- 面试时把事故复盘落到 regression case 和告警调整，会很像真实负责人。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Dashboard 和复盘题要讲清用户影响层、服务层、依赖层、资源层、Runbook、事故时间线、行动项和回归验证。 Dashboard 是围绕用户影响、服务健康、依赖状态和资源水位组织的可视化诊断入口。 Runbook 是告警触发后可执行的排查、止血、升级和回滚手册。 事故复盘闭环是把事故样本转化为监控、代码、流程和测试改进。 面板应该从症状到根因逐层下钻，而不是按技术组件孤立堆图。 Runbook 要可执行、可验证、可维护，最好绑定告警和 Dashboard 链接。 复盘关注系统改进，不追责个人；行动项要有 owner、deadline 和验证方式。 事故样本要进入压测、回归、eval 或演练，而不是只写复盘文档。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `dashboard_layer` | Dashboard | 用户影响、服务、依赖、资源或业务质量 | 支持从症状下钻 |
| `panel_owner` | Dashboard | 负责维护面板语义 | 防止长期失真 |
| `runbook_step` | Runbook | 排查、止血、回滚或升级动作 | 值班可执行 |
| `precondition` | Runbook | 执行动作前的判断条件 | 避免错误止血 |
| `incident_timeline_event` | 事故时间线 | 告警、发布、操作和指标变化 | 复盘顺序 |
| `action_owner` | 复盘任务 | 负责修复或流程改进 | 防止行动项悬空 |
| `verification_signal` | 复盘任务 | 证明行动项有效的指标或测试 | 关闭复盘闭环 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 公开阅读校验

这篇文章对外阅读时，要把 Dashboard 从“展示页面”提升为“值班决策入口”。好的 Dashboard 应该按用户影响、服务健康、依赖状态、资源饱和、发布变更和业务质量分层，而不是把 CPU、内存、QPS 随意铺满。值班人员进入第一屏就应该知道影响面、是否仍在恶化、是否和发布相关、下一步应该点到哪里。

Runbook 的判断标准是可执行。每条高优先级告警至少要绑定：影响说明、常用 PromQL、日志查询模板、Trace 入口、止血动作、动作风险、回滚条件、升级联系人和恢复验证。只写“检查数据库是否正常”不够，应该写清查哪个面板、看哪个指标、阈值是多少、异常时做什么。

事故复盘的闭环不能停在文档。复盘行动项要进入 issue 或任务系统，有 owner、deadline、验证方式和关闭证据。可关闭证据可以是新增告警、runbook 更新、压测脚本、故障注入、回归样本、代码修复或演练记录。否则复盘只是记录事故，不会提升系统韧性。

如果落到 Agent/RAG 场景，Dashboard 还要覆盖质量和轨迹：tool error rate、retrieval recall、citation precision、eval pass rate、模型限流、队列 lag、失败 run replay 数。这样事故时间线既能解释传统服务故障，也能解释“接口成功但答案质量下降”的产品级故障。

## 来源与延伸阅读

- [Grafana Documentation: Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
- [Google SRE Workbook: Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)：用于确认官方语义边界、命令行为和工程约束。
