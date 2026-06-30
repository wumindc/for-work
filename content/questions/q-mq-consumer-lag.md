# 线上 MQ 消费积压突然升高，你会如何定位和处理？

## 面试定位

这是现场排障题。回答要体现先止血、再定位、后治理，并说明扩容、限流、隔离和降级之间的取舍。不能只说“加消费者”。

## 30 秒回答

我会先确认影响面：consumer lag、消息年龄、业务延迟、错误率和下游压力。止血上可以限流上游、暂停毒丸消息、扩容消费者或降级非核心任务。

定位时沿数据流看：producer 是否突增，broker 是否异常，consumer 是否处理慢，下游是否限流，是否有毒丸消息、rebalance 或线程池耗尽。最后把失败样本进入 DLQ、补偿和回归。

## 标准回答

第一步看指标。消费积压可能是生产变多，也可能是消费变慢。要同时看 produce_tps、consume_tps、consumer_lag、oldest_message_age、processing_p95、error_rate、retry_rate 和 DLQ_count。

第二步分段排查。broker 磁盘、网络、分区热点会影响投递。consumer 线程池、数据库慢查询、外部 API 限流、代码异常都会拖慢处理。毒丸消息会造成反复重试。

第三步恢复。短期可以隔离异常消息、提高并发、限流下游调用、暂停非核心消费者。长期要优化批处理、幂等、重试退避、DLQ 治理和容量规划。

## 架构与运行机制

数据流是 producer 写入 topic，broker 按分区或队列保存，consumer group 拉取并处理，业务成功后 ack/commit offset。任何一段慢下来都会形成 lag。

## 可画图

```mermaid
flowchart LR
  Producer[Producer TPS] --> Broker[Broker / Partitions]
  Broker --> Consumer[Consumer Group]
  Consumer --> Downstream[DB / API]
  Consumer --> Retry[Retry]
  Retry --> DLQ[DLQ]
  Metrics[Metrics] --> Producer
  Metrics --> Broker
  Metrics --> Consumer
  Metrics --> Downstream
```

## 系统设计案例

RAG embedding 队列突然积压，可能是文档同步突增，也可能是 embedding API 限流。先看生产速率和消费耗时。如果下游限流，盲目扩容 consumer 会加剧失败，应该限流、退避和分批处理。

## 真实问题与排障

常见根因包括流量突增、消费者发布 bug、数据库慢查询、外部服务限流、单分区热点、rebalance 频繁、毒丸消息和 retry 风暴。

关键指标是 `consumer_lag`、`oldest_message_age`、`consume_tps`、`processing_p95`、`retry_rate`、`DLQ_count`、`rebalance_count` 和 `downstream_error_rate`。

## 面试官追问

### 追问 1：能直接加消费者吗？

要看瓶颈。如果瓶颈在下游 DB 或外部 API，加消费者会放大压力。如果分区数不足，加消费者也不一定有效。

### 追问 2：毒丸消息怎么办？

识别失败次数和错误类型，超过阈值进 DLQ，不能让它阻塞正常消息。

### 追问 3：如何防止复发？

容量水位告警、重试退避、DLQ 治理、限流、批处理优化和压测。

## 项目化回答

这题可以连接到 Agent 异步执行队列、ES 同步队列和 embedding 任务队列。项目里要讲 lag、retry、DLQ 和下游保护。

## 常见错误

- 只说扩容消费者。
- 不区分生产突增和消费变慢。
- 忽略下游限流。
- 毒丸消息反复重试。

## 深挖技术细节

我会把 lag 排查拆成“队列水位、消费执行、下游依赖、重试链路”四层。队列层看 `partition_lag`、`oldest_message_age`、broker 磁盘和 ISR/副本状态；执行层看 consumer poll 间隔、批大小、线程池队列、单条 `processing_latency_p95`；依赖层看 DB 慢查询、外部 API 429、连接池耗尽；重试层看 retry topic 是否把失败消息重新打回主链路形成风暴。

关键不是单点指标，而是对齐时间线：生产 TPS 从 10:00 突增、consumer p95 从 10:03 变慢、downstream error 从 10:05 升高，三者代表不同根因。定位时 trace 要带 `topic`、`partition`、`offset`、`message_id`、`attempt`、`handler_version`、`downstream_status` 和 `ack_result`，否则只能看到 lag 变高，却不知道哪类消息或哪版代码制造了积压。

## 边界条件与反例

“加消费者”只有在分区足够、瓶颈在 consumer CPU 或本地处理、下游还能承压时才有效。如果 Kafka topic 只有 4 个分区，consumer group 加到 20 个也只有 4 个实例真正消费；如果瓶颈是数据库锁等待，扩容 consumer 会把锁竞争和 retry 放大。遇到顺序消息时还要保护同一 key 的顺序，不能简单并发打散。

另一个反例是毒丸消息。某条消息因为 schema 变更或空字段一直失败，如果 retry 没有退避和最大次数，它会反复占用消费线程，让正常消息被拖慢。正确做法是按错误类型区分 transient 和 permanent：临时错误指数退避，永久错误进入 DLQ，并保留原始 payload、错误栈、handler 版本和重放策略。

## 深问准备

面试官如果追问“怎么判断恢复成功”，我会回答三个水位：lag 下降斜率大于生产速率、`oldest_message_age` 回到 SLA 内、业务 `error_rate` 和 `processing_p95` 回归基线。只看 lag 清零不够，因为可能是丢弃、错误 ack 或暂停生产造成的假恢复。

如果继续问“怎么做长期治理”，可以讲容量模型：`required_consumers = peak_produce_tps * avg_processing_time / target_utilization`，再用压测验证分区数、批处理大小、连接池、限流和 DLQ 重放能力。告警要按年龄和业务延迟触发，不能只按消息数量，因为低 TPS 但消息很老同样影响 SLA。

## 来源与延伸阅读

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [RabbitMQ DLX](https://www.rabbitmq.com/docs/dlx)
