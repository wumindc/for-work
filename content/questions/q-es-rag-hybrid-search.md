# RAG 为什么不应该只用向量检索？ES 在 Hybrid Search 里能发挥什么作用？

## 30 秒回答

向量检索擅长语义相似，但对错误码、函数名、版本号和精确术语不稳定。RAG 应结合 BM25、metadata filter、dense_vector、kNN 和 RRF。ES 可以统一管理 text、keyword、metadata 和向量字段，做 lexical + semantic 召回，再交给 rerank 和 grounding。

## 面试定位

这题考 ES 与 RAG 的结合。面试官想听到传统搜索和向量搜索的职责边界。

## 标准回答

只用向量检索容易漏掉精确词，且相似不等于可回答。企业知识库里，权限、版本、时间和文档类型也很重要。ES 可以先用 metadata filter 限定范围，再并行跑 BM25 与 kNN。

候选用 RRF 融合，保留 retriever_type、rank 和 evidence_id。融合后还要 rerank 判断 answerability，最终答案用 citation verifier 检查。

## 架构与运行机制

```mermaid
flowchart TD
  A[Query] --> B[BM25]
  A --> C[kNN dense_vector]
  D[Metadata filter] --> B
  D --> C
  B --> E[RRF]
  C --> E
  E --> F[Rerank]
  F --> G[Evidence pack]
```

数据流要先做权限和版本过滤，避免无权限证据进入候选。

## 可画图

画双路召回图：BM25 处理 lexical，kNN 处理 semantic，RRF 融合，rerank 精排。

## 系统设计案例

Paper Agent 或企业知识库问答中，用户既可能问自然语言，也可能输入 API 名、论文术语或错误码。ES 的 BM25 兜住精确词，dense_vector 处理语义，metadata filter 控制权限。

## 真实问题与排障

如果精确错误码召回失败，检查 analyzer 和 keyword 字段。若语义噪声高，检查 chunk、embedding 和 kNN top_k。若引用错误，检查 rerank 和 citation grounding。

指标包括 recall@k、precision@k、citation_precision、rerank_lift、query_latency 和 permission_leak_count。

Hybrid Search 的取舍是召回质量、延迟和成本。BM25 对精确词友好且成本低，但语义泛化有限；向量召回能覆盖同义表达，却依赖 embedding 质量和向量索引参数；rerank 提升证据排序，但会增加模型调用或交叉编码器开销。真实系统通常先用轻量融合保证召回，再只对小候选集做重排。

## 面试官追问

- RRF 为什么适合融合？
- ES 和独立向量库怎么选？
- dense_vector 模型升级怎么办？
- metadata filter 应该在哪一层？
- 如何做 hybrid search 消融？

## 项目化回答

我会说 RAG 召回要 lexical 和 semantic 结合。ES 负责 BM25、metadata filter 和 kNN，RRF 负责融合，rerank 负责证据质量，grounding 负责答案可信。

## 常见错误

- 只用向量检索。
- 权限过滤太晚。
- dense_vector 不记录模型版本。
- 融合后不保留来源。
- 没有 rerank 和 citation eval。

## 深挖技术细节

Hybrid Search 要把召回链路拆成 query understanding、metadata filter、BM25 retriever、vector retriever、fusion、rerank、evidence pack。BM25 对精确词、代码符号、错误码、专有名词更稳；kNN 对同义表达和语义邻近更强；metadata filter 必须在召回前约束 tenant、部门、文档版本和时间范围。融合后还要保留每条候选来自哪一路，否则无法做消融和排障。

RRF 的优势是用 rank 而不是原始分数融合，降低 BM25 分数和向量相似度不可比的问题。Rerank 可以用 cross-encoder、LLM judge 或规则特征，但只应该作用在小候选集上，否则 latency 和 cost 会失控。最终 answer 必须通过 citation verifier 检查 claim 是否被 evidence 支撑。

## 边界条件与反例

只用向量的反例是“ERR_CONN_RESET”“NullPointerException”“search_after”这类精确术语，embedding 可能把语义相近但实体不同的片段排在前面。只用 BM25 的反例是用户用自然语言描述问题，不出现文档原词。权限过滤放到生成后也是反例，因为无权限证据已经进入模型上下文。

## 深问准备

- 追问 RRF：讲排名融合、分数不可比和多路召回稳定性。
- 追问向量模型升级：双写新字段、记录 embedding_model_version、离线回放后切流。
- 追问评测：比较 BM25 only、vector only、hybrid、hybrid+rerank 的 recall、citation_precision、latency。
- 追问 ES vs 向量库：ES 胜在过滤、聚合、BM25 和向量一体化，专用向量库胜在超大规模向量能力。

## 参考资料

- [Elasticsearch kNN search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html)
- [Elasticsearch RRF](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html)
