# 如何做容量规划和热点治理？为什么只看平均 QPS 不够？

## 面试定位

这道题关联 容量规划、热点治理与压测回归、Redis 热 key、击穿、穿透与雪崩治理，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「容量规划、热点治理与压测回归」切入：容量题要从流量模型、峰值、瓶颈、热点 key、压测、容量水位、降级预案和发布回归展开。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 只看平均值
- 没有真实数据分布
- 压测不覆盖降级和故障

## 30 秒回答

容量规划先建流量模型：QPS、并发、读写比、数据量、峰值因子、单请求资源消耗、下游容量和目标 SLA。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 容量规划先建流量模型：QPS、并发、读写比、数据量、峰值因子、单请求资源消耗、下游容量和目标 SLA。
- 平均 QPS 会掩盖热点，真正危险的是单 key、单租户、单分片、单接口、单队列或单下游过载；还要考虑失败重试带来的放大。
- 压测要覆盖真实数据分布、缓存失效、依赖限流、MQ 积压、长稳内存、降级路径和故障恢复，而不是只跑 happy path。
- 指标看 capacity_headroom、hot_key_qps、saturation、queue_depth、cost_per_request、p95/p99、错误率和扩容时间。
- 容量题要从流量模型、峰值、瓶颈、热点 key、压测、容量水位、降级预案和发布回归展开。
- 容量规划是根据业务流量、数据规模、资源消耗和 SLA 预测系统承载能力。
- 热点是少量 key、租户、接口、分片或依赖承载了不成比例的请求。
- 压测回归是用可复现负载验证系统在目标容量和故障条件下的表现。
- 峰值、突刺、热点和失败重试比平均 QPS 更能决定系统风险。
- 容量要按端到端链路看，包括入口、服务、线程池、DB、Redis、MQ、外部 API 和观测系统。
- 压测必须有真实数据分布和失败注入，否则无法暴露热点和退化路径。
- 扩容、限流、降级和缓存预热要作为容量方案的一部分。
- 容量规划不是估机器数，而是从 QPS、并发、数据量、读写比、峰值因子、下游容量和 SLA 推导瓶颈。
- 热点治理要关注单 key、单分片、单租户、单接口、单队列和单下游，而不是只看系统平均值。
- Redis 稳定性题要区分热 key、缓存击穿、缓存穿透和缓存雪崩，并给出限流、隔离、互斥重建、空值缓存、TTL 抖动、预热和降级的组合方案。
- 热 key 是访问集中到少数 Redis key，导致单分片、单连接、网络或下游回源压力异常升高。
- 缓存击穿是热点 key 过期或被删除后，大量并发请求同时 miss 并回源重建。
- 缓存穿透是请求的数据本身不存在，缓存无法命中，恶意或异常请求持续打到 DB；缓存雪崩是大量 key 同时失效或缓存整体不可用造成大面积回源。
- 先分类再治理：热 key 关注分布和分片，击穿关注重建并发，穿透关注无效请求过滤，雪崩关注批量失效和整体故障。
- 事故处理优先保护事实源 DB 和核心链路，必要时返回旧值、降级非核心字段或限流。
- 热点治理不能只靠 Redis，客户端本地缓存、CDN、多级缓存、队列削峰和业务开关都要进入设计。
- 分布式锁只能控制重建并发，不能替代超时、fencing token、降级、回滚和可观测性。
- 所有缓存保护策略都要配回归压测，防止修复把不一致窗口、尾延迟或资源占用推高。
- 热 key 是少数 key 承担过高 QPS；击穿是热点 key 失效瞬间大量请求回源；穿透是不存在的数据反复打到 DB；雪崩是大量 key 同时失效或 Redis 故障导致整体回源。


### 数据流怎么讲

可以按用户入口、流量路由、负载均衡、服务发现、限流熔断、超时重试、状态存储、异步事件、一致性、容量、灾备和可观测性来讲。数据流通常是请求经过网关和负载均衡进入服务，服务通过发现/配置选择依赖，按 timeout、retry、circuit breaker 和 bulkhead 执行；状态变化写 DB/MQ/缓存，观测系统用指标、日志和 Trace 判断是否过载、降级或恢复。

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 落地实现细节

- Load test / stress test / soak test：不同目标的压测类型。
- Capacity headroom：保留突发和故障切换余量。
- Hot key detection：按 key、分片、租户和接口识别热点。
- Autoscaling + prewarming：自动扩缩和活动前预热。
- 容量模型要明确单请求 CPU、内存、DB rows examined、Redis ops、MQ messages 和外部 API 调用。
- 热点治理可用本地缓存、分片、队列化、限流、预热、读模型和降级。
- 长稳压测要观察内存泄漏、GC、连接池、日志成本和监控采集容量。
- 发布前后要比较 p95/p99、错误率、资源水位和关键业务成功率。
- 压测要覆盖核心链路、降级路径、依赖限流、缓存失效、MQ 积压和故障恢复。
- 容量水位要设置告警和扩容阈值，并记录 capacity_headroom、saturation 和 cost_per_request。
- 为每个跨服务动作定义 request_id、idempotency_key、timeout、retry policy 和 error code。
- 为最终一致性链路设计 outbox、consumer idempotency、compensation 和 checker。
- 上线后跟踪 retry_rate、timeout_rate、duplicate_rate、compensation_lag 和 inconsistent_count。
- Hot key detection：基于 Redis command stats、代理层采样、客户端埋点和 trace 聚合识别热 key。
- Mutex rebuild / singleflight：同一 key 同一时间只允许一个请求回源重建，其余等待、返回旧值或快速失败。
- Bloom filter + null cache：过滤不存在的 id，对合法不存在结果短 TTL 缓存空值，降低穿透。
- TTL jitter + warmup：TTL 加随机抖动并对热点 key 提前预热，降低雪崩概率。
- Stale cache + degrade switch：缓存不可用或回源过载时返回可接受旧值，关闭非核心字段或降级推荐模块。
- 热 key 发现可以从客户端埋点、代理层采样、Redis slowlog、命令统计和 trace 标签同时入手，避免只看平均 QPS。
- 重建锁要设置过期时间、owner token 和版本校验；锁超时后第二个写者不能用旧值覆盖新值。
- 空值缓存要使用短 TTL，并区分真的不存在、权限不可见和下游错误，否则会把故障缓存成空结果。
- 雪崩治理要把 TTL 抖动、预热、限流、熔断、stale value 和回源队列一起设计。
- 事故回归要沉淀压测脚本：模拟热点 key 过期、随机 id 穿透、Redis 分片高延迟和 DB 回源限流。
- 上线前要为热点 key、big key、slowlog、connection count、evicted keys、expired keys 和 DB fallback QPS 建看板。

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

### 高并发活动页 Redis 稳定性治理设计

**需求与边界**
- 活动页核心接口在热点流量下保持可用。
- 缓存击穿、穿透、雪崩发生时保护 DB 和推荐服务。
- 事故能快速定位影响面、止血、回滚并形成回归压测样例。

**架构拆解**
- API Gateway 做限流和灰度开关。
- Application Local Cache 保存短 TTL 热点配置。
- Redis Cluster 承担共享缓存，并通过代理或埋点识别热 key。
- Rebuild Coordinator 使用 singleflight/lock 控制回源重建。
- Fallback Layer 返回 stale value、默认配置或降级内容。
- Observability Stack 聚合 Redis、DB、应用和 trace 指标。

**数据流**
- 请求进入网关，先按用户、活动和接口维度限流。
- 应用查询本地缓存，未命中再查 Redis。
- Redis miss 后进入重建协调器，只有持有重建权的请求回源。
- 回源成功后写 Redis 和本地缓存，同时记录 source_version 和 generated_at。
- 回源失败或超时则返回 stale value 或降级内容，并记录 degraded=true。
- 监控系统按 key、接口、trace 和下游服务聚合异常。

**扩展点与观测指标**
- 热点 key 可拆成分片 key 或本地缓存广播，降低单 Redis 分片压力。
- 活动发布前预热核心 key，避免首次访问集中回源。
- 重建队列限速，避免 DB 被缓存 miss 和重试同时放大。
- 监控 per-key QPS、cache_hit_rate、cache_miss_rate、backend_fallback_qps。
- 监控 redis_latency_p95、slowlog_count、big_key_count、evicted_keys 和 connection_count。
- 监控 DB p95、DB error_rate、degrade_count、stale_return_count 和 rebuild_lock_wait。
- Trace 中记录 cache_status、cache_key_hash、lock_owner、fallback_reason 和 source_version。

**取舍**
- 返回旧值保护可用性，但要明确 stale TTL 和用户可见风险。
- 本地缓存降低 Redis 压力，但会增加失效广播和多实例一致性成本。
- Bloom filter 降低穿透，但存在误判和重建成本，需要随数据源更新。

## 真实问题与排障

真实线上问题一般从错误率、p95/p99、timeout_rate、retry_rate、queue_depth、consumer_lag、dependency_error_rate、circuit_open_count、hot_key_qps、capacity_headroom、failover_time 和 inconsistent_count 看起。回答时要先保护核心链路，再定位是入口流量、路由、依赖、状态、一致性、容量还是发布配置问题。

真实线上问题一般从 hot key、big key、slowlog、latency monitor、evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio、connected_clients、blocked_clients、replication lag、AOF rewrite 和 Cluster slot 迁移看起。回答时要先保护 DB 和核心接口，再定位是命令模型、数据结构、内存、网络、复制还是客户端问题。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- capacity_headroom
- hot_key_qps
- saturation
- queue_depth
- cost_per_request
- backend_fallback_qps
- cache_rebuild_lock_wait
- redis_latency_p95
- db_latency_p95
- cache_miss_rate

## 多轮追问模拟

### 延伸追问 1：压测环境和线上差异怎么处理？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲秒杀、热门 RAG 文档、Agent 工具队列、模型 API 限额。；用容量模型、压测报告、热点指标、降级开关和回归脚本作为项目证据。

### 延伸追问 2：热点 key 怎么发现和治理？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲秒杀、热门 RAG 文档、Agent 工具队列、模型 API 限额。；用容量模型、压测报告、热点指标、降级开关和回归脚本作为项目证据。

### 延伸追问 3：容量水位怎么设告警？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲秒杀、热门 RAG 文档、Agent 工具队列、模型 API 限额。；用容量模型、压测报告、热点指标、降级开关和回归脚本作为项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲秒杀、热门 RAG 文档、Agent 工具队列、模型 API 限额。
- 用容量模型、压测报告、热点指标、降级开关和回归脚本作为项目证据。

**取舍总结**
系统设计的取舍是可用性、性能、一致性、成本、复杂度和可运维性之间的平衡。面试追问通常会围绕负载均衡策略、重试风暴、限流熔断、服务发现、配置灰度、选主共识、多活灾备、热点治理和容量规划展开。

Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Load test / stress test / soak test：不同目标的压测类型。
- Capacity headroom：保留突发和故障切换余量。
- Hot key detection：按 key、分片、租户和接口识别热点。
- Autoscaling + prewarming：自动扩缩和活动前预热。
- 容量模型要明确单请求 CPU、内存、DB rows examined、Redis ops、MQ messages 和外部 API 调用。
- 热点治理可用本地缓存、分片、队列化、限流、预热、读模型和降级。
- 长稳压测要观察内存泄漏、GC、连接池、日志成本和监控采集容量。
- 发布前后要比较 p95/p99、错误率、资源水位和关键业务成功率。
- 压测要覆盖核心链路、降级路径、依赖限流、缓存失效、MQ 积压和故障恢复。
- 容量水位要设置告警和扩容阈值，并记录 capacity_headroom、saturation 和 cost_per_request。
- 为每个跨服务动作定义 request_id、idempotency_key、timeout、retry policy 和 error code。
- 为最终一致性链路设计 outbox、consumer idempotency、compensation 和 checker。
- 上线后跟踪 retry_rate、timeout_rate、duplicate_rate、compensation_lag 和 inconsistent_count。
- Hot key detection：基于 Redis command stats、代理层采样、客户端埋点和 trace 聚合识别热 key。
- Mutex rebuild / singleflight：同一 key 同一时间只允许一个请求回源重建，其余等待、返回旧值或快速失败。
- Bloom filter + null cache：过滤不存在的 id，对合法不存在结果短 TTL 缓存空值，降低穿透。
- TTL jitter + warmup：TTL 加随机抖动并对热点 key 提前预热，降低雪崩概率。
- Stale cache + degrade switch：缓存不可用或回源过载时返回可接受旧值，关闭非核心字段或降级推荐模块。
- 热 key 发现可以从客户端埋点、代理层采样、Redis slowlog、命令统计和 trace 标签同时入手，避免只看平均 QPS。
- 重建锁要设置过期时间、owner token 和版本校验；锁超时后第二个写者不能用旧值覆盖新值。
- 空值缓存要使用短 TTL，并区分真的不存在、权限不可见和下游错误，否则会把故障缓存成空结果。
- 雪崩治理要把 TTL 抖动、预热、限流、熔断、stale value 和回源队列一起设计。
- 事故回归要沉淀压测脚本：模拟热点 key 过期、随机 id 穿透、Redis 分片高延迟和 DB 回源限流。
- 上线前要为热点 key、big key、slowlog、connection count、evicted keys、expired keys 和 DB fallback QPS 建看板。

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

- [Google SRE Book: Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis Documentation](https://redis.io/docs/latest/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis Documentation](https://redis.io/docs/latest/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis: Distributed Locks with Redis](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
