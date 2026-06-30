# Agent 七个核心模块

## 面试定位

这类题不是让你背组件清单，而是判断你能否审查一个 Agent 是否具备生产系统的骨架。回答要覆盖 Goal、State、Context、Tools、Loop、Guardrails、Eval，并说明它们之间的数据流和责任边界。

## 一句话定义

Agent 七个核心模块是：Goal 定义任务成功标准，State 保存可信运行状态，Context 给模型构造工作视图，Tools 连接外部能力，Loop 推进 observe/reason/act，Guardrails 管风险边界，Eval 证明系统有效。

缺少任一模块，Agent 都容易停在 demo：没有 State 就不可恢复，没有 Guardrails 就不安全，没有 Eval 就无法证明稳定。

## 为什么需要它

很多项目只把 LLM、prompt 和工具放在一起，就声称是 Agent。真正上线后会遇到目标漂移、状态丢失、工具误用、权限越界、循环不止和无法复盘。七模块是一套审查框架，能把“模型表现不好”拆成可定位的工程问题。

## 核心架构

```mermaid
flowchart LR
  Goal[Goal] --> Context[Context Builder]
  State[State Store] --> Context
  Context --> Loop[Loop Controller]
  Loop --> Model[Model]
  Model --> Tools[Tools]
  Tools --> State
  Tools --> Guardrails[Guardrails]
  State --> Eval[Eval + Trace]
  Eval --> Loop
```

图里 Context 不是数据库，State 也不是聊天历史。State 是系统可信状态，Context 是给模型的一次性工作视图。Eval 不是上线后才补的报表，而是决定能否继续迭代的验证层。

## 架构与运行机制

数据流从 Goal 开始。用户目标和约束被转成成功标准，State 保存当前计划和工具结果，Context Builder 把相关状态、证据和工具说明放入模型上下文，Loop Controller 控制每一步动作，Tools 返回 observation，Guardrails 拦截风险，Eval 给出 verdict。

这些模块不是并列清单，而是一条闭环。Tools 的 observation 会更新 State，State 会影响下一轮 Context，Eval 会改变 Loop 的停止策略。

## 运行机制

实现时可以先做最小闭环：Goal、State、Tools、Trace 和 Verifier。再逐步增强 Context 压缩、权限策略、评测集和多 Agent。不要一开始堆复杂框架。

State 至少要记录 `goal`、`constraints`、`plan`、`current_step`、`tool_results`、`open_risks`、`state_version`。Trace 至少要记录 step、tool、arguments、observation、latency、cost 和 verdict。

## 关键设计取舍

| 模块 | 设计重点 | 常见风险 | 面试表达 |
| --- | --- | --- | --- |
| Goal | 成功标准和约束 | 目标模糊导致漂移 | 先定义 done |
| State | 可信状态和恢复点 | 只靠 messages 丢状态 | 可 checkpoint |
| Context | 预算内证据视图 | 上下文污染 | 有 builder 和过滤 |
| Tools | schema 与权限 | 裸露执行权 | 宿主管控 |
| Eval | 组件与轨迹评测 | 只看 demo | 有 regression |

## 生产落地细节

生产 Agent 要把七模块变成可观测对象。每次 run 要能回答：Goal 是什么，State 如何变化，Context 为什么包含这些信息，Tools 调了哪些，Guardrails 拦了什么，Eval 为什么通过或失败。

指标包括 `task_success_rate`、`tool_chain_success_rate`、`state_restore_success_rate`、`context_budget_usage`、`guardrail_trigger_rate` 和 `eval_regression_pass_rate`。

## 系统设计案例

Coding Agent Harness 可以按七模块拆：Goal 是 issue 和测试成功标准，State 是计划、已读文件和 patch，Context 是当前相关文件片段，Tools 是 read/apply_patch/run_tests，Loop 是修复迭代，Guardrails 是文件和 shell 权限，Eval 是测试和 diff 审查。

```mermaid
sequenceDiagram
  participant G as Goal
  participant S as State
  participant C as Context
  participant L as Loop
  participant T as Tools
  participant E as Eval
  G->>S: initialize task
  S->>C: build working context
  C->>L: next action
  L->>T: tool call
  T-->>S: observation
  S->>E: verify state
  E-->>L: continue or stop
```

## 真实问题与排障

如果一个 Agent 不稳定，先定位缺的是哪一层。目标漂移看 Goal 和 Verifier，重复调用看 Loop，越权看 Guardrails，答非所问看 Context，无法复盘看 Trace，修复后回归失败看 Eval。

## 常见误区与排障

常见误区是把 State 当聊天记录，把 Tools 当普通 API，把 Eval 当人工感觉。排障时不要只调 prompt，要沿模块检查数据流和指标。

## 面试追问

1. State 和 Context 的区别是什么？
2. 为什么 Tools 不能直接给模型执行权？
3. Eval 怎么证明 Agent 不是 demo？
4. 七模块里哪个最容易被忽略？

## 项目化表达

可以把任何项目按七模块讲一遍。Paper Agent 强调 Context、Citation 和 Eval；Travel Agent 强调 Goal、Tools 和 Guardrails；Coding Agent 强调 State、Loop、Trace 和测试 verifier。

## 深入技术细节

七模块真正落地时要有明确的数据契约。Goal 不只是标题，而是 `objective`、`success_criteria`、`constraints` 和 `stop_condition`；State 不只是聊天历史，而是 `state_version`、`plan`、`completed_steps`、`tool_results`、`risk_flags`；Context Builder 负责从 State、Memory、Evidence 和 Tool Specs 中裁剪本轮输入；Loop 只推进结构化 action；Eval 用外部证据、测试或规则给 verdict。

这些模块的边界决定排障路径。Context 出错会导致模型看不到关键证据，Tool 出错会导致 observation 不可信，State 出错会让旧错误被反复带入，Guardrails 出错会放大副作用，Eval 出错会把失败当成功。面试里能把一次失败映射到模块，比背组件名更有说服力。

## 关键数据结构与协议

| 字段 | 所属模块 | 工程作用 |
| :--- | :--- | :--- |
| `success_criteria` | Goal | 定义 done condition |
| `state_version` | State | 支持恢复和回滚 |
| `context_refs` | Context | 说明证据来源 |
| `tool_call_id` | Tools | 串联 action 和 observation |
| `risk_flags` | Guardrails | 控制高风险动作 |
| `verifier_verdict` | Eval | 决定继续或停止 |

协议上每一步都应进入 trace：输入的 context、模型输出的 action、工具 observation、state diff 和 verifier verdict。没有这些字段，Agent 失败后只能猜 prompt 哪里不对。

## 深问准备

被问“七模块怎么裁剪首版”时，可以回答先做 Goal、State、Tools、Trace、Verifier 的最小闭环，再补 Guardrails、Context 压缩和复杂 Eval。不要一开始堆多 Agent 或复杂记忆。

被问“State 和 Context 区别”时，强调 State 是可信持久事实，Context 是一次性工作视图；State 可恢复、可审计，Context 可压缩、可裁剪。把两者混用是很多长任务 Agent 不稳定的根因。

## 来源与延伸阅读

- [OpenAI A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
- [Anthropic Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [AgentGuide Agent 学习地图](https://github.com/adongwanai/AgentGuide/blob/main/docs/00-getting-started/01-agent-map.md)
