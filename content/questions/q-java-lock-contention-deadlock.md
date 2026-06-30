# 线上 Java 线程大量 BLOCKED 或疑似死锁，你会怎么排查？

## 面试定位

这道题关联 synchronized、ReentrantLock 与 AQS 锁机制、JVM GC、内存与线上排障，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「synchronized、ReentrantLock 与 AQS 锁机制」切入：Java 锁题要从互斥、可见性、锁升级、AQS 队列、可中断/超时、公平性、条件队列和死锁排障展开。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 只重启不保留现场
- 看不到持锁线程
- 修复只加 synchronized

## 30 秒回答

先看影响面：接口 p99、线程池 queue、BLOCKED/WAITING 线程数、CPU、GC、下游延迟和最近发布，确定是全局还是局部业务 key。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 先看影响面：接口 p99、线程池 queue、BLOCKED/WAITING 线程数、CPU、GC、下游延迟和最近发布，确定是全局还是局部业务 key。
- 采集 thread dump/JFR，定位持锁线程、等待线程、锁对象、调用栈、业务 trace 和加锁顺序；如果是真死锁，JVM dump 通常能显示 deadlock 信息。
- 止血可以回滚发布、限流高风险入口、隔离慢下游、降低批任务并发或重启单实例；修复包括缩短临界区、固定锁顺序、拆锁、tryLock 超时和移除锁内远程调用。
- 恢复后用并发压测和 lock_blocked_time、thread_blocked_count、critical_section_latency 证明回归。
- Java 锁题要从互斥、可见性、锁升级、AQS 队列、可中断/超时、公平性、条件队列和死锁排障展开。
- 锁是保护临界区的同步机制，同时提供互斥和内存可见性保证。
- AQS 是 Java 并发包中构建锁和同步器的基础框架，通过 state 和等待队列管理竞争线程。
- Condition 是显式锁下的条件等待队列，用于比 wait/notify 更清晰地表达等待和唤醒。
- 临界区越小，锁竞争和尾延迟越低。
- 多个锁必须固定获取顺序，避免循环等待。
- tryLock 和超时能让业务具备失败路径，避免线程无限等待。
- 锁内不能做不可控耗时动作，例如 HTTP、MQ、模型 API 或慢 SQL。
- synchronized 语义简单，随 JVM 优化具备较好性能；ReentrantLock 提供 tryLock、可中断、公平锁和多个 Condition。
- AQS 通过 state、CAS、CLH 风格等待队列和 park/unpark 支撑 ReentrantLock、Semaphore、CountDownLatch 等同步器。
- JVM GC 排障要从影响面、GC 日志、堆/非堆、对象分配、线程、JFR、heap dump、降级和回归验证完整展开。
- GC 是 JVM 自动回收不可达对象内存的机制，不同收集器在吞吐、延迟、停顿和内存开销之间做取舍。
- JVM 排障是利用 GC 日志、JFR、heap dump、thread dump、指标和业务 trace 定位运行时问题的过程。
- 内存问题不只包括堆 OOM，也包括 direct memory、metaspace、线程栈、缓存膨胀和对象分配过快。
- 先判断用户影响和时间窗口，再抓证据，避免无证据调参。
- GC 停顿是结果，不一定是根因；根因可能是对象分配暴涨、缓存泄漏、线程池堆积或下游慢。
- 调大堆可能减少 GC 次数，但会增加单次停顿和故障恢复成本。
- 排障动作要考虑风险：dump 大堆可能占满磁盘，jstack 频繁执行也会增加抖动。
- 修复后必须做回归压测，验证 pause、吞吐、内存曲线和业务 p95 是否改善。
- GC 问题可能表现为停顿、吞吐下降、CPU 飙升、内存泄漏、频繁 Full GC 或 OOM。


### 数据流怎么讲

可以按请求入口、线程池、任务队列、JMM 可见性、锁/CAS、异步编排、类加载边界、堆/非堆内存、GC、JFR/dump 证据和观测指标来讲。数据流通常是请求进入 Java 服务后带着 trace、tenant 和上下文进入同步或异步执行路径；线程池调度任务，锁和内存模型保证并发语义，JVM 通过 GC 和运行时管理内存，观测系统把线程、堆、GC、异常、下游和业务 SLA 串成证据链。


### 落地实现细节

- Thread dump：查看 BLOCKED/WAITING 线程和锁对象。
- JFR lock profiling：定位热点锁、阻塞时间和调用栈。
- Striped lock：按 key 拆分锁粒度，降低全局锁竞争。
- ReadWriteLock / StampedLock：读多写少场景降低互斥成本，但要谨慎处理复杂性。
- ReentrantLock 使用后必须在 finally 中 unlock，避免异常路径永久占锁。
- 公平锁降低饥饿但吞吐通常更低，只有明确公平需求才使用。
- wait/notify 必须配合条件循环判断，避免虚假唤醒和丢信号。
- 死锁排查要还原线程、锁对象、获取顺序、业务 key 和最近发布。
- 锁竞争问题要用 thread dump、JFR lock event、blocked time、业务 trace 和代码临界区一起定位。
- 高并发下优先缩小临界区、固定加锁顺序、拆分锁粒度或使用并发容器，而不是盲目换锁实现。
- 为不同任务类型隔离线程池，配置队列、超时、拒绝、降级和监控。
- 保留 GC log、JFR、heap dump、thread dump 和关键版本配置，支持故障复盘。
- 上线后跟踪 pool active、queue size、reject count、gc pause p95、heap usage 和 safepoint time。
- GC log analysis：查看 pause、cause、young/old 回收、晋升和 Full GC。
- JFR：低开销记录分配、锁、线程、IO、异常和 GC 事件。
- Heap dump + dominator tree：定位大对象、泄漏集合和引用链。
- Thread dump：定位死锁、阻塞、线程池耗尽和高 CPU 线程。
- Runtime dashboard：监控 heap、non-heap、direct memory、GC pause、allocation rate 和 safepoint。
- GC 排障先看时间相关性：业务延迟、GC pause、CPU、allocation rate 和线程池队列是否同时变化。
- heap used after GC 持续升高比单次 heap used 更能说明可能泄漏。
- direct memory、metaspace、线程数和本地内存也可能导致 OOM，不能只看 Java heap。
- 对象泄漏常见于无界缓存、静态集合、ThreadLocal 未清理、trace buffer 和队列积压。
- Agent/RAG 服务要特别关注大 prompt、长 trace、embedding 批量结果和缓存 value 的对象体积。
- 生产要提前开启可接受开销的 GC log、JFR 或运行时指标，事故时才有证据。

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

### Java 服务运行时观测与 GC 排障设计

**需求与边界**
- 线上能快速判断 GC 是否影响 SLA。
- 能安全采集 GC log、JFR、heap dump 和 thread dump。
- 排障结论能回到代码、缓存、线程池或下游依赖改进。

**架构拆解**
- Runtime Metrics Exporter 暴露 JVM 和线程池指标。
- GC Log Collector 收集并索引 GC 日志。
- JFR Trigger 按告警条件采集短窗口 JFR。
- Dump Tool 受控采集 heap/thread dump。
- Incident Dashboard 关联业务 p95、GC、线程池和下游指标。

**数据流**
- Prometheus 采集 heap、GC、thread 和 executor 指标。
- 告警触发后保存时间窗口和 trace 样本。
- 按审批采集 JFR、heap dump 或 thread dump。
- 分析对象引用链、分配热点、线程阻塞和 GC cause。
- 修复后用压测和线上指标验证回归。

**扩展点与观测指标**
- JFR 使用短时间窗口，控制开销和文件大小。
- dump 写入独立磁盘或对象存储，避免占满业务磁盘。
- 多实例分批诊断，避免同时暂停所有节点。
- 监控 gc_pause_p95、gc_pause_max、full_gc_count、allocation_rate。
- 监控 heap_used_after_gc、old_gen_usage、direct_memory_used、thread_count。
- 关联 http_p95、consumer_lag、executor_queue_size 和 downstream_latency。

**取舍**
- 更大堆降低 GC 频率，但可能增加停顿和 dump 成本。
- 更详细的诊断数据提升定位能力，但会增加采集开销和敏感信息风险。
- 激进降级能快速止血，但可能影响用户功能完整性。

## 真实问题与排障

真实线上问题一般从接口 p95/p99、线程池 active/queue/reject、lock contention、deadlock、CPU、GC pause、allocation rate、heap used after GC、direct memory、metaspace、classloader leak、JFR event 和 thread dump 看起。回答时要先确认影响面和止血动作，再区分线程池、锁、对象分配、GC、类加载、下游依赖和代码发布变更。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- lock_blocked_time
- lock_wait_count
- deadlock_count
- critical_section_latency
- thread_blocked_count
- gc_pause_p95
- allocation_rate
- heap_used_after_gc
- full_gc_count
- safepoint_time
- queue_size

## 多轮追问模拟

### 延伸追问 1：BLOCKED 和 WAITING 有什么区别？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲任务调度器、批处理、缓存回源、异步聚合。；用 thread dump、JFR、trace_id、业务 key 和修复后压测曲线说明生产经验。

### 延伸追问 2：锁内为什么不能调用远程服务？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲任务调度器、批处理、缓存回源、异步聚合。；用 thread dump、JFR、trace_id、业务 key 和修复后压测曲线说明生产经验。

### 延伸追问 3：怎么避免多锁死锁？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲任务调度器、批处理、缓存回源、异步聚合。；用 thread dump、JFR、trace_id、业务 key 和修复后压测曲线说明生产经验。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲任务调度器、批处理、缓存回源、异步聚合。
- 用 thread dump、JFR、trace_id、业务 key 和修复后压测曲线说明生产经验。

**取舍总结**
Java/JVM 的取舍是成熟生态、强类型和高吞吐运行时换来了并发语义复杂、对象分配成本、GC 停顿、线程和类加载治理成本。面试追问通常会围绕 JMM happens-before、volatile 是否保证原子性、synchronized/ReentrantLock/AQS、ConcurrentHashMap、CompletableFuture 超时取消、类加载隔离、GC 日志和内存泄漏定位展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Thread dump：查看 BLOCKED/WAITING 线程和锁对象。
- JFR lock profiling：定位热点锁、阻塞时间和调用栈。
- Striped lock：按 key 拆分锁粒度，降低全局锁竞争。
- ReadWriteLock / StampedLock：读多写少场景降低互斥成本，但要谨慎处理复杂性。
- ReentrantLock 使用后必须在 finally 中 unlock，避免异常路径永久占锁。
- 公平锁降低饥饿但吞吐通常更低，只有明确公平需求才使用。
- wait/notify 必须配合条件循环判断，避免虚假唤醒和丢信号。
- 死锁排查要还原线程、锁对象、获取顺序、业务 key 和最近发布。
- 锁竞争问题要用 thread dump、JFR lock event、blocked time、业务 trace 和代码临界区一起定位。
- 高并发下优先缩小临界区、固定加锁顺序、拆分锁粒度或使用并发容器，而不是盲目换锁实现。
- 为不同任务类型隔离线程池，配置队列、超时、拒绝、降级和监控。
- 保留 GC log、JFR、heap dump、thread dump 和关键版本配置，支持故障复盘。
- 上线后跟踪 pool active、queue size、reject count、gc pause p95、heap usage 和 safepoint time。
- GC log analysis：查看 pause、cause、young/old 回收、晋升和 Full GC。
- JFR：低开销记录分配、锁、线程、IO、异常和 GC 事件。
- Heap dump + dominator tree：定位大对象、泄漏集合和引用链。
- Thread dump：定位死锁、阻塞、线程池耗尽和高 CPU 线程。
- Runtime dashboard：监控 heap、non-heap、direct memory、GC pause、allocation rate 和 safepoint。
- GC 排障先看时间相关性：业务延迟、GC pause、CPU、allocation rate 和线程池队列是否同时变化。
- heap used after GC 持续升高比单次 heap used 更能说明可能泄漏。
- direct memory、metaspace、线程数和本地内存也可能导致 OOM，不能只看 Java heap。
- 对象泄漏常见于无界缓存、静态集合、ThreadLocal 未清理、trace buffer 和队列积压。
- Agent/RAG 服务要特别关注大 prompt、长 trace、embedding 批量结果和缓存 value 的对象体积。
- 生产要提前开启可接受开销的 GC log、JFR 或运行时指标，事故时才有证据。

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

- [Java SE 21 API: ReentrantLock](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html)：用于确认官方语义边界、命令行为和工程约束。
- [Java Language Specification: Threads and Locks](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)：用于确认官方语义边界、命令行为和工程约束。
- [Oracle: HotSpot VM Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/)：用于确认官方语义边界、命令行为和工程约束。
- [Oracle Java Tutorials: Concurrency](https://docs.oracle.com/javase/tutorial/essential/concurrency/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
