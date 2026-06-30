# Agent 和 Workflow 的本质区别是什么？

## 面试定位

这是 Agent 面试的分水岭问题。回答要从控制流讲起，再落到架构、数据流、指标、取舍和追问。

## 30 秒回答

Workflow 的本质是代码预定义控制流，下一步由规则、状态机或编排逻辑决定。Agent 的本质是模型参与控制流，下一步由模型结合目标、状态、工具结果和反馈动态决定。

所以区别不是有没有 LLM，而是 LLM 是否决定下一步。一个 workflow 可以调用 LLM 做分类或摘要，但只要路径仍由代码决定，它仍然是 workflow。

## 标准回答

我会从三个维度区分。第一，控制流：workflow 固定，Agent 动态。第二，可验证性：workflow 更容易写单元测试，Agent 需要 trace 和 eval。第三，适用场景：workflow 适合规则明确任务，Agent 适合开放任务。

生产系统常常不是二选一，而是 hybrid。外层 workflow 管权限、预算、审批和最终提交，内层 Agent 处理探索、检索、排障或代码修复。

## 架构与运行机制

Workflow 的数据流像状态机：输入、校验、分支、动作、状态更新、输出。Agent 的数据流像反馈循环：observe、decide、act、observe、verify。两者都可以调用工具，但 Agent 会根据 observation 改变下一步计划。

## 可画图

```mermaid
flowchart TB
  subgraph W[Workflow]
    W1[Step 1] --> W2[Step 2]
    W2 --> W3[Step 3]
  end
  subgraph A[Agent]
    A1[Observe] --> A2[Decide]
    A2 --> A3[Act]
    A3 --> A4[Feedback]
    A4 --> A2
  end
```

## 系统设计案例

客服订单查询可以是 workflow：识别订单号、查状态、返回结果。复杂投诉归因可以是 Agent：需要查订单、物流、售后记录、政策文档，再根据证据提出处理建议。退款提交仍应回到 workflow。

## 真实问题与排障

如果 Agent 失败，要看动态决策链路：是否选错工具，是否误读反馈，是否目标漂移，是否停止条件错误。workflow 失败则更多看规则、状态和外部依赖。

指标取舍也不同。workflow 看分支覆盖率、错误率和延迟；Agent 还要看 `avg_steps`、`recovery_rate`、`trajectory_quality` 和 `unsafe_action_block_rate`。

## 面试官追问

### 追问 1：workflow 能调用 LLM 吗？

可以。LLM 做节点能力不等于 Agent，关键看谁控制下一步。

### 追问 2：Agent 一定比 workflow 高级吗？

不是。workflow 更可控、更便宜、更稳定。Agent 是为开放路径付出复杂度换灵活性。

### 追问 3：生产系统怎么组合？

常用 hybrid：workflow 管控制面，Agent 管探索面。

## 项目化回答

在 Coding Agent 中，搜索和修复循环是 Agent；apply patch 和 run tests 是受控工具；最后验收由 deterministic verifier 判断。这样能体现两者边界。

## 常见错误

- 认为用了 LLM 就是 Agent。
- 认为 Agent 必然替代 workflow。
- 不讲控制流和反馈。
- 不讲验证成本。

## 深挖技术细节

Workflow 和 Agent 的区别可以落到控制流字段上。Workflow 中下一步由代码状态机决定，例如 `state=approved -> send_email`；LLM 只是某个节点能力。Agent 中下一步由模型基于 `goal`、`state`、`tool_observation`、`constraints` 和 `verifier_feedback` 动态选择，例如继续检索、换工具、追问用户或停止。这个差别决定了测试、trace 和权限设计。

Workflow 的优势是确定、低成本、易审计，适合规则明确、分支稳定、失败路径可枚举的任务。Agent 的优势是处理未知环境、动态工具选择、多步排障和开放问题，但要付出 trace、eval、stop policy、guardrails 和成本控制。生产系统常用 hybrid：workflow 管权限、预算、审批和最终提交，Agent 处理探索和恢复。

评估时不要只看“是否用了 LLM”。Workflow 指标看 branch coverage、SLA、error rate、retry success；Agent 还要看 `avg_steps`、`trajectory_quality`、`recovery_rate`、`unsafe_action_block_rate`、`cost_per_success`。如果 Agent 的动态性没有提高成功率或降低人工成本，就应回到 workflow。

## 边界条件与反例

反例一：一个固定表单填报流程接了 LLM 文案润色，就说是 Agent。路径仍由代码决定，它更像 workflow+LLM node。反例二：把退款提交这种强规则、高风险流程交给 Agent 自主决定，造成审计和权限风险。反例三：Agent 探索完成后仍让模型决定是否真正付款，而不是回到 workflow 审批。

边界在于：workflow 不是低级，Agent 也不是更高级。规则稳定、风险高、需要强一致的部分应 workflow；路径开放、需要观察和推理的部分可 Agent。混合架构往往比“全 Agent”更生产级。

## 深问准备

- 问：workflow 能调用 LLM 吗？答：可以，关键看下一步控制权是否仍由代码决定。
- 问：什么时候用 Agent？答：路径无法预枚举、需要观察环境、动态选工具、异常恢复和证据收集时。
- 问：生产怎么组合？答：workflow 做控制面和审批，Agent 做探索、检索、排障，结果由 deterministic verifier 验收。
- 问：Agent 比 workflow 贵在哪里？答：更多模型调用、工具失败、trace 存储、eval 维护和安全门禁。

## 来源与延伸阅读

- [Anthropic Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)
