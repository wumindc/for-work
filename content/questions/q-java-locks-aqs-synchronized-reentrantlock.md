# synchronized 和 ReentrantLock 有什么区别？AQS 大致怎么工作？

## 面试定位

这道题关联 synchronized、ReentrantLock 与 AQS 锁机制，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「synchronized、ReentrantLock 与 AQS 锁机制」切入：Java 锁题要从互斥、可见性、锁升级、AQS 队列、可中断/超时、公平性、条件队列和死锁排障展开。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 只说 ReentrantLock 性能更好
- 忘记 unlock
- 锁内做远程调用

## 30 秒回答

我会先讲共同点：两者都用于保护临界区，提供互斥和内存可见性。锁释放/获取形成 happens-before。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先讲共同点：两者都用于保护临界区，提供互斥和内存可见性。锁释放/获取形成 happens-before。
- 区别上 synchronized 语义简单、自动释放、JVM 优化充分；ReentrantLock 支持 tryLock、可中断、公平锁、多个 Condition，但必须 finally unlock。
- AQS 可以理解为 state + CAS + 等待队列 + park/unpark，许多同步器用它管理竞争线程和唤醒。
- 工程回答要落到锁粒度、临界区耗时、加锁顺序、thread dump/JFR 定位阻塞，而不是只比较性能。
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
- 把核心对象、状态变化、执行顺序和异常路径讲出来，避免只说结论。


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
- 关键接口要有 schema、version、timeout、retry、幂等键和审计字段。
- 关键状态要能恢复，关键动作要能回放，关键结果要有验证器或指标证明。

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

典型设计题是订单服务异步化、MQ 消费者、定时任务平台、Agent tool execution worker 或高并发缓存回源。架构上要包含线程池隔离、有界队列、超时取消、上下文传播、锁竞争治理、JFR/GC log、heap/thread dump、Prometheus 指标和故障降级。

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

## 多轮追问模拟

### 延伸追问 1：公平锁为什么吞吐可能低？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲本地任务调度、缓存重建、库存本地聚合、Agent worker 抢占。；用 thread dump、JFR lock event、blocked time 和加锁顺序作为证据。

### 延伸追问 2：Condition 和 wait/notify 有什么区别？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲本地任务调度、缓存重建、库存本地聚合、Agent worker 抢占。；用 thread dump、JFR lock event、blocked time 和加锁顺序作为证据。

### 延伸追问 3：锁竞争怎么排查？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲本地任务调度、缓存重建、库存本地聚合、Agent worker 抢占。；用 thread dump、JFR lock event、blocked time 和加锁顺序作为证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲本地任务调度、缓存重建、库存本地聚合、Agent worker 抢占。
- 用 thread dump、JFR lock event、blocked time 和加锁顺序作为证据。

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
- 关键数据结构要带版本、状态、trace、超时、重试和审计字段。

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
