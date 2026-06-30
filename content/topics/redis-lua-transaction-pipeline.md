# Redis Lua、事务与 Pipeline

## 面试定位

Redis Lua、事务与 Pipeline 属于 Redis / Redis 原子性、锁与限流。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Redis 原子性题要区分 MULTI/EXEC 事务、Lua 脚本原子执行和 Pipeline 批量网络优化，并说明它们不等价于关系数据库事务。

**必须讲清楚**
- Redis 事务是命令排队和批量执行机制，Lua 是服务端脚本原子执行机制，Pipeline 是客户端批量发送机制。
- Lua 原子性来自 Redis 单线程执行脚本期间不会交错执行其他命令。
- Pipeline 只优化网络 RTT，不改变命令语义和失败处理。
- Redis 原子性题要区分 MULTI/EXEC 事务、Lua 脚本原子执行和 Pipeline 批量网络优化，并说明它们不等价于关系数据库事务。
- Lua 保证脚本内原子执行
- Pipeline 不是事务
- Redis 事务不支持自动回滚

**常见追问方向**
- 先讲缓存模式和一致性边界，再讲 Redis 数据结构、过期策略和故障治理。
- 把缓存穿透、击穿、雪崩、热 key、大 key 分开回答，避免所有问题都说加锁或限流。
- 遇到系统设计题时，要主动连接 DB、MQ、CDC、Prometheus、Trace 和降级预案。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 需要 check-and-set 的地方优先 Lua 或原子命令，避免 get 后再 set 的竞态。
- 脚本不能做长时间计算或大范围扫描，否则会阻塞所有请求。
- Redis 事务执行中某些命令失败不会回滚之前命令，业务要自己处理补偿。
- Pipeline 批处理要按延迟、吞吐、响应大小和失败重试设计批量上限。
- MULTI/EXEC 将多个命令排队后顺序执行，但不提供关系数据库式隔离和回滚。
- Lua 脚本在 Redis 单线程执行模型下原子运行，适合 check-and-set、限流、释放锁等组合操作。
- Pipeline 只是减少网络往返，不保证命令整体原子。
- Lua unlock：校验 token 后删除锁，避免误删。
- Lua rate limit：读取计数、更新时间窗、判断阈值并返回剩余额度。
- MULTI/EXEC + WATCH：乐观锁式 CAS，但高冲突下重试成本高。
- Pipeline 批量预热或批量读取：减少 RTT，但要防止大批量拖慢连接。
- Lua 脚本部署要使用 SHA 缓存，并处理 NOSCRIPT 后重新加载。
- Cluster 模式脚本涉及多个 key 时要使用 hash tag 保证同 slot。
- 脚本返回结构化 code、remaining、reset_at、reason，便于客户端降级和观测。
- Pipeline 失败要能定位第几个命令失败，重试必须幂等。


### 通用数据流

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 工程落点

- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
- Lua 脚本要短小、可预估耗时，避免阻塞 Redis 主线程。
- 脚本参数和 key 必须显式传入，Cluster 模式下注意所有 key 是否同 slot。
- Pipeline 批量大小要控制，避免单次响应过大造成连接和内存压力。
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

图 1：Redis Lua、事务与 Pipeline 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Redis Lua、事务与 Pipeline 的面试级设计题

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
- eval_latency_p95
- pipeline_batch_size
- blocked_clients
- slowlog_count
- cross_slot_error_count

**常见误区**
- 把 Pipeline 当事务
- 以为 Redis 事务失败会自动回滚
- Lua 脚本过重阻塞主线程
- Cluster 跨 slot 脚本失败

## 业界方案与技术取舍

Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**方案对比**
- Lua unlock：校验 token 后删除锁，避免误删。
- Lua rate limit：读取计数、更新时间窗、判断阈值并返回剩余额度。
- MULTI/EXEC + WATCH：乐观锁式 CAS，但高冲突下重试成本高。
- Pipeline 批量预热或批量读取：减少 RTT，但要防止大批量拖慢连接。
- Lua 简化原子组合，但可维护性和阻塞风险高于简单命令。
- WATCH 语义清晰但高并发冲突下重试多。
- Pipeline 提升吞吐但可能增加单批尾延迟和失败恢复复杂度。
- 先判断 Redis 解决的是高频读写、共享状态和低延迟访问，不是关系数据库的事实源替代品。
- 缓存设计要同时回答数据从哪里来、什么时候失效、失败时如何降级、最终如何收敛。
- 线上治理要把命中率、热 key、大 key、慢命令、内存、连接、复制延迟和回源压力放在同一张图里看。
- 这类题可以连接限流、分布式锁、库存扣减和 Agent 工具调用配额控制。
- 回答时把 Redis 原子性边界和数据库事务边界对比，面试深度会明显提高。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Redis 原子性题要区分 MULTI/EXEC 事务、Lua 脚本原子执行和 Pipeline 批量网络优化，并说明它们不等价于关系数据库事务。 Redis 事务是命令排队和批量执行机制，Lua 是服务端脚本原子执行机制，Pipeline 是客户端批量发送机制。 Lua 原子性来自 Redis 单线程执行脚本期间不会交错执行其他命令。 Pipeline 只优化网络 RTT，不改变命令语义和失败处理。 需要 check-and-set 的地方优先 Lua 或原子命令，避免 get 后再 set 的竞态。 脚本不能做长时间计算或大范围扫描，否则会阻塞所有请求。 Redis 事务执行中某些命令失败不会回滚之前命令，业务要自己处理补偿。 Pipeline 批处理要按延迟、吞吐、响应大小和失败重试设计批量上限。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `script_name` | Lua 脚本 | 标识业务脚本语义 | 定位慢脚本或错误脚本 |
| `script_sha` | Lua 脚本 | Redis 脚本缓存标识 | 处理 NOSCRIPT 与版本漂移 |
| `keys[]` | Lua 参数 | 显式声明访问 key | Cluster 校验同 slot |
| `argv[]` | Lua 参数 | 传入阈值、token、TTL 等变量 | 复盘参数错误 |
| `return_code` | 脚本结果 | 表达 success/limited/conflict/error | 客户端降级和告警 |
| `pipeline_batch_id` | Pipeline | 标识一批命令 | 定位批量失败位置 |
| `command_index` | Pipeline 响应 | 标识第几个命令失败 | 支持幂等重试 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 公开阅读校验

这篇文章要让读者分清三件事：MULTI/EXEC 是命令排队和顺序执行，Lua 是服务端脚本原子执行，Pipeline 是减少网络往返。Pipeline 不提供原子性，Redis 事务也不提供关系数据库式自动回滚。把三者混成“Redis 事务方案”，是面试里很容易暴露的浅层理解。

Lua 的生产边界要写清。脚本适合短小的 check-and-set、释放锁、限流扣减、库存预占等组合命令；不适合长循环、大范围扫描、复杂计算和跨 slot 多 key 操作。脚本执行期间会阻塞 Redis 主线程，慢脚本会影响所有请求，所以要监控 `eval_latency_p95`、slowlog、blocked clients 和脚本错误率。

Cluster 模式下要特别说明 key 的 slot 约束。Lua 脚本访问多个 key 时，这些 key 必须落在同一个 slot，常用 hash tag 保证相关 key 同槽。上线前要用集群环境回归，而不是只在单机 Redis 上验证脚本。否则本地通过，生产直接 CROSSSLOT。

Pipeline 的验收重点是批量大小和失败恢复。批量太小收益不明显，批量太大会增加响应包、连接占用和尾延迟；某个命令失败时，客户端要能定位 command index，并保证重试是幂等的。公开文章里能讲清这些细节，读者才会信这是生产经验，而不是命令速查。

## 来源与延伸阅读

- [Redis Documentation](https://redis.io/docs/latest/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis: Distributed Locks with Redis](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)：用于确认官方语义边界、命令行为和工程约束。
