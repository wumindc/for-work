# Redis 主从复制、哨兵和 Cluster 分别解决什么问题？故障切换有什么一致性风险？

## 面试定位

这道题关联 Redis 主从复制、哨兵与 Cluster、Redis RDB、AOF 与持久化恢复，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Redis 主从复制、哨兵与 Cluster」切入：Redis 高可用题要讲清主从复制、replication backlog、哨兵故障转移、Cluster slot、reshard、脑裂和复制延迟的一致性影响。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把主从当强一致
- 客户端不处理 MOVED
- key 设计导致热点 slot

## 30 秒回答

主从复制解决冗余和读扩展，Sentinel 负责监控和故障转移，Cluster 通过 slot 分片解决容量和水平扩展。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 主从复制解决冗余和读扩展，Sentinel 负责监控和故障转移，Cluster 通过 slot 分片解决容量和水平扩展。
- 复制通常是异步的，主写成功不代表副本已收到，failover 可能丢失最后一段写入或读到旧值。
- Cluster 要讲 slot、MOVED/ASK、hash tag、reshard、hot slot、跨 slot 多 key 限制和客户端拓扑刷新。
- 排障看 replication_lag、master_link_status、connected_slaves、cluster_slots_fail、moved_error_count 和客户端重连。
- Redis 高可用题要讲清主从复制、replication backlog、哨兵故障转移、Cluster slot、reshard、脑裂和复制延迟的一致性影响。
- 主从复制用于冗余和读扩展，Sentinel 用于自动故障转移，Cluster 用于分片和水平扩展。
- replication backlog 支持断线后的部分同步，复制延迟决定故障切换时可能丢失多少写入。
- Cluster 将 key 映射到 slot，客户端要根据 slot 拓扑路由请求。
- Redis 高可用不等于强一致，高风险状态仍要回到事实源确认。
- slot 设计要避免所有热点 key 落到同一分片，必要时拆 key 或加本地缓存。
- 故障切换期间要接受短暂不可用、重试、读到旧值或写入失败的可能。
- 跨 slot 多 key 操作受限，业务 key 设计要提前考虑 hash tag。
- 主从复制通常是异步复制，主节点写成功不代表副本已经收到，因此故障切换存在数据丢失窗口。
- Sentinel 负责监控、选主和通知客户端；Cluster 通过 slot 分片扩展容量和吞吐。
- Redis 持久化题要区分 RDB 快照、AOF 追加日志、fsync 策略、rewrite、恢复时间和数据丢失窗口。
- RDB 是 Redis 数据集的快照文件，AOF 是写操作追加日志，二者解决的是重启恢复和数据丢失窗口问题。
- fsync 策略决定 AOF 刷盘频率，影响吞吐、延迟和故障时最多丢多少数据。
- 持久化恢复要同时评估 RPO、RTO、文件大小、磁盘 IO 和业务是否有事实源可重建。
- 缓存类数据优先考虑可重建，持久化只是加速恢复，不应承担最终正确性。
- 状态类数据如果必须保留，要评估是否应该放数据库或专用存储，而不是只增强 Redis 持久化。
- AOF rewrite 会降低文件体积，但 fork、copy-on-write 和磁盘 IO 会影响线上延迟。
- 恢复流程要演练，包括从备份恢复、主从重建、数据校验和业务回源补偿。
- RDB 是某个时间点的数据快照，文件紧凑、恢复快，但两次快照之间可能丢数据。
- AOF 记录写命令或重写后的命令序列，配合 fsync 策略控制丢失窗口，但文件增长和 rewrite 会带来 IO 压力。


### 数据流怎么讲

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 落地实现细节

- Sentinel 模式：适合单主多从自动切换，容量扩展有限。
- Cluster 模式：通过 slot 分片扩展容量，但客户端复杂度更高。
- WAIT/min replicas：提高写入复制确认，但增加延迟且不能替代事务一致性。
- 托管 Redis：降低运维成本，但仍要理解故障模型、指标和客户端行为。
- 监控 replication offset、master_link_down_since_seconds、role、failover 状态和客户端重连错误。
- Cluster 迁移前评估 big key、hot slot、跨 slot 命令和客户端 SDK 兼容。
- 故障演练要覆盖主节点宕机、网络分区、慢复制、slot 迁移和客户端连接池耗尽。
- 读写分离要标注哪些读可接受旧值，哪些必须读主或回源 DB。
- 客户端必须正确处理 MOVED/ASK、连接刷新、只读副本和故障切换重试。
- 关键写入要知道 WAIT、min-replicas-to-write 等保护手段的收益和代价。
- slot 迁移、failover 和网络分区要有演练，不要只依赖托管服务默认配置。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- RDB + AOF 混合：兼顾恢复速度和较小丢失窗口。
- appendfsync everysec：常见默认取舍，最多约秒级丢失窗口但吞吐较好。
- 备份演练：定期把 RDB/AOF 在隔离环境恢复并校验关键 key。
- 缓存可重建设计：重启后通过预热、限流和分批回源恢复热数据。
- 监控 aof_last_bgrewrite_status、rdb_last_bgsave_status、latest_fork_usec、aof_delayed_fsync。
- 磁盘水位和 rewrite 失败要告警，否则 AOF 增长可能把节点拖垮。
- Redis 重启后要控制预热速度，避免所有流量同时回源 DB。
- 故障复盘要明确丢失窗口内哪些 key 可重建，哪些需要从事实源补偿。
- 不要把 Redis 持久化等同数据库事务日志，Redis 仍不适合作核心事实源。
- 持久化策略要结合业务可丢失窗口、恢复时间、磁盘 IO、fork 开销和主从复制设计。

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

典型设计题是商品详情缓存、排行榜、分布式锁、限流器、会话状态或延迟任务。架构上要明确 Redis 是缓存/协同状态/轻量队列，不是关系数据库事实源；关键路径要包含 DB 事实源、缓存失效、回源保护、降级开关和 Redis 指标看板。

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

真实线上问题一般从 hot key、big key、slowlog、latency monitor、evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio、connected_clients、blocked_clients、replication lag、AOF rewrite 和 Cluster slot 迁移看起。回答时要先保护 DB 和核心接口，再定位是命令模型、数据结构、内存、网络、复制还是客户端问题。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- master_link_status
- replication_lag
- connected_slaves
- cluster_slots_fail
- moved_error_count
- aof_current_size
- aof_rewrite_in_progress
- rdb_last_bgsave_status
- fork_latency
- disk_usage

## 多轮追问模拟

### 延伸追问 1：主从复制是强一致吗？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲缓存集群扩容、热点 slot、配置中心读旧值和故障演练。

### 延伸追问 2：Cluster 跨 slot 多 key 怎么处理？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲缓存集群扩容、热点 slot、配置中心读旧值和故障演练。

### 延伸追问 3：故障切换期间客户端要做什么？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲缓存集群扩容、热点 slot、配置中心读旧值和故障演练。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲缓存集群扩容、热点 slot、配置中心读旧值和故障演练。

**取舍总结**
Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Sentinel 模式：适合单主多从自动切换，容量扩展有限。
- Cluster 模式：通过 slot 分片扩展容量，但客户端复杂度更高。
- WAIT/min replicas：提高写入复制确认，但增加延迟且不能替代事务一致性。
- 托管 Redis：降低运维成本，但仍要理解故障模型、指标和客户端行为。
- 监控 replication offset、master_link_down_since_seconds、role、failover 状态和客户端重连错误。
- Cluster 迁移前评估 big key、hot slot、跨 slot 命令和客户端 SDK 兼容。
- 故障演练要覆盖主节点宕机、网络分区、慢复制、slot 迁移和客户端连接池耗尽。
- 读写分离要标注哪些读可接受旧值，哪些必须读主或回源 DB。
- 客户端必须正确处理 MOVED/ASK、连接刷新、只读副本和故障切换重试。
- 关键写入要知道 WAIT、min-replicas-to-write 等保护手段的收益和代价。
- slot 迁移、failover 和网络分区要有演练，不要只依赖托管服务默认配置。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- RDB + AOF 混合：兼顾恢复速度和较小丢失窗口。
- appendfsync everysec：常见默认取舍，最多约秒级丢失窗口但吞吐较好。
- 备份演练：定期把 RDB/AOF 在隔离环境恢复并校验关键 key。
- 缓存可重建设计：重启后通过预热、限流和分批回源恢复热数据。
- 监控 aof_last_bgrewrite_status、rdb_last_bgsave_status、latest_fork_usec、aof_delayed_fsync。
- 磁盘水位和 rewrite 失败要告警，否则 AOF 增长可能把节点拖垮。
- Redis 重启后要控制预热速度，避免所有流量同时回源 DB。
- 故障复盘要明确丢失窗口内哪些 key 可重建，哪些需要从事实源补偿。
- 不要把 Redis 持久化等同数据库事务日志，Redis 仍不适合作核心事实源。
- 持久化策略要结合业务可丢失窗口、恢复时间、磁盘 IO、fork 开销和主从复制设计。

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

- [Redis Documentation](https://redis.io/docs/latest/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis Documentation](https://redis.io/docs/latest/)：用于确认官方语义边界、命令行为和工程约束。
