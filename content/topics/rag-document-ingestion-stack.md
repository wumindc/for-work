# RAG 文档解析与入库栈

## 面试定位

RAG 文档解析与入库栈 属于 AI 工程趋势与实战方案 / RAG 数据基础设施。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：RAG 质量上限由文档解析、结构化、metadata、chunk、索引和引用定位共同决定。

**必须讲清楚**
- RAG 质量上限由文档解析、结构化、metadata、chunk、索引和引用定位共同决定。
- PDF 解析影响召回上限
- metadata 是排障基础
- Markdown/JSON/HTML 是给 AI 读的中间层

**常见追问方向**
- 为什么 PDF 解析会影响 RAG 准确率。
- 如何设计可回归、可追溯的文档入库链路。
- 解析器版本、chunk metadata 和 citation span 如何支持排障。
- 如果这个点落到 Paper Agent：论文研读与可追溯综述，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- OpenDataLoader PDF、LiteParse 这类项目说明文档解析已经成为 RAG 基建核心。
- 解析器要保留标题、表格、页码、坐标、图片、章节和内容 hash。


### 通用数据流

可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。


### 工程落点

- 解析时保留 doc_id、page、section_path、bbox、table_id、image_ref、content_hash 和 parser_version。
- 按标题、段落、表格和代码块保留语义边界，避免纯固定长度切块。
- 入库时同时生成 Markdown/JSON/HTML 结构和 BM25/vector 索引。
- 用解析 golden set 回归 reading order、table accuracy、citation span 和 OCR 错误。
- chunk metadata 至少包含 doc_id、page、section、bbox、content_hash、parser_version、permission_scope。
- 解析质量要用 table_accuracy、reading_order、citation_span_hit_rate 评估。
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

图 1：RAG 文档解析与入库栈 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### RAG 文档解析与入库栈 的面试级设计题

典型设计题是企业内部 Agent、Coding Agent、Paper Agent 或 Web Agent：外层 deterministic workflow 管理权限、预算、审批和最终提交，内层 Agent loop 处理开放探索，Eval Gate 根据 golden case、轨迹评分、工具结果和人工反馈决定是否继续。

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

真实线上问题一般从任务成功率、工具调用成功率、invalid args、上下文漂移、幻觉率、引用准确率、token 成本、延迟、guardrail block rate 和 human handoff rate 看起。回答时要把模型问题、检索问题、工具问题、状态问题和权限问题分开归因。

**排查顺序**
- 先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。
- 再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。
- 对比最近发布、配置变更、流量变化、数据倾斜和下游限流。
- 先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。
- 最后把失败样例进入 regression/eval，避免同类问题复发。

**重点指标**
- parse_success_rate
- table_accuracy
- reading_order_score
- citation_span_hit_rate
- retrieval_recall_at_k

**常见误区**
- 把 PDF 当纯文本
- 丢页码和章节
- 不记录 parser 版本导致难以回归

## 业界方案与技术取舍

AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。

**方案对比**
- RAG 的质量上限经常由文档入库决定，而不是最终生成模型决定。
- PDF、表格、图片和多栏排版必须保留结构、页码、章节和定位信息。
- Markdown/JSON/HTML 是面向 AI 的中间结构，metadata 是排障和引用的证据层。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

RAG 质量上限由文档解析、结构化、metadata、chunk、索引和引用定位共同决定。

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

## 趋势落地补充

RAG 文档入库的第一性问题是“答案能不能回到原文证据”。因此解析产物不要只保存纯文本，还要保存 section_path、page、bbox、table_id、parser_version 和 content_hash。表格、代码块、多栏排版和图片说明都要单独建模，否则 citation 看似存在，实际无法支撑 claim。

动手实验可以用同一份复杂 PDF 跑两条链路：普通纯文本抽取和结构化 Markdown/JSON 抽取。再用相同问题比较 retrieval_recall_at_k、citation_span_hit_rate、table_accuracy 和 unsupported_claim_rate。这个实验能很直观地说明 OpenDataLoader PDF、LiteParse 这类项目为什么是 RAG 基建，而不是普通格式转换工具。

## 生产验收清单

- 解析输出要保存 `doc_id`、`page`、`section_path`、`bbox`、`parser_version`、`content_hash`、`permission_scope` 和 `source_uri`。
- 入库链路要支持增量重跑，文档版本变化后能定位哪些 chunk、索引和 citation 需要失效。
- Golden set 至少覆盖多栏 PDF、表格、扫描件、图片说明、脚注、代码块和跨页段落。
- 检索评测要把 parse_error、chunk_error、index_error、rerank_error 和 generation_error 分开归因。
- 权限必须在解析、索引、检索和引用展示四层一致，否则 RAG 可能把不可见文档泄漏给答案。
- 解析器升级不能只看速度，要重跑 citation golden set，确认页码、表格单元格、标题层级和引用 span 没有退化。
- 如果业务依赖合规审计，答案里的每个关键 claim 都应能回到原文页码和片段，而不是只给文档标题。

## 来源与延伸阅读

- [OpenDataLoader PDF](https://github.com/opendataloader-project/opendataloader-pdf)：用于确认官方语义边界、命令行为和工程约束。
- [LlamaIndex LiteParse](https://github.com/run-llama/liteparse)：用于确认官方语义边界、命令行为和工程约束。
