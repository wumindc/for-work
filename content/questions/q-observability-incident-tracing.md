# 线上事故如何用 Trace、日志和指标定位根因？

## 面试定位

这道题考的是事故定位方法。回答要把指标、Trace、日志和事件时间线分工讲清楚：指标发现趋势和影响面，Trace 还原跨服务路径，日志补充局部细节，复盘沉淀 runbook 和回归。

## 30 秒回答

我会先建立影响面和时间线：哪些用户、接口、服务、版本、错误率、p95、依赖和发布事件。指标用来判断症状和范围，Trace 用来定位一次请求经过哪些服务和 span，日志用来解释每个节点的 error_code、参数摘要和状态。

Trace 要跨 HTTP、MQ、线程池和 Agent run 传播；错误和慢请求要提高采样或 tail sampling 保留。事故后要产出根因、止血、回滚、修复、告警调整、runbook 和回归用例。

## 架构与运行机制

```mermaid
flowchart LR
  Alert[Alert] --> Metrics[Metrics]
  Metrics --> Trace[Trace Search]
  Trace --> Logs[Structured Logs]
  Logs --> Timeline[Incident Timeline]
  Timeline --> RCA[Root Cause]
  RCA --> Regression[Regression Case]
```

图 1 的数据流是：告警触发后从指标确定范围，再用 Trace 找链路，日志补细节，最后形成事故时间线和回归。图中 Regression 是关键，因为没有回归的复盘很容易再次发生。

## 深挖技术细节

Trace 的核心是上下文传播。HTTP 用 `traceparent`，MQ 要把 trace context 放进 message header，线程池要捕获和恢复上下文，Agent run 要把 run_id、tool_call_id 和 trace_id 关联。异步边界最容易断链。

日志要结构化，字段包括 trace_id、span_id、service、route、error_code、tenant、release_id、payload_hash。敏感字段不能直接落日志，尤其是 prompt、用户输入、token 和工具参数。

采样策略要考虑故障证据。普通请求可以低采样，错误、慢请求、高风险操作要强制保留。否则事故发生时只看到指标没有链路。

## 关键数据结构与协议

| 字段 | 作用 | 风险 |
| --- | --- | --- |
| `trace_id` | 串联请求 | 异步断链 |
| `span_id` | 标识操作 | 层级错误 |
| `traceparent` | 跨服务传播 | 伪造和丢失 |
| `error_code` | 错误分类 | 不稳定难聚合 |
| `payload_hash` | 参数摘要 | 摘要不足影响定位 |
| `run_id` | Agent 任务 | 要映射 trace |

## 系统设计案例

设计 Agent 工具调用排障系统：每个 run 创建 trace，每个 tool call 是 span，HTTP/MQ/DB/Redis 调用继续派生 span，日志记录 args_hash、policy verdict、error_code。数据流是 run -> tool span -> downstream span -> metrics/logs -> incident console。

取舍是：全量 Trace 成本高；采样会漏证据；日志越详细越利于排障但隐私风险越高。面试追问通常会问 MQ trace 传播、tail sampling、日志脱敏和 Agent trace replay。

## 真实问题与排障

Agent 工具失败率升高时，先看影响面：哪个工具、哪个版本、哪个 workspace、错误码、模型、权限策略、下游 p95。止血可以禁用工具、回滚 schema、降低并发或转人工。

根因定位沿 Trace 看：模型参数是否错，权限是否拦截，工具是否超时，MQ 是否丢上下文，线程池是否打满。回归要保存失败 run 并加入 replay。

## 边界条件与反例

反例：日志无 trace_id；日志保存完整敏感参数；采样丢错误链路；复盘没有回归。

## 项目表达

项目里可以说：我把传统分布式 Trace 和 Agent run trace 对齐，一次工具事故中通过 trace 发现失败集中在新 tool schema，日志的 args_hash 证明参数校验失败，回滚后把失败 run 加入回放测试。

如果继续追问复盘产物，可以说每次事故至少留下四样东西：修复代码、告警或面板调整、runbook 更新、回归用例。对 Agent 系统，回归用例最好包含原始目标、工具 schema、参数摘要、observation 和 verifier 结果，这样下次模型或工具升级时能自动复测。

还可以补一个排障顺序：先用指标判断是全局还是局部，再用 Trace 找慢 span 或错误 span，最后用日志看 error_code、release_id 和参数摘要。不要反过来一上来翻海量日志，否则很容易被噪声带偏。这个顺序能体现生产排障经验。

如果面试官问“如何证明修好了”，回答要包含回归：同一失败链路能 replay，告警阈值覆盖同类问题，dashboard 能看到错误率和 p95 回落，日志中 error_code 不再出现。没有这些证据，只能算临时恢复。

## 多轮追问模拟

1. 追问：Trace、日志、指标三者分别解决什么问题？
   - 回答要点：指标负责趋势、范围和告警，适合回答“影响多少用户、是否仍在恶化”；Trace 负责一次请求或任务的跨服务路径，适合回答“慢在哪个 span、错在哪个依赖”；日志负责局部事实，适合回答“这个节点当时的 error_code、release_id、参数摘要是什么”。排障顺序通常是指标定范围、Trace 定路径、日志定细节。
   - 考察点：是否理解不同观测信号的粒度。
   - 常见坑：把 trace_id 写进日志后就认为有了 Trace。

2. 追问：MQ、线程池、异步任务为什么容易断 Trace？
   - 回答要点：同步 HTTP 可以靠 `traceparent` 头传播，MQ 要把 trace context 放入 message header，线程池要在提交任务时捕获上下文、执行时恢复、执行后清理。Agent run 也要把 `run_id` 和 `trace_id` 建映射，否则模型调用、工具调用和状态写入无法回放。
   - 考察点：异步边界和上下文传播能力。
   - 常见坑：只在入口网关生成 trace_id，消费者和后台任务完全断链。

3. 追问：为什么事故时只靠头部采样可能不够？
   - 回答要点：头部采样在请求开始时决定是否保留，可能把之后变慢或出错的请求丢掉；tail sampling 可以根据结果保留错误、慢请求和高价值链路，但需要 Collector 缓冲和策略配置。生产上可以普通流量低采样，错误、慢请求、支付、权限、Agent 工具执行提高保留概率。
   - 考察点：采样策略与证据保留的取舍。
   - 常见坑：为了省成本把所有错误链路也随机丢掉。

4. 追问：日志和 Trace 里哪些信息不能直接记录？
   - 回答要点：不能直接记录完整 prompt、用户输入、token、身份证、订单隐私、完整 SQL 参数或工具原始参数。可以用字段白名单、hash、摘要、error_code、evidence_id、chunk_version 等替代，并配合访问控制和保留周期。排障需要足够上下文，但不能以泄露隐私为代价。
   - 考察点：可观测性和安全合规的平衡。
   - 常见坑：为排障方便把完整 payload 放进日志。

## 深问准备

1. Trace 和日志的边界？
2. MQ 异步链路怎么传 trace？
3. Tail sampling 为什么有用？
4. 如何做日志脱敏？
5. Agent trace replay 怎么设计？

## 来源与延伸阅读

- [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/)：用于确认 trace/span、事件、属性和跨组件请求路径的基本语义。
- [OpenTelemetry Context Propagation](https://opentelemetry.io/docs/concepts/context-propagation/)：用于支撑 HTTP、MQ、线程池和 Agent run 传播上下文的设计原则。
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)：用于说明 `traceparent` 作为跨系统传播 trace 上下文的标准字段。
- [OpenTelemetry Sampling](https://opentelemetry.io/docs/concepts/sampling/)：用于解释头部采样、尾部采样和错误/慢请求证据保留的取舍。
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)：用于连接指标告警、事故时间线和回归验证。
