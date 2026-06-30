# 线上大表加字段、加索引或改字段，如何做到平滑变更？

## 面试定位

这道题关联 Online DDL、Schema 变更与灰度迁移、数据库备份、恢复与迁移演练，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Online DDL、Schema 变更与灰度迁移」切入：Schema 变更题要讲清 DDL 锁影响、兼容发布、expand/contract、双读双写、灰度切流、校验和回滚。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 认为 Online DDL 完全不锁
- 字段删除太早
- 回填没有限速和校验

## 30 秒回答

我会先评估变更类型和风险：表大小、写入 QPS、索引宽度、锁模式、执行时间、复制延迟、备份状态和回滚方案。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先评估变更类型和风险：表大小、写入 QPS、索引宽度、锁模式、执行时间、复制延迟、备份状态和回滚方案。
- 发布顺序采用 expand/contract：先做兼容 schema，例如加 nullable 字段或新索引；再发布兼容新旧字段的代码；分批回填；灰度切读；最后删除旧字段或旧逻辑。
- Online DDL 不等于无风险，要在低峰执行，观察 lock wait、replica lag、DDL duration、DB CPU、磁盘水位和错误率；回填任务要限速、可暂停、可重跑。
- 回滚要提前设计：代码有开关，新旧字段双写，切读可回退，旧结构保留一段窗口，校验通过后再 contract。
- Schema 变更题要讲清 DDL 锁影响、兼容发布、expand/contract、双读双写、灰度切流、校验和回滚。
- Online DDL 是尽量在业务仍可读写的情况下完成表结构或索引变更的能力。
- Schema 灰度迁移是让数据库结构和应用代码分阶段兼容演进，而不是一次性强切。
- Expand/contract 是先添加兼容结构并双写，验证后切读，最后移除旧结构的迁移模式。
- 先做向后兼容变更，例如加 nullable 字段、新表或新索引，再发布能同时读写新旧结构的代码。
- 回填要限速、分批、可暂停、可重跑，并记录游标、失败样本和校验结果。
- 删除字段、改语义、收紧约束属于 contract 阶段，必须等旧代码和旧数据完全退出。
- DDL 风险要和主从复制、备份、连接池、慢查询和应用发布统一评估。
- Online DDL 降低阻塞风险，但不代表没有锁、没有复制延迟、没有资源消耗。
- 字段、索引和表结构变更要和应用发布顺序配合，避免旧代码和新 schema 不兼容。
- 备份恢复题要围绕 RPO/RTO、全量备份、增量日志、恢复演练、校验、迁移回滚和业务停机窗口回答。
- RPO 表示最多可接受丢失多少数据，RTO 表示最多可接受多长恢复时间。
- 备份恢复链路通常由全量备份、增量日志、元数据、恢复环境、校验和切换流程组成。
- 数据迁移是在不中断或少中断业务的情况下，把数据从旧模型、旧库或旧表迁到新目标。
- 没有恢复演练的备份只是心理安慰，必须按真实数据量和真实权限验证。
- 恢复要先保护现场，再选择时间点、恢复环境、binlog/增量范围和业务补偿方式。
- 迁移脚本要幂等、可暂停、可重跑、可限速，并记录进度和错误样本。
- 切流前后都要做行数、校验和、业务抽样、关键接口和报表一致性校验。
- 数据库备份只有在定期恢复演练并通过一致性校验后才算有效。
- 迁移不是复制数据这么简单，还包含双写、增量追平、校验、切流、回滚和清理。


### 数据流怎么讲

可以按业务查询入口、SQL 访问路径、索引、执行计划、锁/MVCC、事务边界、复制链路、备份恢复、Schema 变更和观测指标来讲。数据流通常是应用带着 request_id、tenant_id、幂等键和查询条件进入服务层，服务层选择读主库、读副本、缓存或异步事件；数据库优化器根据统计信息和索引选择 plan，事务层通过 MVCC、锁和日志保证并发正确性，运维层通过备份、复制和 DDL 流程保证可恢复、可演进。


### 落地实现细节

- Expand/contract migration：先扩展 schema，再迁移流量，最后收缩旧字段。
- Shadow table migration：新表承接新模型，通过双写和校验逐步切换。
- Online schema change：使用数据库原生 Online DDL 或外部工具降低阻塞。
- Backfill job：按主键范围分批回填，配合校验和限速。
- 新增索引前要评估索引宽度、写入成本、磁盘水位、锁模式和执行时间。
- 应用代码要支持新旧字段共存，读路径切换要有灰度开关和回滚开关。
- 回填任务要避免长事务，记录 last_id、batch_size、duration、error_count 和 lag。
- Contract 阶段前要通过日志和数据库扫描确认旧字段无人读写。
- 高风险 DDL 要在低峰、只读副本或影子表验证执行时间、锁等待和复制延迟。
- Schema 迁移要拆成 expand、backfill、dual read/write、switch、contract 多步，每步可验证可回滚。
- 为核心 SQL 保存 explain plan、行数估算、索引选择、回表次数和慢查询样本。
- 为事务链路设计隔离级别、锁范围、重试策略、超时和死锁处理。
- 上线后跟踪 query latency p95、rows examined、lock wait、deadlock count 和 replication lag。
- Point-in-time recovery：通过全量备份和增量日志恢复到指定时间点。
- Dual write migration：旧表和新表并行写入，读路径灰度切换。
- Checksum reconciliation：按主键范围、时间窗口或业务维度做一致性校验。
- Rollback window：切流后保留旧链路和增量同步，直到指标稳定。
- 备份要覆盖数据文件、binlog、schema、权限、定时任务和外部依赖配置。
- 恢复演练要记录 restore_duration、checksum_mismatch_count、missing_binlog 和人工步骤。
- 迁移限速要避免拖慢主库、拉高复制延迟或撑爆连接池。
- 用户可见迁移要设计只读窗口、处理中状态或补偿公告。
- 核心库要明确 RPO/RTO，记录最近一次备份、恢复耗时、校验结果和责任人。
- 迁移期间要有冻结窗口、灰度比例、回滚条件和业务对账。
- 关键接口要有 schema、version、timeout、retry、幂等键和审计字段。

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

典型设计题是订单库、库存库、任务表、消息 outbox、搜索同步或 AI Agent trace 存储。架构上要明确数据库是事实源，Redis/ES 是读模型或缓存，MQ/CDC 负责事件传播；核心设计要包含索引评审、事务边界、读写分离、分片键、Online DDL、备份恢复演练和慢查询看板。

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

真实线上问题一般从 slow query、rows examined、plan regression、lock wait、deadlock、replication lag、buffer pool hit rate、connection pool saturation、DDL blocking、backup lag 和 schema migration error 看起。回答时要先确认业务影响和止血路径，再沿 SQL、索引、锁、事务、复制、容量和发布变更逐层定位。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- ddl_duration
- metadata_lock_wait
- replica_lag
- backfill_lag
- schema_migration_error_count
- restore_duration
- recovery_point_gap
- checksum_mismatch_count
- migration_lag
- rollback_window_remaining

## 多轮追问模拟

### 延伸追问 1：为什么不能应用和 DDL 一起强切？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲订单表加索引、任务状态字段迁移、Agent run 表拆分、trace 归档。；用 expand/backfill/switch/contract 时间线、回填指标和回滚开关做项目表达。

### 延伸追问 2：回填任务怎么设计？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲订单表加索引、任务状态字段迁移、Agent run 表拆分、trace 归档。；用 expand/backfill/switch/contract 时间线、回填指标和回滚开关做项目表达。

### 延伸追问 3：Online DDL 还会有什么风险？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲订单表加索引、任务状态字段迁移、Agent run 表拆分、trace 归档。；用 expand/backfill/switch/contract 时间线、回填指标和回滚开关做项目表达。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲订单表加索引、任务状态字段迁移、Agent run 表拆分、trace 归档。
- 用 expand/backfill/switch/contract 时间线、回填指标和回滚开关做项目表达。

**取舍总结**
数据库的取舍是强一致、事务和成熟查询能力换来了 schema 演进成本、锁竞争、扩展边界和运维复杂度。面试追问通常会围绕 B+ 树和执行计划、MVCC 和锁、Join 和分页优化、主从延迟、分库分表、Online DDL、备份恢复和缓存/读模型一致性展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- Expand/contract migration：先扩展 schema，再迁移流量，最后收缩旧字段。
- Shadow table migration：新表承接新模型，通过双写和校验逐步切换。
- Online schema change：使用数据库原生 Online DDL 或外部工具降低阻塞。
- Backfill job：按主键范围分批回填，配合校验和限速。
- 新增索引前要评估索引宽度、写入成本、磁盘水位、锁模式和执行时间。
- 应用代码要支持新旧字段共存，读路径切换要有灰度开关和回滚开关。
- 回填任务要避免长事务，记录 last_id、batch_size、duration、error_count 和 lag。
- Contract 阶段前要通过日志和数据库扫描确认旧字段无人读写。
- 高风险 DDL 要在低峰、只读副本或影子表验证执行时间、锁等待和复制延迟。
- Schema 迁移要拆成 expand、backfill、dual read/write、switch、contract 多步，每步可验证可回滚。
- 为核心 SQL 保存 explain plan、行数估算、索引选择、回表次数和慢查询样本。
- 为事务链路设计隔离级别、锁范围、重试策略、超时和死锁处理。
- 上线后跟踪 query latency p95、rows examined、lock wait、deadlock count 和 replication lag。
- Point-in-time recovery：通过全量备份和增量日志恢复到指定时间点。
- Dual write migration：旧表和新表并行写入，读路径灰度切换。
- Checksum reconciliation：按主键范围、时间窗口或业务维度做一致性校验。
- Rollback window：切流后保留旧链路和增量同步，直到指标稳定。
- 备份要覆盖数据文件、binlog、schema、权限、定时任务和外部依赖配置。
- 恢复演练要记录 restore_duration、checksum_mismatch_count、missing_binlog 和人工步骤。
- 迁移限速要避免拖慢主库、拉高复制延迟或撑爆连接池。
- 用户可见迁移要设计只读窗口、处理中状态或补偿公告。
- 核心库要明确 RPO/RTO，记录最近一次备份、恢复耗时、校验结果和责任人。
- 迁移期间要有冻结窗口、灰度比例、回滚条件和业务对账。
- Schema 变更题要讲清 DDL 锁影响、兼容发布、expand/contract、双读双写、灰度切流、校验和回滚。

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

- [MySQL 8.4 Reference Manual: Online DDL Operations](https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl.html)：用于确认官方语义边界、命令行为和工程约束。
- [MySQL 8.4 Reference Manual: EXPLAIN Output Format](https://dev.mysql.com/doc/refman/8.4/en/explain-output.html)：用于确认官方语义边界、命令行为和工程约束。
- [MySQL 8.4 Reference Manual: Backup and Recovery](https://dev.mysql.com/doc/refman/8.4/en/backup-and-recovery.html)：用于确认官方语义边界、命令行为和工程约束。
- [MySQL 8.4 Reference Manual: Replication](https://dev.mysql.com/doc/refman/8.4/en/replication.html)：用于确认官方语义边界、命令行为和工程约束。
