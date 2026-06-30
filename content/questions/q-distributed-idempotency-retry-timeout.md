# 分布式系统里幂等、重试和超时怎么设计？

## 面试定位

这道题考失败模型。回答要说明超时不等于失败、重试会放大故障、写操作必须幂等、限流降级保护核心链路。它连接 API、MQ、Redis、线程池和 Agent 工具调用。

## 30 秒回答

我会先定义失败模型：网络超时、重复请求、部分成功、下游过载和结果未知。写操作必须有幂等键，幂等记录保存 `processing/succeeded/failed`、`request_hash` 和结果摘要。

重试只针对可恢复错误，必须有指数退避、jitter、最大次数和错误分类。超时要按端到端 SLA 分解，不能层层相加。限流、熔断和降级用于保护下游和核心链路。指标看 `retry_rate`、`timeout_rate`、`idempotency_conflict_count`、`rate_limited_count` 和 `degrade_count`。

## 架构与运行机制

```mermaid
flowchart LR
  Client[Client] --> Gateway[Rate Limit]
  Gateway --> SDK[Timeout / Retry]
  SDK --> API[API Service]
  API --> Idem[(Idempotency Store)]
  API --> Down[Downstream]
  Down --> Unknown[Success / Fail / Unknown]
  API --> Fallback[Fallback]
```

图 1 的核心是 Idempotency Store 和 Unknown 状态。超时后不能直接认为失败，可能下游已经成功但响应丢失。

## 深挖技术细节

幂等键要对应一次业务意图。支付创建可以用订单号和操作类型，Agent 工具执行可以用 run_id + tool_call_id。服务端要校验 request_hash，避免同一 key 被不同请求体复用。

重试要按错误码分类。timeout、rate_limited、temporary_5xx 可重试；validation_error、permission_denied、insufficient_balance 不应重试。退避要加 jitter，避免所有客户端同步重试。

超时预算要从用户 SLA 倒推。用户接口 2 秒，内部多个依赖不能各自 2 秒。超时后要提供查询、幂等重试或补偿。

## 关键数据结构与协议

| 字段 | 作用 | 追问 |
| --- | --- | --- |
| `idempotency_key` | 防重复副作用 | 粒度 |
| `request_hash` | 防 key 误用 | 冲突处理 |
| `status` | 处理状态 | unknown |
| `retry_count` | 重试次数 | 风暴 |
| `timeout_ms` | 超时预算 | SLA |
| `error_code` | 错误分类 | retryable |

## 系统设计案例

支付创建 API：Gateway 限流，服务端检查 Idempotency-Key，写幂等记录，调用支付渠道设置超时和重试，结果写状态机。数据流是 request -> idempotency -> business tx -> downstream -> result/query/fallback。

取舍是：幂等存储增加成本但保护资金；短超时保护体验但增加 unknown；重试提升成功率但可能放大下游故障。

## 真实问题与排障

支付渠道超时升高时，先看影响面、timeout_rate、retry_rate、渠道 p95、幂等冲突和线程池队列。止血可以降低重试、熔断渠道、切备用渠道、返回处理中。

根因定位看错误码、网络、下游状态和客户端重试策略。回归要模拟超时、重复请求、同 key 不同参数和 rate limit。

## 边界条件与反例

反例：没有幂等就重试写操作；所有错误都重试；超时时间层层相加；降级没有用户状态。

## 项目表达

项目里可以说：我在支付创建和 Agent 工具执行中都使用业务幂等键，记录 request_hash、status 和 result_hash。一次渠道超时事故中，我们用处理中状态止血，查询渠道结果后补偿，并把 retry_rate 和 idempotency_conflict_count 加入告警。

如果追问为什么不能简单重试，可以补充：写操作的副作用通常发生在远端，调用方超时只代表没拿到响应，不代表远端没有执行。没有查询和幂等，重试就是用另一次副作用赌结果。

再补一个项目证据：幂等表里保存 status 和 result_hash 后，客户端超时重试可以直接拿到上一次结果；如果仍在 processing，就返回处理中并让前端轮询。这样用户体验、服务端状态和下游副作用是一致的，不会因为网络抖动产生重复业务。

如果面试官追问限流和降级，可以说限流是在入口控制请求量，熔断是在依赖异常时快速失败，降级是在功能层返回低成本结果。三者目标都是保护核心链路，但触发条件和用户体验不同。

最后可以用一句话总结：分布式可靠性不是让每次调用都成功，而是在失败不可避免时，让副作用不重复、状态可查询、压力不扩散、用户能理解。

这句话能很好地收束幂等、重试、超时和降级四个关键词。

## 深问准备

1. 幂等键怎么设计？
2. 超时后结果未知怎么办？
3. 如何避免重试风暴？
4. 限流、熔断、降级怎么配合？
5. Agent 工具如何保证幂等？

## 来源与延伸阅读

- RabbitMQ confirms 官方文档：用于理解重复和确认边界。
- Prometheus 官方文档：用于支持 retry/timeout 指标。
