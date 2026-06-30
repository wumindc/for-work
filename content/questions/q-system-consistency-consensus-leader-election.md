# 一致性模型、Raft/选主和分布式锁里的 fencing token 怎么理解？

## 面试定位

这道题关联 一致性模型、共识与 Leader 选举、分布式事务、Saga 与 Outbox，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「一致性模型、共识与 Leader 选举」切入：一致性和选主题要从线性一致、最终一致、租约、脑裂、Raft 日志复制、quorum、fencing 和业务场景取舍展开。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把最终一致说成强一致
- 只有锁没有 fencing
- 忽略网络分区

## 30 秒回答

我会先说一致性是业务语义选择：强一致让读写结果更可预测，但延迟和可用性成本高；最终一致可用性好，但要有补偿、对账和用户状态表达。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先说一致性是业务语义选择：强一致让读写结果更可预测，但延迟和可用性成本高；最终一致可用性好，但要有补偿、对账和用户状态表达。
- Raft 这类共识通过 leader、term、日志复制和多数派 quorum 达成一致，适合配置、元数据、选主等控制面。
- Leader 选举要处理网络分区、租约过期和旧 leader 继续写的问题，fencing token/term/version 用来拒绝旧 leader 的写入。
- 工程上看 leader_change_count、quorum_unavailable_count、fencing_reject_count、replication_lag、stale_read_count，并设计退化策略。
- 一致性和选主题要从线性一致、最终一致、租约、脑裂、Raft 日志复制、quorum、fencing 和业务场景取舍展开。
- 一致性模型定义读写操作在并发和故障下能看到什么结果。
- 共识是在多个节点之间对日志或状态达成一致的机制。
- Leader 选举是在多个候选节点中选择唯一协调者或写入者。
- 强一致通常牺牲可用性或延迟，最终一致通常增加补偿和用户状态表达。
- Leader 不是永久正确，所有写入要带 term、lease 或 fencing token。
- 网络分区下要防止两个 leader 同时写入。
- 业务要区分控制面强一致和数据面高可用。
- 不是所有系统都需要强一致，面试要先说明业务是否能接受旧读、重复执行和最终收敛。
- Leader 选举解决单写者或协调者问题，但必须处理网络分区、租约过期、旧 leader 写入和脑裂。
- 分布式事务题要比较本地事务、Outbox、事务消息、Saga、TCC、补偿和对账，核心是跨服务状态最终收敛。
- 分布式事务是跨多个资源或服务维护一致性的机制。
- Saga 是把长事务拆成多个本地事务和补偿动作的模式。
- 每个步骤本地提交。
- 失败要补偿或人工介入。
- 消息和状态要幂等。
- 用户状态要表达处理中。
- 对账巡检不可省略。
- 强分布式事务成本高，业务系统常用最终一致性。
- Saga 每一步都要有幂等、补偿和状态记录。


### 数据流怎么讲

可以按用户入口、流量路由、负载均衡、服务发现、限流熔断、超时重试、状态存储、异步事件、一致性、容量、灾备和可观测性来讲。数据流通常是请求经过网关和负载均衡进入服务，服务通过发现/配置选择依赖，按 timeout、retry、circuit breaker 和 bulkhead 执行；状态变化写 DB/MQ/缓存，观测系统用指标、日志和 Trace 判断是否过载、降级或恢复。


### 落地实现细节

- Raft：通过 leader、term、log replication 和 quorum 达成共识。
- Lease + fencing：租约控制活跃 leader，fencing 拒绝旧 leader 写入。
- Quorum read/write：多数派读写减少脑裂风险。
- Read repair / reconciliation：最终一致系统通过修复和对账收敛。
- 分布式锁如果没有 fencing token，锁过期后的旧持有者仍可能写坏数据。
- 时钟不能作为唯一正确性来源，租约要考虑漂移和暂停。
- 选主频繁抖动通常说明健康检查、网络、GC pause 或 quorum 配置有问题。
- 用户可见状态要明确处理中、已提交、待同步和冲突修复。
- 需要单写者的任务调度、分片迁移和全局配置发布要有 fencing token 或版本校验。
- 共识系统不可用时要明确业务退化策略，而不是把所有请求挂死。
- 为每个跨服务动作定义 request_id、idempotency_key、timeout、retry policy 和 error code。
- 为最终一致性链路设计 outbox、consumer idempotency、compensation 和 checker。
- 上线后跟踪 retry_rate、timeout_rate、duplicate_rate、compensation_lag 和 inconsistent_count。
- Transactional Outbox。
- RocketMQ transaction message。
- Saga orchestrator。
- TCC。
- Consistency checker。
- Saga step 要记录 request、response、status、attempts。
- 补偿动作也要幂等。
- 对账要比较业务表、事件表和下游结果。
- 状态机要记录 step、status、attempts、last_error。
- 对账任务要能发现悬挂和补偿失败。
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

### Saga + Outbox 一致性设计

**需求与边界**
- 本地事务短。
- 跨服务状态最终收敛。
- 补偿和对账可观测。

**架构拆解**
- Service 写本地状态和 outbox。
- Saga Orchestrator 推进步骤。
- MQ 分发事件。
- Checker 对账。

**数据流**
- 写本地事务。
- 发布事件。
- 推进步骤。
- 失败补偿。
- 对账修复。

**扩展点与观测指标**
- Saga 状态分片。
- 补偿限速。
- 监控 pending、lag、compensation。

**取舍**
- 最终一致可用性高但用户状态复杂。
- TCC 语义强但侵入性高。

## 真实问题与排障

真实线上问题一般从错误率、p95/p99、timeout_rate、retry_rate、queue_depth、consumer_lag、dependency_error_rate、circuit_open_count、hot_key_qps、capacity_headroom、failover_time 和 inconsistent_count 看起。回答时要先保护核心链路，再定位是入口流量、路由、依赖、状态、一致性、容量还是发布配置问题。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- leader_change_count
- quorum_unavailable_count
- fencing_reject_count
- replication_lag
- stale_read_count
- saga_pending_count
- compensation_success_rate
- outbox_pending_count
- inconsistent_count
- event_publish_lag

## 多轮追问模拟

### 延伸追问 1：为什么只有分布式锁还不够？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲任务调度主节点、配置发布、分片迁移、Agent coordinator。；用 term、lease、fencing token、quorum 和旧 leader 拒写作为项目证据。

### 延伸追问 2：强一致和最终一致怎么选？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲任务调度主节点、配置发布、分片迁移、Agent coordinator。；用 term、lease、fencing token、quorum 和旧 leader 拒写作为项目证据。

### 延伸追问 3：选主频繁抖动怎么排查？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲任务调度主节点、配置发布、分片迁移、Agent coordinator。；用 term、lease、fencing token、quorum 和旧 leader 拒写作为项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲任务调度主节点、配置发布、分片迁移、Agent coordinator。
- 用 term、lease、fencing token、quorum 和旧 leader 拒写作为项目证据。

**取舍总结**
系统设计的取舍是可用性、性能、一致性、成本、复杂度和可运维性之间的平衡。面试追问通常会围绕负载均衡策略、重试风暴、限流熔断、服务发现、配置灰度、选主共识、多活灾备、热点治理和容量规划展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Raft：通过 leader、term、log replication 和 quorum 达成共识。
- Lease + fencing：租约控制活跃 leader，fencing 拒绝旧 leader 写入。
- Quorum read/write：多数派读写减少脑裂风险。
- Read repair / reconciliation：最终一致系统通过修复和对账收敛。
- 分布式锁如果没有 fencing token，锁过期后的旧持有者仍可能写坏数据。
- 时钟不能作为唯一正确性来源，租约要考虑漂移和暂停。
- 选主频繁抖动通常说明健康检查、网络、GC pause 或 quorum 配置有问题。
- 用户可见状态要明确处理中、已提交、待同步和冲突修复。
- 需要单写者的任务调度、分片迁移和全局配置发布要有 fencing token 或版本校验。
- 共识系统不可用时要明确业务退化策略，而不是把所有请求挂死。
- 为每个跨服务动作定义 request_id、idempotency_key、timeout、retry policy 和 error code。
- 为最终一致性链路设计 outbox、consumer idempotency、compensation 和 checker。
- 上线后跟踪 retry_rate、timeout_rate、duplicate_rate、compensation_lag 和 inconsistent_count。
- Transactional Outbox。
- RocketMQ transaction message。
- Saga orchestrator。
- TCC。
- Consistency checker。
- Saga step 要记录 request、response、status、attempts。
- 补偿动作也要幂等。
- 对账要比较业务表、事件表和下游结果。
- 状态机要记录 step、status、attempts、last_error。
- 对账任务要能发现悬挂和补偿失败。
- 一致性和选主题要从线性一致、最终一致、租约、脑裂、Raft 日志复制、quorum、fencing 和业务场景取舍展开。

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

- [etcd Documentation: Raft](https://etcd.io/docs/v3.5/learning/)：用于确认官方语义边界、命令行为和工程约束。
- [AWS Builders Library: Static stability using Availability Zones](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/)：用于确认官方语义边界、命令行为和工程约束。
- [PostgreSQL Documentation: Multiversion Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html)：用于确认官方语义边界、命令行为和工程约束。
- [Apache RocketMQ: Transaction Message](https://rocketmq.apache.org/docs/featureBehavior/04transactionmessage/)：用于确认官方语义边界、命令行为和工程约束。
- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)：用于确认官方语义边界、命令行为和工程约束。
- [PostgreSQL Documentation: Multiversion Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html)：用于确认官方语义边界、命令行为和工程约束。
