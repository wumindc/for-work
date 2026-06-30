# synchronized、ReentrantLock 与 AQS 锁机制

## 面试定位

synchronized、ReentrantLock 与 AQS 锁机制 属于 Java 并发与 JVM / JMM、锁与并发基础。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Java 锁题要从互斥、可见性、锁升级、AQS 队列、可中断/超时、公平性、条件队列和死锁排障展开。

**必须讲清楚**
- 锁是保护临界区的同步机制，同时提供互斥和内存可见性保证。
- AQS 是 Java 并发包中构建锁和同步器的基础框架，通过 state 和等待队列管理竞争线程。
- Condition 是显式锁下的条件等待队列，用于比 wait/notify 更清晰地表达等待和唤醒。
- Java 锁题要从互斥、可见性、锁升级、AQS 队列、可中断/超时、公平性、条件队列和死锁排障展开。
- 锁既管互斥也管可见性
- AQS 用状态和队列协调等待
- 锁等待要能观测

**常见追问方向**
- 线程池题先讲任务类型、队列、拒绝策略、隔离和上下文传播，而不是背参数。
- GC 题先讲影响面和证据，再讲堆、对象分配、收集器、停顿和内存泄漏定位。
- 把 Java 运行时治理连接到 MQ 积压、Redis 热点、Prometheus 指标和 Trace。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 临界区越小，锁竞争和尾延迟越低。
- 多个锁必须固定获取顺序，避免循环等待。
- tryLock 和超时能让业务具备失败路径，避免线程无限等待。
- 锁内不能做不可控耗时动作，例如 HTTP、MQ、模型 API 或慢 SQL。
- synchronized 语义简单，随 JVM 优化具备较好性能；ReentrantLock 提供 tryLock、可中断、公平锁和多个 Condition。
- AQS 通过 state、CAS、CLH 风格等待队列和 park/unpark 支撑 ReentrantLock、Semaphore、CountDownLatch 等同步器。
- Thread dump：查看 BLOCKED/WAITING 线程和锁对象。
- JFR lock profiling：定位热点锁、阻塞时间和调用栈。
- Striped lock：按 key 拆分锁粒度，降低全局锁竞争。
- ReadWriteLock / StampedLock：读多写少场景降低互斥成本，但要谨慎处理复杂性。
- ReentrantLock 使用后必须在 finally 中 unlock，避免异常路径永久占锁。
- 公平锁降低饥饿但吞吐通常更低，只有明确公平需求才使用。
- wait/notify 必须配合条件循环判断，避免虚假唤醒和丢信号。
- 死锁排查要还原线程、锁对象、获取顺序、业务 key 和最近发布。


### 通用数据流

可以按请求入口、线程池、任务队列、JMM 可见性、锁/CAS、异步编排、类加载边界、堆/非堆内存、GC、JFR/dump 证据和观测指标来讲。数据流通常是请求进入 Java 服务后带着 trace、tenant 和上下文进入同步或异步执行路径；线程池调度任务，锁和内存模型保证并发语义，JVM 通过 GC 和运行时管理内存，观测系统把线程、堆、GC、异常、下游和业务 SLA 串成证据链。


### 工程落点

- 为不同任务类型隔离线程池，配置队列、超时、拒绝、降级和监控。
- 保留 GC log、JFR、heap dump、thread dump 和关键版本配置，支持故障复盘。
- 上线后跟踪 pool active、queue size、reject count、gc pause p95、heap usage 和 safepoint time。
- 锁竞争问题要用 thread dump、JFR lock event、blocked time、业务 trace 和代码临界区一起定位。
- 高并发下优先缩小临界区、固定加锁顺序、拆分锁粒度或使用并发容器，而不是盲目换锁实现。
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

图 1：synchronized、ReentrantLock 与 AQS 锁机制 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### synchronized、ReentrantLock 与 AQS 锁机制 的面试级设计题

典型设计题是订单服务异步化、MQ 消费者、定时任务平台、Agent tool execution worker 或高并发缓存回源。架构上要包含线程池隔离、有界队列、超时取消、上下文传播、锁竞争治理、JFR/GC log、heap/thread dump、Prometheus 指标和故障降级。

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

真实线上问题一般从接口 p95/p99、线程池 active/queue/reject、lock contention、deadlock、CPU、GC pause、allocation rate、heap used after GC、direct memory、metaspace、classloader leak、JFR event 和 thread dump 看起。回答时要先确认影响面和止血动作，再区分线程池、锁、对象分配、GC、类加载、下游依赖和代码发布变更。

**排查顺序**
- 先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。
- 再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。
- 对比最近发布、配置变更、流量变化、数据倾斜和下游限流。
- 先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。
- 最后把失败样例进入 regression/eval，避免同类问题复发。

**重点指标**
- lock_blocked_time
- lock_wait_count
- deadlock_count
- critical_section_latency
- thread_blocked_count

**常见误区**
- 只比较 synchronized 和 Lock 性能
- 忘记 finally unlock
- 锁内调用远程接口或慢 SQL

## 业界方案与技术取舍

Java/JVM 的取舍是成熟生态、强类型和高吞吐运行时换来了并发语义复杂、对象分配成本、GC 停顿、线程和类加载治理成本。面试追问通常会围绕 JMM happens-before、volatile 是否保证原子性、synchronized/ReentrantLock/AQS、ConcurrentHashMap、CompletableFuture 超时取消、类加载隔离、GC 日志和内存泄漏定位展开。

**方案对比**
- Thread dump：查看 BLOCKED/WAITING 线程和锁对象。
- JFR lock profiling：定位热点锁、阻塞时间和调用栈。
- Striped lock：按 key 拆分锁粒度，降低全局锁竞争。
- ReadWriteLock / StampedLock：读多写少场景降低互斥成本，但要谨慎处理复杂性。
- synchronized 语义简单、维护成本低，适合多数普通临界区。
- ReentrantLock 功能更强，但错误使用更容易造成锁泄漏。
- 锁粒度越细并发越高，但状态一致性和代码复杂度也会上升。
- 先把 Java 服务看成线程、队列、堆内存、GC、下游依赖和业务 SLA 共同作用的运行系统。
- 线程池治理解决并发调度和反压，JVM 排障解决内存、停顿、线程和运行时稳定性。
- 面试回答要从参数配置推进到事故处理、指标看板、压测和回归验证。
- 锁机制可以和数据库锁、Redis 分布式锁做对比，展示你知道不同层锁的边界。
- 把一次线程阻塞或死锁排障讲清楚，比单纯背 AQS 源码更贴近工程面试。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Java 锁题要从互斥、可见性、锁升级、AQS 队列、可中断/超时、公平性、条件队列和死锁排障展开。 锁是保护临界区的同步机制，同时提供互斥和内存可见性保证。 AQS 是 Java 并发包中构建锁和同步器的基础框架，通过 state 和等待队列管理竞争线程。 Condition 是显式锁下的条件等待队列，用于比 wait/notify 更清晰地表达等待和唤醒。 临界区越小，锁竞争和尾延迟越低。 多个锁必须固定获取顺序，避免循环等待。 tryLock 和超时能让业务具备失败路径，避免线程无限等待。 锁内不能做不可控耗时动作，例如 HTTP、MQ、模型 API 或慢 SQL。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `request_id` | 请求 | 串联入口、缓存、DB 和下游调用 | 定位单次异常 |
| `key_schema` | Redis/存储 | 固定业务域、实体和版本 | 排查误删、串租户和旧版本 |
| `source_version` | value/event | 标识事实源版本 | 防止旧值覆盖新值 |
| `ttl_policy` | 缓存策略 | 控制过期、抖动和刷新 | 排查击穿、雪崩和旧值窗口 |
| `trace_id` | 观测链路 | 串联服务、存储和异步任务 | 复盘慢请求和失败分支 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 来源与延伸阅读

- [Java SE 21 API: ReentrantLock](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html)：用于确认官方语义边界、命令行为和工程约束。
- [Java Language Specification: Threads and Locks](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)：用于确认官方语义边界、命令行为和工程约束。
