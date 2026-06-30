# 如何避免长时间 coding 任务里丢失用户约束和测试证据？

## 面试定位

这道题关联 Codex / Claude Code 上下文工作流，难度 5/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Codex / Claude Code 上下文工作流」切入：现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把整个仓库塞给模型
- 不跑测试就说修好了
- 上下文压缩丢用户约束
- 只给名词解释，不讲边界、指标和工程证据

## 30 秒回答

我会先划边界：现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。；先读代码再改；上下文要分层加载；测试和 diff 是事实证据。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先划边界：现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。；先读代码再改；上下文要分层加载；测试和 diff 是事实证据。
- 再讲运行机制：Codex 和 Claude Code 类工具把聊天界面变成代码任务 runtime。；subagent、skill、hook 和 memory 都是在降低长任务中的上下文漂移。。
- 工程实现要落到可执行设计：上下文分成任务目标、硬约束、相关文件、测试输出、diff 和历史决策。；长任务触发 compaction 时要保存 evidence refs，而不是只写聊天摘要。。
- 如果被要求画设计，可以按这个结构展开：。
- 最后补风险、指标和取舍：把整个仓库塞给模型；不跑测试就说修好了；上下文压缩丢用户约束；跟踪 issue_resolution_rate；跟踪 test_pass_rate；跟踪 context_reuse_rate；跟踪 lost_constraint_rate；跟踪 review_findings_per_patch。
- 现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。
- Codex 和 Claude Code 类工具把聊天界面变成代码任务 runtime。
- subagent、skill、hook 和 memory 都是在降低长任务中的上下文漂移。
- 把核心对象、状态变化、执行顺序和异常路径讲出来，避免只说结论。


### 数据流怎么讲

可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。


### 落地实现细节

- 上下文分成任务目标、硬约束、相关文件、测试输出、diff 和历史决策。
- 长任务触发 compaction 时要保存 evidence refs，而不是只写聊天摘要。
- 先用代码搜索定位相关模块，再读取最小必要文件和测试。
- 把上下文拆成 task、constraints、repo facts、diff、test output、decisions 和 open risks。
- 触发压缩时保存 evidence refs，而不是只写自然语言总结。
- 每次完成前必须以真实命令、diff 和 reviewer verdict 做验证。
- 关键接口要有 schema、version、timeout、retry、幂等键和审计字段。
- 关键状态要能恢复，关键动作要能回放，关键结果要有验证器或指标证明。

## 可画图

```mermaid
flowchart LR
  Q[面试问题] --> Boundary[先划边界]
  Boundary --> Mechanism[解释机制]
  Mechanism --> Design[落到系统设计]
  Design --> Incident[补事故排障]
  Incident --> Tradeoff[总结取舍]
```

图 1：这类题不要直接背结论，先划清边界，再沿机制、设计、事故和取舍回答。

## 系统设计案例

### 面试可展开的系统设计

典型设计题是企业内部 Agent、Coding Agent、Paper Agent 或 Web Agent：外层 deterministic workflow 管理权限、预算、审批和最终提交，内层 Agent loop 处理开放探索，Eval Gate 根据 golden case、轨迹评分、工具结果和人工反馈决定是否继续。

**答题时建议画出的模块**
- 入口层：参数校验、权限、租户、幂等和 request_id。
- 业务服务层：决定同步流程、异步流程、缓存读写、数据库回源、下游调用或降级返回。
- 执行层：封装存储访问、外部调用和异步任务，统一 timeout、retry、error code 和审计。
- 状态层：保存任务状态、业务状态、checkpoint 和版本。
- 观测层：指标、日志、trace、回放和 regression case。

**数据流**
- 请求进入系统后生成唯一标识，并把用户约束和业务上下文落入状态。
- 业务服务读取缓存、数据库、异步事件或下游状态，选择执行路径。
- 执行结果以结构化结果写回状态，同时上报指标。
- 保护策略判断是否完成、重试、降级、补偿或转人工。

## 真实问题与排障

真实线上问题一般从任务成功率、工具调用成功率、invalid args、上下文漂移、幻觉率、引用准确率、token 成本、延迟、guardrail block rate 和 human handoff rate 看起。回答时要把模型问题、检索问题、工具问题、状态问题和权限问题分开归因。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- issue_resolution_rate
- test_pass_rate
- context_reuse_rate
- lost_constraint_rate
- review_findings_per_patch

## 多轮追问模拟

### 追问 1：Coding Agent 为什么需要上下文工作流，而不是直接让模型写代码？

**回答要点**：我会先回到适用边界，再解释机制和工程代价：。回答时不能只说概念，要把选择标准、失败模式和可观测指标一起讲出来。

**考察点**：边界判断、工程取舍

### 追问 2：如果把它落到 pe-coding-agent 项目里，你会怎么设计？

**回答要点**：我会按输入、状态、执行、验证和指标展开：上下文分成任务目标、硬约束、相关文件、测试输出、diff 和历史决策。；长任务触发 compaction 时要保存 evidence refs，而不是只写聊天摘要。；先用代码搜索定位相关模块，再读取最小必要文件和测试。；把上下文拆成 task、constraints、repo facts、diff、test output、decisions 和 open risks。；触发压缩时保存 evidence refs，而不是只写自然语言总结。；每次完成前必须以真实命令、diff 和 reviewer verdict 做验证。。项目表达里要说明模块边界、数据流、错误恢复和上线后的指标，而不是只说用了某个框架。

**考察点**：系统设计、项目证据

### 追问 3：线上出问题时，你会看哪些日志、trace 或指标？

**回答要点**：我会先按失败类型归因，再看 trace 中的输入、状态、工具参数、返回结果、耗时、成本和 verdict；重点指标包括 issue_resolution_rate；test_pass_rate；context_reuse_rate；lost_constraint_rate；review_findings_per_patch。如果问题来自设计边界，还要回到 schema、权限、上下文和评测集，而不是只调 prompt。

**考察点**：trace、指标归因

### 延伸追问 1：Coding Agent 为什么需要上下文工作流，而不是直接让模型写代码？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：把回答落到 pe-coding-agent 的工具、状态、评测或安全设计中。；用架构、业务、结果三段式回答，避免只背概念。；补一个失败案例和改进动作，可信度会明显更高。

### 延伸追问 2：如果线上出现这个问题，你会看哪些日志、trace 或指标？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：把回答落到 pe-coding-agent 的工具、状态、评测或安全设计中。；用架构、业务、结果三段式回答，避免只背概念。；补一个失败案例和改进动作，可信度会明显更高。

### 延伸追问 3：如果成本、延迟和准确率发生冲突，你会怎么取舍？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：把回答落到 pe-coding-agent 的工具、状态、评测或安全设计中。；用架构、业务、结果三段式回答，避免只背概念。；补一个失败案例和改进动作，可信度会明显更高。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 把回答落到 pe-coding-agent 的工具、状态、评测或安全设计中。
- 用架构、业务、结果三段式回答，避免只背概念。
- 补一个失败案例和改进动作，可信度会明显更高。

**取舍总结**
AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- 上下文分成任务目标、硬约束、相关文件、测试输出、diff 和历史决策。
- 长任务触发 compaction 时要保存 evidence refs，而不是只写聊天摘要。
- 先用代码搜索定位相关模块，再读取最小必要文件和测试。
- 把上下文拆成 task、constraints、repo facts、diff、test output、decisions 和 open risks。
- 触发压缩时保存 evidence refs，而不是只写自然语言总结。
- 每次完成前必须以真实命令、diff 和 reviewer verdict 做验证。
- 现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。
- Codex 和 Claude Code 类工具把聊天界面变成代码任务 runtime。
- subagent、skill、hook 和 memory 都是在降低长任务中的上下文漂移。
- 关键数据结构要带版本、状态、trace、超时、重试和审计字段。
- 关键链路要说明同步路径、异步路径、失败路径和补偿路径。

## 边界条件与反例

反例一：如果业务需要强事务一致性，不能只靠缓存、搜索索引或异步读模型承载最终正确性。

反例二：如果没有指标、trace 和回归样例，方案在线上出问题时只能靠猜，不能证明稳定性。

反例三：为了追求低延迟而省略权限、幂等、超时或降级，会把局部性能优化变成系统性风险。

## 深问准备

被追问时优先沿四条线展开：为什么需要这个方案、关键数据结构是什么、失败后如何止血和定位、最终用什么指标证明修复有效。

- 准备一个线上事故：影响面、止血、根因、修复、回归。
- 准备一个系统设计：入口、状态、执行、存储、观测。
- 准备一个取舍：一致性、延迟、吞吐、成本和可维护性。

## 来源与延伸阅读

- [OpenAI: A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于确认官方语义边界、命令行为和工程约束。
- [Anthropic: Effective tools for agents](https://www.anthropic.com/engineering/effective-tools-for-agents)：用于确认官方语义边界、命令行为和工程约束。
