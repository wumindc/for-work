# 一个完整 Agent 通常由哪些核心组件构成？

## 面试定位

这题考你是否能把 Agent 讲成工程系统，而不是“模型加工具”。回答要覆盖架构、数据流、指标、取舍和追问。

## 30 秒回答

我会用七个模块回答：Goal、State、Context、Tools、Loop、Guardrails、Eval。Goal 定义成功标准，State 保存可信任务状态，Context 是给模型的工作视图，Tools 连接外部能力，Loop 推进观察和行动，Guardrails 控制风险，Eval 证明系统有效。

缺少这些模块，Agent 容易只停留在 demo。例如没有 State 就无法恢复，没有 Eval 就无法证明稳定，没有 Guardrails 就不能安全执行真实动作。

## 标准回答

先讲边界。Agent 不是单次聊天，也不是一次 tool call。它要围绕目标持续决策，所以必须有状态、工具、反馈和停止条件。

再讲数据流。用户目标进入 Goal，State 提供当前进展，Context Builder 选择相关状态和工具说明，模型在 Loop 中选择动作，Tools 返回 observation，Guardrails 判断风险，Eval 决定继续还是停止。

最后讲取舍。模块越完整，系统越可控，但开发成本也更高。首版可以先做 Goal、State、Tools、Trace 和 Verifier，再逐步加强复杂能力。

## 架构与运行机制

```mermaid
flowchart LR
  Goal[Goal] --> Context[Context]
  State[State] --> Context
  Context --> Loop[Loop]
  Loop --> Tools[Tools]
  Tools --> State
  Tools --> Guardrails[Guardrails]
  State --> Eval[Eval]
  Eval --> Loop
```

State 是系统可信状态，Context 是模型看到的短期视图。这个区别是回答里的关键细节。

## 可画图

可以画七模块闭环，并强调 observation 会写回 State，Eval 会影响下一步 Loop。

## 系统设计案例

Coding Agent 中，Goal 是修复测试，State 保存计划和补丁，Context 放相关文件片段，Tools 包含 read/apply_patch/run_tests，Guardrails 限制写文件和 shell，Eval 用测试和 diff 判断是否完成。

## 真实问题与排障

如果 Agent 失败，按模块定位。目标漂移看 Goal，重复工具调用看 Loop，越权看 Guardrails，无法复盘看 Trace，修复后又坏看 Eval。

指标包括 `task_success_rate`、`tool_chain_success_rate`、`state_restore_success_rate`、`guardrail_trigger_rate` 和 `eval_regression_pass_rate`。

## 面试官追问

### 追问 1：State 和 Context 有什么区别？

State 是可信持久状态，Context 是本轮给模型的压缩视图。

### 追问 2：Eval 为什么是核心模块？

没有 Eval 就只能展示成功 demo，不能证明系统稳定。

## 项目化回答

Paper Agent 强调 Context 和 citation Eval。Travel Agent 强调 Goal、Tools 和 Guardrails。Coding Agent 强调 State、Loop 和测试验证。

## 常见错误

- 只说模型、工具、prompt。
- 把聊天历史当 State。
- 不讲 Guardrails 和 Eval。
- 没有指标和失败恢复。

## 深挖技术细节

完整 Agent 的核心不是模块名，而是模块之间的数据契约。Goal 要包含 `objective`、`success_criteria`、`constraints` 和 `stop_condition`；State 保存可恢复的任务事实，例如 plan、completed_steps、tool_results、risk_flags；Context Builder 从 State、Memory、检索结果和工具说明里选本轮最相关的信息；Loop 产出 action；Tools 返回 observation；Verifier/Eval 决定继续、重试、handoff 或停止。

State 和 Context 是最容易被混淆的两层。State 是系统可信账本，应该可持久化、可回放、可审计；Context 是给模型的临时窗口，可以被压缩、裁剪和重排。把聊天历史当 State，会在长任务里造成信息漂移；把完整 State 原样塞进 Context，又会增加成本、延迟和干扰。

## 边界条件与反例

并不是所有项目都要一开始做全量 Agent 平台。低风险 demo 可以先有 model、tools 和 trace；但只要进入生产写操作，就至少需要权限、幂等、审计、失败恢复和 eval。反例是“让模型直接调用退款接口”：即使 tool schema 正确，没有 Guardrails、permission gate、preview 和 user confirmation，也不应该自动执行。

另一个边界是 Memory。长期记忆不等于状态数据库。Memory 适合存用户偏好、历史经验和可复用背景；State 记录当前任务事实和执行进度。把未验证的模型总结写进 State，会污染后续决策；把执行结果只放 Memory，不进入 trace，就无法复盘一次失败 run。

## 深问准备

面试官追问“如何判断 Agent 可上线”时，可以用指标回答：`task_success_rate`、`tool_chain_success_rate`、`state_restore_success_rate`、`guardrail_trigger_rate`、`manual_handoff_rate`、`eval_regression_pass_rate` 和 `cost_per_success`。这些指标要按任务类型拆开看，不能用总体成功率掩盖高风险场景失败。

如果问“失败怎么定位”，按模块逆推：Goal 是否定义模糊，Context 是否缺证据，Tool 是否 schema 或权限错误，Loop 是否重复无效动作，Guardrail 是否漏放，Eval 是否把坏结果判成成功。好的回答要能把一次失败 trace 映射到具体模块，而不是泛泛说“模型不稳定”。

## 来源与延伸阅读

- [OpenAI A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
- [Anthropic Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
