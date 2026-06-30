# Codex / Claude Code 上下文工作流

## 面试定位

Codex / Claude Code 上下文工作流 属于 AI 工程趋势与实战方案 / Coding Agent 工程化。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。

**必须讲清楚**
- 现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。
- 先读代码再改
- 上下文要分层加载
- 测试和 diff 是事实证据

**常见追问方向**
- 为什么 Coding Agent 需要 context workflow。
- Codex/Claude Code 类工具如何组织搜索、读取、patch、测试和 review。
- 长任务中如何避免丢失用户约束和失败测试证据。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- Codex 和 Claude Code 类工具把聊天界面变成代码任务 runtime。
- subagent、skill、hook 和 memory 都是在降低长任务中的上下文漂移。


### 通用数据流

可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。


### 工程落点

- 先用代码搜索定位相关模块，再读取最小必要文件和测试。
- 把上下文拆成 task、constraints、repo facts、diff、test output、decisions 和 open risks。
- 触发压缩时保存 evidence refs，而不是只写自然语言总结。
- 每次完成前必须以真实命令、diff 和 reviewer verdict 做验证。
- 上下文分成任务目标、硬约束、相关文件、测试输出、diff 和历史决策。
- 长任务触发 compaction 时要保存 evidence refs，而不是只写聊天摘要。
- 把每个关键步骤都映射到可观测指标，避免只描述功能。
- 回答时主动说明哪些信息是强一致状态，哪些只是上下文或缓存视图。

## 可画图

```mermaid
flowchart LR
  Input[业务请求 / 面试场景] --> Contract[边界与数据结构]
  Contract --> Mechanism[核心机制]
  Mechanism --> Failure[失败模式]
  Failure --> Metrics[指标与 Trace]
  Metrics --> Decision[取舍与项目表达]
```

图 1：Codex / Claude Code 上下文工作流 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Codex / Claude Code 上下文工作流 的面试级设计题

典型设计题是企业内部 Agent、Coding Agent、Paper Agent 或 Web Agent：外层 deterministic workflow 管理权限、预算、审批和最终提交，内层 Agent loop 处理开放探索，Eval Gate 根据 golden case、轨迹评分、工具结果和人工反馈决定是否继续。

**可画架构**
- 入口层校验用户请求、权限、租户、参数和幂等键。
- 业务服务层决定同步处理、异步处理、缓存读写、数据库回源或降级返回。
- 状态层保存业务状态、缓存版本、事件状态和恢复点。
- 执行层处理存储访问、下游调用、异步任务和补偿动作，并把结构化结果写入 trace。
- 观测层用指标、日志和链路追踪证明系统可运行、可排障、可复盘。

**数据流**
- 请求进入入口层后生成 request_id/run_id。
- 业务服务读取缓存、数据库或异步事件状态，选择执行路径。
- 执行结果写回状态存储，并向监控系统上报延迟、错误和业务结果。
- 保护策略根据成功标准、失败次数、SLA 和风险等级决定继续、降级、补偿或停止。

## 真实问题与排障

真实线上问题一般从任务成功率、工具调用成功率、invalid args、上下文漂移、幻觉率、引用准确率、token 成本、延迟、guardrail block rate 和 human handoff rate 看起。回答时要把模型问题、检索问题、工具问题、状态问题和权限问题分开归因。

**排查顺序**
- 先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。
- 再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。
- 对比最近发布、配置变更、流量变化、数据倾斜和下游限流。
- 先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。
- 最后把失败样例进入 regression/eval，避免同类问题复发。

**重点指标**
- issue_resolution_rate
- test_pass_rate
- context_reuse_rate
- lost_constraint_rate
- review_findings_per_patch

**常见误区**
- 把整个仓库塞给模型
- 不跑测试就说修好了
- 上下文压缩丢用户约束

## 业界方案与技术取舍

AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。

**方案对比**
- Coding Agent 的能力来自仓库上下文、工具反馈和验证闭环，不只是模型会写代码。
- 上下文工作流要控制读什么、保留什么、压缩什么、何时交给 subagent 或 skill。
- 测试、diff、trace 和用户约束是事实，聊天历史只是交互外壳。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

现代 Coding Agent 的关键不是单次生成代码，而是管理仓库搜索、上下文窗口、子任务、补丁、测试和复盘。

面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `task_goal` | 任务上下文 | 保存用户真实目标 | 防止长任务跑偏 |
| `hard_constraints` | 约束上下文 | 保存不能违反的要求 | 排查约束丢失 |
| `files_read` | Repo facts | 记录已读取代码证据 | 防止未读先改 |
| `changed_files` | Diff state | 记录补丁影响面 | 支持 review 和回滚 |
| `commands_run` | Verification | 保存测试、构建、lint 命令 | 证明交付状态 |
| `open_risks` | Handoff state | 保存未解决风险和跳过项 | 恢复任务时先处理 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 趋势落地补充

Codex/Claude Code 类工作流的实际差异，往往不在模型回答多聪明，而在上下文如何被组织成可恢复任务。一个可靠 coding session 至少要保留 goal、hard_constraints、files_read、changed_files、commands_run、test_results、decisions、open_risks 和 next_actions；其中 diff、测试输出和截图应该作为 artifact ref，而不是被摘要吞掉。

动手实验可以选一个小 bug，分别用“直接描述问题让模型改”和“先搜索、读文件、写计划、apply patch、跑测试、复盘”的方式处理。比较 test_pass_rate、irrelevant_diff_rate、duplicate_work_rate 和 user_revision_rate。这样能把上下文工作流讲成工程能力，而不是某个工具的使用技巧。

## 生产验收清单

- 会话开始时先建立 repo facts：相关目录、已有测试、入口文件、约束文件和可能受影响模块。
- 长任务中把用户硬约束、失败测试、关键命令输出和未解决风险写成可引用记录，压缩时只压缩叙事，不丢 evidence refs。
- 每个补丁都要能追溯到需求、文件读取证据、diff、验证命令和失败恢复策略。
- 交付前至少跑一次全量或针对性验证，并用 reviewer checklist 检查是否存在无关改动、未解释的跳过项和未处理失败。
- 如果任务跨越多轮，恢复时先重读状态和当前 git diff，再继续执行，不把旧记忆当成当前事实。

## 公开阅读校验

公开读者看 Codex / Claude Code 上下文工作流，应该得到的结论是：Coding Agent 的核心能力来自上下文管理和验证闭环，而不是模型单次生成。一个可靠会话要先搜索和读取代码，再形成计划，再小步 patch，再跑测试和 review。缺少这些步骤，即使模型一次写出能编译的代码，也很难证明改动符合仓库真实约束。

上下文要分层保存。用户目标和硬约束是高优先级事实，repo facts 来自实际文件读取，diff 和测试输出是交付证据，decisions 和 open_risks 是恢复线索。压缩或跨轮恢复时，不能只保存自然语言总结；必须保留文件路径、命令输出、失败日志和 patch 引用。否则下一轮 Agent 会把旧记忆当事实，重复工作或漏掉失败测试。

验收口径也要清楚：每个补丁都能追到需求、读过的文件、修改的 diff、运行过的命令和仍未解决的风险。对外讲这个主题时，不要停留在“Codex/Claude Code 很会写代码”，而要讲它们如何把搜索、上下文、工具、测试和复盘组织成 coding runtime。

这个主题还适合讲“恢复时先验证当前事实”。长任务被压缩、换模型或跨天继续时，Agent 应先看 git status、当前 diff、最近测试结果和计划清单，再决定下一步。旧摘要只能帮助定位线索，不能替代当前仓库状态。这个细节能解释为什么成熟工作流会强调 evidence refs、artifact refs 和 verification-before-completion。

评价 Codex/Claude Code 类工作流时，可以看 `files_read_before_patch`、`irrelevant_diff_rate`、`test_command_coverage`、`lost_constraint_rate`、`review_findings_per_patch` 和 `handoff_quality`。这些指标比“生成速度”更能体现工程价值，因为它们对应的是代码是否真的可维护、可验证、可恢复。

跨工具交接还要保留“为什么这样改”的决策链。比如从 Codex 切到 Claude Code、再回到 IDE 人工修补时，handoff 里要写清楚已接受的约束、被排除的方案、仍需人工确认的风险和下一条验证命令。这样后续协作者看到的不是一段模糊摘要，而是一份可以继续执行、也可以质疑和回滚的工程记录。

## 来源与延伸阅读

- [OpenAI: A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于确认官方语义边界、命令行为和工程约束。
- [Anthropic: Effective tools for agents](https://www.anthropic.com/engineering/effective-tools-for-agents)：用于确认官方语义边界、命令行为和工程约束。
