// @author codex
import type { ProjectEvidence } from "../types/knowledge";

export const projectEvidence = [
  {
    id: "pe-paper-agent",
    project: "paper-agent",
    title: "Paper Agent：论文研读与可追溯综述",
    scenario: "输入研究主题后检索论文、解析 PDF、抽取贡献与局限，生成带 page/section 引用的综述和对比表。",
    architecturePoints: [
      "Planner 将主题拆成检索、筛选、精读、对比和综述步骤。",
      "Evidence Store 保存 paper、page、section、claim 和引用关系。",
      "Synthesis Agent 只基于已选证据生成结论，Review Agent 检查引用是否支撑。",
    ],
    tools: [
      "search_papers",
      "download_pdf",
      "parse_pdf",
      "extract_claims",
      "compare_papers",
      "write_review",
    ],
    evalPoints: [
      "paper_relevance@k",
      "citation_precision",
      "coverage_score",
      "hallucination_rate",
      "avg_cost",
    ],
    safetyPoints: [
      "只下载公开可访问 PDF",
      "拒绝绕过付费墙",
      "结论无证据时显式标注不确定",
    ],
    resumeBullet:
      "构建论文研读 Agent，接入论文检索与 PDF 解析工具，使用 evidence store 保留 paper/page/section 引用；设计主题检索、单篇精读和多篇对比 eval case，统计引用准确率、覆盖率、幻觉率和平均成本。",
    relatedTopicIds: [
      "rag-pipeline",
      "citation-grounding",
      "agentic-rag",
      "component-eval",
      "trajectory-eval",
      "paper-agent-project",
    ],
  },
  {
    id: "pe-travel-agent",
    project: "travel-agent",
    title: "Travel Agent：可解释多约束旅行规划",
    scenario: "根据预算、时间、兴趣、天气和路线约束生成行程，并解释为什么这样安排。",
    architecturePoints: [
      "Preference Collector 将自然语言需求转成结构化约束。",
      "Route Planner、Budget Estimator 和 Safety Reviewer 串联形成可解释规划链。",
      "对预订、付款和敏感凭据采用 human-in-the-loop。",
    ],
    tools: [
      "collect_preferences",
      "search_places",
      "geocode_location",
      "estimate_route",
      "get_weather",
      "estimate_budget",
    ],
    evalPoints: [
      "constraint_satisfaction",
      "route_reasonableness",
      "uncertainty_disclosure",
      "safety_compliance",
    ],
    safetyPoints: [
      "不自动付款",
      "不保存身份证、银行卡或账号密码",
      "价格和实时交通只做区间估计并标注来源时间",
    ],
    resumeBullet:
      "构建旅行规划 Agent，将用户需求结构化为预算、时间、兴趣和天气约束，组合地点、路线、天气和预算工具生成可解释行程；对付款、预订和敏感凭据设置 human-in-the-loop，并用约束满足率、路线合理性和安全合规率评估。",
    relatedTopicIds: [
      "workflow-vs-agent",
      "planning-methods",
      "tool-permissions",
      "handoff-pattern",
      "travel-agent-project",
    ],
  },
  {
    id: "pe-web-agent",
    project: "web-agent",
    title: "Web Agent：公开网页任务自动化与评测",
    scenario: "在公开网页和本地测试站完成信息查找、表单填写、页面导航，并用截图、DOM 摘要和 trace 复盘失败。",
    architecturePoints: [
      "Browser Observer 输出 URL、title、visible text、interactive elements 和 screenshot path。",
      "Action Selector 选择 Playwright 动作，Executor 执行后由 Verifier 检查页面变化。",
      "每一步保存 trace.jsonl 和截图，失败后支持重试或安全停止。",
    ],
    tools: [
      "browser_open",
      "browser_observe",
      "browser_click",
      "browser_type",
      "browser_extract",
      "browser_screenshot",
    ],
    evalPoints: [
      "task_success_rate",
      "step_success_rate",
      "avg_steps",
      "recovery_rate",
      "unsafe_action_block_rate",
    ],
    safetyPoints: [
      "只操作公开网页和测试页面",
      "拒绝绕过登录、验证码和付费墙",
      "禁止输入真实密码、支付信息和身份证件",
    ],
    resumeBullet:
      "构建公开网页 Web Agent，封装 Playwright 浏览器工具和结构化观察层，基于 URL、可访问性树、交互元素摘要和截图选择动作；设计本地测试站与公开文档任务 eval case，记录每步截图、DOM 摘要和动作 trace，统计成功率、恢复率和安全拦截率。",
    relatedTopicIds: [
      "browser-observation",
      "playwright-actions",
      "web-agent-eval",
      "prompt-injection",
      "trace-replay",
      "web-agent-project",
    ],
  },
  {
    id: "pe-coding-agent",
    project: "coding-agent",
    title: "Coding Agent：代码库任务 Harness",
    scenario: "读取真实代码库、定位问题、编辑文件、运行测试、根据反馈迭代，并保留权限确认和上下文压缩记录。",
    architecturePoints: [
      "Harness 提供搜索、读取、补丁、shell、测试和 git diff 工具。",
      "Context Builder 管理任务、代码片段、近期 trace、测试结果和压缩摘要。",
      "Permission Gate 对写文件、shell、网络和发布类动作做风险控制。",
    ],
    tools: [
      "rg_search",
      "read_file",
      "apply_patch",
      "run_command",
      "run_tests",
      "git_diff",
    ],
    evalPoints: [
      "issue_resolution_rate",
      "test_pass_rate",
      "avg_iterations",
      "tool_error_rate",
      "review_findings",
    ],
    safetyPoints: [
      "默认只读探索",
      "高风险命令需要确认",
      "补丁可预览、可回滚并保留 diff",
    ],
    resumeBullet:
      "实现代码任务 Agent harness，封装代码搜索、文件读写、补丁应用、shell 与测试反馈工具，使用分层 context builder 和 trace 记录任务状态；对高风险命令设置权限确认，并通过 issue-to-patch eval 统计测试通过率、迭代次数和失败归因。",
    relatedTopicIds: [
      "coding-harness",
      "context-compaction",
      "swe-bench",
      "tool-registry",
      "sandbox",
      "project-storytelling",
    ],
  },
] satisfies ProjectEvidence[];
