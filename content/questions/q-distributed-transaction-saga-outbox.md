# 分布式事务里 Saga、Outbox 和事务消息怎么选？

## 面试定位

这道题考跨系统一致性边界。回答要区分数据库本地事务、远程消息、Saga 补偿、事务消息和用户可见状态。不能把 MQ 当成事务，也不能只说失败后补偿。

## 30 秒回答

我会先划边界：本地事务只能保护本地数据库，跨服务一致性通常用最终一致性。Outbox 把业务表和事件表放在同一个本地事务里，再由 Relay/CDC 发布，通用且生产常用。

事务消息依赖 MQ 的半消息和事务回查；Saga 把长事务拆成多个本地事务和补偿动作；TCC 需要业务实现 try/confirm/cancel，语义强但侵入高。选择要看一致性要求、补偿是否可逆、用户状态、幂等和观测能力。

## 架构与运行机制

```mermaid
flowchart LR
  Service[Service] --> TX[Local TX]
  TX --> DB[(Business Table)]
  TX --> Outbox[(Outbox)]
  Outbox --> Relay[Relay]
  Relay --> MQ[MQ]
  MQ --> Saga[Saga Step]
  Saga --> Comp[Compensation]
  Saga --> Check[Checker]
```

图 1 展示 Outbox + Saga 数据流：本地事务写业务和事件，Relay 发布，Saga 推进步骤，失败进入补偿和对账。图中 Checker 用于发现悬挂状态。

## 深挖技术细节

Outbox 的关键是把“状态变化”和“待发布事件”放进同一个本地事务。Relay 发布成功但标记 sent 失败会重复发布，所以消费者必须幂等。

Saga 每一步都要有状态、重试、补偿和审计。补偿不是万能，外部扣款、短信、不可逆权益要谨慎处理。不可逆步骤尽量靠后，或使用人工确认。

事务消息适合 MQ 支持半消息和回查的场景，回查接口必须根据本地事务最终状态返回，而不能依赖内存。

## 关键数据结构与协议

| 字段 | 作用 | 追问 |
| --- | --- | --- |
| `event_id` | 事件幂等 | 重复发布 |
| `outbox_status` | pending/sent/failed | 发布延迟 |
| `saga_id` | 跨服务事务 | 步骤串联 |
| `step_status` | 步骤状态 | 悬挂定位 |
| `compensation_id` | 补偿幂等 | 重复补偿 |
| `last_error` | 错误上下文 | 人工处理 |

## 系统设计案例

支付成功发券：支付服务本地事务更新订单并写 outbox，Relay 发布事件，Saga 推进发券、通知、ES 同步。数据流是 payment tx -> outbox -> MQ -> saga step -> idempotent consumer -> checker。

取舍是：Outbox 通用但多组件；事务消息省表但绑定 MQ；Saga 灵活但补偿复杂；TCC 强一致但侵入高。

## 真实问题与排障

用户支付成功但权益未到账，先看 outbox pending、MQ lag、Saga step、消费者错误和补偿队列。止血可以手动补发、暂停异常消费者、限速 replay、给用户显示处理中。

根因定位看本地事务、Relay、MQ、消费者幂等和补偿任务。回归要模拟重复事件、发布失败、补偿失败和消费者超时。

## 边界条件与反例

反例：MQ 发送成功等于事务成功；补偿不可逆仍使用 Saga；没有对账；用户没有处理中状态。

## 项目表达

项目里可以说：我用 Outbox 保证订单状态和事件发布最终一致，用 Saga 状态机推进发券、通知和 ES 同步。指标看 outbox_pending_count、event_publish_lag、saga_pending_count、compensation_success_rate 和 inconsistent_count。

如果面试官追问“补偿是不是万能”，要明确不是。补偿要看业务是否可逆，发券可以撤销，短信不可撤回，外部支付要走退款或冲正。不可逆步骤要尽量靠后，或者使用人工确认和对账任务兜底。这样回答能体现你不是把 Saga 当魔法回滚。

还可以补充用户状态：最终一致性系统必须让用户知道核心动作是否成功、后置任务是否处理中、超过 SLA 后如何补救。后台则用 checker 扫描 pending、failed、sent-but-not-consumed 等状态，避免不一致长期沉默。

如果追问如何对账，可以回答：按业务事实源、outbox 状态、MQ 消费结果和下游业务表做差异扫描，例如 paid 订单必须有 PaymentSucceeded 事件，sent 事件必须有消费者处理结果。对账任务要限速、幂等、可审计。

再补一句选型收束：如果只是单服务写库，用本地事务；如果要可靠发事件，用 Outbox；如果 MQ 原生能力成熟，可考虑事务消息；如果跨多个业务步骤且可补偿，用 Saga；如果需要强预留确认且能改造业务，用 TCC。

最后强调所有方案都必须有幂等、补偿、对账和用户可见状态。

否则所谓最终一致性只是“出了问题以后人工查库”的另一种说法。

这也是面试里最需要避免的空话。

## 多轮追问模拟

1. 追问：Outbox 为什么不能只保证“消息发出去”？
   - 回答要点：Outbox 解决的是本地状态变化和待发布事件原子写入，Relay 发布到 MQ 只是下一步；Relay 可能发布成功但标记 sent 失败，也可能标记失败后重试。因此消费者必须基于 `event_id` 幂等，发布链路还要看 `outbox_pending_count`、`event_publish_lag` 和重复投递。
   - 考察点：是否理解 Outbox 是“本地事务 + 异步投递 + 幂等消费”组合，而不是单张表魔法。
   - 常见坑：认为 outbox 表里有记录就等于下游一定处理成功。

2. 追问：Saga 补偿失败怎么办？
   - 回答要点：补偿本身也要幂等、有状态、有重试、有审计；补偿失败要进入人工处理或对账队列，而不是无限重试。不可逆动作要尽量后置，例如短信、外部转账、实物履约；无法真正回滚时要用冲正、退款、撤销权益或用户可见的处理中状态。
   - 考察点：能否承认补偿不是万能，并设计失败兜底。
   - 常见坑：把 Saga 说成“失败就自动回滚”，忽略不可逆副作用。

3. 追问：RocketMQ 事务消息和 Outbox 怎么选？
   - 回答要点：事务消息依赖 MQ 的半消息、提交/回滚和事务回查，适合团队已经深度使用该 MQ 且回查接口能根据本地事务事实返回结果的场景；Outbox 更通用，可配合 CDC 或 Relay，但要维护 outbox 表、扫描、重试和去重。关键不是谁更高级，而是本地事务边界、MQ 能力、运维成熟度和消费者幂等是否成立。
   - 考察点：能否做工程选型，而不是背方案优劣。
   - 常见坑：把事务消息理解成跨服务 ACID 事务。

4. 追问：一致性对账怎么做？
   - 回答要点：从事实源出发建立不变量，例如 paid 订单必须有支付成功事件，sent 事件必须有消费者处理记录，Saga completed 必须有所有关键步骤终态。对账任务要限速、幂等、可审计，发现差异后进入补发、补偿、人工审核或用户通知流程。
   - 考察点：是否能把最终一致性落到可运营机制。
   - 常见坑：只靠日志查问题，没有周期性 checker 和指标。

## 深问准备

1. Outbox 为什么需要消费者幂等？
2. Saga 补偿失败怎么办？
3. 事务消息和 Outbox 怎么选？
4. TCC 适合什么场景？
5. 如何做一致性对账？

## 公开阅读校验

这道题对外发布时，要避免把几个方案写成并列名词表。更好的回答结构是先说本地事务边界，再按业务约束选方案：单服务内用本地事务；可靠发事件用 Outbox；MQ 原生能力成熟且团队熟悉时可用事务消息；跨多个可补偿步骤用 Saga；需要预留/确认/取消语义且业务能改造时才考虑 TCC。

Outbox 的关键不是“有一张表”，而是可恢复发布链路。业务表和 outbox event 同事务提交，Relay/CDC 发布时允许重复，消费者必须幂等，pending 事件要有 age 告警和人工处理入口。公开读者应该能从答案里看到 `event_id`、`outbox_status`、`next_retry_at`、`published_at`、`oldest_pending_age` 这些运行状态。

Saga 的关键不是“失败补偿”，而是每个步骤都有终态和去向。补偿本身可能失败，不可逆动作不能假装可以回滚，用户必须看到处理中或待人工处理状态。对账任务要周期性扫描 paid but coupon missing、sent but not consumed、saga pending too long 这类不变量破坏。

高分收束可以说：分布式事务选型不是看方案名字，而是看一致性窗口、是否可补偿、是否允许用户等待、是否能幂等重放、是否有对账和告警。这个回答比“Outbox 最终一致，Saga 补偿”更能说服读者。

## 来源与延伸阅读

- [Transactional Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html)：用于支持“业务状态和待发布事件放在同一本地事务中，再由独立进程投递”的核心机制。
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)：用于说明 Saga 由多个本地事务和补偿动作组成，而不是跨服务 ACID 回滚。
- [Apache RocketMQ Transaction Message](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage/)：用于确认事务消息的半消息、事务状态和回查语义。
- [Apache Kafka Delivery Semantics](https://kafka.apache.org/documentation/#semantics)：用于支撑重复处理、至少一次语义和消费者幂等的边界说明。
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)：用于区分本地数据库事务隔离和跨服务最终一致性。
