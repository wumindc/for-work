# 业务团队应该如何在 Prompt、RAG 和微调之间做技术选型？

## 30 秒回答

我会先做失败归因。任务表达不清、格式不稳，先用 Prompt。事实外部化、知识更新、需要引用，优先 RAG。固定风格、固定分类、稳定格式且有高质量样本，才考虑微调。无论选哪种，都要用 eval 验证质量、延迟和成本。

## 面试定位

这题考技术选型。面试官想听到你能根据问题类型选择方案，而不是追新名词。

## 标准回答

Prompt 成本最低，适合快速约束角色、格式、步骤和少量示例。但它对复杂稳定行为的控制有限。

RAG 适合业务知识、政策文档、论文证据、权限数据和时效性内容。它能提供 citation，但依赖检索质量和 grounding。

微调适合模型输出风格、格式、分类边界和领域表达习惯。它不适合作为事实数据库，也不适合频繁变化的数据。

## 架构与运行机制

```mermaid
flowchart TD
  A[Failure case] --> B{Root cause}
  B -->|task unclear| C[Prompt]
  B -->|missing facts| D[RAG]
  B -->|stable behavior| E[Fine-tune]
  C --> F[Eval]
  D --> F
  E --> F
```

数据流是从失败样本出发，先做根因分类，再选择方案并通过 eval 回归。

## 可画图

可以画决策树：格式问题、事实问题、行为问题、安全问题分别走 Prompt、RAG、fine-tune、guardrail。

## 系统设计案例

面试学习站要回答 AI、ES、MQ 知识点，事实和文档内容应走 RAG 或静态内容库。用户学习偏好可以放 Memory。回答格式可以用 prompt 约束。只有当大量答案风格不稳定且有标注样本时，才考虑微调。

## 真实问题与排障

如果 RAG 后仍答错，检查 citation 和 retrieval，不要直接改成微调。如果 prompt 很长仍不稳定，要看是否需要结构化输出 schema 或微调。指标包括 answer_accuracy、citation_precision、format_pass_rate、latency 和 cost。

选型取舍可以按变更频率、证据要求、样本质量和上线成本拆开。知识每天变化、需要权限和引用时，RAG 通常优先；输出格式长期稳定且已有高质量标注样本时，微调才有性价比；只是表达不清、角色不稳或步骤缺失时，Prompt 和 schema 往往更快。落地时还要比较 p95 latency、token cost、维护人力和回滚路径。

## 面试官追问

- 微调和 RAG 可以一起用吗？
- 什么时候 prompt 已经不够？
- RAG 的知识更新如何做？
- 微调数据量不够怎么办？
- 如何比较三种方案成本？

## 项目化回答

我会说选型从失败样本出发。事实问题优先 RAG，行为稳定性问题考虑微调，表达和流程问题先用 prompt。所有方案都必须进入 eval，而不是凭主观感觉。

## 常见错误

- 一上来就微调。
- 用 prompt 保存大量知识。
- RAG 没有 citation 评测。
- 微调数据没有验证集。
- 不比较延迟和成本。

## 深挖技术细节

选型时先建立 failure taxonomy，而不是直接挑方案。`instruction_ambiguous` 用 prompt、few-shot 或任务拆解解决。`missing_external_fact` 用 RAG、数据库或工具解决。`output_contract_unstable` 用 JSON schema、function calling 或 SFT 解决。`domain_style_mismatch` 可以考虑 SFT。`unsafe_or_policy_failure` 需要 guardrail、拒答策略、红队 eval 和可能的对齐优化。

RAG 方案还要继续拆：ingest 是否正确、chunk 是否保留标题和层级、embedding 模型是否版本化、metadata filter 是否前置、rerank 是否提升 answerability、citation verifier 是否能发现 unsupported claim。微调方案要拆数据：样本是否高质量、是否覆盖反例、是否有验证集、是否可回滚、是否会让模型过拟合固定模板。Prompt 方案也不是随便写一段话，而是要有 prompt_version、输入输出契约和回归样本。

## 边界条件与反例

如果业务知识频繁变化，RAG 的维护成本通常低于微调，因为文档更新可以重新索引，而训练要重新准备数据、跑 eval 和灰度发布。如果任务只是固定字段抽取，强 schema 和小模型可能比大模型微调更经济。如果高风险问题需要严格拒答，单靠 prompt 很脆弱，应配合 policy engine 和 output guard。

反例可以用“政策问答答错”说明：如果知识库没有最新政策，微调旧样本只会把错误固化；如果检索召回了正确政策但模型格式乱，才考虑 schema 或 SFT；如果模型引用无关证据，要优化 rerank 和 citation grounding，而不是先训练。

## 深问准备

- 追问成本比较：讲 token cost、向量索引成本、训练成本、标注成本、上线回归和维护人力。
- 追问 RAG 与微调能否组合：可以，RAG 提供事实，微调稳定领域格式和工具使用。
- 追问样本不足怎么办：先 prompt/schema/RAG，收集线上失败样本，人工审核后再训练。
- 追问怎么证明选型正确：做 A/B 或离线 eval，对比 accuracy、citation_precision、latency_p95、cost_per_success。

## 参考资料

- [OpenAI Fine-tuning guide](https://platform.openai.com/docs/guides/fine-tuning)
- [OpenAI Prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering)
