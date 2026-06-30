# 引用与 Grounding

## 一句话定义

引用与 Grounding 是让回答中的每个关键 claim 都能回到 citation、evidence span 或工具结果，并用 verifier 识别 unsupported claim，从而降低 RAG 或 Agent 的幻觉。

## 面试定位

这道题考的是“如何让答案有证据”。面试官不满足于你说“加引用”，而会继续问引用是否真的支持结论、如何评测 citation precision、冲突证据怎么办。

回答要覆盖架构、数据流、指标、取舍和追问。核心是 claim-to-evidence，而不是在答案末尾堆链接。

## 为什么需要它

RAG 系统即使检索到了文档，也可能把证据误读、过度概括或引用不支持结论的段落。Agent 还可能混合工具结果、记忆和网页内容，使来源边界更复杂。

Grounding 的目标是让模型回答受证据约束。每个关键 claim 都应能追溯到 evidence span。无法支持的内容要删除、降级为不确定，或者触发补检索。

## 核心架构

```mermaid
flowchart TD
  A[Retrieved evidence] --> B[Evidence pack with IDs]
  B --> C[Grounded generator]
  C --> D[Draft answer with citations]
  D --> E[Claim extractor]
  E --> F[Claim-evidence verifier]
  F -->|supported| G[Final answer]
  F -->|unsupported claim| H[Revise or retrieve more]
  H --> B
```

图 1：引用与 Grounding 的 claim-to-evidence 闭环。

图中 Retrieved evidence 不是普通上下文，而是带 ID、权限和版本的证据包。生成器只能引用 Evidence pack 中真实存在的证据，Claim extractor 再把答案拆成事实断言，Verifier 判断每个断言是否被 evidence span 直接支持。这个闭环的关键状态变化是：unsupported claim 不能直接进入最终答案，要么删除，要么降级为不确定，要么触发补检索。

| 对象 | 定义 | 检查点 | 风险 |
| :--- | :--- | :--- | :--- |
| citation | 答案引用的来源标识 | 是否存在且可打开 | 链接堆砌 |
| evidence span | 支持 claim 的原文片段 | 是否直接支持 | 引错段落 |
| claim | 答案中的事实断言 | 是否被证据覆盖 | 幻觉 |
| grounding | claim 与证据的对应关系 | 支持、冲突或不足 | 过度概括 |
| verifier | 检查引用是否成立 | precision 和 recall | judge bias |

## 架构与运行机制

Evidence pack 要在生成前就结构化。每个 chunk 包含 evidence_id、source、section、timestamp、permission、text 和可信级别。模型生成时按 evidence_id 引用，不允许凭空引用。

生成后最好再做 claim extraction。系统抽取答案中的事实 claim，并逐条判断证据是否支持。对 unsupported claim，可以要求模型修订、触发补检索，或在答案中标注不确定。

## 运行机制

1. 检索阶段输出带 ID 的 evidence pack。
2. 生成阶段要求关键 claim 附 citation。
3. Claim extractor 抽取事实断言、数值、比较和建议。
4. Verifier 判断每个 claim 是否被 evidence span 支持。
5. unsupported claim 被删除、改写或触发补检索。
6. 评测阶段统计 citation precision、claim support rate 和 hallucination rate。

## 关键设计取舍

| 取舍 | 好处 | 代价 | 建议 |
| --- | --- | --- | --- |
| 生成时强制引用 | 输出可追溯 | 可能变啰嗦 | 技术文档必备 |
| 生成后验证 | 更可靠 | 延迟增加 | 高风险答案使用 |
| span 级证据 | 精准 | 标注成本高 | 关键 claim 使用 |
| 文档级引用 | 简单 | 支持关系弱 | 只做辅助 |

## 生产落地细节

- evidence_id 要稳定，并能回到原文、页码、URL、工具调用或数据库记录。
- 引用不能跨权限泄漏，citation 也要遵守 tenant 和 ACL。
- verifier 要覆盖“证据存在但不支持”的 hard negative。
- 冲突证据要显式展示差异，而不是只选一个来源。
- 指标包括 citation_precision、citation_recall、claim_support_rate、unsupported_claim_rate 和 hallucination_rate。

发布级系统还要把“答案质量”和“引用质量”分开验收。一个答案可以语气流畅但引用错误，也可以引用正确但没有覆盖关键结论。建议把验收拆成三张表：claim 表记录答案断言，evidence 表记录来源片段，verdict 表记录支持关系。这样排查时能看到是检索没找对、chunk 太粗、生成器过度推断，还是 verifier 漏判。

权限边界同样不能省。企业知识库里，citation 本身也可能泄露信息：文档标题、路径、页码、项目名都可能暴露租户或内部系统。Grounding 层要在 evidence pack 阶段绑定 `permission_scope`，输出阶段只允许展示当前用户可见的 citation。无法展示原文时，可以返回“依据当前可访问材料无法公开引用”，而不是伪造一个安全链接。

## 系统设计案例

Paper Agent 生成论文综述时，不能只在段落后贴论文链接。它应把每个结论拆成 claim，例如“方法 A 在数据集 B 上优于方法 C”，再指向具体表格、页码或实验段落。

数据流是：paper parser 抽取段落和表格，retriever 生成 evidence pack，模型生成带 citation 的草稿，claim verifier 检查结论是否被 evidence span 支持。失败的 claim 被打回重写或触发补检索。

## 真实问题与排障

如果引用看起来很多但不支持答案，先抽样检查 claim-to-evidence。常见原因是 chunk 太粗、检索只命中相关主题而非答案、模型把相邻段落推断过头。

修复方式包括改 chunk、提高 rerank 的 answerability 权重、增加 verifier、或要求模型在证据不足时拒答。

如果系统经常“引用正确文档但答错细节”，优先看 evidence span 是否太宽。文档级 citation 只能证明主题相关，不能证明结论成立；表格、数值、时间和比较类 claim 应该落到段落、行、页码或工具结果字段。对冲突证据，答案要保留冲突事实，例如“文档 A 的旧版本写 X，新版本写 Y”，并说明采用哪个版本，而不是让模型自动择一。

## 常见误区与排障

- 以为有链接就等于 grounded。
- citation 指到整篇文档，无法定位 evidence span。
- 不处理冲突证据。
- 评测只看答案好不好，不看引用是否支持。
- 模型生成后引用了未提供的来源。

## 面试追问

- citation precision 怎么算？
- claim extraction 会不会漏掉隐含结论？
- 证据冲突时如何回答？
- 工具结果和文档证据如何统一引用？
- 如何避免引用泄露无权限文档？

## 项目化表达

项目里可以说：“我把引用做成 claim-to-evidence 验证链路。生成前 evidence pack 带 ID，生成后抽 claim，verifier 检查 evidence span 是否支持，unsupported claim 会被删除或触发补检索。”

## 深入技术细节

Grounding 的核心不是“回答末尾有链接”，而是每个关键 claim 都能映射到具体 evidence span。Evidence pack 应包含 `evidence_id`、`source_uri`、`doc_version`、`section_path`、`page_or_offset`、`permission_scope`、`retrieved_at`、`text_span`、`score` 和 `source_type`。生成器只能引用 pack 中存在的 id，不能凭空造 citation。

生成后要做 claim extraction。claim 类型包括事实、数值、比较、因果、建议和限制条件；Verifier 对每个 claim 判定 supported、partially_supported、contradicted、not_enough_evidence。unsupported claim 不应被润色，而要删除、降级或触发补检索。冲突证据要显式展示差异，而不是让模型只挑一个更顺眼的来源。

## 关键数据结构与协议

| 字段 | 含义 | 作用 |
| --- | --- | --- |
| `claim_id` | 答案中的断言编号 | 绑定 verifier verdict |
| `evidence_id` | 证据片段编号 | 支持可追溯引用 |
| `support_label` | supported/partial/contradicted | 控制发布决策 |
| `permission_scope` | 租户和 ACL | 防止引用泄露 |
| `retrieved_at` | 检索时间 | 判断信息是否过期 |
| `source_type` | 文档、工具、数据库、网页 | 区分可信级别 |

协议上要保留 hard negatives：相关但不支持结论的证据。没有 hard negatives，verifier 容易把“主题相关”误判成“结论被支持”。这也是很多 RAG 系统 citation precision 虚高的原因。

## 深问准备

被问“citation precision 怎么算”时，可以说：抽取答案 claims，逐条检查引用的 evidence span 是否直接支持；precision 是被正确支持的引用占所有引用的比例。更进一步还要看 claim support rate，因为一个答案可能漏引关键 claim。

被问“工具结果和文档证据如何统一”时，可以把 tool observation 也包装成 evidence：带 `tool_call_id`、参数摘要、时间、结果状态和权限。这样数据库查询、浏览器截图、测试输出和文档 chunk 都能进入同一套 grounding trace。

## 公开阅读校验

Grounding 文章要把“有引用”与“引用支持结论”分开讲。公开读者很容易被答案末尾的一排链接误导，但真正的质量控制发生在 claim-to-evidence 层：每个事实、数值、比较、因果和建议都要能指向具体 span，并标出 supported、partially_supported、contradicted 或 not_enough_evidence。

生产验收可以按抽样和全量两种模式做。抽样模式适合日常监控，从每批回答中抽 claim，人工或 judge 检查 citation 是否直接支持。全量模式适合高风险输出，对所有关键 claim 运行 verifier，并把 hard negative 加入评测集。hard negative 很重要：它们是“相关但不支持”的证据，能防止 verifier 把主题相似误判成结论成立。

权限和时效也要进入 grounding。引用本身可能暴露文档标题、租户、项目路径或内部页码；证据也可能过期。Evidence pack 需要携带 `permission_scope`、`doc_version`、`retrieved_at` 和 `allowed_usage`，最终答案只展示当前用户可见、当前版本仍有效的 citation。证据不足时，可靠系统应输出“不足以支持该结论”，而不是补一个看似合理的链接。

## 来源与延伸阅读

- [OpenAI Cookbook](https://cookbook.openai.com/)：用于支持 RAG、向量检索和工具化应用的工程示例，说明引用不是装饰，而是生成链路的一部分。
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于说明 Agent 工作流要把增强 LLM 和工作流边界分清，支撑“工具结果也要进入 evidence trace”的观点。
- [OpenAI Agents SDK Guardrails](https://openai.github.io/openai-agents-python/guardrails/)：官方文档用于支持输入、输出和工具 guardrail 的边界，说明 grounded answer 可以在输出阶段继续验证。
- [Elasticsearch RAG 示例](https://cookbook.openai.com/examples/vector_databases/elasticsearch/elasticsearch-retrieval-augmented-generation)：用于说明检索、chunk、向量搜索和答案生成之间的关系，支撑 citation precision 需要看 evidence span。
