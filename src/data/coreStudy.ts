// @author codex
export type CoreStudyNode = {
  topicId: string;
  title: string;
  shortTitle: string;
  summary: string;
  role: string;
};

export type CoreStudyRelationKind =
  | "boundary"
  | "activation"
  | "execution"
  | "context";

export type CoreStudyRelation = {
  from: string;
  to: string;
  kind: CoreStudyRelationKind;
  label: string;
  premise: string;
  interviewCue: string;
  selfCheck: string;
};

export type CoreInterviewSpineStep = {
  topicId: string;
  text: string;
};

export type CoreQuickReview = {
  label: string;
  content: string;
};

export type CoreAnswerScript = {
  short: string;
  deep: string;
  followup: string;
};

export type AgentModule =
  | "Goal"
  | "State"
  | "Context"
  | "Tools"
  | "Loop"
  | "Guardrails"
  | "Eval";

export type CoreSelfCheck = {
  prompt: string;
  passCriteria: string;
  answerChecklist: string[];
};

export type CoreFollowUpDrill = {
  question: string;
  answerHint: string;
};

export type CoreProjectScript = {
  scenario: string;
  spoken: string;
  evidence: string;
};

export type CoreInterviewTemplateScript = {
  oneMinute: string;
  twoMinute: string;
  pressureClose: string;
  memoryHook: string;
};

export type CoreDeepReading = {
  topicId: string;
  title: string;
  quickReview: CoreQuickReview[];
  answerScript: CoreAnswerScript;
  agentModules: AgentModule[];
  selfChecks: CoreSelfCheck[];
  definition: string[];
  principle: string[];
  mechanism: string[];
  engineering: string[];
  pitfalls: string[];
  followUps: string[];
  followUpDrills: CoreFollowUpDrill[];
  projectScript: CoreProjectScript;
  projectExpression: string[];
  comparisons: string[];
  pseudocode: string[];
  interviewTemplateScript: CoreInterviewTemplateScript;
  interviewTemplate: string[];
};

export const coreStudyNodes: CoreStudyNode[] = [
  {
    topicId: "agent-definition",
    title: "Agent 的定义",
    shortTitle: "定义",
    summary: "先把 Agent 讲成模型驱动执行流的工程系统，而不是会聊天的 LLM。",
    role: "所有回答的地基",
  },
  {
    topicId: "workflow-vs-agent",
    title: "Agent vs Workflow",
    shortTitle: "边界",
    summary: "判断什么时候该用固定流程，什么时候才值得引入模型自主决策。",
    role: "架构取舍题必问",
  },
  {
    topicId: "react-loop",
    title: "Agent Loop",
    shortTitle: "闭环",
    summary: "把 observe、reason、act、evaluate 和 stop 连成可恢复、可观测的执行循环。",
    role: "系统设计主轴",
  },
  {
    topicId: "function-calling",
    title: "Tool Calling",
    shortTitle: "工具",
    summary: "模型只产生结构化调用意图，宿主负责校验、执行、权限、错误和审计。",
    role: "工程落地核心",
  },
  {
    topicId: "rag-pipeline",
    title: "RAG / Memory",
    shortTitle: "上下文",
    summary: "把检索、记忆、上下文压缩、证据引用和评测讲成一个信息供给系统。",
    role: "高频深挖方向",
  },
];

export const coreStudyRelations: CoreStudyRelation[] = [
  {
    from: "agent-definition",
    to: "workflow-vs-agent",
    kind: "boundary",
    label: "先定义 Agent，再判断是否需要 Agent",
    premise:
      "如果连 Agent 的控制权边界都说不清，后面的 Workflow 取舍会变成空泛站队。",
    interviewCue:
      "回答时先承认不是所有 LLM 应用都该叫 Agent，再用“模型是否参与多步控制流”作为判断轴。",
    selfCheck: "能否用 20 秒区分 chatbot、tool calling、workflow 和 Agent？",
  },
  {
    from: "workflow-vs-agent",
    to: "react-loop",
    kind: "activation",
    label: "开放任务需要动态闭环",
    premise:
      "只有当路径无法完全预编排、需要根据外部反馈调整动作时，Agent Loop 才有价值。",
    interviewCue:
      "先说固定流程优先，再说明开放任务为什么需要 observe、decide、act、evaluate/stop 的反馈闭环。",
    selfCheck: "能否举出一个 Workflow 更合适、一个 Agent 更合适的场景？",
  },
  {
    from: "react-loop",
    to: "function-calling",
    kind: "execution",
    label: "闭环通过工具改变外部状态",
    premise:
      "Agent Loop 如果不能通过受控工具读取或改变环境，就只是在内部生成文本。",
    interviewCue:
      "讲清模型只产出调用意图，宿主负责 schema 校验、权限、执行、错误结构化和审计。",
    selfCheck: "能否说明 tool schema、权限和错误返回分别保护什么？",
  },
  {
    from: "function-calling",
    to: "rag-pipeline",
    kind: "context",
    label: "工具与检索/记忆共同供给上下文",
    premise:
      "工具解决行动能力，RAG 和 Memory 解决证据、历史和跨轮连续性，三者共同影响下一步决策。",
    interviewCue:
      "把 RAG 讲成外部证据供给，把 Memory 讲成跨轮状态供给，再强调治理、压缩和评测。",
    selfCheck: "能否区分 RAG、Memory、Context Compression 和普通 prompt 拼接？",
  },
];

export const coreRelationKindLabels: Record<CoreStudyRelationKind, string> = {
  activation: "触发",
  boundary: "边界",
  context: "上下文",
  execution: "执行",
};

export const coreInterviewSpine: CoreInterviewSpineStep[] = [
  {
    topicId: "agent-definition",
    text: "先定义 Agent：模型参与控制执行流，不等于聊天或单次工具调用。",
  },
  {
    topicId: "workflow-vs-agent",
    text: "再判断边界：固定路径优先 Workflow，开放反馈任务才上 Agent。",
  },
  {
    topicId: "react-loop",
    text: "画出闭环：observe、decide、act、observe、evaluate/stop。",
  },
  {
    topicId: "function-calling",
    text: "讲工具层：模型给调用意图，宿主校验、授权、执行和审计。",
  },
  {
    topicId: "rag-pipeline",
    text: "补上下文：RAG 供给外部证据，Memory 供给跨轮连续性。",
  },
];

export const coreDeepReadings: Record<string, CoreDeepReading> = {
  "agent-definition": {
    topicId: "agent-definition",
    title: "Agent 的定义",
    quickReview: [
      {
        label: "概念边界",
        content:
          "Agent 是模型参与控制执行流的工程系统，能基于目标、状态、工具结果和反馈决定下一步动作。",
      },
      {
        label: "机制展开",
        content:
          "按 goal、state、context、tools、loop、guardrails、eval 展开，再说明宿主负责权限、执行和验证。",
      },
      {
        label: "防追问边界",
        content:
          "不是所有 LLM 应用都是 Agent；关键看模型是否参与多步控制流，以及是否有外部反馈闭环。",
      },
    ],
    answerScript: {
      short:
        "我会把 Agent 定义成“模型参与控制执行流的工程系统”。它不只是聊天，也不只是一次工具调用，而是能基于目标、当前状态、工具结果和外部反馈，持续决定下一步动作，直到完成任务或触发停止条件。",
      deep:
        "展开讲，我通常拆成七块：Goal 定义成功标准，State 保存任务进展，Context 组织当前输入和历史，Tools 负责连接外部环境，Loop 让模型在 observe、decide、act、observe 中迭代，Guardrails 管权限和风险，Eval 验证结果和过程。模型负责在约束内做决策，宿主程序负责工具执行、权限校验、状态持久化、错误处理和最终验证。这样才是一个可上线的 Agent，而不是一个包装了提示词的 demo。",
      followup:
        "如果追问边界，我会说：普通 chatbot 主要生成回复，workflow 主要由代码控制路径，tool calling 只是能力接口；Agent 的关键是模型是否参与多步控制流，以及每一步是否能被外部反馈修正。生产里还要补 trace、eval、fallback 和高风险动作确认。",
    },
    agentModules: ["Goal", "State", "Context", "Tools", "Loop", "Guardrails", "Eval"],
    selfChecks: [
      {
        prompt: "不用资料，清楚区分 Agent 和普通 LLM 应用。",
        passCriteria: "必须出现：模型参与控制流、多步反馈、工具或环境、宿主负责边界。",
        answerChecklist: [
          "模型参与控制流",
          "多步反馈闭环",
          "工具或外部环境",
          "宿主负责权限、执行和验证",
        ],
      },
      {
        prompt: "把 Agent 拆成 7 个工程模块，并说明每个模块解决什么问题。",
        passCriteria: "能按 Goal、State、Context、Tools、Loop、Guardrails、Eval 顺序讲清责任。",
        answerChecklist: [
          "Goal 定义成功标准",
          "State 保存任务进展",
          "Context 组织输入和历史",
          "Tools 连接外部环境",
          "Loop 形成反馈迭代",
          "Guardrails 管权限和风险",
          "Eval 验证过程和结果",
        ],
      },
      {
        prompt: "举一个项目例子证明它不是 demo。",
        passCriteria: "要讲 trace、失败恢复、权限边界和 eval case，而不是只说用了框架。",
        answerChecklist: [
          "真实 action / observation trace",
          "失败后如何恢复或降级",
          "权限和高风险动作边界",
          "eval case 或线上指标",
        ],
      },
    ],
    definition: [
      "AI Agent 是由大模型在受控环境中，根据目标、状态、工具结果和反馈自主选择下一步动作的软件系统。",
      "它不等于聊天机器人，也不等于一次 function call；关键差异是模型参与控制执行流，并能在多步反馈中修正策略。",
      "工程上可以把 Agent 看成 goal、state、context、tools、loop、guardrails、eval 的组合体。",
    ],
    principle: [
      "Agent 的本质是把“生成文本”扩展成“选择动作并影响环境”。",
      "模型负责在约束内做决策，宿主程序负责权限、工具执行、状态持久化、错误处理和最终验证。",
      "越开放、越需要环境反馈、越难预先枚举步骤的任务，越可能需要 Agent。",
    ],
    mechanism: [
      "输入目标和约束后，系统构建上下文，让模型输出下一步动作：继续思考、调用工具、询问用户或结束。",
      "工具返回 observation，系统更新 state，再进入下一轮决策，直到满足停止条件或触发失败边界。",
      "每一步都应该留下 trace：输入、工具、参数、结果、状态变化、成本、耗时和 verdict。",
    ],
    engineering: [
      "先定义成功标准、失败边界、最大步数、超时和人工介入条件，再设计 loop。",
      "所有外部动作都通过工具层，工具层负责 schema 校验、权限校验、审计和错误结构化。",
      "上线前要有 eval case，不只看最终答案，还要看 trajectory、工具选择、恢复能力和安全拦截。",
    ],
    pitfalls: [
      "把任何 LLM 应用都叫 Agent，导致面试回答没有边界。",
      "只讲框架名，不讲状态、工具、评测、安全和失败恢复。",
      "让模型自己决定高风险动作，宿主程序没有权限层和确认机制。",
    ],
    followUps: [
      "普通 RAG 应用算不算 Agent？判断标准是什么？",
      "Agent 自主选择动作时，如何防止错误动作被连续放大？",
      "如何证明你的 Agent 不是 demo，而是可上线系统？",
    ],
    followUpDrills: [
      {
        question: "普通 RAG 应用算不算 Agent？判断标准是什么？",
        answerHint:
          "如果只是检索、拼上下文、生成答案的固定 pipeline，通常算 RAG workflow；如果模型会根据证据缺口决定改写 query、继续检索、调用工具、让用户澄清或停止，才进入 Agent 边界。",
      },
      {
        question: "Agent 自主选择动作时，如何防止错误动作被连续放大？",
        answerHint:
          "把自主权限制在工具白名单、权限 scope、最大步数、预算、确认机制和 verifier 内；高风险动作必须人工确认，所有 action/observation 留 trace，失败时能降级、回滚或停止。",
      },
      {
        question: "如何证明你的 Agent 不是 demo，而是可上线系统？",
        answerHint:
          "用工程证据回答：有状态持久化、结构化工具错误、trace replay、离线 eval case、线上指标、fallback、权限审计和典型失败复盘，而不是只说用了某个 Agent 框架。",
      },
    ],
    projectScript: {
      scenario: "用 Coding Agent 或 Paper Agent 证明系统真的具备 Agent 边界",
      spoken:
        "我会这样讲项目：这个系统不是把 LLM 包一层接口，而是让模型在受控 loop 里根据目标、状态和工具反馈选择下一步。比如 Coding Agent 会先读任务和仓库上下文，再决定搜索文件、修改代码、运行测试或停止；每一步由宿主做权限、工具执行、状态更新和 trace 记录。这样模型参与控制流，但真正的副作用和验证仍由工程系统兜住。",
      evidence:
        "证据可以落到一次 trace：模型选择 read_file / apply_patch / run_tests，工具返回结构化 observation，失败后进入下一轮修正；最终用测试结果、步骤数、耗时、失败恢复和权限审计证明它是可上线 Agent，而不是 prompt demo。",
    },
    projectExpression: [
      "Paper Agent：模型决定是继续检索、精读、对比证据还是生成结论。",
      "Web Agent：模型根据页面观察选择 click、type、extract 或 stop。",
      "Coding Agent：模型根据测试失败和仓库上下文决定搜索、改代码、跑测试或回滚。",
    ],
    comparisons: [
      "Chatbot：主要生成回复；Agent：生成动作并进入外部反馈闭环。",
      "Workflow：代码控制路径；Agent：模型参与控制路径。",
      "Tool use：提供可调用能力；Agent：把工具、状态和评测组织成多步任务系统。",
    ],
    pseudocode: [
      "state = init(goal, constraints)",
      "while not done(state) and within_budget(state):",
      "  action = model.decide(context_builder(state))",
      "  observation = tool_runtime.execute(action) with validation",
      "  state = reducer(state, action, observation)",
      "return verifier.finalize(state)",
    ],
    interviewTemplateScript: {
      oneMinute:
        "我会先把 Agent 定义成模型参与控制执行流的工程系统。它和普通 LLM 应用的区别不在于有没有调用模型，而在于模型是否能基于目标、状态、工具结果和外部反馈决定下一步动作。工程上我会拆成 goal、state、context、tools、loop、guardrails、eval 七块：模型负责在约束内做决策，宿主程序负责权限、工具执行、状态持久化、错误处理和最终验证。",
      twoMinute:
        "完整回答我会先划边界：chatbot 主要生成回复，workflow 主要由代码控制路径，tool calling 只是能力接口；Agent 是把模型决策放进多步反馈闭环。然后讲机制：系统把目标、状态、工具和约束组织成上下文，模型输出下一步 action，宿主执行工具并把 observation 写回 state，再由 stop policy 或 verifier 判断继续、降级还是结束。最后讲工程：生产 Agent 必须有权限层、结构化工具错误、trace replay、eval case、fallback 和高风险动作确认。项目上可以用 Coding Agent 举例：它根据测试失败决定搜索、改代码、跑测试或停止，但所有文件写入和命令执行都由宿主控制并记录。",
      pressureClose:
        "如果面试官质疑“这不就是 workflow / function calling 吗”，我会先承认很多 LLM 应用不该叫 Agent，再回到判断标准：模型是否参与多步控制流，是否有外部反馈修正，是否能在受控边界内选择不同动作。如果只是固定检索和生成，那更像 RAG workflow；如果能根据证据缺口继续检索、换工具或请求澄清，才更接近 Agent。",
      memoryHook: "定义边界 -> 七模块 -> 闭环机制 -> 工程护栏 -> 项目 trace",
    },
    interviewTemplate: [
      "一句话定义：Agent 是模型驱动执行流的系统，能基于目标、状态和反馈自主选择下一步动作。",
      "边界判断：如果路径固定、成功标准明确，用 workflow；如果步骤不可预知、依赖环境反馈，才考虑 Agent。",
      "工程展开：讲 goal、state、context、tools、loop、guardrails、eval 七块。",
      "项目落地：补一个 trace 或 eval 例子，说明它如何失败、恢复和被验证。",
    ],
  },
  "workflow-vs-agent": {
    topicId: "workflow-vs-agent",
    title: "Agent vs Workflow",
    quickReview: [
      {
        label: "一句话判断",
        content:
          "Workflow 是代码控制路径，Agent 是模型在反馈循环中动态选择路径，核心差异是控制权。",
      },
      {
        label: "取舍顺序",
        content:
          "先问路径能不能枚举、成功标准是否稳定、风险是否可控；能用 workflow 就先用 workflow。",
      },
      {
        label: "项目表达",
        content:
          "生产里常用 hybrid：workflow 管边界和降级，Agent 只处理开放探索、重规划或候选排序。",
      },
    ],
    answerScript: {
      short:
        "Agent 和 Workflow 的核心差异是控制权。Workflow 的路径由代码提前写死，适合稳定、可枚举、风险高的流程；Agent 把一部分路径选择交给模型，适合步骤开放、依赖环境反馈、需要动态重规划的任务。",
      deep:
        "工程上我会先做 deterministic baseline，因为 workflow 更可控、更便宜、更容易测试。只有当任务分支很难枚举，比如需要多轮检索、根据工具返回改计划、在冲突条件下做取舍时，才引入 Agent。生产里通常不是二选一，而是 hybrid：外层 workflow 管权限、预算、降级、人工介入和最终提交，内层 Agent 处理开放探索、候选生成或重规划。是否值得上 Agent，要用成功率、人工节省、成本、延迟和失败率证明。",
      followup:
        "如果面试官问为什么不用固定流程，我会先承认 workflow 优先，再指出当前任务有哪些不可枚举分支、需要哪些外部反馈，以及 Agent 相比 baseline 在指标上带来的收益。回答最后要说清 fallback：超时、低置信度或高风险时回到 workflow 或人工。",
    },
    agentModules: ["Goal", "Loop", "Guardrails", "Eval"],
    selfChecks: [
      {
        prompt: "面试官问“为什么不用固定流程”，你如何回答？",
        passCriteria: "先承认 workflow 优先，再用开放分支、环境反馈、动态重规划说明 Agent 必要性。",
        answerChecklist: [
          "先承认 workflow 优先",
          "指出不可枚举分支",
          "说明依赖环境反馈",
          "说明动态重规划价值",
          "限定 Agent 只处理开放子任务",
        ],
      },
      {
        prompt: "给出一个 hybrid 架构例子。",
        passCriteria: "能说清 workflow 管边界、权限、降级，Agent 只处理开放子任务。",
        answerChecklist: [
          "外层 workflow 管权限和预算",
          "外层 workflow 管降级和人工介入",
          "内层 Agent 处理开放探索或重规划",
          "最终提交仍由确定性流程兜底",
        ],
      },
      {
        prompt: "如何证明 Agent 比 workflow 值得？",
        passCriteria: "必须落到 baseline、成功率、成本、延迟、失败率和人工节省。",
        answerChecklist: [
          "有 deterministic baseline",
          "比较成功率和覆盖率",
          "比较成本和延迟",
          "比较失败率和 fallback 触发率",
          "量化人工节省或体验收益",
        ],
      },
    ],
    definition: [
      "Workflow 是由代码预定义路径的自动化流程，Agent 是由模型在反馈循环中动态决定路径的系统。",
      "两者不是高级低级的关系，而是控制权不同：workflow 的控制权在代码，Agent 的一部分控制权交给模型。",
      "面试中要先说明是否真的需要 Agent，再讲如何实现 Agent。",
    ],
    principle: [
      "确定性、合规性、低延迟、高稳定要求强的流程，优先 workflow。",
      "任务步骤不可预知、需要多轮探索、依赖工具反馈和动态重规划时，Agent 才有价值。",
      "Agent 引入的复杂度必须用成功率、覆盖率、人工节省或体验提升证明。",
    ],
    mechanism: [
      "Workflow 通常是固定 DAG、状态机或规则引擎，节点和分支由工程师提前写好。",
      "Agent loop 中模型可以基于 observation 选择不同工具、改变计划或请求澄清。",
      "实际生产系统经常是 hybrid：外围 workflow 管约束，内部 Agent 处理开放子任务。",
    ],
    engineering: [
      "先做 deterministic baseline，再用同一批 case 比较 Agent 的成功率、成本和延迟。",
      "为 Agent 保留降级路径：超时、低置信度或高风险时回到固定流程或人工处理。",
      "把不可控部分限制在清晰边界内，例如只允许 Agent 排序候选，不允许直接提交订单。",
    ],
    pitfalls: [
      "为了显得高级而上 Agent，结果成本更高、稳定性更差。",
      "把 workflow 中的一个 LLM 节点误称为 Agent。",
      "没有 baseline 和 eval，无法回答“为什么不用规则/工作流”。",
    ],
    followUps: [
      "如果流程可以枚举，为什么还需要 Agent？",
      "Agent 比 workflow 贵很多时，你如何证明值得？",
      "线上如何在 Agent 和 workflow 之间做 fallback？",
    ],
    followUpDrills: [
      {
        question: "如果流程可以枚举，为什么还需要 Agent？",
        answerHint:
          "如果真的可以稳定枚举，就不该上 Agent，直接用 workflow。只有当分支数量随外部反馈爆炸、规则维护成本过高、或者需要模型做开放判断时，才把局部子任务交给 Agent。",
      },
      {
        question: "Agent 比 workflow 贵很多时，你如何证明值得？",
        answerHint:
          "先建立 workflow baseline，再用同一批 case 比成功率、人工节省、覆盖率、成本、延迟和失败率；只有收益覆盖额外 token、工具调用、维护和风险成本，才值得保留。",
      },
      {
        question: "线上如何在 Agent 和 workflow 之间做 fallback？",
        answerHint:
          "用策略层控制：超时、低置信度、预算耗尽、工具连续失败或风险升级时，回到固定 workflow、返回候选答案、请求用户澄清或转人工，并把触发原因写入 trace。",
      },
    ],
    projectScript: {
      scenario: "用 hybrid 架构解释为什么不是所有环节都上 Agent",
      spoken:
        "我会把项目讲成 hybrid：外层 workflow 负责稳定流程，比如权限校验、预算控制、提交前确认、降级和人工介入；内层 Agent 只负责开放子任务，比如多轮检索、候选方案排序、根据工具反馈重规划。这样回答既承认 workflow 的工程优势，也说明 Agent 只用在固定流程难以枚举的局部。",
      evidence:
        "证据上我会拿 baseline 对比：固定 workflow 覆盖稳定 case，Agent 处理长尾开放 case；用成功率、人工节省、平均步数、成本、延迟、fallback 触发率证明引入 Agent 的收益，而不是为了概念高级。",
    },
    projectExpression: [
      "Travel Agent：收集偏好可以是 workflow，遇到天气、预算、路线冲突后动态重排更像 Agent。",
      "Paper Agent：固定摘要是 workflow，多轮检索、交叉验证和追证据更像 Agent。",
      "Coding Agent：固定 lint/fix 是 workflow，根据测试反馈自主搜索和补丁迭代才像 Agent。",
    ],
    comparisons: [
      "Workflow 优势：可控、可测试、延迟低、合规简单。",
      "Agent 优势：适合开放任务、多工具探索、动态重规划。",
      "Hybrid 架构：workflow 做护栏和编排，Agent 解决局部开放决策。",
    ],
    pseudocode: [
      "if task.is_deterministic() and branches_are_known:",
      "  return run_workflow(task)",
      "if task.needs_environment_feedback() or branches_are_open_ended:",
      "  return run_agent_with_guardrails(task)",
      "return run_workflow_with_agent_subtask(task)",
    ],
    interviewTemplateScript: {
      oneMinute:
        "我会先讲核心差异是控制权。Workflow 的路径由代码提前定义，适合稳定、可枚举、风险高的流程；Agent 把一部分路径选择交给模型，适合步骤开放、依赖环境反馈、需要动态重规划的任务。我的默认原则是 workflow 优先，只有固定流程难以覆盖长尾分支，或者需要模型根据工具反馈做判断时，才引入 Agent。",
      twoMinute:
        "完整回答我会按取舍讲：第一，先做 deterministic baseline，因为它便宜、稳定、可测试；第二，分析任务是否存在不可枚举分支，比如多轮检索、冲突取舍、根据工具结果改计划；第三，如果需要 Agent，就做 hybrid 架构，外层 workflow 管权限、预算、降级、人工介入和最终提交，内层 Agent 只处理开放子任务；第四，用指标证明收益，比如成功率、人工节省、成本、延迟、失败率和 fallback 触发率。这样不会为了概念上 Agent，而牺牲工程可控性。",
      pressureClose:
        "如果面试官追问“为什么不用规则”，我会先说能用规则就用规则，然后指出规则覆盖不了的开放反馈点；如果追问“Agent 太贵怎么办”，我会回到 baseline 对比和降级策略，说明 Agent 只处理高价值长尾任务，超时、低置信度或高风险时回到 workflow 或人工。",
      memoryHook: "控制权 -> workflow 优先 -> 开放反馈才 Agent -> hybrid -> 指标证明",
    },
    interviewTemplate: [
      "先给判断标准：控制权在代码就是 workflow，控制权部分交给模型就是 Agent。",
      "再给适用场景：稳定流程用 workflow，开放探索和反馈驱动任务用 Agent。",
      "然后讲成本：Agent 必须用指标证明收益覆盖成本、延迟和风险。",
      "最后落项目：说明你在哪里用 workflow，在哪里只让 Agent 处理开放子任务。",
    ],
  },
  "react-loop": {
    topicId: "react-loop",
    title: "Agent Loop",
    quickReview: [
      {
        label: "闭环公式",
        content:
          "observe -> decide -> act -> observe -> evaluate/stop，每轮都用外部反馈修正下一步。",
      },
      {
        label: "工程抓手",
        content:
          "重点讲 context builder、structured action、tool runtime、state reducer、stop policy 和 trace replay。",
      },
      {
        label: "可靠性答案",
        content:
          "用 max steps、timeout、budget、fallback、verifier 和 trajectory eval 控制循环失控。",
      },
    ],
    answerScript: {
      short:
        "Agent Loop 可以概括为 observe、decide、act、observe、evaluate or stop。模型不是一次性回答，而是在每轮看到状态和工具反馈后决定下一步动作，再由宿主执行并更新状态。",
      deep:
        "落到工程实现，loop 至少要有 context builder、structured action、tool runtime、state reducer、stop policy 和 trace。context builder 负责把目标、状态、工具、记忆和约束组织给模型；模型输出结构化 action；tool runtime 负责校验、授权和执行；state reducer 把 observation 写回状态；stop policy 控制最大步数、超时、预算、失败边界和人工介入。评估时不能只看最终答案，还要看 trajectory：工具选得对不对、步骤是否冗余、失败是否恢复、成本是否可控。",
      followup:
        "如果追问工具失败，我会说不能让模型猜结果。工具要返回结构化 error，比如 code、retryable、message 和 suggested_next_action；loop 再决定重试、换工具、降级、问用户或停止，并把这次失败写入 trace 方便复盘。",
    },
    agentModules: ["State", "Context", "Tools", "Loop", "Guardrails", "Eval"],
    selfChecks: [
      {
        prompt: "画出 Agent Loop，并说明每一步由谁负责。",
        passCriteria: "能覆盖 observe、decide、act、update state、evaluate/stop，且区分模型和宿主责任。",
        answerChecklist: [
          "observe 收集状态和反馈",
          "decide 由模型选择结构化 action",
          "act 由宿主校验和执行工具",
          "update state 写回 observation",
          "evaluate / stop 由策略和 verifier 决定",
        ],
      },
      {
        prompt: "如果工具失败，下一轮 loop 怎么处理？",
        passCriteria: "能讲 retryable error、换工具、降级、问用户、stop policy，而不是让模型猜结果。",
        answerChecklist: [
          "工具返回结构化 error",
          "retryable 才重试或修参",
          "不可用时换工具或降级",
          "权限或信息缺失时问用户",
          "触发 stop policy 时停止",
        ],
      },
      {
        prompt: "如何评估一个多步 trajectory？",
        passCriteria: "不能只看最终答案，要讲工具选择、步骤数、恢复、成本、安全拦截和可回放 trace。",
        answerChecklist: [
          "工具选择和参数是否正确",
          "步骤数是否冗余",
          "失败是否恢复",
          "成本和耗时是否可控",
          "安全拦截是否生效",
          "trace 能否 replay",
        ],
      },
    ],
    definition: [
      "Agent Loop 是 Agent 的执行闭环：观察状态，决定动作，调用工具，接收反馈，更新状态，再判断是否继续。",
      "ReAct 是典型形式，把 reasoning 与 acting 交替组织，让模型用工具结果修正下一步。",
      "生产系统不应暴露完整隐式思维链，而应记录可审计的 thought summary、action、observation 和 verdict。",
    ],
    principle: [
      "Loop 的价值来自反馈修正：模型不是一次性回答，而是根据环境变化持续调整策略。",
      "工具结果是 ground truth，模型推断必须被 observation、测试、检索证据或 verifier 约束。",
      "一个合格 loop 必须有停止条件、预算控制、错误恢复和可回放 trace。",
    ],
    mechanism: [
      "每轮 context builder 从 goal、state、memory、recent trace、tools 和 constraints 构建输入。",
      "模型输出结构化 action，例如 tool_call、final_answer、ask_human、revise_plan。",
      "宿主执行 action 后更新 state，并由 stop policy 判断是否结束、重试、降级或升级人工。",
    ],
    engineering: [
      "设置 max_steps、timeout、token budget、tool budget 和 final verifier。",
      "工具失败返回结构化 error：code、retryable、message、suggested_next_action。",
      "用 trajectory eval 检查过程质量，而不是只看最终答案是否看起来合理。",
    ],
    pitfalls: [
      "没有停止条件，导致循环调用工具或不断自我修正。",
      "工具失败后让模型猜测结果，产生幻觉或错误外部动作。",
      "trace 太粗，只记录最终答案，无法定位是计划错、工具错还是上下文错。",
    ],
    followUps: [
      "如何设计 Agent Loop 的停止条件？",
      "工具调用失败后，Agent 应该重试、换工具、降级还是问用户？",
      "如何评估一个多步 trajectory 的质量？",
    ],
    followUpDrills: [
      {
        question: "如何设计 Agent Loop 的停止条件？",
        answerHint:
          "至少有成功 verifier、max steps、timeout、token/tool budget、重复动作检测、低收益停止和风险升级条件；停止不是只靠模型说 done，而是宿主策略和验证器共同决定。",
      },
      {
        question: "工具调用失败后，Agent 应该重试、换工具、降级还是问用户？",
        answerHint:
          "先看结构化 error：retryable 就带退避重试，参数错就让模型修正，权限或高风险就问用户，工具不可用就换工具或降级；不能让模型假装工具成功。",
      },
      {
        question: "如何评估一个多步 trajectory 的质量？",
        answerHint:
          "不要只看最终答案，要看每步工具选择、参数正确性、步骤冗余、错误恢复、引用证据、安全拦截、成本和耗时；最好能 replay trace 做离线评测。",
      },
    ],
    projectScript: {
      scenario: "用一次失败恢复过程讲清 Agent Loop 的工程价值",
      spoken:
        "项目里我会用 Coding Agent 的一次闭环来讲：用户给出目标后，系统构建 context，模型选择读文件或跑测试，工具返回 observation，state reducer 记录结果，再由模型决定改代码、继续搜索或结束。重点不是模型会思考，而是每一轮都有结构化 action、工具反馈、状态更新和 stop policy。",
      evidence:
        "证据最好是一条可回放 trace：第一次测试失败暴露类型错误，下一轮模型定位文件并修改，第三轮测试通过；同时记录 max steps、timeout、tool error、成本和最终 verifier，说明 loop 可观测、可恢复、可评估。",
    },
    projectExpression: [
      "Web Agent：observe 页面摘要和截图，act 为 click/type/extract，再观察页面变化。",
      "Coding Agent：search/read/edit/test 形成闭环，测试结果决定下一步。",
      "Paper Agent：检索、阅读、引用检查、补证据形成研究闭环。",
    ],
    comparisons: [
      "单次 LLM 调用：没有外部反馈闭环；Agent Loop：每步都受 observation 修正。",
      "ReAct：强调推理与行动交替；Plan-and-Solve：强调先规划再执行。",
      "Reflection：偏自我审查；Verifier：偏外部标准验证。",
    ],
    pseudocode: [
      "for step in range(max_steps):",
      "  context = build_context(goal, state, trace, tools)",
      "  action = model.route(context)",
      "  if action.type == 'final': break",
      "  result = execute_tool(action) with guardrails",
      "  trace.append(action, result)",
      "  state = update_state(state, result)",
      "return verify_and_finalize(state, trace)",
    ],
    interviewTemplateScript: {
      oneMinute:
        "我会把 Agent Loop 讲成 observe、decide、act、observe、evaluate or stop。模型不是一次性回答，而是在每轮看到状态和工具反馈后决定下一步动作；宿主负责执行工具、更新 state、记录 trace，并用 stop policy 控制什么时候结束、重试、降级或转人工。",
      twoMinute:
        "完整回答我会先画闭环：context builder 把 goal、state、memory、recent trace、tools 和 constraints 组织给模型；模型输出结构化 action，比如 tool_call、final_answer、ask_human 或 revise_plan；tool runtime 做 schema 校验、权限判断和执行；state reducer 把 observation 写回状态；stop policy 控制 max steps、timeout、token/tool budget、重复动作检测和风险升级。评估时不能只看最终答案，还要看 trajectory：工具选得对不对、参数是否正确、步骤是否冗余、失败是否恢复、成本和安全拦截是否可控。",
      pressureClose:
        "如果工具失败，我不会让模型猜结果，而是要求工具返回结构化 error，包括 code、retryable、message、suggested_next_action。loop 再决定重试、修参、换工具、降级、问用户或停止，并把失败写进 trace，方便 replay 和归因。",
      memoryHook: "observe -> decide -> act -> state -> stop；评估看 trajectory",
    },
    interviewTemplate: [
      "先画闭环：observe -> decide -> act -> observe -> stop/evaluate。",
      "讲宿主责任：schema 校验、权限、执行、状态更新、错误结构化。",
      "讲可靠性：max steps、timeout、fallback、trace replay、trajectory eval。",
      "落项目：用一次真实失败或测试反馈说明 loop 如何修正。",
    ],
  },
  "function-calling": {
    topicId: "function-calling",
    title: "Tool Calling",
    quickReview: [
      {
        label: "机制主句",
        content:
          "模型只输出结构化调用意图，宿主负责校验、授权、执行、异常处理和结果回传。",
      },
      {
        label: "Schema 重点",
        content:
          "工具名、参数、返回值、错误码、边界、示例和风险等级都要对模型和工程系统友好。",
      },
      {
        label: "安全收口",
        content:
          "高风险工具必须有权限、确认、审计、限流、超时和敏感信息过滤，不能让模型直接执行副作用。",
      },
    ],
    answerScript: {
      short:
        "Tool Calling 的本质是模型输出结构化调用意图，真正的校验、授权、执行、异常处理和结果回传都在宿主程序。模型不应该直接拥有外部系统的副作用权限。",
      deep:
        "一个好工具要同时对模型和工程系统友好：名称清楚，参数 schema 严格，返回值短且结构化，错误码可恢复，边界和示例明确，还要有权限、版本、owner、timeout、retry、rate limit 和 audit。工具结果回到上下文后，模型再决定继续调用、修正计划或生成答案。这里要区分 Tool Calling 和 Agent：Tool Calling 解决能调用什么，Agent 用 state、loop、guardrails、eval 把工具组织成多步任务系统。",
      followup:
        "如果追问高风险工具，比如发邮件、删文件、下单，我会强调 confirmation、scope 权限、审计日志、敏感信息过滤、限流、超时和补偿/回滚。模型只能提出意图，宿主必须在边界内执行，并能让用户确认关键副作用。",
    },
    agentModules: ["Tools", "Guardrails", "State", "Eval"],
    selfChecks: [
      {
        prompt: "用一句话区分 Tool Calling 和 Agent。",
        passCriteria: "Tool Calling 是能力接口，Agent 是用 state、loop、guardrails、eval 组织多步任务。",
        answerChecklist: [
          "Tool Calling 是能力接口",
          "模型只输出调用意图",
          "Agent 用 state 和 loop 编排多步任务",
          "Agent 还需要 guardrails 和 eval",
        ],
      },
      {
        prompt: "设计一个模型友好的工具 schema，需要包含什么？",
        passCriteria: "能说出工具名、描述、参数、返回、错误、边界、示例、权限和版本。",
        answerChecklist: [
          "清晰工具名和描述",
          "强类型参数 schema",
          "短而结构化的返回 schema",
          "可恢复错误码",
          "使用边界和示例",
          "权限、版本和风险等级",
        ],
      },
      {
        prompt: "高风险工具如何上线？",
        passCriteria: "必须讲 confirmation、权限、审计、限流、timeout、敏感信息过滤和回滚/补偿。",
        answerChecklist: [
          "scope 权限控制",
          "二次确认 confirmation",
          "审计日志",
          "限流和 timeout",
          "敏感信息过滤",
          "补偿或回滚方案",
        ],
      },
    ],
    definition: [
      "Tool Calling 是模型输出结构化工具调用意图，由宿主程序校验、执行，并把结果返回上下文。",
      "模型不会也不应该直接执行外部动作；真正的权限、网络、文件、数据库和副作用都在宿主侧。",
      "Function calling 是 Tool Calling 的一种接口形态，但完整 Agent 还需要状态、loop、权限和评测。",
    ],
    principle: [
      "工具把模型能力从文本生成扩展到外部系统，但也把错误从文本层带到真实世界。",
      "好的工具 schema 会减少模型猜测，坏的 schema 会放大参数错误、边界误解和恢复成本。",
      "工具返回值要短、结构化、可追溯，让模型能决定下一步，而不是吞进不可控长文本。",
    ],
    mechanism: [
      "开发者向模型暴露工具名、描述、参数 schema 和使用边界。",
      "模型在响应中产生 tool_call，宿主做参数校验、权限判断、执行和异常捕获。",
      "tool_result 回到上下文后，模型继续决策、生成最终答案或发起下一次工具调用。",
    ],
    engineering: [
      "工具名用明确动词加对象，例如 search_papers、browser_click、run_tests。",
      "高风险工具加 requires_confirmation、risk_level、allowed_scope 和审计日志。",
      "为每个工具设置 timeout、retry policy、rate limit、owner、version 和返回 schema。",
    ],
    pitfalls: [
      "认为 function calling 等于 Agent，忽略 loop、state、guardrails 和 eval。",
      "工具参数太自由，模型传入模糊自然语言导致执行失败。",
      "把完整网页、PDF 或日志原文塞回模型，造成上下文污染和成本失控。",
    ],
    followUps: [
      "如何设计一个对模型友好的工具 schema？",
      "工具调用失败时如何把错误反馈给模型？",
      "高风险工具，比如发邮件、删文件、下单，如何做确认和权限？",
    ],
    followUpDrills: [
      {
        question: "如何设计一个对模型友好的工具 schema？",
        answerHint:
          "名称用明确动词和对象，描述写清适用/不适用场景，参数强类型且少歧义，返回值短而结构化，并补错误码、示例、权限、版本、timeout 和风险等级。",
      },
      {
        question: "工具调用失败时如何把错误反馈给模型？",
        answerHint:
          "返回结构化 error，而不是一大段日志：包含 code、retryable、user_action_required、message、suggested_next_action 和可引用证据，让下一轮 loop 能决定重试、修参、降级或停止。",
      },
      {
        question: "高风险工具，比如发邮件、删文件、下单，如何做确认和权限？",
        answerHint:
          "模型只能生成意图，宿主做 scope 权限、二次确认、敏感信息过滤、审计、限流、超时和补偿/回滚；最终副作用动作要能被用户或策略层拦截。",
      },
    ],
    projectScript: {
      scenario: "用工具运行时说明 Tool Calling 怎样从 demo 变成工程能力",
      spoken:
        "我会用 Coding Agent 或 Web Agent 来讲 Tool Calling：模型只负责输出结构化调用意图，比如 read_file、run_tests、browser_click，宿主负责 schema 校验、权限判断、执行、timeout、错误结构化和审计。工具结果再回到上下文，模型才能决定下一步，所以工具层是 Agent 可控性的核心。",
      evidence:
        "证据可以讲一个工具 registry：每个工具都有 name、description、args schema、return schema、risk_level、owner、version、timeout 和 retry policy；高风险工具加 confirmation 和 audit，失败时返回 code/retryable/suggested_next_action。",
    },
    projectExpression: [
      "Coding Agent：read_file、apply_patch、run_tests 都应有 schema、timeout 和 audit trail。",
      "Web Agent：browser_observe 返回可点击元素摘要，browser_click 只接收稳定 selector 或 node id。",
      "Paper Agent：search_papers 返回 title、source、abstract、score 和 citation，而不是无限长全文。",
    ],
    comparisons: [
      "Tool schema：定义能调用什么；tool runtime：负责如何执行；tool registry：负责发现、权限和版本。",
      "Tool Calling 解决能做什么；Agent Loop 解决什么时候做、做完如何继续。",
      "MCP 更像工具协议和运行时边界，Function Calling 更像模型侧结构化调用格式。",
    ],
    pseudocode: [
      "tools = registry.available_for(user, task)",
      "tool_call = model.choose_tool(context, tools)",
      "args = validate_schema(tool_call.args)",
      "authorize(user, tool_call.name, args)",
      "result = run_tool(tool_call.name, args)",
      "context.append(tool_result(result.summary, result.sources, result.error))",
    ],
    interviewTemplateScript: {
      oneMinute:
        "我会先讲 Tool Calling 的本质：模型只输出结构化调用意图，真正的校验、授权、执行、异常处理和结果回传都在宿主程序。模型不应该直接拥有外部系统的副作用权限。Tool Calling 解决模型能调用什么，而 Agent 还要用 state、loop、guardrails、eval 把工具组织成多步任务。",
      twoMinute:
        "完整回答我会按工具生命周期讲：开发者暴露工具名、描述、参数 schema、返回 schema 和使用边界；模型生成 tool_call；宿主做参数校验、权限判断、执行、timeout、retry、rate limit 和异常捕获；tool_result 以短而结构化的形式回到上下文，模型再决定继续调用、修正计划或生成答案。一个好工具还要有 owner、version、risk_level、audit 和示例。高风险工具比如发邮件、删文件、下单，必须有 confirmation、scope 权限、敏感信息过滤、限流和补偿/回滚。",
      pressureClose:
        "如果被追问 function calling 是否等于 Agent，我会说不是。Function calling 是模型侧结构化调用格式，Tool Calling 是能力接口和运行时边界，Agent 是在 loop 里根据状态和反馈决定什么时候调用什么工具，并用评测和护栏保证过程可控。",
      memoryHook: "意图在模型 -> 执行在宿主 -> schema/权限/错误 -> 高风险确认 -> Agent 差异",
    },
    interviewTemplate: [
      "先讲机制：模型输出结构化调用，宿主校验执行，再把结果回传。",
      "再讲 schema：名称、参数、返回、错误、边界和示例都要对模型友好。",
      "然后讲安全：权限、确认、审计、限流、超时、敏感信息过滤。",
      "最后讲 Agent 差异：Tool Calling 是能力接口，Agent 是用 loop 和 state 组织多步任务。",
    ],
  },
  "rag-pipeline": {
    topicId: "rag-pipeline",
    title: "RAG / Memory",
    quickReview: [
      {
        label: "边界主句",
        content:
          "RAG 解决外部知识 grounding，Memory 解决跨轮或跨会话连续性，二者都是上下文供给系统。",
      },
      {
        label: "Pipeline 展开",
        content:
          "RAG 讲 ingest、chunk、index、retrieve、rerank、select、generate、cite、eval；Memory 讲写入决策、隐私、过期和冲突。",
      },
      {
        label: "追问防线",
        content:
          "不要只说向量库；要能回答召回、引用准确率、幻觉率、隐私隔离、过期和上下文污染。",
      },
    ],
    answerScript: {
      short:
        "RAG 和 Memory 都是上下文供给系统，但边界不同：RAG 解决外部知识 grounding，让答案有证据；Memory 解决跨轮或跨会话连续性，让系统记住偏好、历史和任务状态。",
      deep:
        "RAG 不是只接一个向量库，而是一条 pipeline：ingest、chunk、index、retrieve、rerank、select evidence、generate、cite、eval。每个 chunk 要带 doc_id、section、timestamp、source_url 等 metadata，方便引用和排错。Memory 也不是把聊天记录全存起来，而是 write decision、dedupe、privacy filter、store、retrieve、decay 和 conflict resolution。进入上下文前还要排序、压缩、去重、标注来源和可信度，否则会污染 Agent 决策。",
      followup:
        "如果追问评测和风险，我会讲 recall@k、citation precision、answer faithfulness、hallucination rate，以及 memory 的授权、敏感过滤、过期、冲突、多用户隔离和可删除。项目表达上可以用 Paper Agent 讲证据引用，用 Coding Agent 讲项目约定和当前代码上下文的区别。",
    },
    agentModules: ["Context", "State", "Guardrails", "Eval"],
    selfChecks: [
      {
        prompt: "RAG、Memory、Context Compression 三者怎么区分？",
        passCriteria: "能按外部证据、跨会话连续性、已有上下文压缩三条线讲生命周期和风险。",
        answerChecklist: [
          "RAG 取外部知识证据",
          "Memory 保存跨轮或跨会话连续性",
          "Context Compression 压缩已有上下文",
          "三者生命周期不同",
          "三者可信度和隐私风险不同",
        ],
      },
      {
        prompt: "RAG pipeline 里哪些环节最容易出线上问题？",
        passCriteria: "要覆盖 chunk、metadata、召回、重排、引用、过期、上下文污染和评测。",
        answerChecklist: [
          "chunk 粒度和 metadata",
          "召回和重排质量",
          "引用准确性",
          "知识过期",
          "上下文污染",
          "faithfulness 和 hallucination eval",
        ],
      },
      {
        prompt: "Memory 写入为什么危险，怎么控制？",
        passCriteria: "必须提到授权、敏感过滤、去重、过期、冲突解决、多用户隔离和可删除。",
        answerChecklist: [
          "用户授权",
          "敏感信息过滤",
          "去重和重要性评分",
          "过期和删除机制",
          "冲突解决",
          "多用户或租户隔离",
        ],
      },
    ],
    definition: [
      "RAG 是把外部知识检索进上下文，让生成建立在证据上；Memory 是跨轮或跨会话保存可复用信息。",
      "两者都属于 Agent 的信息供给系统，但生命周期不同：RAG 多面向外部知识，Memory 多面向用户、任务和历史状态。",
      "面试里不要只说向量库，要讲切分、索引、检索、重排、证据选择、引用、评测和过期处理。",
    ],
    principle: [
      "模型本身不是可靠知识库，检索和记忆的目标是把正确、相关、可追溯的信息放进上下文。",
      "RAG 追求 evidence grounding，Memory 追求 personalization 和 task continuity。",
      "信息进入上下文前必须排序、压缩、去重、标注来源和可信度，否则会污染 Agent 决策。",
    ],
    mechanism: [
      "RAG pipeline 通常包括 ingest、chunk、embed/index、retrieve、rerank、select evidence、generate、cite、evaluate。",
      "Memory pipeline 通常包括 write decision、dedupe、privacy filter、store、retrieve、decay、conflict resolution。",
      "Agentic RAG 会让模型根据 coverage gap 决定是否改写 query、继续检索、换工具或停止。",
    ],
    engineering: [
      "chunk 保存 doc_id、section、page、timestamp、source_url 等 metadata，方便引用和排错。",
      "检索评测至少覆盖 recall@k、citation precision、answer faithfulness 和 hallucination rate。",
      "Memory 写入要有重要性评分、用户授权、敏感信息过滤、过期策略和冲突澄清。",
    ],
    pitfalls: [
      "只接入向量库就说 RAG，没有重排、引用和评测。",
      "把聊天记录全写进长期记忆，导致隐私风险和错误记忆长期污染。",
      "检索结果不带来源和页码，面试官追问证据链时讲不清。",
    ],
    followUps: [
      "RAG、长期记忆和上下文压缩有什么区别？",
      "如何评估 RAG 的召回率、引用准确率和幻觉率？",
      "Memory 冲突、过期、隐私和多用户隔离怎么设计？",
    ],
    followUpDrills: [
      {
        question: "RAG、长期记忆和上下文压缩有什么区别？",
        answerHint:
          "RAG 从外部知识库取新证据，长期记忆保存跨会话可复用信息，上下文压缩是整理当前已有上下文；三者生命周期、可信度、隐私风险和评测指标都不同。",
      },
      {
        question: "如何评估 RAG 的召回率、引用准确率和幻觉率？",
        answerHint:
          "准备带标准证据的 query set，评 recall@k、rerank 后命中、citation precision、answer faithfulness 和 unsupported claim rate；线上再看无答案拒答率、过期引用和用户纠错。",
      },
      {
        question: "Memory 冲突、过期、隐私和多用户隔离怎么设计？",
        answerHint:
          "写入前做授权、敏感过滤、重要性评分和去重；读取时按用户/租户隔离、来源和时间排序；冲突时让新事实覆盖或请求澄清，并支持过期、删除和审计。",
      },
    ],
    projectScript: {
      scenario: "用 Paper Agent 说明 RAG / Memory 如何支撑可信回答",
      spoken:
        "我会用 Paper Agent 来讲：RAG 负责把论文、文档和网页证据按 chunk 检索进上下文，Memory 负责保存用户偏好、研究主题和历史任务状态。生成答案前先做 query rewrite、retrieve、rerank、evidence selection，再把带 doc_id、section、page、source_url 的证据交给模型；长期记忆则要经过写入决策、隐私过滤、过期和冲突处理。",
      evidence:
        "证据上讲评测：检索看 recall@k 和 rerank 命中，回答看 citation precision、faithfulness、unsupported claim rate；Memory 看授权、隔离、过期、删除和冲突解决。这样能说明它不是只有向量库，而是一套上下文供给和验证系统。",
    },
    projectExpression: [
      "Paper Agent：以论文 section/page 为证据单元，回答时引用来源并检查 claim coverage。",
      "Travel Agent：保存用户偏好是 memory，检索天气/酒店/路线是 RAG 或外部工具。",
      "Coding Agent：项目约定和常用命令可以进 memory，当前代码片段和测试结果属于任务上下文。",
    ],
    comparisons: [
      "RAG：面向外部知识证据；Memory：面向历史偏好和任务连续性。",
      "Short-term memory：当前任务工作区；Long-term memory：跨会话复用。",
      "Context compression：压缩已有上下文；Retrieval：从外部索引找新证据。",
    ],
    pseudocode: [
      "query = rewrite(user_question, task_state)",
      "candidates = retrieve(query, indexes)",
      "evidence = rerank_and_select(candidates, coverage_goal)",
      "memory = retrieve_memory(user, task, privacy_policy)",
      "context = compose(task, state, evidence.with_citations(), memory)",
      "answer = model.generate(context)",
      "return verify_citations(answer, evidence)",
    ],
    interviewTemplateScript: {
      oneMinute:
        "我会先区分边界：RAG 解决外部知识 grounding，让答案有证据；Memory 解决跨轮或跨会话连续性，让系统记住偏好、历史和任务状态。它们都属于上下文供给系统，但生命周期和风险不同。RAG 不能只说向量库，Memory 也不能把聊天记录全存起来。",
      twoMinute:
        "完整回答我会按 pipeline 讲：RAG 包括 ingest、chunk、embed/index、retrieve、rerank、select evidence、generate、cite、evaluate；每个 chunk 要带 doc_id、section、page、timestamp、source_url 等 metadata，方便引用和排错。Memory 包括 write decision、dedupe、privacy filter、store、retrieve、decay、conflict resolution；写入前要做授权、敏感过滤、重要性评分和过期策略。进入上下文前还要排序、压缩、去重、标注来源和可信度，否则会污染 Agent 决策。",
      pressureClose:
        "如果被追问评测，我会说 RAG 看 recall@k、rerank 命中、citation precision、answer faithfulness 和 unsupported claim rate；Memory 看授权、隔离、过期、删除、冲突解决和错误记忆污染。项目上用 Paper Agent 讲证据引用，用 Coding Agent 区分项目长期约定和当前任务上下文。",
      memoryHook: "RAG 取外部证据；Memory 存连续性；先治理再进上下文；评测看引用和污染",
    },
    interviewTemplate: [
      "先分边界：RAG 解决外部知识 grounding，Memory 解决跨轮/跨会话连续性。",
      "讲 pipeline：摄入、切分、索引、召回、重排、证据选择、生成、引用、评测。",
      "讲工程风险：过期、冲突、隐私、引用不准、上下文污染、成本。",
      "落项目：用 Paper Agent 或 Coding Agent 说明证据如何存、如何检、如何验证。",
    ],
  },
};
