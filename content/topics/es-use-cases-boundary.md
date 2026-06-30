# ES 使用场景与边界

## 一句话定义

Elasticsearch 是面向 search、日志分析和 aggregation 的 near real-time 分布式检索引擎。它基于 inverted index、mapping、shard 和 segment 提供高性能检索，但不适合替代关系数据库做强事务主存储。

## 面试定位

面试官问 ES 边界，不是想听“ES 搜索很快”。真正考察的是你是否理解倒排索引、近实时、分片、副本、映射和查询模型，以及什么时候不该用 ES。

回答要覆盖架构、数据流、指标、取舍和追问。尤其要把 ES 与 MySQL、缓存、RAG 检索的边界讲清楚。

## 为什么需要它

业务系统常有全文搜索、日志检索、商品筛选、监控分析和知识库召回需求。关系数据库可以做简单查询，但面对复杂文本检索、多字段过滤、排序和聚合时，ES 更合适。

同时，ES 的 near real-time 语义、分布式写入成本和 mapping 约束，决定它不适合作为强一致交易库。

## 核心架构

```mermaid
flowchart TD
  A[Documents] --> B[Index API]
  B --> C[Primary shard]
  C --> D[Inverted index and doc values]
  C --> E[Replica shard]
  F[Search request] --> G[Coordinating node]
  G --> H[Query shards]
  H --> I[Merge hits and aggregations]
  I --> J[Response]
```

图 1：ES 的典型边界是把业务文档同步成搜索视图，由 primary/replica shard 建索引，再通过 coordinating node 聚合查询结果。

这张图要读成“写入视图”和“查询视图”两条链路。左侧 Documents 进入 Index API 后落到 primary shard，再构建倒排索引和 doc values，并复制到 replica；右侧 Search request 由 coordinating node 分发到相关 shard，最后合并 hits 和 aggregations。它适合构建可检索、可聚合的派生视图，但不替代数据库负责交易状态、强事务和最终事实源。

| 场景 | ES 适合度 | 原因 | 边界 |
| :--- | :--- | :--- | :--- |
| 全文搜索 | 高 | inverted index 和 relevance | 需要正确 analyzer |
| 日志检索 | 高 | 时间序列和 aggregation | 成本治理重要 |
| 商品筛选 | 中高 | filter、sort、聚合 | 主数据仍在数据库 |
| 强事务订单 | 低 | near real-time | 不能替代 OLTP |
| RAG 召回 | 中高 | BM25、metadata、dense_vector | 需要 rerank |

## 架构与运行机制

ES 将文档写入 index，再按 mapping 构建倒排索引和列式 doc values。搜索时，coordinating node 将 query DSL 分发到相关 shard，各 shard 返回局部结果，最后汇总排序和聚合。

near real-time 意味着写入成功不等于立刻可搜索。refresh 之后新 segment 才进入搜索视图。这个边界在同步链路和面试回答中要讲清楚。

因此判断“该不该用 ES”时，要先问读模型是什么。全文检索、日志检索、商品筛选、RAG lexical recall 和多维聚合需要倒排索引、相关性、过滤、排序或 bucket 统计，ES 很合适；主键精确查询、强一致余额、订单状态机、复杂事务更新和小数据量简单查询，数据库通常更稳。ES 的定位是 search/read model，不是系统唯一事实源。

## 运行机制

1. 业务数据从主库、日志系统或事件流进入 ES。
2. Indexing 根据 mapping、analyzer 和字段类型构建索引。
3. refresh 让新 segment 可搜索。
4. 查询请求进入 coordinating node。
5. Query phase 在 shard 内执行检索和过滤。
6. Fetch phase 取回文档字段并合并结果。

## 关键设计取舍

| 取舍 | 收益 | 代价 | 建议 |
| --- | --- | --- | --- |
| 多 shard | 横向扩展 | 查询 fan-out 增加 | 按数据量规划 |
| 多 replica | 查询吞吐和容灾 | 写入成本上升 | 读多场景增加 |
| keyword/text | 精确或全文 | mapping 不当难改 | 提前建模 |
| refresh 短 | 可见性快 | 写入压力上升 | 按业务 SLA |

## 生产落地细节

- 主数据仍应在数据库，ES 做搜索视图或分析视图。
- mapping 设计要区分 text、keyword、date、numeric 和 dense_vector。
- 高频过滤字段要考虑 doc values 和 query cache。
- 使用 alias、rollover、ILM 管理索引生命周期。
- 指标包括 indexing_latency、refresh_time、search_latency、heap_usage、segment_count、rejected_requests 和 disk_watermark。

同步链路要显式处理延迟、乱序和重放。事件里应带 `entity_id`、`entity_version`、`op_type`、`occurred_at` 和 `payload_hash`，写入 ES 时用版本或更新时间避免旧事件覆盖新状态。索引重建时用新 index 接收全量数据，校验文档数、抽样 hash 和查询结果后再切 alias。这样 ES 出问题时可以重建搜索视图，而不是把业务事实丢给 ES 自己恢复。

选型评审时可以用四个问题快速定边界：是否需要分词、相关性或多字段聚合；是否允许近实时可见而不是强实时读；是否能从事实源重建索引；是否有团队维护 mapping、容量、生命周期和慢查询治理。四个问题如果多数是否定，ES 很可能只是增加了一个难维护的副本系统。

## 系统设计案例

商品搜索系统可以用数据库保存交易一致性数据，用 ES 保存搜索视图。商品变更通过 MQ 或 CDC 同步到 ES。用户搜索时，ES 做关键词召回、过滤、排序和聚合，详情页再回源主库或缓存。

数据流是：DB update -> event -> index document -> refresh -> search。若同步延迟，页面要接受短暂近实时差异，不能把 ES 当强一致主库。

## 真实问题与排障

如果搜索结果缺最新数据，先看写入是否成功、refresh 是否发生、alias 是否指向正确索引。若查询慢，查看 query DSL、shard 数、segment、heap、slow log 和 profile API。

排障时要分清写入延迟、refresh 延迟、mapping 问题和查询设计问题。

一个典型事故是“运营后台改了商品名，但前台搜不到”。排查不要直接重启集群，而是按链路看：数据库变更事件是否发出，消费端是否积压，bulk item 是否有 mapping conflict，写入 alias 是否正确，refresh 是否完成，查询 alias 是否仍指向旧 index，用户查询是否命中了旧缓存。止血可以让详情页读主库、重放失败事件或临时切回旧索引；根因修复可能是 mapping 变更、alias 切换流程、事件版本控制或 bulk item 失败处理。

## 常见误区与排障

- 把 ES 当强事务数据库。
- mapping 随便建，后期大量重建索引。
- shard 越多越好。
- 忽略 refresh 的 near real-time 边界。
- 用深分页拖垮集群。

## 面试追问

- inverted index 和 doc values 分别解决什么？
- near real-time 是什么意思？
- ES 和 MySQL 的边界是什么？
- shard 数如何规划？
- 什么场景不应该用 ES？

## 项目化表达

项目里可以说：“我把 ES 定位为搜索视图，不是交易主库。主数据由数据库保证一致性，ES 负责全文检索和聚合，写入链路用事件同步，并用 alias、mapping 和 slow log 做治理。”

## 公开阅读校验

公开文章最容易写虚的地方是“ES 很适合搜索”。更有说服力的写法是把读模型、事实源和恢复方式都讲出来：ES 保存的是可重建搜索视图，数据库保存的是交易事实；ES 的强项是倒排索引、doc values、聚合和分片查询，弱项是强事务、复杂更新和严格实时一致；一旦 mapping 错或同步乱序，正确处理方式通常是重建索引、回放事件和切 alias，而不是把 ES 当成唯一数据源修补。

## 深入技术细节

ES 的核心价值来自倒排索引、列式 doc values、分片并行和近实时 refresh。写入文档时，text 字段经 analyzer 变成 term，term 写入 inverted index；keyword、numeric、date 字段通常用于 filter、sort、aggregation。查询时 query phase 在各 shard 内找候选并评分，fetch phase 再取回文档字段。这个链路决定了 ES 适合全文检索、日志检索、筛选聚合和 RAG lexical recall，但不适合作为强事务主库。

边界要讲清：near real-time 不是强实时，refresh 之前写入成功的文档可能不可搜；分布式查询有 fan-out 成本，shard 过多会拖慢协调和内存；mapping 一旦不合理，后期修复往往要 reindex。把这些限制讲出来，比只说“ES 快”更像真实工程经验。

## 关键数据结构与协议

索引设计要关注 `index_template`、`mapping`、`settings`、`alias` 和 `refresh_interval`。字段层要区分 `text`、`keyword`、`date`、`long`、`nested`、`dense_vector`。搜索请求对象通常包含 query DSL、filter context、sort、from/size 或 search_after、aggs、source filtering、timeout 和 track_total_hits。

同步协议建议包含 `event_id`、`entity_id`、`op_type`、`version`、`occurred_at`、`payload_hash`、`retry_count` 和 `dead_letter_reason`。这样 ES 作为查询视图时，能处理重复消息、乱序更新和重建索引。监控要看 search_latency_p95、indexing_rate、refresh_time、merge_time、heap_usage、rejected_requests、segment_count。

## 深问准备

- 追问“为什么不用 MySQL like”：解释分词、倒排索引、相关性评分和多字段聚合。
- 追问“为什么不用 ES 做主库”：讲事务、强一致、更新冲突、refresh 可见性和数据恢复边界。
- 追问“mapping 错了怎么办”：回答新建索引、reindex、alias 切换和双写校验。
- 追问“什么时候不用 ES”：低数据量、强事务、简单主键查询、严格实时一致场景优先主库。

## 来源与延伸阅读

- [Elasticsearch Near real-time search](https://www.elastic.co/guide/en/elasticsearch/reference/current/near-real-time.html)：用于确认 refresh 之后新 segment 才对搜索可见，写入成功不等于强实时可搜。
- [Elasticsearch Mapping](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping.html)：用于支持 text、keyword、date、numeric、dense_vector 等字段建模边界。
- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)：用于说明 ES 适合复杂查询、过滤、排序和全文检索，但需要受控 DSL。
- [Elasticsearch Scalability and resilience](https://www.elastic.co/guide/en/elasticsearch/reference/current/scalability.html)：用于支持 shard、replica 和分布式查询的扩展性与成本边界。
- [Elasticsearch Index aliases](https://www.elastic.co/guide/en/elasticsearch/reference/current/aliases.html)：用于支持 reindex、蓝绿切换和搜索视图治理。
