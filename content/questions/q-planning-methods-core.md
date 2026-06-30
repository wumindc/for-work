# 目前有哪些主流方法可以赋予 LLM 规划能力？

## 面试定位

这题不是论文名词背诵。要讲 CoT、ToT、Plan-and-Solve、Planner-Executor、Replanner 的适用场景、工程取舍、数据流和指标。

## 30 秒回答

常见方法包括 CoT、ToT、Plan-and-Solve、Planner-Executor 和 Replanner。CoT 帮模型组织步骤，ToT 探索多条候选路径，Plan-and-Solve 先规划再执行，Planner-Executor 把计划和行动拆开，Replanner 在 observation 和计划冲突时修正。

规划能力必须配合 verifier、预算和停止条件，否则会变成昂贵的自我对话。

## 标准回答

我会先区分推理组织和可执行计划。CoT 更像组织思路，Plan-and-Solve 更像生成步骤。工程里更常见的是 structured plan，每一步有目标、工具、预期结果和 done condition。

ToT 适合高价值问题，但成本高。Planner-Executor 适合工具任务，因为执行结果能反馈给 planner。Replanner 解决计划过期问题。

## 架构与运行机制

```mermaid
flowchart LR
  Goal[Goal] --> Planner[Planner]
  Planner --> Plan[Plan]
  Plan --> Executor[Executor]
  Executor --> Observation[Observation]
  Observation --> Verifier[Verifier]
  Verifier -->|conflict| Replanner[Replanner]
  Replanner --> Plan
  Verifier -->|done| Final[Final]
```

图 1：规划型 Agent 的运行闭环。Planner 生成结构化计划，Executor 按步骤调用工具或执行子任务，Observation 把外部结果写回状态，Verifier 判断当前计划是否仍然成立；如果 observation 推翻前提，就进入 Replanner，而不是继续执行旧计划。数据流的关键是 observation 会改变计划，计划不是一次生成后始终正确。

## 可画图

画 planner、executor、verifier、replanner 闭环，比只列 CoT/ToT 更像工程回答。

## 系统设计案例

Travel Agent 先规划查航班、查酒店、组合方案、等用户确认。若航班售罄，Replanner 要回到日期和预算约束重新规划。

## 真实问题与排障

规划失败常见原因是目标不清、计划不可执行、工具结果推翻前提、分支成本过高。指标包括 `plan_success_rate`、`replan_rate`、`avg_plan_steps`、`verifier_reject_rate` 和 `cost_per_task`。

排障时先看影响面：是所有任务都规划失败，还是某类工具任务失败；再看 trace 里的 `plan_id`、`step_id`、`expected_observation` 和真实 observation 是否对得上。止血策略可以是降低最大步骤数、关闭 ToT 多分支、把高风险步骤转人工确认。根因通常落在目标拆解错误、工具 schema 不清、done condition 太模糊或 verifier 过松。修复后要把失败任务放入 regression，用同一 goal 检查规划有效率、重规划次数和最终任务成功率。

## 面试官追问

### 追问 1：ToT 为什么不能随便用？

分支数、深度、token 和工具调用成本会快速膨胀。

### 追问 2：计划和执行冲突怎么办？

用 observation 触发 Replanner，并记录 replan reason。

## 多轮追问模拟

### 追问 1：CoT 和 Planner-Executor 的区别是什么？

回答要点：CoT 是提示模型组织推理过程，主要发生在一次模型调用内部；Planner-Executor 是运行时架构，计划、执行、观察和验证可以分离，并且能记录状态与回放。考察点是你能否区分 prompt 技巧和工程控制流。容易踩坑的是把“写出步骤”当成“系统真的能执行步骤”。

### 追问 2：ToT 为什么不能随便用？

回答要点：ToT 会放大分支数、深度、token、工具调用和评估成本，必须有 branch budget、剪枝策略和 verifier。考察点是成本控制和搜索空间意识。容易踩坑的是只讲“探索更多路径更聪明”，不讲预算和停止条件。

### 追问 3：计划如何进入生产系统？

回答要点：计划要变成结构化对象，包含 step_id、tool_required、expected_observation、done_condition、risk_level、fallback 和依赖关系。考察点是状态建模。容易踩坑的是把计划存在聊天历史里，导致恢复、回放和审计都不可控。

## 项目化回答

Coding Agent 可以讲定位、修改、测试计划。Paper Agent 可以讲证据缺口驱动的检索计划。Travel Agent 可以讲约束驱动规划。

## 常见错误

- 只背方法名。
- 计划生成后不更新。
- 不限制 ToT 成本。
- 没有 verifier。

## 深挖技术细节

规划方法要区分“推理提示技巧”和“可执行控制流”。CoT/Plan-and-Solve 更偏一次性组织步骤，Planner-Executor 把计划与工具执行分离，Replanner 处理外部 observation 推翻计划的情况，ToT/搜索式规划会枚举多个候选路径。工程系统里计划最好是结构化对象：`plan_id`、`step_id`、`goal`、`tool_required`、`expected_observation`、`done_condition`、`risk_level`、`fallback`。

Planner 不能脱离 verifier。每个 step 执行后都要检查 expected_observation 是否达成；未达成就进入 retry、fallback 或 replan。ToT 这类多分支方法还要有 branch budget、beam width、depth limit 和 pruning rubric，否则成本会指数增长。复杂任务中，计划还应带 dependency graph，避免后续步骤依赖未完成前提。

指标不能只看最终答案。规划层可以看 `plan_validity_rate`、`step_executable_rate`、`verifier_reject_rate`、`replan_rate`、`avg_plan_steps`、`branch_prune_rate`、`cost_per_task`。这些指标能证明规划方法是否真的提升任务完成率，而不是生成了漂亮步骤。

## 边界条件与反例

反例一：把 CoT 当成可执行计划，没有工具、状态和 done condition。反例二：ToT 分支很多，但没有 verifier 和 pruning，成本膨胀。反例三：计划生成后不随 observation 更新，工具结果已经推翻前提还继续执行。

边界在于：简单线性任务不需要重规划和 ToT；开放、多约束、工具反馈强的任务才值得引入 Planner-Executor 或 Replanner。计划越复杂，越需要可观测状态、预算和停止条件。

## 深问准备

- 问：CoT 和 Planner-Executor 区别？答：CoT 是推理组织，Planner-Executor 是运行时架构，有工具执行和 observation 反馈。
- 问：ToT 为什么不能随便用？答：分支数乘深度导致 token、工具调用和评估成本快速增长。
- 问：计划如何变成工程对象？答：每步有工具、预期结果、done condition、风险和 fallback。
- 问：计划失败怎么定位？答：看 step_executable、verifier verdict、tool error 和 replan reason。

## 公开阅读校验

这篇文章对公开读者最有价值的地方，是把“规划能力”从 prompt 技巧提升到运行时设计。一个计划如果不能被执行、验证、恢复和审计，就只是模型写出来的步骤清单。工程上要看计划对象是否有 `step_id`、依赖关系、工具需求、预期 observation、done condition、风险等级和 fallback，这些字段决定了计划能否进入真实系统。

读者可以用三条线判断是否需要复杂规划：任务是否跨多个外部状态源，工具结果是否会推翻后续步骤，失败是否需要局部恢复。三条都弱时，简单 workflow 或一次性生成更划算；三条都强时，Planner-Executor、Replanner 或搜索式规划才有投入价值。这个判断能避免把所有复杂问题都交给 ToT，最后只得到成本膨胀。

还要补一个上线门槛：规划不是越长越好，而是越能缩短不确定性越好。有效计划应该减少无效工具调用，降低人工接管，提升恢复率，并在预算内完成。评审时最好把 `plan_validity_rate`、`step_executable_rate`、`replan_rate`、`cost_per_success` 和 baseline 放在一起看，否则“看起来很会规划”不等于系统真的更强。

## 来源与延伸阅读

- [Anthropic Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于说明 workflow、agent、orchestrator-worker 和 evaluator-optimizer 等模式的工程边界。
- [OpenAI A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于支持计划、工具、guardrails 和多 Agent 编排的系统化表达。
