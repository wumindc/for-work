# 如果规划和执行结果冲突，你会如何让 Agent 重规划？

## 面试定位

这题考动态恢复。重点是 observation、verifier、replan reason、状态版本和预算控制。

## 30 秒回答

我会先让 Verifier 判断冲突类型：工具失败、外部状态变化、用户约束变化、证据冲突还是计划假设错误。然后基于当前 State 和 observation 触发 Replanner，生成新 plan version。旧计划不直接删除，要记录 replan reason 和废弃步骤。

重规划也要有预算和次数上限，避免无限规划。

## 标准回答

第一步确认 observation 是否可信。工具结果可能本身错误。第二步定位冲突发生在哪个 step。第三步更新 State，把已完成、失败、不可行的步骤标记清楚。第四步让 Replanner 只改受影响部分，而不是从零开始。

如果冲突涉及高风险业务动作，应该转人工或回到 workflow。

## 架构与运行机制

```mermaid
flowchart LR
  Plan[Plan v1] --> Execute[Execute Step]
  Execute --> Obs[Observation]
  Obs --> Verify{Matches expectation?}
  Verify -->|yes| Next[Next Step]
  Verify -->|no| Reason[Replan Reason]
  Reason --> State[Update State]
  State --> Replanner[Replanner]
  Replanner --> Plan2[Plan v2]
```

图 1：计划与执行冲突后的重规划状态机。Plan v1 的每个 step 都有 expected state，执行后产生 Observation，Verifier 判断是否匹配；不匹配时生成 Replan Reason，先更新 State，再由 Replanner 产出 Plan v2。图中最重要的数据流边界是 plan version：旧计划不能被静默覆盖，必须保留被废弃步骤、冲突原因和新旧计划 diff，才能解释为什么路线变化。

这里的取舍是全量重规划还是局部修补。局部修补成本低，但当目标或关键约束变化时，全量重规划更可靠。

## 可画图

可以画 plan v1 到 plan v2 的状态转移，标出冲突来源和被废弃步骤。

## 系统设计案例

旅行 Agent 计划订周五晚航班，但搜索结果显示无票。Replanner 不应该继续订酒店，而要回到航班时间、预算和备选城市，生成新候选。

## 真实问题与排障

如果频繁重规划，看目标是否太模糊，工具是否不稳定，Verifier 是否过严，预算是否太低。指标包括 `replan_rate`、`replan_success_rate`、`abandoned_step_count` 和 `cost_per_success`。

## 面试官追问

### 追问 1：重规划会不会浪费成本？

会，所以要限制次数，只重写受影响步骤，并用 verifier 控制。

### 追问 2：怎么避免反复推翻计划？

保存不可行原因，把失败约束加入下一轮 planning context。

## 多轮追问模拟

### 追问 1：observation 和计划冲突时先信谁？

回答要点：先验证 observation 是否可信，再判断 expected_state 是否过期；工具结果可能错误，计划假设也可能失效，所以要用 verifier、二次观察或替代工具确认。  
考察点：是否理解重规划不能建立在未验证事实上。  
常见陷阱：一看到冲突就重写计划，结果把错误 observation 固化进 state。

### 追问 2：局部重规划和全量重规划怎么选？

回答要点：单个步骤失败、工具临时不可用、候选资源变化时优先局部重规划；目标、硬约束、关键事实或风险策略变化时全量重规划，并废弃受影响步骤。  
考察点：是否能控制成本和正确性之间的取舍。  
常见陷阱：每次从零开始，丢掉已验证正确的步骤。

### 追问 3：如何避免 replan loop？

回答要点：记录 `replan_reason` 和失败约束，下一轮 planner 必须显式避开；同一 reason 连续触发超过阈值时停止、追问用户或转人工。  
考察点：是否能把重规划做成受控机制。  
常见陷阱：无限“重新规划”，直到预算耗尽。

## 项目化回答

Coding Agent 测试失败后只调整相关 patch。Paper Agent 证据不足时只补检索，不重写整个报告。Travel Agent 航班无票时只重规划交通部分。

## 常见错误

- observation 冲突还硬执行旧计划。
- 每次都从零规划。
- 不记录 replan reason。
- 没有预算上限。

## 深挖技术细节

重规划不是“重新问模型下一步”，而是一个状态迁移。系统要保存 `plan_id`、`plan_version`、`step_id`、`expected_state`、`actual_observation`、`verifier_verdict`、`replan_reason`、`affected_steps`、`abandoned_steps` 和 `budget_remaining`。当 observation 与 expected_state 冲突时，Verifier 先判断冲突类型，再让 Replanner 只修改受影响的步骤。

常见 replan reason 包括 `tool_failed`、`external_state_changed`、`constraint_changed`、`evidence_conflict`、`plan_assumption_invalid`、`risk_policy_blocked`。不同原因对应不同动作：工具失败可换工具或 retry；外部状态变化要刷新事实；用户约束变化要重算计划；高风险策略阻断要转人工或降级。旧计划不要删除，应标记 superseded，方便 trace replay。

重规划要有预算和防抖。连续多次因为同一原因失败，说明计划前提或工具环境有问题，不应无限 replan。指标包括 `replan_rate`、`replan_success_rate`、`same_reason_replan_loop_count`、`abandoned_step_count`、`cost_per_success`、`time_to_recover` 和 `human_handoff_rate`。

## 边界条件与反例

反例一：航班无票后仍按原酒店计划继续，导致后续动作全部建立在错误前提上。反例二：测试失败后 Coding Agent 从零规划，把已确认正确的修复也丢掉。反例三：replan 没有记录 reason，复盘时不知道是工具问题还是计划假设错。

边界在于：局部 replan 成本低，但当前目标、硬约束或关键事实变化时必须全量重规划。高风险业务动作如果已进入 approval 或执行阶段，不能简单 replan，要先确认外部副作用状态。

## 深问准备

- 问：如何避免反复推翻计划？答：把失败原因写入 state，下一轮 planner 必须避开同一不可行假设。
- 问：全量重规划和局部修补怎么选？答：局部步骤失败用局部修补，目标或硬约束变化用全量重规划。
- 问：observation 本身不可信怎么办？答：先验证工具结果或重新观察，不能基于错误 observation 重规划。
- 问：重规划如何进入 trace？答：记录 plan version、replan reason、abandoned steps 和新旧计划 diff。

## 来源与延伸阅读

- [Anthropic Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于支持先用清晰 workflow、routing、evaluator-optimizer 等模式管理复杂任务，而不是让模型无限自由规划。
- [OpenAI A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于说明 Agent 上线需要围绕 tools、guardrails、handoff 和 eval 设计，重规划也要受这些边界控制。
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)：用于说明 reasoning 与 action 可以通过 observation 交替更新计划，但 observation 仍需要工程侧验证。
