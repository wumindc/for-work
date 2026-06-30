// @author codex
import type { TopicDeepDive } from "../types/knowledge";

export const topicDeepDives: Record<string, TopicDeepDive> = {
  "agent-definition": {
    mentalModel: [
      "先把 Agent 理解成“模型驱动执行流”的软件系统，而不是一个会聊天的模型。",
      "Agent 的关键闭环是目标、状态、工具、环境反馈和停止条件；模型只负责在约束内做下一步决策。",
      "面试时先讲边界，再讲组成，最后讲项目里如何证明它真的完成任务。",
    ],
    interviewAngles: [
      "定义题：Agent 和普通 LLM 应用的区别。",
      "系统设计题：什么任务值得上 Agent，什么任务用 workflow 更好。",
      "项目追问题：你的 Agent 如何保存状态、调用工具、处理失败并做评测。",
    ],
    implementationChecklist: [
      "定义用户目标、成功标准、失败边界和不可执行动作。",
      "设计工具注册表和工具结果结构，确保模型拿到的是可行动信息。",
      "保存每轮 observe、tool call、observation、cost 和 final verdict。",
      "为开放任务设置最大步数、超时、人工介入和安全停止。",
    ],
    metrics: [
      "task_success_rate",
      "avg_steps",
      "tool_error_rate",
      "recovery_rate",
      "unsafe_action_block_rate",
    ],
    projectHooks: [
      "Paper Agent：模型决定检索、精读、对比还是继续查证。",
      "Web Agent：模型根据页面观察选择 click/type/extract。",
      "Coding Agent：模型根据测试反馈决定继续搜索、修改还是停止。",
    ],
  },
  "workflow-vs-agent": {
    mentalModel: [
      "Workflow 是代码控制路径，Agent 是模型控制路径。",
      "Workflow 适合稳定流程，Agent 适合步骤不可预知、需要环境反馈的任务。",
      "复杂度不是荣誉章，必须用指标证明 Agent 比 workflow 更好。",
    ],
    interviewAngles: [
      "架构取舍：为什么不用固定 DAG 或普通 RAG pipeline。",
      "成本题：Agent 增加成本和延迟后，收益在哪里。",
      "风险题：模型自主选择下一步会引入哪些安全和稳定性风险。",
    ],
    implementationChecklist: [
      "先做 deterministic workflow 或 single-call baseline。",
      "列出任务分支不可穷举、需要动态工具选择或多轮反馈的证据。",
      "用同一批 eval case 比较 workflow 和 Agent 的成功率、成本、延迟。",
      "保留降级路径：Agent 失败时能回到固定流程或人工处理。",
    ],
    metrics: [
      "baseline_success_rate",
      "agent_success_delta",
      "latency_delta",
      "cost_delta",
      "manual_escalation_rate",
    ],
    projectHooks: [
      "Travel Agent 中偏好收集可用 workflow，天气变化后重排更像 Agent。",
      "Paper Agent 中固定摘要是 workflow，多轮检索和证据验证更像 Agent。",
    ],
  },
  "react-loop": {
    mentalModel: [
      "ReAct 是把推理和行动交替组织，让模型用工具结果修正下一步。",
      "生产系统通常记录 thought summary，而不是输出完整隐式思维链。",
      "每一步都要能回答：为什么选这个工具、观察到了什么、下一步是否还需要继续。",
    ],
    interviewAngles: [
      "解释 ReAct 的 observe-reason-act-observe。",
      "追问 loop 停止条件、最大步数、工具失败和防循环。",
      "追问如何记录 trace 和做 trajectory eval。",
    ],
    implementationChecklist: [
      "模型输出结构化 action：final_answer、tool_call 或 ask_human。",
      "宿主执行工具前校验参数、权限、超时和风险等级。",
      "工具结果进入 observation，必要时摘要和引用压缩。",
      "loop 满足 final、max_steps、timeout、unsafe_action 或 verifier pass 时停止。",
    ],
    metrics: [
      "avg_steps",
      "loop_timeout_rate",
      "tool_selection_accuracy",
      "recovery_rate",
      "trajectory_score",
    ],
    projectHooks: [
      "Web Agent 每一步打开页面、观察元素、点击、再观察。",
      "Coding Agent 每一步搜索、读文件、改补丁、跑测试、再判断。",
    ],
  },
  "tool-schema": {
    mentalModel: [
      "工具 schema 是模型和外部世界之间的 API 契约。",
      "好的工具让模型少猜，坏的工具让模型在参数、边界和错误恢复上反复犯错。",
      "工具设计比提示词更接近生产 Agent 的核心工程能力。",
    ],
    interviewAngles: [
      "Function calling 和 tool use 的机制。",
      "如何设计模型友好的工具名、参数、返回值和错误码。",
      "高风险工具如何做权限、确认和审计。",
    ],
    implementationChecklist: [
      "工具名用动词加对象，例如 search_papers、browser_click。",
      "参数 schema 只暴露必要字段，枚举和范围尽量明确。",
      "返回值包含 status、data、error、source、next_action_hint。",
      "对长结果分页、截断、摘要化，并保留可追溯引用。",
    ],
    metrics: [
      "tool_call_success_rate",
      "invalid_args_rate",
      "tool_latency_p95",
      "retry_rate",
      "requires_confirmation_rate",
    ],
    projectHooks: [
      "Paper Agent 的 parse_pdf 返回 section/page/text，而不是整篇 PDF 文本。",
      "Web Agent 的 browser_observe 返回元素摘要和截图路径，而不是完整 DOM。",
    ],
  },
  "state-management": {
    mentalModel: [
      "State 是任务真实进展，messages 只是对话载体。",
      "长任务能不能恢复，取决于状态是否结构化保存，而不是上下文窗口有多大。",
      "状态应覆盖目标、约束、计划、工具结果、未完成事项和 checkpoint。",
    ],
    interviewAngles: [
      "Agent state 和 memory 的区别。",
      "长任务压缩后如何恢复。",
      "并发、多用户和多 Agent 状态如何隔离。",
    ],
    implementationChecklist: [
      "定义 run_id、user_id、session_id、plan、current_step 和 artifacts。",
      "每个工具调用后更新 state version 和 checkpoint。",
      "多用户按 tenant/user/session 隔离状态和权限。",
      "恢复时读取 state，而不是依赖上一轮聊天历史。",
    ],
    metrics: [
      "resume_success_rate",
      "state_conflict_rate",
      "checkpoint_write_latency",
      "lost_context_incidents",
    ],
    projectHooks: [
      "Coding Agent 保存 changed_files、tests_run、open_risks。",
      "Travel Agent 保存用户偏好、预算、地点候选和已确认事项。",
    ],
  },
  "long-term-memory": {
    mentalModel: [
      "长期记忆是跨会话可复用的知识和偏好，不是聊天记录垃圾桶。",
      "写入长期记忆比读取更危险，因为错误写入会长期污染后续任务。",
      "长期记忆要有来源、时间、置信度、更新和删除机制。",
    ],
    interviewAngles: [
      "短期记忆和长期记忆如何设计。",
      "历史记录量很大时如何检索。",
      "记忆衰退、冲突和多用户隔离。",
    ],
    implementationChecklist: [
      "写入前做重要性评分、去重、敏感信息过滤和用户授权。",
      "存储层可组合关系库、文档库、向量库和知识图谱。",
      "检索排序结合 semantic relevance、recency、importance 和 source confidence。",
      "冲突记忆触发澄清或版本化，不直接合并。",
    ],
    metrics: [
      "memory_hit_rate",
      "memory_precision",
      "stale_memory_rate",
      "conflict_resolution_rate",
      "privacy_violation_count",
    ],
    projectHooks: [
      "Paper Agent 长期保存阅读笔记、论文主题和引用关系。",
      "Coding Agent 可保存项目约定、常用命令和用户偏好。",
    ],
  },
  "context-layers": {
    mentalModel: [
      "Context Engineering 是控制信息流入模型的系统工程，不是把 prompt 写得更漂亮。",
      "不同层的信息可信度、生命周期和预算不同，混在一起就容易污染。",
      "上下文质量直接影响工具选择、引用准确性、成本和安全。",
    ],
    interviewAngles: [
      "Context Engineering 和 Prompt Engineering 的区别。",
      "context builder 如何设计和测试。",
      "外部证据中有恶意指令时如何隔离。",
    ],
    implementationChecklist: [
      "按 system、task、state、memory、retrieved evidence、recent trace 分层。",
      "每层定义预算、排序、来源、可信度和截断策略。",
      "证据层保留 source_id、quote/page/section，而不是只保留摘要。",
      "生成前输出 context manifest，便于 debug 和 eval。",
    ],
    metrics: [
      "prompt_tokens",
      "evidence_coverage",
      "citation_precision",
      "context_drift_rate",
      "injection_block_rate",
    ],
    projectHooks: [
      "Paper Agent 将论文证据和用户任务分层输入。",
      "Coding Agent 将代码片段、测试结果和最近 trace 分层输入。",
    ],
  },
  "rag-pipeline": {
    mentalModel: [
      "RAG 把问题拆成检索问题和生成问题，先让答案有证据来源。",
      "RAG 的关键不是向量库，而是切分、召回、重排、证据选择、引用和评测的闭环。",
      "面试中要能从错误答案反推是 chunk、retriever、reranker 还是 generator 的问题。",
    ],
    interviewAngles: [
      "完整 RAG pipeline。",
      "召回率、引用准确率、幻觉率怎么评测。",
      "Graph RAG、multimodal RAG、agentic RAG 的边界。",
    ],
    implementationChecklist: [
      "chunk 时保留文档、标题、层级、页码和时间等 metadata。",
      "检索阶段记录 query、topK、score、filter 和召回证据。",
      "重排阶段输出 selected evidence 和 dropped reason。",
      "生成阶段要求 claim-to-evidence 映射和不确定性说明。",
    ],
    metrics: [
      "context_recall",
      "answer_relevance",
      "citation_precision",
      "hallucination_rate",
      "latency_p95",
    ],
    projectHooks: [
      "Paper Agent 用 RAG 做论文检索、精读和综述。",
      "企业知识库 Agent 用 RAG 做带引用回答和权限过滤。",
    ],
  },
  "citation-grounding": {
    mentalModel: [
      "Grounding 要求答案中的关键 claim 能被具体证据支持。",
      "引用链接存在不代表引用有效，必须检查内容是否真的支撑结论。",
      "没有证据的结论要降级为不确定，而不是让模型补完。",
    ],
    interviewAngles: [
      "如何降低幻觉。",
      "如何做 citation precision eval。",
      "多来源证据冲突时如何回答。",
    ],
    implementationChecklist: [
      "生成前将 evidence id 显式放入上下文。",
      "生成后解析 claim->evidence 映射。",
      "用人工或 LLM-as-judge 检查引用是否支持 claim。",
      "对无证据、弱证据、冲突证据给不同输出模板。",
    ],
    metrics: [
      "claim_coverage",
      "citation_precision",
      "unsupported_claim_rate",
      "conflicting_evidence_rate",
    ],
    projectHooks: [
      "Paper Agent 每条论文结论带 paper/page/section。",
      "RAG 问答每个关键句带文档片段 ID 和 URL。",
    ],
  },
  "component-eval": {
    mentalModel: [
      "Component eval 是把 Agent 拆开测，先定位局部能力是否可靠。",
      "端到端失败不可怕，可怕的是不知道是检索、工具、模型还是上下文错了。",
      "好的 eval case 包含输入、期望行为、禁止行为和评分方式。",
    ],
    interviewAngles: [
      "Agent 评测分层。",
      "RAG retriever、tool、prompt 如何分别测。",
      "如何从 eval 结果驱动迭代。",
    ],
    implementationChecklist: [
      "为 retriever 写 recall@k 和 evidence coverage case。",
      "为 tool 写参数合法、空结果、超时和权限 case。",
      "为 prompt/output parser 写结构化输出和边界输入 case。",
      "失败样例进入 regression suite。",
    ],
    metrics: [
      "unit_pass_rate",
      "retrieval_recall_at_k",
      "parser_valid_rate",
      "tool_success_rate",
    ],
    projectHooks: [
      "Paper Agent 单独测 search_papers 和 parse_pdf。",
      "Web Agent 单独测 observe、click、extract。",
    ],
  },
  "trajectory-eval": {
    mentalModel: [
      "Trajectory eval 看 Agent 走的路是否合理，而不是只看最后答没答对。",
      "一个 Agent 可以最终成功，但路径绕远、工具选择危险或成本不可接受。",
      "轨迹评测是区分 demo 和工程系统的关键证据。",
    ],
    interviewAngles: [
      "为什么只看 final answer 不够。",
      "如何评价工具选择、步数、恢复和安全。",
      "如何设计 trace rubric。",
    ],
    implementationChecklist: [
      "保存每步 state、observation、action、tool result、cost、latency。",
      "rubric 评分工具选择是否必要、是否绕路、是否违反安全边界。",
      "统计不同失败类型并和 component eval 对齐。",
      "对失败轨迹做 replay 和人工标注。",
    ],
    metrics: [
      "trajectory_score",
      "avg_steps",
      "unnecessary_tool_call_rate",
      "recovery_rate",
      "unsafe_action_attempts",
    ],
    projectHooks: [
      "Web Agent 用截图和 DOM trace 回放点击路径。",
      "Coding Agent 用命令和 diff trace 回放修复过程。",
    ],
  },
  "guardrails": {
    mentalModel: [
      "Guardrails 是多层防线，不是一个万能系统提示词。",
      "Agent 会调用工具，所以安全必须落在输入、上下文、工具、输出、权限和审计上。",
      "高风险动作要让系统暂停，而不是让模型自行决定是否安全。",
    ],
    interviewAngles: [
      "如何保证 Agent 安全可控。",
      "工具权限如何分级。",
      "prompt injection 和数据泄漏如何防。",
    ],
    implementationChecklist: [
      "输入层做 relevance、jailbreak、PII 和恶意内容检查。",
      "上下文层标记 untrusted evidence，隔离外部指令。",
      "工具层按 read/write、可逆性、财务影响和数据敏感度分级。",
      "输出层检查泄密、品牌风险和 unsupported claims。",
    ],
    metrics: [
      "guardrail_trigger_rate",
      "false_positive_rate",
      "unsafe_action_block_rate",
      "human_escalation_rate",
    ],
    projectHooks: [
      "Travel Agent 拦截付款、预订和证件输入。",
      "Web Agent 拦截登录、验证码、付费墙和发布删除动作。",
    ],
  },
  "browser-observation": {
    mentalModel: [
      "Browser Agent 的难点是观察和验证，不是点击本身。",
      "DOM、可访问性树和截图各有盲区，观察层要把它们压成模型可用状态。",
      "观察输出必须短、稳定、可追溯，否则上下文会被网页噪声淹没。",
    ],
    interviewAngles: [
      "Browser Agent 如何观察页面。",
      "DOM-only 和 vision 的取舍。",
      "网页变化和元素定位失败如何恢复。",
    ],
    implementationChecklist: [
      "观察层输出 URL、title、visible text summary、interactive elements、screenshot path。",
      "优先可访问性 role/name，再退到稳定属性和局部 selector。",
      "每次动作后验证 URL、DOM 摘要、截图或目标文本变化。",
      "处理弹窗、加载、disabled、超时和页面跳转。",
    ],
    metrics: [
      "step_success_rate",
      "selector_failure_rate",
      "avg_observation_tokens",
      "recovery_rate",
    ],
    projectHooks: [
      "Web Agent 保存每步截图和 DOM 摘要，失败时能回放。",
      "公开文档抽取任务用 URL 和引用证明来源。",
    ],
  },
  "coding-harness": {
    mentalModel: [
      "Coding Agent 的核心不是一次性生成代码，而是在真实 repo 中观察、修改、测试、再迭代。",
      "Harness 决定模型能看到什么、能做什么、失败后如何反馈。",
      "测试结果、diff 和 shell 输出是 coding agent 的环境 ground truth。",
    ],
    interviewAngles: [
      "Coding Agent harness 包含哪些工具。",
      "权限和 sandbox 如何设计。",
      "如何处理上下文压缩、测试失败和回滚。",
    ],
    implementationChecklist: [
      "工具层包含 rg/search、read、apply_patch、run_command、run_tests、git_diff。",
      "探索阶段默认只读，写入阶段 preview diff，执行高风险命令需确认。",
      "测试失败后把失败命令、错误摘要和相关文件放入下一轮上下文。",
      "完成前必须跑验证命令并保留证据。",
    ],
    metrics: [
      "issue_resolution_rate",
      "test_pass_rate",
      "avg_iterations",
      "patch_size",
      "review_findings",
    ],
    projectHooks: [
      "用 issue-to-patch-to-test 流程讲项目。",
      "用 SWE-bench 思路解释为什么真实代码库比 toy task 难。",
    ],
  },
  "framework-selection": {
    mentalModel: [
      "框架是组织状态、工具、编排和追踪的手段，不是 Agent 能力本身。",
      "选型先看问题结构，再看生态；不要为了简历堆框架。",
      "面试官更关心你知道何时不用框架。",
    ],
    interviewAngles: [
      "LangGraph、Agents SDK、Pydantic AI、LlamaIndex 怎么选。",
      "原生 API 和框架的 trade-off。",
      "框架如何支持 eval、trace、guardrails 和 human-in-the-loop。",
    ],
    implementationChecklist: [
      "先用原生 API 或最小 loop 建 baseline。",
      "状态流复杂、需要持久执行时考虑 LangGraph。",
      "OpenAI 生态、handoff、guardrails、tracing 场景考虑 Agents SDK。",
      "类型安全 Python 应用可考虑 Pydantic AI，数据密集 RAG 可考虑 LlamaIndex。",
    ],
    metrics: [
      "implementation_complexity",
      "debuggability",
      "eval_integration_cost",
      "runtime_cost",
      "team_maintainability",
    ],
    projectHooks: [
      "Paper Agent 可用 LangGraph 表达检索-精读-综述状态流。",
      "Travel Agent 可用 Agents SDK 表达 triage、handoff 和 guardrails。",
    ],
  },
  "project-storytelling": {
    mentalModel: [
      "项目讲述不是“我用了大模型”，而是“我解决了什么开放任务，并证明系统可靠”。",
      "一个 Agent 项目要能讲清用户、工具、状态、上下文、评测、安全和指标。",
      "失败案例和改进动作往往比成功 demo 更能体现工程深度。",
    ],
    interviewAngles: [
      "为什么这个场景需要 Agent。",
      "你的工具、上下文、memory 和 eval 怎么设计。",
      "线上失败或指标不佳时如何排查。",
    ],
    implementationChecklist: [
      "准备 3 分钟版本：场景、架构、指标。",
      "准备 8 分钟版本：工具、状态、上下文、评测、安全。",
      "准备 15 分钟版本：失败归因、消融实验、成本优化和后续计划。",
      "每个项目准备一张架构图、一张 eval 表和一个失败复盘。",
    ],
    metrics: [
      "task_success_rate",
      "eval_case_count",
      "failure_taxonomy_coverage",
      "cost_reduction",
      "latency_p95",
    ],
    projectHooks: [
      "Paper Agent 讲证据引用和幻觉控制。",
      "Web Agent 讲观察、动作、trace 和安全边界。",
      "Coding Agent 讲 harness、测试反馈和权限控制。",
    ],
  },
  "agent-core-modules": {
    mentalModel: [
      "Agent 可以拆成目标理解、规划、工具、状态/记忆、执行、观察反馈、评测与安全七层。",
      "模块拆分的价值是让失败可定位：是目标错、计划错、工具错、状态丢，还是安全拦截不够。",
      "面试里不要只背模块名，要能说明模块之间的数据流和控制权在哪里。",
    ],
    interviewAngles: [
      "架构题：从 0 设计一个 Agent runtime。",
      "追问题：规划器、工具层、记忆层和评测层分别解决什么问题。",
      "排障题：一个任务失败时如何按模块定位原因。",
    ],
    implementationChecklist: [
      "输入层解析 user goal、约束、成功标准和风险级别。",
      "规划层生成可验证步骤，执行层只接受结构化 action。",
      "状态层保存 plan、current_step、tool_results、artifacts 和 open_risks。",
      "观察层把工具或环境反馈压缩成下一步可用信息。",
      "安全和评测层贯穿 loop，而不是最后才做检查。",
    ],
    metrics: [
      "task_success_rate",
      "plan_revision_count",
      "tool_error_rate",
      "state_recovery_rate",
      "guardrail_intervention_rate",
    ],
    projectHooks: [
      "Paper Agent：目标是综述质量，工具是检索/PDF 解析，观察是证据覆盖。",
      "Web Agent：目标是完成网页任务，观察是页面状态，安全层限制高风险动作。",
      "Coding Agent：目标是通过测试，状态层记录 diff、命令和未解决风险。",
    ],
  },
  "agent-failure-modes": {
    mentalModel: [
      "Agent 失败通常不是“模型不聪明”，而是目标、上下文、工具、状态、权限或评测闭环断了。",
      "常见模式包括循环、目标漂移、工具幻觉、状态丢失、证据不足、错误恢复失败和越权动作。",
      "好的工程回答要从可观测 trace 中定位失败，而不是只说换更强模型。",
    ],
    interviewAngles: [
      "线上 Agent 不稳定如何排查。",
      "如何避免无限循环、重复调用工具和错误路径越走越远。",
      "失败后怎么恢复，什么时候转人工。",
    ],
    implementationChecklist: [
      "为每个 step 记录 action、args、observation、error、latency 和 cost。",
      "设置 max_steps、重复动作检测、目标一致性检查和 verifier gate。",
      "对工具错误区分 transient、invalid_args、permission_denied 和 semantic_failure。",
      "失败进入 recovery policy：重试、换工具、重规划、降级或转人工。",
    ],
    metrics: [
      "loop_rate",
      "goal_drift_rate",
      "semantic_tool_failure_rate",
      "recovery_success_rate",
      "human_escalation_rate",
    ],
    projectHooks: [
      "Web Agent 用 trace 回放解释为什么点错元素，并展示 selector 修复策略。",
      "Paper Agent 用 unsupported claim 说明 grounding 失败如何被发现。",
      "Coding Agent 用测试失败归因展示是上下文缺失还是 patch 方向错。",
    ],
  },
  "planning-methods": {
    mentalModel: [
      "Planning 是把开放目标变成可执行、可验证步骤的过程。",
      "CoT 强在局部推理，ToT 强在搜索多路径，Plan-and-Solve 强在先立骨架再执行。",
      "生产系统更关注显式计划、检查点和重规划，而不是暴露完整思维链。",
    ],
    interviewAngles: [
      "CoT、ToT、ReAct、Plan-and-Solve 的区别和适用场景。",
      "什么时候需要显式 planner，什么时候直接 tool loop 就够。",
      "计划如何验证、如何重写、如何避免越计划越错。",
    ],
    implementationChecklist: [
      "把 plan step 写成 action、expected_observation、done_condition。",
      "执行前检查依赖、权限、成本和是否需要用户确认。",
      "每步后用 observation 更新 plan 状态，失败时只重写受影响部分。",
      "对高风险任务加 reviewer/verifier，而不是让 planner 自说自话。",
    ],
    metrics: [
      "plan_validity_rate",
      "step_completion_rate",
      "replan_rate",
      "search_branch_count",
      "verifier_pass_rate",
    ],
    projectHooks: [
      "Travel Agent 先规划信息收集、候选生成、约束检查和最终确认。",
      "Paper Agent 对综述任务先拆检索维度，再精读和对比。",
      "Coding Agent 把修 bug 拆成复现、定位、修改、测试和回归检查。",
    ],
  },
  "tool-registry": {
    mentalModel: [
      "Tool registry 是 Agent 的能力目录，也是权限和可观测性的入口。",
      "模型不应该凭记忆猜工具能力，而应该从 registry 拿到名称、schema、描述、风险和返回契约。",
      "registry 设计得好，工具选择、参数生成、权限检查和 trace 分析都会更稳定。",
    ],
    interviewAngles: [
      "工具很多时如何让模型选对工具。",
      "工具描述、schema、权限、版本和健康状态怎么管理。",
      "如何做工具路由、灰度和下线。",
    ],
    implementationChecklist: [
      "为每个工具登记 name、description、input_schema、output_schema、risk_level。",
      "增加 owner、version、timeout、rate_limit、permission_scope 和 examples。",
      "执行前做 schema validation、permission check 和 risk confirmation。",
      "执行后记录 status、error_code、latency、tokens 和 observation summary。",
    ],
    metrics: [
      "tool_selection_accuracy",
      "invalid_args_rate",
      "tool_availability",
      "permission_denial_rate",
      "tool_latency_p95",
    ],
    projectHooks: [
      "Paper Agent 把 search、parse_pdf、extract_citation 作为不同风险的只读工具。",
      "Web Agent 把 observe/click/type/extract/download 分开登记和限权。",
      "Coding Agent 把 read/apply_patch/run_tests/git_diff 的写权限边界讲清楚。",
    ],
  },
  "tool-error-recovery": {
    mentalModel: [
      "工具失败不是一个布尔值，必须分 transient error、参数错误、权限错误、语义失败和外部状态变化。",
      "恢复策略要让 Agent 知道下一步能做什么，而不是把原始异常丢回模型。",
      "优秀的 recovery 能显著提升任务完成率，也能降低无意义重试成本。",
    ],
    interviewAngles: [
      "工具调用失败后 Agent 怎么办。",
      "如何设计 retry、fallback、replan 和 human-in-the-loop。",
      "如何避免同一个错误无限重试。",
    ],
    implementationChecklist: [
      "工具返回结构包含 status、error_code、retryable、hint 和 partial_data。",
      "对 transient error 使用指数退避和最大重试次数。",
      "对 invalid_args 让模型修参数，对 permission_denied 走确认或降级。",
      "对 semantic_failure 记录观察结果并触发重规划或换工具。",
    ],
    metrics: [
      "retry_success_rate",
      "recovery_rate",
      "repeat_error_rate",
      "fallback_usage_rate",
      "wasted_tool_call_rate",
    ],
    projectHooks: [
      "Web Agent 元素找不到时重新 observe、换 locator 或请求人工确认。",
      "Paper Agent PDF 解析失败时切换 OCR、换来源或标记证据缺失。",
      "Coding Agent 测试失败时分类为环境问题、断言变化或代码逻辑错误。",
    ],
  },
  "function-calling": {
    mentalModel: [
      "Function Calling 是让模型输出结构化工具调用意图，真正执行仍由宿主程序完成。",
      "它解决的是自然语言到 API 参数的桥接，不等于安全、权限、重试和状态管理自动完成。",
      "面试里要强调模型只提出 call，系统负责校验、执行、观察和继续 loop。",
    ],
    interviewAngles: [
      "Function Calling 和普通 JSON 输出有什么区别。",
      "多工具、多轮调用和并行工具调用怎么处理。",
      "工具 schema 变更、参数错误和注入攻击如何防。",
    ],
    implementationChecklist: [
      "定义严格 schema，使用枚举、必填字段、范围和描述减少参数歧义。",
      "宿主对 arguments 做 runtime validation，不信任模型输出。",
      "执行结果写回 messages/state，并让模型基于 observation 决定下一步。",
      "高风险函数前置确认，敏感返回值做脱敏和最小化。",
    ],
    metrics: [
      "valid_call_rate",
      "argument_repair_rate",
      "tool_chain_success_rate",
      "unsafe_call_block_rate",
      "schema_compatibility_errors",
    ],
    projectHooks: [
      "Travel Agent 用函数调用获取天气、预算估算和候选行程。",
      "Paper Agent 用 search_papers、parse_pdf、extract_claims 串成研究流。",
      "Web Agent 用 browser_click/browser_type，但执行前由系统校验元素和权限。",
    ],
  },
  "short-term-memory": {
    mentalModel: [
      "短期记忆是当前任务的工作台，保存目标、最近观察、临时结论和下一步。",
      "它和长期记忆的区别是生命周期短、强任务相关、更新频繁。",
      "短期记忆不能等同于 messages，需要结构化字段支撑恢复和压缩。",
    ],
    interviewAngles: [
      "短期记忆、长期记忆和 state 的区别。",
      "多步任务中模型如何记住已经做过什么。",
      "上下文窗口不够时短期记忆如何压缩。",
    ],
    implementationChecklist: [
      "维护 task_goal、constraints、current_plan、recent_observations、scratch_facts。",
      "每个工具调用后更新 working memory，并删除过期或无关信息。",
      "把关键决策和未完成事项写入 checkpoint，而不是只留在 prompt。",
      "压缩时保留事实、证据、决策、风险和下一步动作。",
    ],
    metrics: [
      "resume_success_rate",
      "duplicate_step_rate",
      "working_memory_token_cost",
      "lost_fact_rate",
      "state_update_latency",
    ],
    projectHooks: [
      "Coding Agent 短期记忆保存已读文件、失败测试和当前假设。",
      "Web Agent 短期记忆保存当前页面、已尝试 selector 和表单状态。",
      "Travel Agent 短期记忆保存用户刚确认的预算、时间和偏好。",
    ],
  },
  "memory-decay": {
    mentalModel: [
      "记忆衰退不是简单删除旧内容，而是让低置信、低重要、低近期的信息逐渐降低影响力。",
      "污染控制比召回更多记忆更重要，错误记忆会稳定制造错误答案。",
      "记忆系统要处理过期、冲突、来源不明和敏感信息。",
    ],
    interviewAngles: [
      "长期记忆如何避免越用越脏。",
      "记忆冲突和过期偏好如何处理。",
      "如何评估 memory precision 而不是只看 hit rate。",
    ],
    implementationChecklist: [
      "写入时记录 source、timestamp、confidence、importance、scope 和 consent。",
      "读取排序结合 relevance、recency、importance、confidence 和 user override。",
      "对冲突记忆触发澄清或版本化，不直接合并。",
      "定期做 decay、归档、删除和敏感信息扫描。",
    ],
    metrics: [
      "memory_precision",
      "stale_memory_rate",
      "conflict_rate",
      "decay_eviction_rate",
      "user_correction_rate",
    ],
    projectHooks: [
      "个人助理 Agent 记住偏好时要区分长期偏好和一次性约束。",
      "Coding Agent 项目约定变化后要更新旧命令和废弃目录。",
      "Paper Agent 主题笔记要保留来源和更新时间，避免旧结论误导新综述。",
    ],
  },
  "context-compression": {
    mentalModel: [
      "上下文压缩的目标不是变短，而是在 token 预算内保真关键状态。",
      "压缩最怕丢失约束、证据、决策、失败尝试和下一步。",
      "好的压缩产物应该像交接文档，可以让下一轮模型继续工作。",
    ],
    interviewAngles: [
      "长上下文任务如何压缩而不丢信息。",
      "摘要、抽取、层级压缩和向量检索各自适合什么。",
      "如何评估 compression fidelity。",
    ],
    implementationChecklist: [
      "按目标、约束、事实、证据、决策、已完成、未完成、风险分段压缩。",
      "引用型任务保留 source/page/quote，不只保留自然语言总结。",
      "压缩前后跑 consistency check，验证关键字段没有丢。",
      "对工具 trace 做分层：完整 trace 存储，prompt 只带摘要和关键 observation。",
    ],
    metrics: [
      "compression_ratio",
      "fidelity_score",
      "lost_constraint_rate",
      "resume_task_success_rate",
      "prompt_token_savings",
    ],
    projectHooks: [
      "Coding Agent 压缩时保留文件 diff、测试命令、失败原因和下一步。",
      "Paper Agent 压缩时保留 claim-evidence 映射和引用来源。",
      "Web Agent 压缩时保留页面状态、已尝试动作和验证码/登录等阻塞点。",
    ],
  },
  "multi-agent-roles": {
    mentalModel: [
      "多 Agent 不是把模型数量变多，而是把职责、上下文和权限边界拆清楚。",
      "常见角色包括 planner、executor、researcher、critic、verifier、router 和 domain expert。",
      "多 Agent 会增加协调成本，只有任务天然可分工或需要制衡时才值得上。",
    ],
    interviewAngles: [
      "多 Agent 相比单 Agent 的收益和成本。",
      "角色分工、通信协议和冲突解决怎么设计。",
      "如何避免多个 Agent 互相放大错误。",
    ],
    implementationChecklist: [
      "定义每个 Agent 的职责、输入、输出、权限和停止条件。",
      "共享状态使用结构化 blackboard 或 orchestrator，不靠自由聊天传话。",
      "关键结论由 verifier 检查证据和一致性。",
      "限制 agent-to-agent 轮数，避免辩论式空转。",
    ],
    metrics: [
      "task_success_delta",
      "coordination_overhead",
      "conflict_resolution_rate",
      "verifier_catch_rate",
      "cost_per_success",
    ],
    projectHooks: [
      "Paper Agent 可拆 researcher、summarizer、citation verifier。",
      "Coding Agent 可拆 implementer、test runner、reviewer。",
      "Travel Agent 可拆 preference collector、planner、risk checker。",
    ],
  },
  "handoff-pattern": {
    mentalModel: [
      "Handoff 是把任务所有权从一个 Agent 或 workflow 节点移交给另一个。",
      "核心不是一句“交给你了”，而是交接目标、状态、证据、权限、未完成项和退出条件。",
      "handoff 失败常表现为上下文丢失、责任不清、重复工作和越权执行。",
    ],
    interviewAngles: [
      "多 Agent 或客服场景如何做 handoff。",
      "handoff message/schema 应包含什么。",
      "如何判断交接成功，失败后怎么回退。",
    ],
    implementationChecklist: [
      "定义 handoff payload：goal、reason、state_summary、artifacts、constraints、next_actions。",
      "接收方先做 capability 和 permission check，再 accept 或 reject。",
      "交接后写入 ownership、timestamp 和 audit trace。",
      "失败时返回上游、请求澄清或转人工。",
    ],
    metrics: [
      "handoff_success_rate",
      "handoff_rejection_rate",
      "context_loss_incidents",
      "duplicate_work_rate",
      "handoff_latency",
    ],
    projectHooks: [
      "Travel Agent 从需求收集 Agent handoff 给规划 Agent，再给风险检查 Agent。",
      "Coding Agent 压缩后把当前任务交给下一轮模型继续执行。",
      "客服 Agent 从通用问答 handoff 到订单、退款或人工专员。",
    ],
  },
  "mcp-fundamentals": {
    mentalModel: [
      "MCP 是让模型客户端以统一方式接入 tools、resources 和 prompts 的协议层。",
      "它把能力提供方做成 server，让客户端不必为每个工具写一套私有适配。",
      "面试时要讲清协议边界：MCP 负责暴露能力，不自动保证业务安全。",
    ],
    interviewAngles: [
      "MCP 解决什么问题，和 function calling、插件、普通 API 的关系。",
      "tools、resources、prompts 分别是什么。",
      "MCP server 如何做鉴权、权限和数据隔离。",
    ],
    implementationChecklist: [
      "按资源读取、工具执行和提示模板拆能力，不把所有东西塞进一个 tool。",
      "为 tool schema、返回结构、错误码和权限范围写清契约。",
      "server 侧做鉴权、审计、速率限制和敏感数据最小化。",
      "client 侧仍要做人机确认、风险分级和 trace 记录。",
    ],
    metrics: [
      "tool_invocation_success_rate",
      "resource_read_latency",
      "permission_violation_count",
      "schema_error_rate",
      "server_availability",
    ],
    projectHooks: [
      "Coding Agent 可以通过 MCP 接 IDE、GitHub、文档和本地命令能力。",
      "企业知识库 Agent 用 resources 暴露只读资料，用 tools 暴露受控动作。",
      "个人效率 Agent 用多个 MCP server 统一日历、邮件和文件能力。",
    ],
  },
  "trace-replay": {
    mentalModel: [
      "Trace 是 Agent 每一步决策和环境反馈的黑匣子记录，Replay 是把失败重新跑出来。",
      "没有 trace，就很难区分模型、工具、上下文、权限还是外部环境导致失败。",
      "Replay 不一定完全确定性，但至少要能重建输入、工具输出和关键状态。",
    ],
    interviewAngles: [
      "Agent eval 和 observability 怎么做。",
      "线上失败如何复现和归因。",
      "trace 数据如何用于回归测试和数据集沉淀。",
    ],
    implementationChecklist: [
      "记录 run_id、step_id、prompt manifest、tool call、observation、state diff 和 verdict。",
      "对外部工具结果做快照或 fixture，支持离线 replay。",
      "失败 trace 进入 case library，标注 failure taxonomy。",
      "用 replay 验证新 prompt、新工具 schema 或新模型是否修复问题。",
    ],
    metrics: [
      "trace_coverage",
      "replay_success_rate",
      "failure_reproduction_rate",
      "regression_catch_rate",
      "mean_time_to_diagnosis",
    ],
    projectHooks: [
      "Web Agent 用截图和 DOM 摘要 replay 点击失败。",
      "Coding Agent 用命令输出、diff 和测试日志 replay 修复过程。",
      "Paper Agent 用检索结果快照 replay 幻觉和引用错误。",
    ],
  },
  "tool-permissions": {
    mentalModel: [
      "工具权限要按动作风险分级，而不是只按用户是否登录分级。",
      "只读、可逆写入、不可逆写入、外部发布、财务/隐私动作的安全要求不同。",
      "Human-in-the-loop 是权限系统的一部分，不是产品体验上的补丁。",
    ],
    interviewAngles: [
      "Agent 调用工具如何做安全边界。",
      "哪些动作需要用户确认，哪些可以自动执行。",
      "如何设计 audit、rollback 和 least privilege。",
    ],
    implementationChecklist: [
      "为工具标注 read/write、reversible、external_effect、sensitive_data 和 money_movement。",
      "根据风险级别决定 allow、confirm、deny 或 ask_human。",
      "写动作前展示 preview diff、目标对象、影响范围和回滚方式。",
      "所有高风险动作写 audit log，包含操作者、理由和确认记录。",
    ],
    metrics: [
      "unsafe_action_block_rate",
      "confirmation_accept_rate",
      "permission_denial_rate",
      "rollback_success_rate",
      "audit_completeness",
    ],
    projectHooks: [
      "Coding Agent 应先展示 diff，再写文件；危险 shell 命令需要确认。",
      "Travel Agent 预订和支付必须 human confirmation。",
      "Web Agent 发布、删除、购买、登录和上传文件要高风险拦截。",
    ],
  },
  "prompt-injection": {
    mentalModel: [
      "Prompt Injection 的本质是把不可信数据伪装成对模型的指令。",
      "Agent 比普通聊天更危险，因为它能读私密上下文、调用工具并产生外部副作用。",
      "防护重点是指令层级、数据隔离、工具权限和输出验证的组合。",
    ],
    interviewAngles: [
      "网页或文档里写“忽略之前指令”怎么办。",
      "如何防止 RAG/Browser Agent 泄露系统提示和用户数据。",
      "Prompt injection 和 jailbreak 的区别。",
    ],
    implementationChecklist: [
      "把外部网页、文档、邮件标记为 untrusted data，不允许其覆盖 system/developer 指令。",
      "context builder 分层拼接，并显式提醒模型外部内容只作证据。",
      "工具调用前做 allowlist、权限检查和敏感数据最小化。",
      "输出前检查是否泄露 secrets、system prompt、PII 或无证据 claim。",
    ],
    metrics: [
      "injection_detection_rate",
      "data_exfiltration_block_rate",
      "false_positive_rate",
      "unsafe_tool_call_rate",
      "red_team_pass_rate",
    ],
    projectHooks: [
      "Web Agent 读取页面时必须隔离网页中的恶意指令。",
      "Paper Agent 处理论文或网页时只把内容当证据，不当系统指令。",
      "企业知识库 Agent 要按用户权限过滤检索结果，防止越权引用。",
    ],
  },
  "playwright-actions": {
    mentalModel: [
      "Playwright 动作封装的核心是稳定定位、动作执行和结果验证的闭环。",
      "浏览器自动化不能只 click/type，还要 wait、assert、screenshot、recover。",
      "Agent 层看到的是抽象动作，执行层负责把动作转成可靠的浏览器操作。",
    ],
    interviewAngles: [
      "Browser Agent 如何用 Playwright 操作网页。",
      "元素定位失败、页面加载慢、弹窗和动态 DOM 怎么处理。",
      "如何把 screenshot、DOM 和 accessibility tree 结合给模型。",
    ],
    implementationChecklist: [
      "优先使用 role/name/test id 等稳定 locator，少依赖脆弱 CSS 路径。",
      "每个动作后等待目标状态，而不是固定 sleep。",
      "动作封装返回 before/after URL、目标元素、截图、错误码和验证结果。",
      "失败时重新 observe、缩小元素范围、改 locator 或转人工确认。",
    ],
    metrics: [
      "action_success_rate",
      "locator_stability",
      "wait_timeout_rate",
      "visual_verification_pass_rate",
      "recovery_success_rate",
    ],
    projectHooks: [
      "Web Agent 把 click/type/extract 做成可审计工具。",
      "电商或表单场景用 screenshot 证明动作前后状态变化。",
      "公开网页采集任务用 URL、DOM 摘要和提取字段做 trace。",
    ],
  },
  "context-compaction": {
    mentalModel: [
      "Coding Agent 上下文压缩是把长时间开发现场整理成可恢复的工程状态。",
      "压缩必须保留用户最新请求、已改文件、关键决策、验证结果、未完成项和阻塞条件。",
      "好的 compaction 让下一轮继续工作时不误改、不重复、不忘测试。",
    ],
    interviewAngles: [
      "长任务 coding agent 如何跨上下文继续。",
      "压缩时哪些信息必须保留，哪些可以丢。",
      "如何避免压缩后误解用户最新指令或覆盖他人改动。",
    ],
    implementationChecklist: [
      "记录工作目录、仓库状态、已触碰文件、用户约束和当前 plan。",
      "保留构建/测试命令及结果、浏览器验证证据和 open risks。",
      "明确哪些变更来自用户、哪些来自 agent，避免自动 revert。",
      "恢复后先读摘要和相关文件，再继续最小范围修改。",
    ],
    metrics: [
      "resume_accuracy",
      "duplicate_work_rate",
      "lost_instruction_rate",
      "post_compaction_regression_rate",
      "verification_carryover_rate",
    ],
    projectHooks: [
      "Coding Agent 可把多小时修复压缩成下一轮可执行清单。",
      "长项目开发中用 compaction 保留设计计划和验收证据。",
      "PR 修复场景保留 review comments、已处理项和剩余风险。",
    ],
  },
  "reflection-review": {
    mentalModel: [
      "Reflection 是让模型对已有输出做批判、修订和补强，但它不能替代外部验证。",
      "自我审查适合可迭代任务，例如研究总结、代码修复、方案设计和长答案润色。",
      "关键风险是模型自我强化错误，所以必须引入测试、工具证据或独立 verifier。",
    ],
    interviewAngles: [
      "Reflection 和普通多轮 prompt 有什么区别。",
      "什么时候用自我审查，什么时候必须用外部验证器。",
      "如何避免 reflection loop 无限循环或越改越差。",
    ],
    implementationChecklist: [
      "让 reviewer 输出结构化 verdict、issue list、evidence gap 和 revision plan。",
      "把生成、审查、修订分成独立 step，并记录 revision chain。",
      "设置最大轮数、质量阈值和无改进停止条件。",
      "对代码、引用、网页动作等任务用测试或工具结果约束自评结论。",
    ],
    metrics: [
      "revision_improvement_rate",
      "verifier_pass_rate",
      "self_approval_false_positive_rate",
      "avg_revision_rounds",
      "loop_stop_rate",
    ],
    projectHooks: [
      "Coding Agent 中 reviewer 根据测试失败和 diff 给出修订建议。",
      "Paper Agent 中 citation verifier 检查综述 claim 是否被证据支持。",
      "Project Story 中可讲失败复盘：自评通过但外部 eval 未过，之后引入 verifier。",
    ],
  },
  "hybrid-search": {
    mentalModel: [
      "Hybrid Search 是把关键词召回、向量召回和结构化过滤组合起来。",
      "关键词擅长精确术语、编号、代码符号；向量擅长语义近似；过滤负责权限、时间、类型等约束。",
      "面试中要能说明融合策略如何服务召回率，而不是只说“BM25 + Vector”。",
    ],
    interviewAngles: [
      "为什么只用向量检索不够。",
      "BM25、向量检索、metadata filter 和 rerank 如何组合。",
      "如何评估 hybrid search 是否真的提升 RAG 质量。",
    ],
    implementationChecklist: [
      "按 query 类型路由：精确术语走关键词加权，概念解释走向量，权限场景先过滤。",
      "融合可用 weighted score、RRF、union 后 rerank 或 query rewrite 分路召回。",
      "保留每路召回来源、score、rank 和 metadata，便于 debug。",
      "用同一批问题对比 BM25、vector、hybrid 的 recall@k 和 citation precision。",
    ],
    metrics: [
      "recall_at_k",
      "mrr",
      "citation_precision",
      "zero_result_rate",
      "retrieval_latency_p95",
    ],
    projectHooks: [
      "Paper Agent 检索论文标题、作者、术语和相似研究时适合 hybrid。",
      "企业知识库 Agent 可先按权限和部门过滤，再做混合召回。",
      "Coding Agent 检索代码符号时关键词优先，解释性文档再叠语义召回。",
    ],
  },
  "rerank": {
    mentalModel: [
      "Rerank 是对初召回候选做更精细的排序和筛选，目标是把真正能支撑答案的证据放前面。",
      "初召回解决“找得到”，rerank 解决“排得准、证据可用”。",
      "好的 rerank 不只看语义相似，还要看问题可回答性、证据完整性和权限可信度。",
    ],
    interviewAngles: [
      "为什么 RAG 需要 rerank。",
      "Cross-encoder、LLM judge、规则特征和 embedding rerank 怎么取舍。",
      "Rerank 的收益和延迟成本如何平衡。",
    ],
    implementationChecklist: [
      "先扩大初召回 topK，再对候选做 rerank，避免过早丢证据。",
      "记录 rerank score、selected evidence、dropped reason 和 final context。",
      "对事实问答关注 answerability，对综述任务关注多样性和覆盖度。",
      "用 no-rerank baseline 做对比，量化引用准确率和幻觉率变化。",
    ],
    metrics: [
      "rerank_ndcg",
      "answerability_score",
      "citation_precision",
      "context_recall",
      "rerank_latency_p95",
    ],
    projectHooks: [
      "Paper Agent 用 rerank 保证综述引用的是真正支撑 claim 的段落。",
      "知识库 Agent 可按权限、时效、标题层级和语义相关性共同排序。",
      "面试项目讲述时可展示 rerank 前后 topK 变化和失败案例。",
    ],
  },
  "agentic-rag": {
    mentalModel: [
      "Agentic RAG 是让 Agent 根据中间证据主动改写查询、选择检索工具、继续查证或停止。",
      "它适合复杂、多跳、多来源、答案边界不确定的知识任务。",
      "不是所有 RAG 都要 agentic，简单 FAQ 用固定 pipeline 更稳、更便宜。",
    ],
    interviewAngles: [
      "Agentic RAG 和普通 RAG 的区别。",
      "多轮检索如何避免主题漂移和成本失控。",
      "如何判断什么时候继续检索，什么时候生成答案。",
    ],
    implementationChecklist: [
      "为每轮检索记录 query、intent、tool、evidence、coverage gap 和 next decision。",
      "设置最大轮数、证据预算、topic consistency check 和 stop condition。",
      "用 verifier 检查关键 claim 是否有证据支撑，缺证据再触发补检索。",
      "对简单问题降级为 single-shot RAG，避免过度 agentic。",
    ],
    metrics: [
      "multi_hop_success_rate",
      "query_drift_rate",
      "evidence_coverage",
      "retrieval_rounds",
      "cost_per_grounded_answer",
    ],
    projectHooks: [
      "Paper Agent 用 Agentic RAG 做研究综述、相关工作对比和证据补齐。",
      "企业诊断 Agent 根据初始答案缺口继续查不同知识源。",
      "项目面试中可展示 query evolution trace 和 stop decision。",
    ],
  },
  "skills": {
    mentalModel: [
      "Skill 封装流程知识、操作规范、参考资料和验收方式；Tool 封装可调用能力。",
      "Skill 更像可版本化的专家工作手册，能让 Agent 在特定任务上稳定遵循流程。",
      "好的 Skill 应该触发明确、步骤可执行、资源渐进加载、结果可验收。",
    ],
    interviewAngles: [
      "Skill 和 Tool、Prompt、MCP 的区别。",
      "什么时候把流程沉淀成 Skill，而不是写在系统提示里。",
      "如何验证一个 Skill 对 Agent 行为真的有提升。",
    ],
    implementationChecklist: [
      "写清触发条件、适用/不适用边界、步骤、依赖资源和 smoke test。",
      "将长参考材料放到独立文件，按任务需要渐进加载。",
      "技能内引用脚本或模板时保持路径稳定，并提供最小验证命令。",
      "对 Skill 版本做 changelog，避免流程变化后旧行为不可解释。",
    ],
    metrics: [
      "skill_trigger_precision",
      "task_success_delta",
      "instruction_adherence_rate",
      "context_token_savings",
      "smoke_test_pass_rate",
    ],
    projectHooks: [
      "Coding Agent 可用 review、debugging、verification 技能规范工作流。",
      "Paper Agent 可用 literature-review skill 固化检索、精读、引用检查流程。",
      "个人学习系统可把“节点复述、追问复盘、项目表达检查”做成可重复技能。",
    ],
  },
  "a2a-acp": {
    mentalModel: [
      "A2A 更关注 Agent 之间发现、通信、任务交接和协作；ACP 更关注应用宿主与 Agent 的统一接口。",
      "这类协议仍在演进，面试里重点是边界、身份、权限、消息格式和审计思路。",
      "不要把协议名当能力本身，真正落地要看它解决了哪个集成或协作问题。",
    ],
    interviewAngles: [
      "A2A、ACP、MCP 分别解决什么问题。",
      "Agent 间通信如何控制权限和上下文泄漏。",
      "协议快速变化时工程上如何做抽象和兼容。",
    ],
    implementationChecklist: [
      "定义 agent identity、capability manifest、message schema 和 task lifecycle。",
      "交接或协作时只传必要上下文，避免把完整私密状态广播出去。",
      "对远程 Agent 调用做鉴权、审计、速率限制和失败回退。",
      "用适配层隔离协议变更，业务层依赖稳定接口。",
    ],
    metrics: [
      "interop_success_rate",
      "handoff_success_rate",
      "message_schema_error_rate",
      "context_leak_incidents",
      "remote_agent_latency",
    ],
    projectHooks: [
      "多 Agent 项目可用 A2A 思路讲 agent discovery 和 handoff contract。",
      "桌面助手或 IDE Agent 可用 ACP 思路讲宿主应用如何暴露统一控制面。",
      "面试回答中把 MCP 放在工具/资源接入，把 A2A 放在 Agent 协作层。",
    ],
  },
  "sandbox": {
    mentalModel: [
      "Sandbox 是把 Agent 的代码、shell、文件、网络和浏览器动作限制在可控边界内。",
      "它既防误操作，也防恶意输入通过 Agent 获得外部副作用能力。",
      "隔离不是单点能力，而是权限、环境、审计、回滚和人工确认的组合。",
    ],
    interviewAngles: [
      "Coding Agent 为什么需要 sandbox。",
      "如何设计只读、写入、执行命令和网络访问的权限边界。",
      "Sandbox、权限系统和 human-in-the-loop 如何配合。",
    ],
    implementationChecklist: [
      "默认只读探索，写入通过 preview diff、backup、apply、verify 和 rollback。",
      "命令执行限制工作目录、环境变量、网络、超时、输出大小和危险命令。",
      "为高风险动作增加确认、审计和可追溯 run_id。",
      "敏感 token、用户私密文件和生产环境默认不可见或需显式授权。",
    ],
    metrics: [
      "unsafe_command_block_rate",
      "rollback_success_rate",
      "permission_escalation_count",
      "sandbox_escape_incidents",
      "audit_log_coverage",
    ],
    projectHooks: [
      "Coding Agent 项目重点讲 sandboxed command、apply_patch 和验证门禁。",
      "Web Agent 项目限制登录、付款、删除和上传等高风险网页动作。",
      "企业 Agent 可按 tenant/user/session 隔离文件和网络资源。",
    ],
  },
  "web-agent-eval": {
    mentalModel: [
      "Web Agent 评测要看任务是否完成，也要看每一步观察、动作、恢复和安全是否可靠。",
      "网页环境天然不稳定，评测必须覆盖加载、弹窗、动态 DOM、disabled 状态和页面漂移。",
      "只看最终文本是不够的，需要 verifier 检查页面状态和外部副作用边界。",
    ],
    interviewAngles: [
      "如何评估 Browser/Web Agent。",
      "DOM-only、vision-only、DOM+vision 的评测差异。",
      "公开网页变化后如何保持 eval 稳定。",
    ],
    implementationChecklist: [
      "构建本地测试站覆盖表单、表格、分页、弹窗、超时、disabled button 和错误态。",
      "每个任务写 verifier：URL、DOM 文本、表单值、截图或下载文件是否符合预期。",
      "记录 step trace、screenshot、locator、observation tokens 和 recovery action。",
      "公开网页只用于低风险只读任务，并保留快照或可替代 fixture。",
    ],
    metrics: [
      "task_success_rate",
      "step_success_rate",
      "selector_failure_rate",
      "recovery_success_rate",
      "unsafe_action_block_rate",
    ],
    projectHooks: [
      "Web Agent 项目可以展示一组本地 benchmark 和 trace replay。",
      "BrowserGym/WebArena 思路可用于解释为什么真实网页评测难。",
      "项目复盘中展示页面漂移导致失败，以及如何用 verifier 发现。",
    ],
  },
  "swe-bench": {
    mentalModel: [
      "SWE-bench 用真实 GitHub issue 和测试验证模型修复真实代码库问题的能力。",
      "它强调从 issue 理解、代码定位、补丁生成到测试验证的完整闭环。",
      "面试里重点不是背榜单，而是能把它抽象成 coding agent 的评测方法。",
    ],
    interviewAngles: [
      "为什么 coding agent 评测比普通代码生成更难。",
      "SWE-bench 评测了哪些能力，没评测哪些能力。",
      "如何在自己的项目中借鉴 issue-to-patch-to-test 流程。",
    ],
    implementationChecklist: [
      "把任务定义为 issue、repo snapshot、expected tests 和允许工具集合。",
      "Agent 过程记录 search/read/edit/test/review 的 trace。",
      "输出必须是可审查 diff，并通过指定测试或回归门禁。",
      "补充人工 code review、风格一致性、安全边界和需求符合度检查。",
    ],
    metrics: [
      "issue_resolution_rate",
      "test_pass_rate",
      "patch_acceptance_rate",
      "avg_iterations",
      "regression_rate",
    ],
    projectHooks: [
      "Coding Agent 项目用 SWE-bench 思路设计本地 bugfix benchmark。",
      "面试回答可讲为什么真实 repo 的依赖、上下文和测试反馈更难。",
      "项目证据可展示一个 issue 从失败测试到最终 diff 的完整 trace。",
    ],
  },
  "langgraph": {
    mentalModel: [
      "LangGraph 把 Agent workflow 表达成有状态图，节点处理任务，边决定流转。",
      "它适合状态复杂、需要恢复、条件分支、人机协作和长期执行的场景。",
      "不是所有 Agent 都需要图；简单线性流程用原生 loop 或普通 workflow 更轻。",
    ],
    interviewAngles: [
      "LangGraph 适合什么场景，不适合什么场景。",
      "State schema、node、edge、checkpoint 和 human-in-the-loop 如何配合。",
      "和 LangChain、普通 DAG、Agents SDK 的取舍。",
    ],
    implementationChecklist: [
      "先定义 state schema：输入、当前步骤、工具结果、artifact、风险和 verdict。",
      "把节点拆成 planner、tool executor、verifier、human approval 等清晰职责。",
      "用 conditional edge 表达分支和重试，避免节点内部藏大量控制流。",
      "开启 checkpoint/persistence，支持失败恢复和 trace 分析。",
    ],
    metrics: [
      "node_success_rate",
      "checkpoint_resume_rate",
      "edge_transition_error_rate",
      "human_intervention_rate",
      "graph_complexity",
    ],
    projectHooks: [
      "Paper Agent 可用图表达检索、精读、证据验证和综述生成。",
      "Travel Agent 可用图表达偏好收集、候选规划、风险检查和确认。",
      "面试取舍可讲：状态复杂才上图，别为了框架把简单流程图化。",
    ],
  },
  "openai-agents-sdk": {
    mentalModel: [
      "OpenAI Agents SDK 把 Agent、tools、handoff、guardrails 和 tracing 作为一等概念。",
      "它适合 OpenAI 生态内构建多 Agent、工具调用和安全检查清晰的应用。",
      "SDK 提供编排基础，但业务成功仍取决于工具设计、上下文、评测和权限。",
    ],
    interviewAngles: [
      "OpenAI Agents SDK 的核心概念有哪些。",
      "Agent、handoff、guardrails、tracing 和 tools 如何协作。",
      "用 SDK 和自己写 loop 的 trade-off。",
    ],
    implementationChecklist: [
      "为每个 Agent 定义 instructions、tools、handoff target 和输出契约。",
      "把输入/输出 guardrails 与工具风险等级、人工确认结合。",
      "打开 tracing，记录每轮调用、工具结果、handoff 和 guardrail verdict。",
      "先做强模型 baseline，再用 eval 比较小模型、提示和工具 schema 优化。",
    ],
    metrics: [
      "handoff_accuracy",
      "guardrail_trigger_rate",
      "tool_chain_success_rate",
      "trace_coverage",
      "cost_per_task",
    ],
    projectHooks: [
      "Travel Agent 可用 triage Agent handoff 到 itinerary、budget、risk checker。",
      "Paper Agent 可用 researcher、summarizer、citation verifier 分工。",
      "项目面试要强调 SDK 不自动解决权限、数据隔离和 eval。",
    ],
  },
  "paper-agent-project": {
    mentalModel: [
      "Paper Agent 的价值不是“总结论文”，而是做可追溯、可验证、可复盘的研究辅助流程。",
      "它天然覆盖 RAG、工具调用、PDF 解析、引用 grounding、评测和幻觉控制。",
      "面试讲述时要把输出物从文本答案升级为 artifacts：综述、引用、证据表和失败报告。",
    ],
    interviewAngles: [
      "如何设计一个 Paper Agent 项目。",
      "如何保证综述中的引用真实支撑结论。",
      "论文检索和普通知识库 RAG 有什么区别。",
    ],
    implementationChecklist: [
      "工具链包含 search_papers、download_pdf、parse_pdf、extract_claims、verify_citations。",
      "数据层保留 paper_id、title、authors、venue、page、section、quote 和 bibtex。",
      "生成时要求 claim-to-evidence 映射，并输出 unsupported claims。",
      "评测覆盖 citation precision、claim coverage、hallucination rate 和综述质量。",
    ],
    metrics: [
      "citation_precision",
      "claim_coverage",
      "paper_recall_at_k",
      "unsupported_claim_rate",
      "review_quality_score",
    ],
    projectHooks: [
      "简历可写：构建 Paper Agent，生成带页码引用的研究综述和证据 JSONL。",
      "面试可展示一个幻觉案例如何通过 citation verifier 被拦截。",
      "项目适合承接 RAG、Agentic RAG、Trace Replay 和 Eval 追问。",
    ],
  },
  "travel-agent-project": {
    mentalModel: [
      "Travel Agent 是多约束规划项目：预算、时间、地点、偏好、天气和安全限制相互影响。",
      "它比金融医疗风险低，适合展示应用型 Agent 的工具编排和 human-in-the-loop。",
      "核心不是编造行程，而是约束收集、候选生成、冲突解释和用户确认。",
    ],
    interviewAngles: [
      "旅行规划为什么适合做 Agent，而不是固定 workflow。",
      "如何处理实时价格、天气、路线和用户偏好变化。",
      "哪些动作必须 human confirmation。",
    ],
    implementationChecklist: [
      "先收集 destination、dates、budget、pace、interests、constraints 和 risk tolerance。",
      "工具包含 get_weather、search_places、estimate_route、budget_estimator、itinerary_verifier。",
      "对外部实时数据标注时间和来源，不能无依据编造价格。",
      "预订、付款、证件、登录等动作必须确认或标记 unsupported。",
    ],
    metrics: [
      "constraint_satisfaction_rate",
      "route_feasibility_score",
      "budget_violation_rate",
      "user_revision_count",
      "unsafe_action_block_rate",
    ],
    projectHooks: [
      "简历可写：实现多约束 Travel Agent，支持天气/预算/路线工具和确认式输出。",
      "项目追问可讲 workflow baseline 与 Agent 重规划的差异。",
      "安全亮点是把支付、预订和敏感凭据排除在自动执行范围外。",
    ],
  },
  "web-agent-project": {
    mentalModel: [
      "Web Agent 项目展示 Agent 在真实网页环境中观察、行动、验证和恢复的能力。",
      "网页任务难在环境变化、DOM/视觉不一致、弹窗、加载、权限和安全边界。",
      "面试中它非常能体现工程深度，因为每一步都有 trace 和可视化证据。",
    ],
    interviewAngles: [
      "Web Agent 和普通爬虫/RPA 的区别。",
      "如何设计 browser observe/action/verifier 三层。",
      "如何处理登录、验证码、付款、删除和页面漂移。",
    ],
    implementationChecklist: [
      "先做本地测试站，覆盖 click、type、extract、table、modal、pagination 和 error states。",
      "观察层输出 URL、title、visible text、interactive elements、screenshot 和 accessibility summary。",
      "动作层封装 click/type/select/extract，并在每步后做 verifier。",
      "高风险网页动作默认拦截，公开网页任务遵守 robots/ToS 和只读边界。",
    ],
    metrics: [
      "task_success_rate",
      "step_success_rate",
      "selector_failure_rate",
      "avg_steps",
      "trace_replay_success_rate",
    ],
    projectHooks: [
      "简历可写：实现 Web Agent benchmark，支持 DOM+截图观察、动作验证和 trace replay。",
      "面试可展示失败 trace：元素定位失败后重新 observe 并恢复。",
      "项目可串起 Browser Observation、Playwright Actions、Web Eval 和 Tool Permissions。",
    ],
  },
};
