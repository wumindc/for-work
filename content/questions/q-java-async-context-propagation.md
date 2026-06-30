# Java 异步任务中 trace、MDC、租户和安全上下文怎么传播？

## 面试定位

这道题关联 CompletableFuture 异步编排、超时与上下文传播、Java 线程池参数、隔离与反压治理，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「CompletableFuture 异步编排、超时与上下文传播」切入：CompletableFuture 题要从异步 DAG、线程池选择、异常聚合、超时取消、上下文传播、下游隔离和可观测性展开。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 依赖 InheritableThreadLocal
- 只 set 不 remove
- 把大对象放 ThreadLocal

## 30 秒回答

我会先说明 ThreadLocal 在线程池复用下不会自动可靠传播，异步任务可能丢 trace、串租户或权限错乱。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先说明 ThreadLocal 在线程池复用下不会自动可靠传播，异步任务可能丢 trace、串租户或权限错乱。
- 做法是在提交任务时捕获上下文快照，执行前设置到当前线程，finally 恢复/清理；对 CompletableFuture、Executor、定时任务和 MQ consumer 都要统一包装。
- 上下文不能无限变大，敏感字段要脱敏，跨进程传播要走 trace headers 或消息 headers，不应把完整用户对象塞进 ThreadLocal。
- 指标和排障看 context_missing_count、trace_broken_rate、tenant_mismatch_error、MDC 泄漏和 ThreadLocal retained size。
- CompletableFuture 题要从异步 DAG、线程池选择、异常聚合、超时取消、上下文传播、下游隔离和可观测性展开。
- CompletableFuture 是 Java 中表达异步结果和组合回调的工具，可以构建任务依赖和聚合关系。
- 异步 DAG 是多个并行或串行任务组成的执行图，每个节点有自己的线程、超时、异常和结果语义。
- 上下文传播是把 trace、租户、安全和日志上下文从提交线程传递到执行线程。
- 异步化只降低等待耦合，不会降低下游真实成本；并发数必须受限。
- 每个下游都要有超时、降级、错误分类和指标，不能只在最外层统一超时。
- allOf 聚合要定义部分失败时返回降级、失败整体请求还是保留部分结果。
- 取消要尽量向下游传播，否则表面超时后后台任务仍然占用资源。
- CompletableFuture 适合并行调用多个下游并聚合结果，但默认 common pool 容易和其他任务互相影响。
- 异步编排必须处理 timeout、exceptionally、handle、allOf 任一失败语义、取消传播和上下文丢失。
- 线程池治理要按任务类型、队列、拒绝策略、超时、隔离、上下文传播、指标和降级设计，不能只背 corePoolSize。
- 线程池是复用线程执行任务的并发调度组件，用于控制并发、队列、资源隔离和任务生命周期。
- 线程池治理是围绕任务分类、参数配置、队列、拒绝、超时、上下文、监控和降级构建的运行体系。
- 反压是当下游或线程池不可承受时，让压力在入口被限制、排队或拒绝，而不是无限堆积。
- 先判断任务类型和 SLA，再配置核心线程、最大线程、队列和拒绝策略。
- 无界队列不是稳定性方案，它会隐藏压力并增加延迟、内存和 OOM 风险。
- 线程池要按业务隔离，慢任务、下游调用、MQ 消费和用户请求不要互相拖垮。
- 拒绝策略要和调用方契约配合，返回降级、快速失败、重试或写入 DLQ。
- Trace、MDC、租户和安全上下文跨线程传播要显式处理，不能依赖 ThreadLocal 自动继承。
- CPU 密集、IO 密集、定时任务、MQ 消费、模型调用和异步日志不能不加区分地共用一个线程池。


### 数据流怎么讲

可以按请求入口、线程池、任务队列、JMM 可见性、锁/CAS、异步编排、类加载边界、堆/非堆内存、GC、JFR/dump 证据和观测指标来讲。数据流通常是请求进入 Java 服务后带着 trace、tenant 和上下文进入同步或异步执行路径；线程池调度任务，锁和内存模型保证并发语义，JVM 通过 GC 和运行时管理内存，观测系统把线程、堆、GC、异常、下游和业务 SLA 串成证据链。


### 落地实现细节

- Custom executor：为不同下游和任务类型隔离线程池。
- orTimeout / completeOnTimeout：控制异步等待上限和默认结果。
- Structured logging + context wrapper：包装 Runnable/Supplier 传递 trace 和 MDC。
- Bulkhead + rate limit：限制并行下游调用，避免异步风暴。
- thenApply 和 thenApplyAsync 的线程语义不同，面试要说清回调在哪个线程执行。
- join 会把异常包装成 CompletionException，异常聚合要保留 root cause 和下游名称。
- 异步任务提交后要记录 task_id、parent_trace_id、executor_name、deadline 和 cancel_reason。
- 模型 API、搜索、推荐、库存等下游并行调用要按预算和 SLA 划分优先级。
- 生产异步任务要显式指定业务线程池，并为每个下游设置超时、降级和 bulkhead。
- traceId、MDC、tenant、用户权限和 locale 要在任务提交时捕获，执行后清理。
- 为不同任务类型隔离线程池，配置队列、超时、拒绝、降级和监控。
- 保留 GC log、JFR、heap dump、thread dump 和关键版本配置，支持故障复盘。
- 上线后跟踪 pool active、queue size、reject count、gc pause p95、heap usage 和 safepoint time。
- Bounded queue + CallerRuns/Abort/自定义拒绝：让压力可见并保护内存。
- Bulkhead isolation：按业务域和下游依赖隔离线程池。
- Adaptive concurrency：根据下游 p95、错误率和队列长度动态调整并发。
- Timeout + cancellation：为任务设置超时和取消，避免线程长期占用。
- Thread pool dashboard：监控 active、queue、reject、latency、timeout 和 error。
- 线程池参数要从任务耗时、目标吞吐、下游容量和机器资源反推，而不是套公式。
- 队列长度是隐含延迟，排队时间超过 SLA 时应拒绝或降级。
- 拒绝策略必须有业务语义：同步接口返回错误，异步任务写 retry/DLQ。
- 跨线程要复制 trace、MDC、tenant、locale 和安全上下文，执行后清理。
- Agent 工具执行和模型调用线程池要按 workspace/user 限流，避免单用户拖垮全局。
- 线程池必须暴露 active、pool size、queue size、reject count、task latency 和 timeout 指标。

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

### 异步任务线程池治理设计

**需求与边界**
- 不同任务类型隔离，慢下游不能拖垮核心链路。
- 队列、拒绝、超时和降级策略可配置、可观测。
- 上下文跨线程传播正确，失败可追踪。

**架构拆解**
- Task Router 按任务类型选择线程池。
- Bounded Executor 控制线程数、队列和拒绝策略。
- Timeout Guard 包装任务执行和取消。
- Context Propagator 传递 trace、tenant 和 MDC。
- Metrics Exporter 暴露线程池指标。

**数据流**
- 请求提交异步任务并附带 trace 和业务上下文。
- Router 选择对应线程池，超过队列容量触发拒绝策略。
- 任务执行时设置超时和取消信号。
- 下游异常按错误类型重试、降级或写 DLQ。
- 执行结果和指标写入监控与 trace。

**扩展点与观测指标**
- 按下游依赖限流，避免扩线程放大故障。
- 根据 CPU、IO 等待和队列长度调整线程数。
- 对批量任务使用独立 worker，避免影响在线请求。
- 监控 active_count、pool_size、queue_size、reject_count。
- 监控 task_latency_p95、timeout_count、downstream_error_rate。
- 记录 executor_name、task_type、trace_id、tenant_id 和 reject_reason。

**取舍**
- 更大线程池提升并发，但会增加上下文切换和下游压力。
- 更大队列减少拒绝，但增加延迟和内存风险。
- 快速失败保护系统，但需要调用方能处理降级结果。

## 真实问题与排障

真实线上问题一般从接口 p95/p99、线程池 active/queue/reject、lock contention、deadlock、CPU、GC pause、allocation rate、heap used after GC、direct memory、metaspace、classloader leak、JFR event 和 thread dump 看起。回答时要先确认影响面和止血动作，再区分线程池、锁、对象分配、GC、类加载、下游依赖和代码发布变更。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- async_task_latency_p95
- future_timeout_count
- fallback_count
- context_missing_count
- downstream_error_rate
- pool_active_count
- queue_size
- reject_count
- task_latency_p95
- timeout_count
- consumer_lag

## 多轮追问模拟

### 延伸追问 1：为什么 InheritableThreadLocal 不适合线程池？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲请求链路追踪、租户隔离、Agent tool execution、异步日志。；用上下文包装器、finally 清理、trace 断链率和租户串扰事故做项目证据。

### 延伸追问 2：上下文清理漏了会怎样？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲请求链路追踪、租户隔离、Agent tool execution、异步日志。；用上下文包装器、finally 清理、trace 断链率和租户串扰事故做项目证据。

### 延伸追问 3：跨 MQ 消息怎么传 trace？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲请求链路追踪、租户隔离、Agent tool execution、异步日志。；用上下文包装器、finally 清理、trace 断链率和租户串扰事故做项目证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲请求链路追踪、租户隔离、Agent tool execution、异步日志。
- 用上下文包装器、finally 清理、trace 断链率和租户串扰事故做项目证据。

**取舍总结**
Java/JVM 的取舍是成熟生态、强类型和高吞吐运行时换来了并发语义复杂、对象分配成本、GC 停顿、线程和类加载治理成本。面试追问通常会围绕 JMM happens-before、volatile 是否保证原子性、synchronized/ReentrantLock/AQS、ConcurrentHashMap、CompletableFuture 超时取消、类加载隔离、GC 日志和内存泄漏定位展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Custom executor：为不同下游和任务类型隔离线程池。
- orTimeout / completeOnTimeout：控制异步等待上限和默认结果。
- Structured logging + context wrapper：包装 Runnable/Supplier 传递 trace 和 MDC。
- Bulkhead + rate limit：限制并行下游调用，避免异步风暴。
- thenApply 和 thenApplyAsync 的线程语义不同，面试要说清回调在哪个线程执行。
- join 会把异常包装成 CompletionException，异常聚合要保留 root cause 和下游名称。
- 异步任务提交后要记录 task_id、parent_trace_id、executor_name、deadline 和 cancel_reason。
- 模型 API、搜索、推荐、库存等下游并行调用要按预算和 SLA 划分优先级。
- 生产异步任务要显式指定业务线程池，并为每个下游设置超时、降级和 bulkhead。
- traceId、MDC、tenant、用户权限和 locale 要在任务提交时捕获，执行后清理。
- 为不同任务类型隔离线程池，配置队列、超时、拒绝、降级和监控。
- 保留 GC log、JFR、heap dump、thread dump 和关键版本配置，支持故障复盘。
- 上线后跟踪 pool active、queue size、reject count、gc pause p95、heap usage 和 safepoint time。
- Bounded queue + CallerRuns/Abort/自定义拒绝：让压力可见并保护内存。
- Bulkhead isolation：按业务域和下游依赖隔离线程池。
- Adaptive concurrency：根据下游 p95、错误率和队列长度动态调整并发。
- Timeout + cancellation：为任务设置超时和取消，避免线程长期占用。
- Thread pool dashboard：监控 active、queue、reject、latency、timeout 和 error。
- 线程池参数要从任务耗时、目标吞吐、下游容量和机器资源反推，而不是套公式。
- 队列长度是隐含延迟，排队时间超过 SLA 时应拒绝或降级。
- 拒绝策略必须有业务语义：同步接口返回错误，异步任务写 retry/DLQ。
- 跨线程要复制 trace、MDC、tenant、locale 和安全上下文，执行后清理。
- Agent 工具执行和模型调用线程池要按 workspace/user 限流，避免单用户拖垮全局。
- 线程池必须暴露 active、pool size、queue size、reject count、task latency 和 timeout 指标。

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

- [Java SE 21 API: CompletableFuture](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html)：用于确认官方语义边界、命令行为和工程约束。
- [Oracle Java Tutorials: Concurrency](https://docs.oracle.com/javase/tutorial/essential/concurrency/)：用于确认官方语义边界、命令行为和工程约束。
- [Oracle Java Tutorials: Concurrency](https://docs.oracle.com/javase/tutorial/essential/concurrency/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
