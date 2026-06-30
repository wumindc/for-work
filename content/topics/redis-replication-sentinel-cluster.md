# Redis 主从复制、哨兵与 Cluster

## 面试定位

Redis 主从复制、哨兵与 Cluster 属于 Redis / Redis 持久化与高可用。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Redis 高可用题要讲清主从复制、replication backlog、哨兵故障转移、Cluster slot、reshard、脑裂和复制延迟的一致性影响。

**必须讲清楚**
- 主从复制用于冗余和读扩展，Sentinel 用于自动故障转移，Cluster 用于分片和水平扩展。
- replication backlog 支持断线后的部分同步，复制延迟决定故障切换时可能丢失多少写入。
- Cluster 将 key 映射到 slot，客户端要根据 slot 拓扑路由请求。
- Redis 高可用题要讲清主从复制、replication backlog、哨兵故障转移、Cluster slot、reshard、脑裂和复制延迟的一致性影响。
- 复制是异步的
- Sentinel 解决故障转移
- Cluster 解决分片和扩容

**常见追问方向**
- 先讲缓存模式和一致性边界，再讲 Redis 数据结构、过期策略和故障治理。
- 把缓存穿透、击穿、雪崩、热 key、大 key 分开回答，避免所有问题都说加锁或限流。
- 遇到系统设计题时，要主动连接 DB、MQ、CDC、Prometheus、Trace 和降级预案。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- Redis 高可用不等于强一致，高风险状态仍要回到事实源确认。
- slot 设计要避免所有热点 key 落到同一分片，必要时拆 key 或加本地缓存。
- 故障切换期间要接受短暂不可用、重试、读到旧值或写入失败的可能。
- 跨 slot 多 key 操作受限，业务 key 设计要提前考虑 hash tag。
- 主从复制通常是异步复制，主节点写成功不代表副本已经收到，因此故障切换存在数据丢失窗口。
- Sentinel 负责监控、选主和通知客户端；Cluster 通过 slot 分片扩展容量和吞吐。
- Sentinel 模式：适合单主多从自动切换，容量扩展有限。
- Cluster 模式：通过 slot 分片扩展容量，但客户端复杂度更高。
- WAIT/min replicas：提高写入复制确认，但增加延迟且不能替代事务一致性。
- 托管 Redis：降低运维成本，但仍要理解故障模型、指标和客户端行为。
- 监控 replication offset、master_link_down_since_seconds、role、failover 状态和客户端重连错误。
- Cluster 迁移前评估 big key、hot slot、跨 slot 命令和客户端 SDK 兼容。
- 故障演练要覆盖主节点宕机、网络分区、慢复制、slot 迁移和客户端连接池耗尽。
- 读写分离要标注哪些读可接受旧值，哪些必须读主或回源 DB。


### 通用数据流

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 工程落点

- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- 客户端必须正确处理 MOVED/ASK、连接刷新、只读副本和故障切换重试。
- 关键写入要知道 WAIT、min-replicas-to-write 等保护手段的收益和代价。
- slot 迁移、failover 和网络分区要有演练，不要只依赖托管服务默认配置。
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

图 1：Redis 主从复制、哨兵与 Cluster 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Redis 主从复制、哨兵与 Cluster 的面试级设计题

典型设计题是商品详情缓存、排行榜、分布式锁、限流器、会话状态或延迟任务。架构上要明确 Redis 是缓存/协同状态/轻量队列，不是关系数据库事实源；关键路径要包含 DB 事实源、缓存失效、回源保护、降级开关和 Redis 指标看板。

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

真实线上问题一般从 hot key、big key、slowlog、latency monitor、evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio、connected_clients、blocked_clients、replication lag、AOF rewrite 和 Cluster slot 迁移看起。回答时要先保护 DB 和核心接口，再定位是命令模型、数据结构、内存、网络、复制还是客户端问题。

**排查顺序**
- 先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。
- 再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。
- 对比最近发布、配置变更、流量变化、数据倾斜和下游限流。
- 先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。
- 最后把失败样例进入 regression/eval，避免同类问题复发。

**重点指标**
- master_link_status
- replication_lag
- connected_slaves
- cluster_slots_fail
- moved_error_count

**常见误区**
- 以为主从复制是强一致
- 客户端不处理拓扑变化
- Cluster key 设计导致热点 slot

## 业界方案与技术取舍

Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**方案对比**
- Sentinel 模式：适合单主多从自动切换，容量扩展有限。
- Cluster 模式：通过 slot 分片扩展容量，但客户端复杂度更高。
- WAIT/min replicas：提高写入复制确认，但增加延迟且不能替代事务一致性。
- 托管 Redis：降低运维成本，但仍要理解故障模型、指标和客户端行为。
- 读副本提升读吞吐，但会引入读旧值和路由复杂度。
- Cluster 提升容量，但跨 key 操作、slot 迁移和热点 slot 治理更复杂。
- 更强复制确认降低丢失窗口，但提高写延迟并影响吞吐。
- 先判断 Redis 解决的是高频读写、共享状态和低延迟访问，不是关系数据库的事实源替代品。
- 缓存设计要同时回答数据从哪里来、什么时候失效、失败时如何降级、最终如何收敛。
- 线上治理要把命中率、热 key、大 key、慢命令、内存、连接、复制延迟和回源压力放在同一张图里看。
- 这类题能连接分布式系统的一致性、可用性和故障切换，比只背 Sentinel/Cluster 更有说服力。
- Agent 平台的共享状态和配置缓存也会遇到故障切换窗口，关键动作必须设计幂等和回源校验。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Redis 高可用题的第一层是复制链路。主节点把写命令传播给 replica，replica 通过 replication offset 追赶主库；短暂断线后，如果 backlog 里还保留所需 offset，就可以部分同步，否则要全量同步。这里的关键边界是异步复制：客户端收到主库写成功，不代表所有 replica 已经持久收到。`WAIT` 或 min replicas 能缩小丢失窗口，但会增加写延迟，也不能替代数据库事务或业务状态机。

第二层是故障切换。Sentinel 通过主观下线、客观下线、投票、选主、提升 replica 和通知客户端完成 failover。这个过程会带来短暂不可用、连接重建、读旧值、最后一段写入丢失和客户端重试风暴。面试里不要把 Sentinel 说成“自动恢复所以无感”，更成熟的回答是：客户端要支持重连和拓扑刷新，写路径要幂等，关键状态要回源事实库校验，告警要能看清 failover 开始、完成和业务恢复时间。

第三层是 Cluster 分片。Redis Cluster 用 16384 个 hash slot 做路由，客户端根据 slot map 访问节点；迁移或拓扑变化时会遇到 `MOVED`、`ASK`、slot importing/migrating 和连接池刷新。Cluster 提升容量和吞吐，但跨 slot 多 key 命令受限，事务、Lua、pipeline 都要考虑 hash tag 和同 slot 约束。热点 slot、big key 和客户端不刷新拓扑，是 Cluster 事故里最常见的工程坑。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `request_id` | 请求 | 串联入口、缓存、DB 和下游调用 | 定位单次异常 |
| `key_schema` | Redis/存储 | 固定业务域、实体和版本 | 排查误删、串租户和旧版本 |
| `source_version` | value/event | 标识事实源版本 | 防止旧值覆盖新值 |
| `ttl_policy` | 缓存策略 | 控制过期、抖动和刷新 | 排查击穿、雪崩和旧值窗口 |
| `trace_id` | 观测链路 | 串联服务、存储和异步任务 | 复盘慢请求和失败分支 |

## 生产验收清单

架构验收要先写清 Redis 在系统中的角色。如果它只是缓存，故障切换后的旧值和丢失窗口可以通过回源 DB、重建缓存和降级承受；如果它承载限流、排行榜、会话或任务状态，就必须定义 RPO/RTO、持久化策略、恢复脚本和业务补偿。不同角色不能混在同一个实例里，否则一个缓存雪崩可能拖垮不可丢状态。

客户端验收要覆盖拓扑变化。Sentinel 模式下要验证客户端能收到新主、清理旧连接、重试可幂等写入；Cluster 模式下要验证 `MOVED`、`ASK`、slot 迁移、读写副本路由、pipeline 批量错误和 hash tag 设计。所有关键 key schema 都要标出 slot 分布和多 key 操作边界，避免上线后才发现同一业务事务跨 slot。

故障演练至少包括主节点宕机、replica 延迟、网络分区、Sentinel 误判、Cluster reshard、big key 迁移和客户端连接池耗尽。指标要看 `master_link_status`、`master_link_down_since_seconds`、`connected_slaves`、`replication_lag`、`repl_backlog_histlen`、`cluster_slots_fail`、`moved_error_count`、`ask_error_count`、`failover_duration`、`client_reconnect_count` 和业务错误率。讲清这套验收，才能证明你理解 Redis 高可用不是“部署模式名词”，而是故障窗口治理。

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 来源与延伸阅读

- [Redis Documentation](https://redis.io/docs/latest/)：用于确认 Redis 官方术语、部署模式和运行边界。
- [Redis Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)：用于说明 replication offset、部分同步、全量同步和异步复制的一致性窗口。
- [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)：用于确认 Sentinel 监控、故障判定、选主和客户端通知机制。
- [Redis Cluster Specification](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)：用于解释 slot、MOVED/ASK、故障检测和 Cluster 协议边界。
- [Scale with Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)：用于支持 reshard、扩缩容和 Cluster 运维场景。
