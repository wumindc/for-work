# ES 查询突然变慢，你会如何定位和优化？

## 30 秒回答

我会先确认是 query phase、fetch phase、aggregation 还是集群资源问题。看 slow log、profile API、shard/segment、heap、GC、thread pool rejected、circuit breaker 和最近 mapping/数据变化。优化从 query DSL、filter context、分页、聚合、字段和索引设计入手。

## 面试定位

这题考线上排障。面试官想看你是否能分层定位，而不是只说加机器或加索引。

## 标准回答

第一步看影响面。是所有查询慢，还是某个 query hash 慢。第二步拆阶段。query phase 慢可能是 DSL 或 shard 问题，fetch 慢可能是字段过大，aggregation 慢可能是高基数字段。

第三步看资源。heap、GC、磁盘、CPU、search thread pool 和 circuit breaker 都会影响查询。第四步才是优化：filter context、减少 script、限制 size、深分页改 search_after + PIT，大聚合改 composite aggregation 或异步预聚合。

## 架构与运行机制

```mermaid
flowchart TD
  A[Slow query] --> B[Slow log]
  B --> C[Profile API]
  C --> D{Bottleneck}
  D -->|query| E[Rewrite DSL]
  D -->|pagination| F[search_after + PIT]
  D -->|aggregation| G[Composite or pre-agg]
  D -->|resource| H[Shard and heap tuning]
```

图 1：ES 慢查询排障路径。Slow log 先定位慢查询样本，Profile API 再拆 query tree 和 fetch/aggregation 阶段，最后按瓶颈选择改 DSL、改分页、改聚合或处理资源问题。数据流从用户 Search API 参数到 DSL，再到 shard 执行和结果合并；每一层都可能慢，所以不能一上来只说“加节点”。

## 可画图

可以画查询生命周期：参数校验、query phase、aggregation、fetch phase、merge response、metrics。

## 系统设计案例

后台订单搜索支持用户自定义排序和聚合。某天 p95 飙升，slow log 显示高基数 terms aggregation。修复是限制聚合字段白名单，改用 composite aggregation 分页拉取，并对高频统计做预聚合。

## 真实问题与排障

如果深分页导致慢，from/size 会让 shard 维护大量候选。改用 PIT + search_after。若脚本排序慢，改成预计算字段。若 heap 抖动，看 fielddata、聚合和 segment。

指标包括 search_latency_p95、query_time、fetch_time、aggregation_time、heap_usage、rejected_requests 和 circuit_breaker_tripped。

一条完整事故回答可以按影响面、止血、根因和回归展开：先确认是全部搜索慢、单个索引慢还是某个 query hash 慢；止血时可以降低最大 `size`、禁用高风险聚合字段、对超慢 query 返回降级结果；根因如果是高基数字段聚合，就要回到 mapping、fielddata、bucket 数和 heap；回归时固定 slow query 样本，用 Profile API、p95 和 breaker 指标对比优化前后。

优化取舍要看读写比例和业务 SLA。给所有字段加索引会提升查询自由度，但会增加写入和存储成本；预聚合能降低查询延迟，但会牺牲实时性和灵活性；限制用户 DSL 能保护集群，却会降低高级搜索能力。面试里要把“快”和“可维护”一起讲。

## 面试官追问

- filter context 为什么更适合过滤？
- search_after 和 from/size 区别是什么？
- PIT 解决什么问题？
- 聚合为什么容易吃内存？
- profile API 线上怎么用？

## 多轮追问模拟

### 追问 1：filter context 为什么更适合过滤？

回答要点：filter context 不参与相关性评分，更适合布尔过滤、权限过滤和时间范围过滤，也更容易被缓存。考察点是 query/filter 的执行语义。容易踩坑的是把所有条件都塞进 must，既影响评分又增加不必要的计算。

### 追问 2：search_after 和 from/size 区别是什么？

回答要点：from/size 深分页会让每个 shard 保留大量候选并在协调节点合并；search_after 用上一页排序值继续查询，通常配 PIT 获得一致视图。考察点是分布式搜索分页代价。容易踩坑的是只说“search_after 更快”，不说明它要求稳定排序且不适合任意跳页。

### 追问 3：Profile API 线上怎么用？

回答要点：用抽样和问题样本定位 query tree 耗时，不应对所有线上流量常开；Profile 结果要和 slow log、节点资源、mapping 变化一起看。考察点是排障方法。容易踩坑的是只看单次 profile，不看业务流量和资源水位。

## 项目化回答

我会说排查 ES 慢查询要先定位阶段，再改 DSL 或索引。项目里 Search API 会限制字段、分页和聚合，慢查询进入样本库，后续变更要回归。

更项目化一点可以这样讲：“我们把每类查询模板都打 `query_hash`，日志里记录 index alias、time range、from/size、sort 字段、aggregation 名称、took、timeout、hit count 和 response size。慢查询不是靠人肉回忆，而是进入回放集。每次改 mapping、DSL 模板或分页策略，都用这批样本比较 p95、aggregation_time、heap 和 circuit breaker。”

## 常见错误

- 直接加节点。
- 任意 from/size 深分页。
- 用户参数直接拼 DSL。
- 对高基数字段做大 terms 聚合。
- 只看平均延迟。

## 深挖技术细节

慢查询要先用 slow log 和 profile API 拆阶段。query phase 慢通常是 DSL 本身、低选择性过滤、script、wildcard 或 shard fan-out。fetch phase 慢通常是返回字段太大、highlight 或 `_source` 读取重。aggregation 慢要看高基数字段、bucket 数量、fielddata、heap 和 circuit breaker。资源层要看 GC、磁盘 IO、search thread pool rejected、segment count。

优化时先降低工作量，再考虑扩容。过滤条件放 filter context，限制时间范围和 size，字段白名单防止任意 DSL，深分页用 PIT + search_after，大基数聚合用 composite aggregation 分页，频繁统计做预聚合或缓存。每个优化都要有指标对比，例如 p95、p99、heap_used_percent、request_cache_hit_rate 和 aggregation_time。

## 边界条件与反例

不是所有慢查询都该加索引。给所有字段建索引会拖慢写入并增加存储。不是所有聚合都该实时算，高频大范围报表可能应该走离线预聚合。不是所有深分页都该支持，用户翻到第几万页往往是产品需求要改，而不是技术要硬扛。

另一个反例是“线上开 Profile API 就能解决问题”。Profile 能帮助拆 query tree，但它本身会改变请求成本，也不能替代 slow log、资源指标和业务影响面分析。更稳的做法是抽样问题请求，在隔离环境或低流量窗口复现，再把优化前后的 DSL、profile 结果和指标对比固化到回归里。

## 公开阅读校验

这道题如果只背优化点，会像清单题；公开阅读时要能看出排障顺序。读者应该先学会问：慢的是哪类 query，在哪个 index alias，是否集中在某个租户或时间窗口，query phase、fetch phase、aggregation 哪个阶段占比高，集群资源是否先于 DSL 退化。只有顺序清楚，后面的 filter context、PIT、composite aggregation 和预聚合才不是零散技巧。

## 深问准备

- 追问 filter context：不评分，适合缓存和过滤，能先缩小候选。
- 追问 search_after：要求稳定排序，常配 PIT 保持一致视图。
- 追问 circuit breaker：防止单次查询占用过多内存拖垮节点。
- 追问 profile API：用于定位 query tree 耗时，线上采样使用，不能全量常开。

## 来源与延伸阅读

- [Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)：用于确认 query/filter、分页、聚合等 DSL 的语义边界。
- [Elasticsearch Search profile API](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-profile.html)：用于说明如何拆解查询执行树和阶段耗时。
- [Elasticsearch Paginate search results](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)：用于支持 from/size、search_after 与 PIT 的分页成本取舍。
- [Elasticsearch Composite aggregation](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-aggregations-bucket-composite-aggregation.html)：用于说明大规模 bucket 遍历为什么要分页而不是一次性拉全量。
- [Elasticsearch Circuit breaker settings](https://www.elastic.co/guide/en/elasticsearch/reference/current/circuit-breaker.html)：用于补充高成本查询与聚合的资源保护边界。
