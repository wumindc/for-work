# 如何用 Redis ZSet 设计排行榜、Feed 或延迟队列？

## 面试定位

这道题关联 Redis 数据类型、底层编码与复杂度、Redis Lua、事务与 Pipeline，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Redis 数据类型、底层编码与复杂度」切入：Redis 数据结构题不能只背 String、Hash、List、Set、ZSet 名称，要能讲清使用场景、底层编码、时间复杂度、big key 风险和排行榜/Feed/计数器等工程设计。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把详情塞进 member
- 无限增长不清理
- 延迟队列没有幂等和重试

## 30 秒回答

ZSet 的核心是 member + score。排行榜里 score 是分数或热度，Feed 里 score 常是时间或权重，延迟队列里 score 是可执行时间。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- ZSet 的核心是 member + score。排行榜里 score 是分数或热度，Feed 里 score 常是时间或权重，延迟队列里 score 是可执行时间。
- 系统设计要讲写入、更新、分页、并列分数、清理、详情回源和幂等。member 通常只放 id，详情放 DB 或二级缓存。
- 高并发下要控制单个 ZSet 大小，避免大范围 rank 查询和深分页；可以按业务分桶、时间分片或榜单维度拆 key。
- 延迟队列要处理重复消费、任务抢占、失败重试和可观测指标，强可靠任务仍要评估专业 MQ。
- Redis 数据结构题不能只背 String、Hash、List、Set、ZSet 名称，要能讲清使用场景、底层编码、时间复杂度、big key 风险和排行榜/Feed/计数器等工程设计。
- Redis 数据类型是面向业务访问模式的内存数据结构，不只是客户端 API 名称。
- 底层编码会随元素数量和大小在紧凑结构、哈希表、跳表等实现之间转换，影响内存和复杂度。
- 数据类型选型要同时考虑读写模式、排序/集合语义、单 key 大小、过期策略和排障成本。
- 先看访问模式：点查对象、计数、集合去重、排序范围、队列消费和近似统计对应不同结构。
- 避免把复杂业务对象无边界塞入单 key；单 key 越大，迁移、删除、复制和慢命令风险越高。
- ZSet 的 score 必须有明确业务语义，例如时间戳、分数或优先级，并处理并列、分页和过期清理。
- List/Stream/MQ 要区分：List 简单但确认和重放弱，Stream 更适合轻量消息流，可靠业务事件仍要评估专业 MQ。
- String 适合简单 KV、计数器和分布式锁 value；Hash 适合对象字段；List 适合简单队列但不适合复杂消费确认；Set 适合集合关系；ZSet 适合排行榜、延迟队列和按 score 检索。
- Redis 内部会根据元素数量和大小选择 compact encoding、hashtable、skiplist 等结构，面试要能把内存、查询复杂度和更新成本讲清楚。
- Redis 原子性题要区分 MULTI/EXEC 事务、Lua 脚本原子执行和 Pipeline 批量网络优化，并说明它们不等价于关系数据库事务。
- Redis 事务是命令排队和批量执行机制，Lua 是服务端脚本原子执行机制，Pipeline 是客户端批量发送机制。
- Lua 原子性来自 Redis 单线程执行脚本期间不会交错执行其他命令。
- Pipeline 只优化网络 RTT，不改变命令语义和失败处理。
- 需要 check-and-set 的地方优先 Lua 或原子命令，避免 get 后再 set 的竞态。
- 脚本不能做长时间计算或大范围扫描，否则会阻塞所有请求。
- Redis 事务执行中某些命令失败不会回滚之前命令，业务要自己处理补偿。
- Pipeline 批处理要按延迟、吞吐、响应大小和失败重试设计批量上限。
- MULTI/EXEC 将多个命令排队后顺序执行，但不提供关系数据库式隔离和回滚。
- Lua 脚本在 Redis 单线程执行模型下原子运行，适合 check-and-set、限流、释放锁等组合操作。


### 数据流怎么讲

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 落地实现细节

- 对象缓存：Hash 存字段，String 存序列化整体对象，按读写粒度选择。
- 排行榜：ZSet 用 score 排序，member 存业务 id，详情回源或二级缓存。
- 标签/关系：Set 做去重和交并差，但要控制集合大小并避免大范围同步计算。
- 延迟任务：ZSet score 存执行时间，消费者按时间窗口拉取并用幂等键防重复。
- 生产排障要看 slowlog、commandstats、bigkeys、memkeys、latency doctor 和业务侧 trace。
- 分页不要用大 offset 扫描超大 ZSet，优先使用 score 游标或业务分片。
- 删除 big key 要用渐进式 unlink 或后台清理，避免阻塞主线程。
- 设计 key 时预留 version，便于 schema 升级和灰度迁移。
- key schema 要包含业务域、实体类型、版本和分片维度，避免全局扫描和跨租户串 key。
- 大对象不要塞进单个 key，Hash 和 ZSet 要限制字段/成员数量并建设 big key 扫描。
- 排行榜、Feed 和延迟队列要明确 score 语义、更新幂等、分页方式和清理策略。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- Lua unlock：校验 token 后删除锁，避免误删。
- Lua rate limit：读取计数、更新时间窗、判断阈值并返回剩余额度。
- MULTI/EXEC + WATCH：乐观锁式 CAS，但高冲突下重试成本高。
- Pipeline 批量预热或批量读取：减少 RTT，但要防止大批量拖慢连接。
- Lua 脚本部署要使用 SHA 缓存，并处理 NOSCRIPT 后重新加载。
- Cluster 模式脚本涉及多个 key 时要使用 hash tag 保证同 slot。
- 脚本返回结构化 code、remaining、reset_at、reason，便于客户端降级和观测。
- Pipeline 失败要能定位第几个命令失败，重试必须幂等。
- Lua 脚本要短小、可预估耗时，避免阻塞 Redis 主线程。
- 脚本参数和 key 必须显式传入，Cluster 模式下注意所有 key 是否同 slot。

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
- cmd_latency_p95
- big_key_count
- used_memory_dataset
- slowlog_count
- zset_cardinality
- eval_latency_p95
- pipeline_batch_size
- blocked_clients
- cross_slot_error_count

## 多轮追问模拟

### 延伸追问 1：排行榜并列分数怎么处理？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲热门知识库榜单、活动排行榜、任务调度和 Agent 任务优先级。

### 延伸追问 2：ZSet 深分页有什么问题？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲热门知识库榜单、活动排行榜、任务调度和 Agent 任务优先级。

### 延伸追问 3：为什么延迟队列不一定适合 Redis？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲热门知识库榜单、活动排行榜、任务调度和 Agent 任务优先级。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲热门知识库榜单、活动排行榜、任务调度和 Agent 任务优先级。

**取舍总结**
Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- 对象缓存：Hash 存字段，String 存序列化整体对象，按读写粒度选择。
- 排行榜：ZSet 用 score 排序，member 存业务 id，详情回源或二级缓存。
- 标签/关系：Set 做去重和交并差，但要控制集合大小并避免大范围同步计算。
- 延迟任务：ZSet score 存执行时间，消费者按时间窗口拉取并用幂等键防重复。
- 生产排障要看 slowlog、commandstats、bigkeys、memkeys、latency doctor 和业务侧 trace。
- 分页不要用大 offset 扫描超大 ZSet，优先使用 score 游标或业务分片。
- 删除 big key 要用渐进式 unlink 或后台清理，避免阻塞主线程。
- 设计 key 时预留 version，便于 schema 升级和灰度迁移。
- key schema 要包含业务域、实体类型、版本和分片维度，避免全局扫描和跨租户串 key。
- 大对象不要塞进单个 key，Hash 和 ZSet 要限制字段/成员数量并建设 big key 扫描。
- 排行榜、Feed 和延迟队列要明确 score 语义、更新幂等、分页方式和清理策略。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- Lua unlock：校验 token 后删除锁，避免误删。
- Lua rate limit：读取计数、更新时间窗、判断阈值并返回剩余额度。
- MULTI/EXEC + WATCH：乐观锁式 CAS，但高冲突下重试成本高。
- Pipeline 批量预热或批量读取：减少 RTT，但要防止大批量拖慢连接。
- Lua 脚本部署要使用 SHA 缓存，并处理 NOSCRIPT 后重新加载。
- Cluster 模式脚本涉及多个 key 时要使用 hash tag 保证同 slot。
- 脚本返回结构化 code、remaining、reset_at、reason，便于客户端降级和观测。
- Pipeline 失败要能定位第几个命令失败，重试必须幂等。
- Lua 脚本要短小、可预估耗时，避免阻塞 Redis 主线程。
- 脚本参数和 key 必须显式传入，Cluster 模式下注意所有 key 是否同 slot。

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
- [Redis: Distributed Locks with Redis](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)：用于确认官方语义边界、命令行为和工程约束。
