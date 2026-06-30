# Agent 系统如何做 Eval 和可观测性，才能不是只看 demo？

## 30 秒回答

要把 Eval 和可观测性做成闭环。离线 eval 用 golden cases 测 task_success、citation_precision、tool_selection、safety 和 cost。线上 trace 记录每一步输入、状态、工具、输出、verdict 和用户反馈。失败样本进入回归集，下一次发布必须通过。

## 面试定位

这题考生产化能力。面试官想听到你如何证明 Agent 可用，而不是只展示成功 demo。

## 标准回答

Eval 要分层。组件评测看检索、rerank、工具 schema、verifier。轨迹评测看 Agent 每一步是否选对工具、更新状态、遵守安全策略。端到端评测看任务是否完成。

可观测性要记录 trace。每次 run 有 run_id，每步有 step_id，包含 prompt、context refs、tool call、observation、latency、cost、verdict 和 error。敏感字段要脱敏。

## 架构与运行机制

```mermaid
flowchart TD
  A[Agent run] --> B[Trace store]
  B --> C[Component eval]
  B --> D[Trajectory eval]
  B --> E[End-to-end eval]
  C --> F[Regression gate]
  D --> F
  E --> F
```

图 1：Agent Eval 和可观测性要从 run trace 进入组件评测、轨迹评测和端到端评测，再汇入发布回归门禁。

这张图的边界是：Trace store 是事实来源，eval 不是事后写一张分数表。Component eval 解释检索、rerank、tool schema 或 guardrail 哪一层坏了；trajectory eval 解释每一步工具选择、状态更新和安全策略是否合理；end-to-end eval 只回答任务最终是否完成。三层结果汇入 Regression gate，才能把线上失败样本变成下一次发布会被拦住的回归样本。

数据流是线上失败样本进入样本库，人工或 verifier 标注期望行为，成为下一轮回归。

## 可画图

可以画 Eval 金字塔：component eval、trajectory eval、end-to-end eval、online monitoring。每层写指标。

## 系统设计案例

Web Agent 的 eval 不只看最终是否成功，还看每一步 observation、selector、action、expected_state 和 recovery。失败页面进入 fixture，后续版本必须重放通过。

## 真实问题与排障

如果线上成功率下降，按 trace 分桶：检索失败、工具失败、状态污染、安全拦截、模型输出错误。指标包括 task_success_rate、step_success_rate、tool_error_rate、citation_precision、latency_p95 和 cost_per_success。

工程取舍在于评测深度和发布速度。只做端到端成功率成本低，但定位慢；组件 eval 和轨迹 eval 更费样本设计，却能说明是检索、工具、模型还是策略失败。生产环境通常把高风险路径放进强门禁，低风险体验优化走抽样监控，避免每次小改动都拖慢发布。

## 多轮追问模拟

追问 1：golden set 只用人工手写样本够不够？
答：不够。人工样本适合覆盖协议边界和安全边界，但真实问题通常来自线上失败、长尾页面、工具异常和用户输入分布变化。更稳的做法是把历史失败、线上抽样、红队样本和人工设计边界样本合并，并给每个样本记录来源、版本、期望行为和风险等级。考察点是样本治理；陷阱是把 eval 当一次性测试集。

追问 2：为什么需要 trajectory eval，端到端成功率不够吗？
答：端到端成功率只能告诉你最后成没成，不能解释中间是否走了危险路径。比如最终答案正确，但中间访问了越权工具、重复提交表单或忽略了 verifier，这些都需要轨迹评测发现。考察点是 Agent 控制流；陷阱是只看最终结果，漏掉安全和可恢复性。

追问 3：trace 全量保存会有什么风险？
答：trace 可能包含用户输入、文件内容、工具参数、业务 ID、PII 和密钥片段，所以需要 redaction、引用式存储、访问控制和审计。高敏数据保存 hash、artifact ref 或脱敏摘要，调试时再按权限取原文。考察点是生产可观测性边界；陷阱是为了调试方便直接落明文。

## 面试官追问

- golden set 怎么构建？
- 轨迹评测如何打分？
- trace 里哪些字段要脱敏？
- 线上用户反馈如何进入 eval？
- 如何做发布门禁？

## 项目化回答

我会说 Agent 项目必须有 eval gate。每个 run 可回放，每个失败可分桶，每次修复都进入 regression。这样才能证明不是只靠演示样例。

## 常见错误

- 只看 demo 成功。
- 没有 trace replay。
- 不区分组件失败和整体失败。
- eval 样本没有版本。
- 指标只看准确率，不看成本和安全。

## 深挖技术细节

Agent Eval 要把 run 拆成可回放的事件流。一个 trace 至少包含 `run_id`、`step_id`、`parent_step_id`、`model`、`input_refs`、`context_manifest_hash`、`tool_name`、`tool_args_hash`、`observation_ref`、`policy_verdict`、`latency_ms`、`cost`、`error_type`、`verifier_verdict` 和 `redaction_status`。敏感字段不要直接落盘，保存引用、hash 和脱敏摘要即可。

评测要分层设计。Component eval 测检索、rerank、tool schema、citation verifier、guardrail；trajectory eval 测每一步是否遵守权限、是否更新状态、是否用正确工具；end-to-end eval 测最终任务是否完成。线上 observability 则负责发现新分布：模型版本变化、工具错误率上升、成本异常、某类页面失败、某个租户权限被频繁拦截。

发布门禁可以按风险分级。高风险路径要求 regression 全绿、unsafe action 为零、trace coverage 达标；中风险路径允许抽样人工 review；低风险体验改动看在线指标。关键不是有一张漂亮 dashboard，而是失败样本能进入 eval set，下一次发布能阻止同类回归。

## 边界条件与反例

反例一：只保存最终 answer，没有 step trace，导致线上失败无法复现。反例二：只做 LLM judge，不记录工具和策略 verdict，judge 可能偏向最终结果而忽略危险路径。反例三：eval set 没有版本和样本来源，指标上涨可能只是样本变简单。

边界在于：不是所有 trace 都能完整保存明文。涉及 PII、密钥、客户文档时，要保存脱敏字段、引用和访问控制；调试权限也要审计。Eval 的深度要匹配风险，不能为了每个低风险文案改动都跑完整重型评测。

## 深问准备

- 问：golden set 怎么来？答：历史失败、人工设计边界样本、线上抽样、红队攻击和用户高频路径。
- 问：trajectory 怎么打分？答：硬规则一票否决，软指标按工具选择、状态更新、恢复、成本和证据链评分。
- 问：如何发现数据漂移？答：按任务类型、工具、模型版本、页面模板和用户群体切分线上指标。
- 问：trace 里哪些要脱敏？答：用户输入、文件内容、PII、密钥、业务 ID、工具参数中的敏感资源。

## 公开阅读校验

这篇文章的公开价值在于提醒读者：Agent 的 Eval 不是一个单独脚本，而是一套质量运营机制。它至少要有样本来源、标注规范、版本管理、发布门禁和失败回流责任人。没有这些治理，dashboard 再漂亮也只能说明“今天看到了几个现象”，不能证明下一次发布不会重复犯错。

真正可落地的 Eval 要把“分数”拆成可行动结论。组件层告诉你检索、rerank、tool schema、guardrail 哪一层坏了；轨迹层告诉你是否走了危险工具、是否重复提交、是否忽略 verifier；端到端层才告诉你任务有没有完成。三层指标不能互相替代，尤其不能用最终答案正确掩盖中间越权或副作用错误。

评审一个 Agent 系统时，可以要求团队拿出三件证据：第一，最近线上失败样本是否已经进入 regression set；第二，trace 是否能在脱敏后重放关键状态转移；第三，发布门禁是否按风险分级而不是一刀切。如果这三件事做不到，所谓“可观测”通常还停留在日志收集阶段，离生产质量闭环还有距离。

## 来源与延伸阅读

- [OpenAI Agents SDK Tracing](https://openai.github.io/openai-agents-python/tracing/)：用于支持 Agent run、step、tool call 和结果需要进入结构化 trace，才能支撑失败归因。
- [LangSmith Observability](https://docs.smith.langchain.com/observability)：用于支持线上监控要按 trace、metadata、反馈和错误分桶，而不是只看最终答案。
- [LangSmith Evaluation](https://docs.smith.langchain.com/evaluation)：用于支持离线 eval、回归数据集和实验对比应成为发布门禁的一部分。
