# 如果让一个 Agent 自动跑半小时任务，你会如何设计 state、verifier、schedule 和恢复机制？

## 面试定位

这道题关联 Loop Engineering 与 Agent Runtime，难度 5/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Loop Engineering 与 Agent Runtime」切入：Loop Engineering 把一次 prompt 调用升级为带状态、验证器、调度、恢复和反馈闭环的 Agent Runtime。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 只写更长 prompt
- 没有 verifier 就宣称 autonomous
- 长任务无恢复点
- 只给名词解释，不讲边界、指标和工程证据

## 30 秒回答

我会先划边界：Loop Engineering 把一次 prompt 调用升级为带状态、验证器、调度、恢复和反馈闭环的 Agent Runtime。；prompt 不是系统边界；state 和 verifier 是循环可靠性的核心；schedule 决定长任务能否持续推进。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- 我会先划边界：Loop Engineering 把一次 prompt 调用升级为带状态、验证器、调度、恢复和反馈闭环的 Agent Runtime。；prompt 不是系统边界；state 和 verifier 是循环可靠性的核心；schedule 决定长任务能否持续推进。
- 再讲运行机制：核心问题是让 Agent 在多步任务中持续记录状态、检查结果并恢复失败。；它连接 ReAct、Plan-and-Execute、反思、工具调用和轨迹评测。。
- 工程实现要落到可执行设计：为每次 run 建立 state file、step log、verifier verdict 和 next action。；把停止条件、预算、重试、人工确认写进 runtime，而不是交给模型自由判断。。
- 如果被要求画设计，可以按这个结构展开：。
- 最后补风险、指标和取舍：只写更长 prompt；没有 verifier 就宣称 autonomous；长任务无恢复点；跟踪 task_success_rate；跟踪 loop_completion_rate；跟踪 verifier_reject_rate；跟踪 resume_success_rate；跟踪 cost_per_success。
- Loop Engineering 把一次 prompt 调用升级为带状态、验证器、调度、恢复和反馈闭环的 Agent Runtime。
- 核心问题是让 Agent 在多步任务中持续记录状态、检查结果并恢复失败。
- 它连接 ReAct、Plan-and-Execute、反思、工具调用和轨迹评测。
- 把核心对象、状态变化、执行顺序和异常路径讲出来，避免只说结论。


### 数据流怎么讲

可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。


### 落地实现细节

- 为每次 run 建立 state file、step log、verifier verdict 和 next action。
- 把停止条件、预算、重试、人工确认写进 runtime，而不是交给模型自由判断。
- 定义 run state：goal、constraints、plan、completed_steps、open_risks、artifact_refs 和 next_actions。
- 每个 step 保存 tool call、observation、cost、duration、error 和 verifier verdict。
- 调度层设置 max steps、timeout、budget、pause/resume、human gate 和 rollback。
- 用 trajectory eval 和 artifact verifier 判断循环是否真的推进目标。
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
- task_success_rate
- loop_completion_rate
- verifier_reject_rate
- resume_success_rate
- cost_per_success

## 多轮追问模拟

### 追问 1：Loop Engineering 和传统 prompt engineering 的区别是什么？

**回答要点**：我会先回到适用边界，再解释机制和工程代价：。回答时不能只说概念，要把选择标准、失败模式和可观测指标一起讲出来。

**考察点**：边界判断、工程取舍

### 追问 2：如果把它落到 pe-coding-agent / pe-web-agent 项目里，你会怎么设计？

**回答要点**：我会按输入、状态、执行、验证和指标展开：为每次 run 建立 state file、step log、verifier verdict 和 next action。；把停止条件、预算、重试、人工确认写进 runtime，而不是交给模型自由判断。；定义 run state：goal、constraints、plan、completed_steps、open_risks、artifact_refs 和 next_actions。；每个 step 保存 tool call、observation、cost、duration、error 和 verifier verdict。；调度层设置 max steps、timeout、budget、pause/resume、human gate 和 rollback。；用 trajectory eval 和 artifact verifier 判断循环是否真的推进目标。。项目表达里要说明模块边界、数据流、错误恢复和上线后的指标，而不是只说用了某个框架。

**考察点**：系统设计、项目证据

### 追问 3：线上出问题时，你会看哪些日志、trace 或指标？

**回答要点**：我会先按失败类型归因，再看 trace 中的输入、状态、工具参数、返回结果、耗时、成本和 verdict；重点指标包括 task_success_rate；loop_completion_rate；verifier_reject_rate；resume_success_rate；cost_per_success。如果问题来自设计边界，还要回到 schema、权限、上下文和评测集，而不是只调 prompt。

**考察点**：trace、指标归因

### 延伸追问 1：Loop Engineering 和传统 prompt engineering 的区别是什么？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：把回答落到 pe-coding-agent、pe-web-agent 的工具、状态、评测或安全设计中。；用架构、业务、结果三段式回答，避免只背概念。；补一个失败案例和改进动作，可信度会明显更高。

### 延伸追问 2：如果线上出现这个问题，你会看哪些日志、trace 或指标？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：把回答落到 pe-coding-agent、pe-web-agent 的工具、状态、评测或安全设计中。；用架构、业务、结果三段式回答，避免只背概念。；补一个失败案例和改进动作，可信度会明显更高。

### 延伸追问 3：如果成本、延迟和准确率发生冲突，你会怎么取舍？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：把回答落到 pe-coding-agent、pe-web-agent 的工具、状态、评测或安全设计中。；用架构、业务、结果三段式回答，避免只背概念。；补一个失败案例和改进动作，可信度会明显更高。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 把回答落到 pe-coding-agent、pe-web-agent 的工具、状态、评测或安全设计中。
- 用架构、业务、结果三段式回答，避免只背概念。
- 补一个失败案例和改进动作，可信度会明显更高。

**取舍总结**
AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- 为每次 run 建立 state file、step log、verifier verdict 和 next action。
- 把停止条件、预算、重试、人工确认写进 runtime，而不是交给模型自由判断。
- 定义 run state：goal、constraints、plan、completed_steps、open_risks、artifact_refs 和 next_actions。
- 每个 step 保存 tool call、observation、cost、duration、error 和 verifier verdict。
- 调度层设置 max steps、timeout、budget、pause/resume、human gate 和 rollback。
- 用 trajectory eval 和 artifact verifier 判断循环是否真的推进目标。
- Loop Engineering 把一次 prompt 调用升级为带状态、验证器、调度、恢复和反馈闭环的 Agent Runtime。
- 核心问题是让 Agent 在多步任务中持续记录状态、检查结果并恢复失败。
- 它连接 ReAct、Plan-and-Execute、反思、工具调用和轨迹评测。
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

- [Addy Osmani: Loop Engineering](https://addyosmani.com/blog/loop-engineering/)：用于确认官方语义边界、命令行为和工程约束。
- [OpenAI: A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于确认官方语义边界、命令行为和工程约束。
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于确认官方语义边界、命令行为和工程约束。
