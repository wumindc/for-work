# Redis Lua、MULTI/EXEC 事务和 Pipeline 有什么区别？

## 面试定位

这道题关联 Redis Lua、事务与 Pipeline、Redis 分布式锁、限流与并发控制，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Redis Lua、事务与 Pipeline」切入：Redis 原子性题要区分 MULTI/EXEC 事务、Lua 脚本原子执行和 Pipeline 批量网络优化，并说明它们不等价于关系数据库事务。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把 Pipeline 当原子批处理
- Lua 脚本里做大循环
- 忽略 NOSCRIPT 和跨 slot 错误

## 30 秒回答

Lua 是服务端脚本原子执行，适合 check-and-set、释放锁、限流这类组合操作；脚本执行期间会阻塞其他命令，所以必须短小。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- Lua 是服务端脚本原子执行，适合 check-and-set、释放锁、限流这类组合操作；脚本执行期间会阻塞其他命令，所以必须短小。
- MULTI/EXEC 是命令排队后顺序执行，不等于数据库事务，没有自动回滚和复杂隔离语义。
- Pipeline 是客户端批量发送，减少 RTT，提高吞吐，但不保证整体原子，也不改变失败语义。
- Cluster 下 Lua 和多 key 操作要注意 hash tag 和同 slot；Pipeline 要控制批大小并保证重试幂等。
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
- Pipeline 只是减少网络往返，不保证命令整体原子。
- Redis 锁和限流题要讲 SET NX PX、唯一 token、Lua 释放、锁续期、fencing token、Redlock 争议、令牌桶/滑动窗口和失败降级。
- 分布式锁是在多个进程之间协调临界区访问的协同机制，Redis 常用原子 SET NX PX 实现。
- fencing token 是单调递增令牌，用于让下游拒绝旧锁持有者的迟到写入。
- 限流是按维度控制请求进入系统的速率，保护下游和成本预算。
- 加锁、执行业务、释放锁都必须考虑超时、进程崩溃、网络抖动和锁过期。
- 释放锁必须校验 owner token，防止 A 的锁过期后 B 获锁，A 又误删 B 的锁。
- 真正高风险的并发写入应由数据库约束、状态机版本或 fencing token 兜底。
- 限流策略必须和用户体验绑定：拒绝、排队、降级、返回缓存或人工确认。
- 基础锁通常用 SET resource token NX PX ttl 获取，用 Lua 校验 token 后删除，避免误删他人锁。


### 数据流怎么讲

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 落地实现细节

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
- Pipeline 批量大小要控制，避免单次响应过大造成连接和内存压力。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- SET NX PX + Lua delete：单 Redis 节点或主从场景最常见基础锁实现。
- Redlock：多节点获取多数派锁，但需要理解时钟、网络分区和业务风险争议。
- 滑动窗口限流：ZSet 记录时间戳，适合精确窗口但内存和清理成本更高。
- 令牌桶：允许短时突发，更适合 API 和模型调用成本控制。
- 锁 value 使用 UUID/request_id，Lua 脚本校验 value 后删除。
- 业务执行要小于锁 TTL，超时后要停止写入或通过 fencing token 让下游拒绝。
- 限流 key 要包含维度和窗口，例如 rate:{tenant}:{api}:{minute}。
- 被限流要返回明确错误码、retry_after 和降级说明，避免客户端无限重试。
- 锁保护的是临界区并发，不保证外部资源具备严格一次语义；重要写入仍要数据库唯一约束或 fencing token。
- 锁 TTL 要覆盖业务执行时间并考虑超时、续期和进程暂停，不能无限续期。

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
- eval_latency_p95
- pipeline_batch_size
- blocked_clients
- slowlog_count
- cross_slot_error_count
- lock_acquire_success_rate
- lock_wait_p95
- lock_timeout_count
- rate_limited_count
- critical_section_latency

## 多轮追问模拟

### 延伸追问 1：Pipeline 为什么不是事务？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲限流脚本、锁释放脚本、批量预热和排行榜更新。

### 延伸追问 2：Lua 脚本会带来什么风险？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲限流脚本、锁释放脚本、批量预热和排行榜更新。

### 延伸追问 3：WATCH 适合什么场景？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲限流脚本、锁释放脚本、批量预热和排行榜更新。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲限流脚本、锁释放脚本、批量预热和排行榜更新。

**取舍总结**
Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

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
- Pipeline 批量大小要控制，避免单次响应过大造成连接和内存压力。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- SET NX PX + Lua delete：单 Redis 节点或主从场景最常见基础锁实现。
- Redlock：多节点获取多数派锁，但需要理解时钟、网络分区和业务风险争议。
- 滑动窗口限流：ZSet 记录时间戳，适合精确窗口但内存和清理成本更高。
- 令牌桶：允许短时突发，更适合 API 和模型调用成本控制。
- 锁 value 使用 UUID/request_id，Lua 脚本校验 value 后删除。
- 业务执行要小于锁 TTL，超时后要停止写入或通过 fencing token 让下游拒绝。
- 限流 key 要包含维度和窗口，例如 rate:{tenant}:{api}:{minute}。
- 被限流要返回明确错误码、retry_after 和降级说明，避免客户端无限重试。
- 锁保护的是临界区并发，不保证外部资源具备严格一次语义；重要写入仍要数据库唯一约束或 fencing token。
- 锁 TTL 要覆盖业务执行时间并考虑超时、续期和进程暂停，不能无限续期。

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

- [Redis Documentation](https://redis.io/docs/latest/)：用于确认 Redis 单线程执行、事务、脚本和客户端命令语义。
- [Redis Commands](https://redis.io/docs/latest/commands/)：用于核对 MULTI、EXEC、WATCH、EVAL、EVALSHA 和 Pipeline 相关命令行为。
- [Redis: Distributed Locks with Redis](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)：用于支持 Lua 校验释放锁和并发控制边界。
