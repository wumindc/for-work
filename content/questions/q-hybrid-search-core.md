# 为什么 RAG 系统常用混合检索？

## 30 秒回答

因为单一检索方式都有盲区。BM25 擅长 lexical 匹配，能命中错误码、函数名和专有名词。vector search 擅长 semantic 匹配，能理解同义表达和长问句。混合检索用 metadata filter 控制权限，再用 RRF 或加权融合提升 recall 和 precision。

## 面试定位

这道题考的是 RAG 检索层设计。面试官想听到你如何权衡关键词检索、向量检索、融合策略、rerank 和评测。

回答要包含架构、数据流、指标、取舍和追问。不要只说“向量更智能”。

## 标准回答

我会先说向量检索不是银弹。它对语义相似很强，但对精确字符串、版本号、错误码、ID 和短 query 可能不稳定。BM25 对这些精确词更可靠。

混合检索的典型链路是：先做 tenant、权限、时间、文档类型等 metadata filter，再并行跑 BM25 和 vector search。候选通过 RRF 或加权分数融合，去重后交给 rerank，最终生成 evidence pack。

评测上要做消融实验。分别比较 BM25-only、vector-only、hybrid 和 hybrid+rerank，看 recall@k、precision@k、citation_precision、latency 和 cost。

## 架构与运行机制

```mermaid
flowchart TD
  A[Query] --> B[Metadata filter]
  B --> C[BM25 retriever]
  B --> D[Vector search]
  C --> E[Candidate fusion]
  D --> E
  E --> F[Rerank]
  F --> G[Evidence pack]
```

数据流的关键是先过滤安全边界，再做双路召回。候选要保留 source、rank、score、retriever_type 和 evidence_id，方便排障。

## 可画图

可以画双路召回图。左边 BM25 处理关键词，右边 vector search 处理语义，中间 fusion 合并，后面接 rerank 和 grounded generation。

## 系统设计案例

企业知识库里，用户问“支付回调 10007 错误怎么处理”。BM25 能命中错误码，向量检索能找到“签名校验失败”的解释。融合后 rerank 会把同时包含错误码和处理步骤的文档排到前面。

如果只用向量检索，可能召回语义相似但没有错误码的通用支付文档。如果只用 BM25，用户换一种说法时又可能漏掉。

## 真实问题与排障

如果答案引用旧文档，检查 metadata filter 是否包含 version 和 updated_at。若召回噪声高，分别看 BM25 和 vector 的候选，判断问题来自分词、embedding、chunk 还是融合权重。

指标包括 recall@k、precision@k、MRR、nDCG、citation_precision、latency_p95 和 cost_per_query。

## 面试官追问

- RRF 为什么适合做融合？
- top_k 应该如何设置？
- hybrid search 什么时候没有收益？
- metadata filter 应在检索前还是后？
- 如何构造离线评测集？

## 项目化回答

我会说项目里没有只依赖 embedding。BM25 兜住精确词，vector search 处理语义泛化，RRF 融合候选，rerank 控制进入上下文的 evidence precision。每一步都有 trace 和消融指标。

## 常见错误

- 认为向量检索可以完全替代关键词检索。
- 权限过滤放到生成后。
- 融合后丢掉来源和 rank。
- 不做消融实验。
- 只看召回率，不看上下文证据质量。

## 深挖技术细节

混合检索的工程细节在候选生成和融合。一次查询通常先经过 query normalization 和 metadata filter，过滤 tenant、权限、文档类型、版本、时间范围。然后并行跑 BM25 与 vector search。每个候选保存 `doc_id`、`chunk_id`、`retriever_type`、`raw_score`、`rank`、`source_uri`、`updated_at`、`permission_scope`、`chunk_hash`。融合层用 RRF 或加权归一化合并，避免不同打分尺度直接相加。

RRF 的好处是利用排名而不是原始分数，对 BM25 和向量分数尺度差异更稳。融合后要去重和做 coverage 控制，避免同一文档的多个相邻 chunk 挤占上下文。随后 rerank 评估 answerability，把真正能回答问题的 span 放进 evidence pack。生成阶段只看到权限允许且被选中的 evidence。

评测要做消融：BM25-only、vector-only、hybrid、hybrid+rerank。指标不只看 `recall@k`，还要看 `precision@context_k`、`nDCG`、`citation_precision`、`no_answer_accuracy`、`p95_search_latency`、`cost_per_query`。排障时分别打印两个召回通道的 top candidates，才能判断是分词、embedding、chunk、filter 还是融合策略的问题。

## 边界条件与反例

反例一：权限过滤放到生成后，虽然答案不展示越权文档，但模型已经看到了敏感内容。反例二：向量召回语义相近但没有错误码，BM25 能命中的关键 ID 被融合权重压低。反例三：融合后不保留 retriever_type 和 rank，导致无法解释为什么选中某段证据。

边界在于：混合检索不是越复杂越好。小语料、结构化查询或精确 ID 查询，BM25 加 metadata filter 可能足够；开放问答、同义表达多、长文档多时 hybrid 收益更明显。每个业务应该用自己的 query log 和标注集做消融，而不是照搬默认 top_k。

## 深问准备

- 问：metadata filter 应放在哪？答：检索前必须做权限和租户过滤，检索后还要复核，避免越权证据进入上下文。
- 问：RRF 为什么稳？答：它融合排名而非原始分数，减少 BM25 和向量分数不可比的问题。
- 问：top_k 怎么定？答：根据 recall 曲线、上下文预算、rerank 延迟和 citation precision 共同选择。
- 问：hybrid 什么时候没收益？答：查询高度结构化、语料很小、关键词覆盖好或向量质量差时。

## 来源与延伸阅读

- [Elasticsearch Reciprocal Rank Fusion](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html)
- [Elasticsearch kNN search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html)
- [LangChain Contextual compression](https://python.langchain.com/docs/how_to/contextual_compression/)
