# Redis key 过期后会立刻删除吗？内存满了淘汰策略怎么选？

## 面试定位

这道题关联 Redis 过期、淘汰策略与内存治理、Redis 热 key、击穿、穿透与雪崩治理，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Redis 过期、淘汰策略与内存治理」切入：Redis 内存治理要把 TTL、惰性删除、定期删除、maxmemory、淘汰策略、big key、碎片率和 OOM 风险连起来回答。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 认为 TTL 到点立即释放
- 淘汰策略不分业务
- 忽略 big key 删除阻塞

## 30 秒回答

过期不等于立刻删除。Redis 通过惰性删除和定期删除清理过期 key，短时间内过期 key 仍可能占内存。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 过期不等于立刻删除。Redis 通过惰性删除和定期删除清理过期 key，短时间内过期 key 仍可能占内存。
- maxmemory-policy 要匹配业务语义。纯缓存集群可以考虑 allkeys-lru/lfu，混有不可淘汰状态时要谨慎使用并隔离实例。
- TTL 要加 jitter，热点 key 要预热和互斥重建，big key 要拆分或异步删除，避免删除和过期导致长尾延迟。
- 排障看 used_memory、mem_fragmentation_ratio、evicted_keys、expired_keys、big_key_count、backend_fallback_qps 和 DB p95。
- Redis 内存治理要把 TTL、惰性删除、定期删除、maxmemory、淘汰策略、big key、碎片率和 OOM 风险连起来回答。
- 过期策略负责让 key 在业务可接受窗口后失效，淘汰策略负责内存不足时选择牺牲对象。
- 惰性删除在访问过期 key 时触发，定期删除按采样清理，二者共同决定过期 key 的实际释放时机。
- 内存治理是容量、TTL、淘汰、big key、碎片率和回源压力的综合问题。
- 不同业务 key 的可淘汰性不同，权限、库存、支付状态和展示缓存不能用同一种策略粗暴处理。
- TTL 要加随机抖动，避免大量 key 同时过期造成雪崩。
- big key 的风险不只在内存，还在序列化、网络传输、删除、复制和 slot 迁移。
- 内存接近上限时要先保护核心读链路，再降级非核心缓存和批量任务。
- Redis key 过期主要依赖惰性删除和定期删除，过期 key 可能短时间仍占内存。
- maxmemory-policy 决定内存不足时淘汰哪些 key，不同策略会影响命中率、正确性和用户体验。
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

可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。


### 落地实现细节

- volatile-lru/ttl：只淘汰设置过期时间的 key，适合区分缓存和不可淘汰状态。
- allkeys-lru/lfu：所有 key 参与淘汰，适合纯缓存集群但要防止关键状态被淘汰。
- TTL jitter：在基础 TTL 上加随机扰动，降低同一时间大面积过期。
- Big key治理：定期扫描、拆分、限长、异步删除和迁移前预估。
- 内存告警至少包含 used_memory、used_memory_dataset、mem_fragmentation_ratio、evicted_keys、blocked_clients。
- 删除大 Hash/ZSet/List 优先使用 UNLINK 或分批清理，避免 DEL 阻塞。
- 缓存策略要记录 ttl_policy 和 business_criticality，排查淘汰事故时能知道是否误淘汰关键 key。
- 雪崩回归压测要模拟同批 key 过期、Redis 内存打满和 DB 回源限流。
- 核心缓存必须明确 TTL、TTL jitter、预热策略和内存水位告警。
- 按业务域拆 key 空间和监控标签，避免一个模块的大 key 或热 key 拖垮全局。
- 上线前压测 evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio 和 DB fallback QPS。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
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

真实线上问题一般从 hot key、big key、slowlog、latency monitor、evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio、connected_clients、blocked_clients、replication lag、AOF rewrite 和 Cluster slot 迁移看起。回答时要先保护 DB 和核心接口，再定位是命令模型、数据结构、内存、网络、复制还是客户端问题。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- used_memory
- mem_fragmentation_ratio
- evicted_keys
- expired_keys
- backend_fallback_qps
- hot_key_qps
- cache_rebuild_lock_wait
- redis_latency_p95
- db_latency_p95
- cache_miss_rate

## 多轮追问模拟

### 延伸追问 1：volatile-lru 和 allkeys-lru 怎么选？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：活动缓存、会话缓存、权限缓存和 RAG 热门文档缓存都能讲。

### 延伸追问 2：big key 怎么删除？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：活动缓存、会话缓存、权限缓存和 RAG 热门文档缓存都能讲。

### 延伸追问 3：TTL 抖动解决什么问题？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：活动缓存、会话缓存、权限缓存和 RAG 热门文档缓存都能讲。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 活动缓存、会话缓存、权限缓存和 RAG 热门文档缓存都能讲。

**取舍总结**
Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- volatile-lru/ttl：只淘汰设置过期时间的 key，适合区分缓存和不可淘汰状态。
- allkeys-lru/lfu：所有 key 参与淘汰，适合纯缓存集群但要防止关键状态被淘汰。
- TTL jitter：在基础 TTL 上加随机扰动，降低同一时间大面积过期。
- Big key治理：定期扫描、拆分、限长、异步删除和迁移前预估。
- 内存告警至少包含 used_memory、used_memory_dataset、mem_fragmentation_ratio、evicted_keys、blocked_clients。
- 删除大 Hash/ZSet/List 优先使用 UNLINK 或分批清理，避免 DEL 阻塞。
- 缓存策略要记录 ttl_policy 和 business_criticality，排查淘汰事故时能知道是否误淘汰关键 key。
- 雪崩回归压测要模拟同批 key 过期、Redis 内存打满和 DB 回源限流。
- 核心缓存必须明确 TTL、TTL jitter、预热策略和内存水位告警。
- 按业务域拆 key 空间和监控标签，避免一个模块的大 key 或热 key 拖垮全局。
- 上线前压测 evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio 和 DB fallback QPS。
- 明确缓存 key schema、value schema、TTL、失效触发、回源保护和降级策略。
- 为缓存写入、失效、回源、重建和淘汰建立指标、日志和 trace。
- 上线后跟踪 hit rate、miss rate、backend fallback QPS、hot key QPS、big key count、redis p95 和 DB p95。
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
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis Documentation](https://redis.io/docs/latest/)：用于确认官方语义边界、命令行为和工程约束。
- [Redis: Distributed Locks with Redis](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)：用于确认官方语义边界、命令行为和工程约束。
