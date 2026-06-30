# Agent 最终答对但路径很危险，Eval 应该如何判？

## 面试定位

这是 Trajectory Eval 的深入题。面试官想看你能否把安全、成本和可审计路径纳入质量标准，而不是只奖励最终结果。

## 30 秒回答

最终答对不代表通过。Eval 应该把任务结果和轨迹质量分开计分。结果维度看答案是否正确，轨迹维度看工具是否越权、是否缺 evidence、state_update 是否正确、是否绕过 human-in-the-loop、是否超预算。高风险违规应直接 fail，即使最终答案看起来对。

## 标准回答

我会设计硬规则和软评分。硬规则包括禁用工具、权限、确认、PII、测试、citation 等。触发硬规则直接失败。软评分包括路径长度、工具选择、恢复策略、状态更新和成本。这样能处理“答对但危险”的情况。

比如 Web Agent 最终提交成功，但中间点击了未授权按钮。结果分可能高，safety 分为零，整体发布 gate 不通过。Coding Agent 最终测试过了，但修改了无关文件，也应该在 minimal patch 和 auditability 上扣分。

## 架构与运行机制

数据流从 step trace 开始。Rule Checker 判断硬安全边界。Rubric Engine 评估 path_quality。Aggregator 将 result_score、safety_score、efficiency_score 和 audit_score 合成 verdict。高风险任务中 safety_score 有一票否决权。

## 可画图

```mermaid
flowchart TD
  Trace[step trace] --> Rule[Hard Rule Checker]
  Trace --> Rubric[Path Rubric]
  Rule --> Verdict{Hard fail?}
  Verdict -->|yes| Fail[Fail despite correct answer]
  Verdict -->|no| Aggregate[Aggregate scores]
  Rubric --> Aggregate
  Aggregate --> Report[Result + Safety + Cost]
```

## 系统设计案例

Travel Agent 推荐路线正确，但未确认就调用支付工具。Eval 应判失败，因为 externalEffect 动作缺 approval。Paper Agent 摘要正确，但没有引用证据，citation 规则失败。Coding Agent 修复成功，但跳过测试，verifier 规则失败。

## 真实问题与排障

如果危险成功增多，先按 riskLevel 分桶，再看 Permission Gate 和 Context Builder。若模型绕过确认，要检查工具可见性和 policy verdict。指标看 `unsafe_success_count`、`approval_bypass_count`、`missing_verifier_rate`、`cost_per_success`。

## 面试官追问

- 安全和成功冲突时怎么取舍？高风险场景安全一票否决。
- 成本高但成功要不要过？看任务价值和预算阈值。
- 如何避免 judge 偏向结果？把规则和结果分开评分。

## 项目化回答

我会说：我们的 Eval 报告不只显示 success，还显示 safety、efficiency、auditability 和 evidence。危险路径进入 regression，即使用户当次没发现问题。

## 常见错误

- 成功率唯一指标。
- 安全规则只放在 prompt。
- 不记录 policy verdict。
- 成本和路径质量不进报告。

## 深挖技术细节

Trajectory Eval 要把每一步 action 作为可评分对象。Trace schema 至少包含 `step_id`、`state_before_hash`、`context_refs`、`model_action`、`tool_name`、`tool_args_hash`、`policy_verdict`、`observation_ref`、`state_update`、`verifier_verdict`、`latency_ms`、`cost` 和 `risk_level`。最终答案正确只是 result_score，不能覆盖路径中的权限违规、证据缺失或不可恢复副作用。

硬规则要独立于 LLM judge。例如禁用工具、未授权资源、跳过 required confirmation、泄露 PII、缺少 citation、未运行必须测试、修改无关文件、超预算，都应由 Rule Checker 直接 fail。软评分再看工具选择是否合理、步骤是否冗余、是否及时恢复、是否保留审计证据。Aggregator 可以按风险设置权重，高风险任务中 safety 和 auditability 一票否决。

排障时要看“危险成功”而不是只看失败。`unsafe_success_count` 表示用户没看到错误但系统路径违规，这是最危险的 bucket。还要看 `approval_bypass_count`、`missing_verifier_rate`、`unnecessary_tool_call_rate`、`cost_per_success`、`trace_coverage`。把这些样本加入 regression，才能防止模型通过捷径拿到表面正确答案。

## 边界条件与反例

反例一：Web Agent 最终买到了票，但中途绕过确认点击支付，应 fail。反例二：Paper Agent 答案正确但没有引用，应 fail 或至少降级。反例三：Coding Agent 修好测试但删除了无关文件，应 fail。反例四：评价器只看最终文本，给了高分。

边界在于：不是所有低效路径都要失败。低风险任务可以把路径长度和成本作为软分；涉及支付、删除、发送、权限、个人数据、生产发布时，任何越权路径都应硬失败。Eval 的重点是把风险显式化，而不是追求一个总分。

## 深问准备

- 问：如何避免 judge 偏向正确结果？答：硬规则先跑，judge 只评软维度；结果分和路径分分开展示。
- 问：Trajectory 样本怎么标注？答：从 trace 中标注 expected action、forbidden action、required evidence 和 stop condition。
- 问：成本过高但结果正确怎么办？答：低风险降分，高风险或预算受限场景 fail，具体看 budget policy。
- 问：如何落到发布门禁？答：高风险 bucket 零容忍，普通路径看加权分和回归趋势。

## 来源与延伸阅读

- [LangSmith Evaluation](https://docs.smith.langchain.com/evaluation)
- [OpenAI Agents SDK Tracing](https://openai.github.io/openai-agents-python/tracing/)
- [OpenTelemetry Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
