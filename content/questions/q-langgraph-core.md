# LangGraph 适合什么类型的 Agent 项目？

## 面试定位

这题考你是否理解 LangGraph 的适用边界。回答要讲 state schema、node、edge、checkpoint、interrupt、reducer 和不适用场景。

## 30 秒回答

LangGraph 适合有明确状态图、条件分支、checkpoint、interrupt、人机协同和恢复需求的 Agent workflow。它把流程拆成 node，把流转放到 edge，把共享事实放到 state schema。简单线性 loop 不一定需要它，高度开放探索任务也可能图膨胀。

## 标准回答

LangGraph 的核心是显式状态。node 读取 state 并返回 update，edge 根据 verdict、error_code、risk_level 或 human decision 决定下一步。reducer 决定多个更新如何合并。checkpoint 保存状态，interrupt 支持人工介入和 resume。

关键取舍是结构化治理和建模成本。显式 graph 便于恢复和测试，但简单任务会显得重。动态探索太多时，图结构也可能膨胀。

适合场景包括旅行规划、客服流程、研究助手、审批流和长任务 coding workflow。它们都有阶段、状态、分支和恢复点。不适合只需要一次工具调用或简单问答的任务。

## 架构与运行机制

数据流是用户输入初始化 state，planner node 生成 plan，tool node 写入 observation，verifier node 输出 verdict，edge 决定 finish、retry、interrupt 或 fail。每次关键更新保存 checkpoint。

## 可画图

```mermaid
flowchart TD
  State[state schema] --> Planner[node planner]
  Planner --> Router{edge verdict}
  Router --> Tool[node tool executor]
  Router --> Human[interrupt human approval]
  Tool --> Reducer[reducer]
  Reducer --> Checkpoint[checkpoint]
  Checkpoint --> Verifier[node verifier]
```

图 1：LangGraph 类状态图的核心控制流。用户输入先进入 State schema，Planner 写入计划，Router 根据 edge verdict 分流到 Tool 或 Human interrupt，Tool 的 observation 通过 Reducer 合并到 state，再由 Checkpoint 保存可恢复状态并交给 Verifier。图中最重要的数据流边界是 Reducer：它决定哪些字段可以 append、merge 或 overwrite，避免普通节点覆盖用户约束、风险标记或人工决策。

## 系统设计案例

Travel Agent 可拆成偏好收集、路线规划、天气查询、预算校验和人工确认节点。预算超限走重规划。付款和预订前触发 interrupt。用户确认后从 checkpoint resume。

## 真实问题与排障

resume 失败时查 checkpoint_id 和 thread_id。状态覆盖时查 reducer。分支错误看 edge condition。图变得难维护时检查是否把开放探索过度图化。指标看 `node_success_rate`、`edge_transition_error_rate`、`checkpoint_resume_rate` 和 `human_intervention_rate`。

排障要按影响面、止血、根因、回归四步讲。影响面先看卡住的 thread、失败 node 和是否存在外部副作用；止血是暂停相关 thread 或把高风险 edge 临时转人工；根因从 checkpoint version、reducer 合并规则、edge condition 和 interrupt resume 参数里找；回归要补一条能 replay 的 graph fixture，断言同一 state 不会再走错 edge。

## 面试官追问

- state schema 先还是 node 先？先 state，否则节点会失控。
- interrupt 解决什么？高风险步骤暂停，等待外部决策。
- checkpoint 里能放大文件吗？不建议，放 artifact 引用。

## 多轮追问模拟

### 追问 1：为什么说 state schema 比 node 更先？

回答要点：state 决定节点能读取什么、更新什么，以及 edge 条件基于哪些字段；如果先写 node，状态字段会散落在自由文本和临时变量里，后续 reducer、checkpoint 和 eval 都难以稳定。  
考察点：是否真正理解 LangGraph 的核心是显式状态，而不是画流程图。  
常见陷阱：把 node 当函数列表，缺少字段级语义和版本管理。

### 追问 2：interrupt 放在哪些地方最有价值？

回答要点：放在不可逆写入、高风险权限、预算超限、证据不足、用户硬约束冲突和人工审批前；interrupt 之后要从 checkpoint resume，并保证前置副作用幂等。  
考察点：候选人是否能把 human-in-the-loop 和恢复机制连起来。  
常见陷阱：把 interrupt 当 UI 弹窗，没有考虑 checkpoint、resume 参数和副作用状态。

### 追问 3：怎么判断 LangGraph 用重了？

回答要点：如果一次工具调用或线性问答也拆成大量 node，`avg_node_count_per_run` 上升但 `debug_time_to_root_cause`、`checkpoint_resume_rate` 没改善，就说明图化没有收益。  
考察点：是否有框架边界意识。  
常见陷阱：认为图越细越专业，导致 edge 爆炸和维护成本上升。

## 项目化回答

我会说：我会在多阶段 Agent 中用 LangGraph 建状态图。每个 node 有单一职责，edge 可测试，高风险动作通过 interrupt 进入人工确认，checkpoint 支持恢复。

## 常见错误

- 简单任务过度图化。
- 把复杂逻辑藏进 node。
- reducer 默认覆盖状态。
- 没有 node 级 eval 和 trace。

## 深挖技术细节

LangGraph 类框架适合把 Agent workflow 建模成可恢复状态机。关键不是“画图”，而是 state schema。State 里应区分 `user_goal`、`constraints`、`plan`、`observations`、`tool_results`、`risk_flags`、`human_decisions` 和 `final_answer`。Node 只负责单一阶段，例如 planner、retriever、tool_executor、verifier、human_approval。Edge 根据 verdict、error_code、risk_level 和 user_decision 路由。

Reducer 是容易被忽略的技术点。多个 node 更新同一字段时，要明确 append、merge、overwrite、deduplicate 或 reject。比如 observations 通常 append，constraints 不能被普通 node 覆盖，risk_flags 只能升高不能静默降低。Checkpoint 保存 thread 级状态，interrupt 用于高风险动作和人工输入。恢复时要带 checkpoint_id 和 state version，避免重复执行外部副作用。

适用性可以用指标判断：`checkpoint_resume_rate`、`node_success_rate`、`edge_transition_error_rate`、`state_merge_conflict_rate`、`human_intervention_rate`、`debug_time_to_root_cause`。如果项目主要是一次问答或单次工具调用，这些能力很少用上，图化就是负担。

## 边界条件与反例

反例一：每个按钮点击都拆成 graph node，图迅速膨胀，维护成本超过收益。反例二：node 内部塞进巨型自由文本状态，表面是图，实际不可测试。反例三：恢复后重复执行支付或发送动作，因为 node 没有幂等和副作用记录。

边界在于：Graph 适合稳定的阶段性流程，开放探索可以放在某个 node 内部或子 Agent。高风险外部动作前要 interrupt，外部 artifact 应保存引用而不是塞进 checkpoint。简单任务优先用原生 loop baseline。

## 深问准备

- 问：state schema 先还是 node 先？答：先 state，因为节点职责和 edge 条件都依赖状态字段。
- 问：checkpoint 存什么？答：可恢复的小状态、artifact 引用、版本和决策，不存大文件明文。
- 问：reducer 怎么设计？答：按字段语义决定 append/merge/overwrite，并保护 constraints 和 risk_flags。
- 问：什么时候不用 LangGraph？答：线性、低状态、一次性工具调用或图建模成本大于恢复收益时。

## 来源与延伸阅读

- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)：用于说明 LangGraph 以 state、nodes、edges 建模可恢复工作流的基础抽象。
- [LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)：用于支持 checkpoint、thread 级短期状态和跨 thread store 的边界。
- [LangGraph Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)：用于说明 human-in-the-loop 如何依赖持久化状态暂停与恢复图执行。
