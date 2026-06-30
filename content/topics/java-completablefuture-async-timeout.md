# CompletableFuture 异步编排、超时与上下文传播

## 面试定位

CompletableFuture 异步编排、超时与上下文传播 属于 Java 并发与 JVM / 异步编排与上下文传播。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：CompletableFuture 题要从异步 DAG、线程池选择、异常聚合、超时取消、上下文传播、下游隔离和可观测性展开。

**必须讲清楚**
- CompletableFuture 是 Java 中表达异步结果和组合回调的工具，可以构建任务依赖和聚合关系。
- 异步 DAG 是多个并行或串行任务组成的执行图，每个节点有自己的线程、超时、异常和结果语义。
- 上下文传播是把 trace、租户、安全和日志上下文从提交线程传递到执行线程。
- CompletableFuture 题要从异步 DAG、线程池选择、异常聚合、超时取消、上下文传播、下游隔离和可观测性展开。
- 异步不等于无限并发
- 必须指定线程池
- 超时取消和异常聚合要设计

**常见追问方向**
- 线程池题先讲任务类型、队列、拒绝策略、隔离和上下文传播，而不是背参数。
- GC 题先讲影响面和证据，再讲堆、对象分配、收集器、停顿和内存泄漏定位。
- 把 Java 运行时治理连接到 MQ 积压、Redis 热点、Prometheus 指标和 Trace。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 异步化只降低等待耦合，不会降低下游真实成本；并发数必须受限。
- 每个下游都要有超时、降级、错误分类和指标，不能只在最外层统一超时。
- allOf 聚合要定义部分失败时返回降级、失败整体请求还是保留部分结果。
- 取消要尽量向下游传播，否则表面超时后后台任务仍然占用资源。
- CompletableFuture 适合并行调用多个下游并聚合结果，但默认 common pool 容易和其他任务互相影响。
- 异步编排必须处理 timeout、exceptionally、handle、allOf 任一失败语义、取消传播和上下文丢失。
- Custom executor：为不同下游和任务类型隔离线程池。
- orTimeout / completeOnTimeout：控制异步等待上限和默认结果。
- Structured logging + context wrapper：包装 Runnable/Supplier 传递 trace 和 MDC。
- Bulkhead + rate limit：限制并行下游调用，避免异步风暴。
- thenApply 和 thenApplyAsync 的线程语义不同，面试要说清回调在哪个线程执行。
- join 会把异常包装成 CompletionException，异常聚合要保留 root cause 和下游名称。
- 异步任务提交后要记录 task_id、parent_trace_id、executor_name、deadline 和 cancel_reason。
- 模型 API、搜索、推荐、库存等下游并行调用要按预算和 SLA 划分优先级。


### 通用数据流

可以按请求入口、线程池、任务队列、JMM 可见性、锁/CAS、异步编排、类加载边界、堆/非堆内存、GC、JFR/dump 证据和观测指标来讲。数据流通常是请求进入 Java 服务后带着 trace、tenant 和上下文进入同步或异步执行路径；线程池调度任务，锁和内存模型保证并发语义，JVM 通过 GC 和运行时管理内存，观测系统把线程、堆、GC、异常、下游和业务 SLA 串成证据链。


### 工程落点

- 为不同任务类型隔离线程池，配置队列、超时、拒绝、降级和监控。
- 保留 GC log、JFR、heap dump、thread dump 和关键版本配置，支持故障复盘。
- 上线后跟踪 pool active、queue size、reject count、gc pause p95、heap usage 和 safepoint time。
- 生产异步任务要显式指定业务线程池，并为每个下游设置超时、降级和 bulkhead。
- traceId、MDC、tenant、用户权限和 locale 要在任务提交时捕获，执行后清理。
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

图 1：CompletableFuture 异步编排、超时与上下文传播 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### CompletableFuture 异步编排、超时与上下文传播 的面试级设计题

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
- async_task_latency_p95
- future_timeout_count
- fallback_count
- context_missing_count
- downstream_error_rate

**常见误区**
- 使用默认 common pool
- 只 allOf join 不处理部分失败
- 异步后丢 trace 和租户上下文

## 业界方案与技术取舍

Java/JVM 的取舍是成熟生态、强类型和高吞吐运行时换来了并发语义复杂、对象分配成本、GC 停顿、线程和类加载治理成本。面试追问通常会围绕 JMM happens-before、volatile 是否保证原子性、synchronized/ReentrantLock/AQS、ConcurrentHashMap、CompletableFuture 超时取消、类加载隔离、GC 日志和内存泄漏定位展开。

**方案对比**
- Custom executor：为不同下游和任务类型隔离线程池。
- orTimeout / completeOnTimeout：控制异步等待上限和默认结果。
- Structured logging + context wrapper：包装 Runnable/Supplier 传递 trace 和 MDC。
- Bulkhead + rate limit：限制并行下游调用，避免异步风暴。
- 异步聚合降低接口等待时间，但增加调试、上下文和异常处理复杂度。
- 更激进的超时保护核心 SLA，但可能牺牲结果完整性。
- 线程池隔离提升稳定性，但配置和容量规划成本上升。
- 先把 Java 服务看成线程、队列、堆内存、GC、下游依赖和业务 SLA 共同作用的运行系统。
- 线程池治理解决并发调度和反压，JVM 排障解决内存、停顿、线程和运行时稳定性。
- 面试回答要从参数配置推进到事故处理、指标看板、压测和回归验证。
- CompletableFuture 很适合连接线程池治理、Trace、下游限流和用户可感知降级。
- 面试时用一张异步 DAG 图讲超时、异常、取消和 fallback，会比背 API 方法名强很多。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

CompletableFuture 题要从异步 DAG、线程池选择、异常聚合、超时取消、上下文传播、下游隔离和可观测性展开。 CompletableFuture 是 Java 中表达异步结果和组合回调的工具，可以构建任务依赖和聚合关系。 异步 DAG 是多个并行或串行任务组成的执行图，每个节点有自己的线程、超时、异常和结果语义。 上下文传播是把 trace、租户、安全和日志上下文从提交线程传递到执行线程。 异步化只降低等待耦合，不会降低下游真实成本；并发数必须受限。 每个下游都要有超时、降级、错误分类和指标，不能只在最外层统一超时。 allOf 聚合要定义部分失败时返回降级、失败整体请求还是保留部分结果。 取消要尽量向下游传播，否则表面超时后后台任务仍然占用资源。

面试深挖时要把异步 DAG 当成有状态执行协议，而不是几个 API 调用。每个 stage 都要知道由哪个 executor 执行、继承了什么上下文、截止时间是多少、失败后是否降级、取消是否传播到下游，以及最终聚合语义是全失败、部分成功还是保留默认值。这样才能解释为什么接口已经超时但后台任务仍在占资源。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `future_id` | 异步任务 | 标识一次异步执行 | 串联 stage 和聚合结果 |
| `stage_name` | DAG 节点 | 标识任务阶段 | 定位哪个下游或转换慢 |
| `executor_name` | 线程池 | 指定执行资源 | 排查 common pool 污染和隔离失效 |
| `deadline_ms` | 超时协议 | 阶段截止时间 | 判断超时是否逐层传播 |
| `context_snapshot` | 上下文 | trace、tenant、user、locale | 排查跨线程上下文丢失 |
| `exception_type` | 失败结果 | 记录 CompletionException 根因 | 避免聚合后丢失真实异常 |
| `cancel_reason` | 取消协议 | 标识用户取消、超时或上游失败 | 判断后台任务是否仍在执行 |
| `fallback_code` | 降级结果 | 说明默认值或部分结果来源 | 支持业务可解释降级 |

## 公开阅读校验

公开文章里要避免把 CompletableFuture 写成“并行一下就快”。真正有价值的是让读者看到异步化的边界：它降低等待耦合，但不会减少下游成本；它需要显式线程池，否则会污染 common pool；它需要阶段级超时和取消传播，否则只是在调用方表面超时；它需要上下文包装器，否则 trace、租户和权限会丢。读者能用这些边界检查自己的代码，文章才算专业。

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 来源与延伸阅读

- [Java SE 21 API: CompletableFuture](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html)：用于确认官方语义边界、命令行为和工程约束。
- [Oracle Java Tutorials: Concurrency](https://docs.oracle.com/javase/tutorial/essential/concurrency/)：用于确认官方语义边界、命令行为和工程约束。
