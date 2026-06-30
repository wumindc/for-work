# Agent 的工具注册表应该怎么设计？

## 面试定位

这道题考的是 Agent 工具治理能力。不要只说“用一个 Map 存函数”。工具注册表在生产系统里同时承担工具发现、模型可见工具裁剪、版本管理、权限策略、执行调度和审计入口。回答要把 registry、dispatcher、permission、owner、version、数据流、指标和取舍讲完整。

## 30 秒回答

工具注册表是 Agent 可用能力的控制平面。它保存每个工具的 name、description、input schema、output schema、owner、version、riskLevel、permissionScope、read/write、timeout、health 和 examples。运行时根据用户、任务、上下文和权限裁剪候选工具，只把少量合适 schema 给模型。真正执行由 dispatcher 完成，并把调用结果写入 trace。这样能减少模型选错工具，也能让工具升级、下线和审计有统一入口。

## 标准回答

我会把工具注册表分成定义层和执行层。定义层面向模型，描述工具是什么、何时使用、参数和返回结构。执行层面向宿主，保存真实 handler、凭证引用、权限策略、限流和回滚能力。模型不应拿到执行凭证，执行凭证只应由宿主和受控运行时管理。

设计时还要支持版本。一个工具的 schema 改了，历史 trace、评测样本和旧 prompt 可能都会受影响。Registry 应记录 schema version、兼容性说明、灰度状态和 owner。这样当 `invalid_args_rate` 或 `schema_compatibility_errors` 上升时，能定位到具体版本。

## 架构与运行机制

典型数据流是：Registry Store 保存工具元数据，Tool Selector 根据 task intent、domain、用户权限和上下文选出候选工具，Context Builder 把精简 schema 放入模型上下文。模型返回 tool call 后，Dispatcher 回 registry 查执行器、schema 和策略。Validator 处理参数和业务校验。Permission Gate 判断是否允许。Executor 执行真实动作。Observation 和 error envelope 写入 State 与 Trace。

关键指标包括 `tool_selection_accuracy`、`valid_call_rate`、`invalid_args_rate`、`permission_denial_rate`、`tool_availability`、`tool_latency_p95` 和 `schema_compatibility_errors`。这些指标应该按 tool、version、model 和任务类型拆分。

## 可画图

```mermaid
flowchart LR
  Store[Registry Store] --> Selector[Tool Selector]
  Selector --> Context[Model-visible Tool Specs]
  Context --> Model[Model]
  Model --> Call[tool_call]
  Call --> Dispatcher[Dispatcher]
  Dispatcher --> Store
  Dispatcher --> Validator[Validator]
  Validator --> Gate[Permission Gate]
  Gate --> Executor[Tool Executor]
  Executor --> Trace[Observation + Trace]
```

图 1：工具注册表从能力发现、模型可见裁剪到执行鉴权和 trace 的控制流。

这张图里，Registry Store 保存工具定义、版本、owner、风险等级、权限范围、健康状态和执行引用。Tool Selector 先根据任务意图、用户权限、domain 和上下文裁剪候选工具，Context Builder 只把少量 Model-visible Tool Specs 暴露给模型。模型返回 tool_call 后，Dispatcher 再回到 Registry Store 解析 `tool_id@version`，Validator 校验 schema 和业务规则，Permission Gate 做确定性授权，Tool Executor 执行真实动作。Observation + Trace 把参数摘要、权限决策、版本和错误码写入记录，让工具选择错误、schema 兼容问题和越权拦截都能追溯。

## 系统设计案例

以企业内部助手为例，HR、财务、研发都有不同工具。员工只能看到自己有权限的工具，管理员能看到更多审计和管理工具。Registry 记录每个工具的 domain、permission scope、owner、version 和 risk level。Tool Selector 根据用户身份和任务类型裁剪列表，避免把财务写操作暴露给普通问答任务。

如果要接 MCP Server，Registry 可以把远程 server 的 tools 同步为统一元数据，但执行时仍通过 dispatcher 加权限和审计。这样既支持动态能力发现，又不把远端工具完全交给模型自由使用。

## 真实问题与排障

如果模型选错工具，先看候选列表是否过大，再看 description 是否互相重叠。可以用 tool router 或 embedding retrieval 先筛候选，再让模型在小集合中选择。如果调用成功率突然下降，按 version 查 schema 变更，确认是否新增 required 字段或 enum 改名。

如果出现越权调用，排查 registry metadata 和 permission gate 是否一致。只在 schema 里写“不要用于高风险场景”是不够的，执行层必须阻断。工具下线时也要保留兼容层或迁移策略，否则历史 trace replay 和评测 fixture 会失效。

## 面试官追问

- 静态注册和动态注册怎么取舍？静态注册类型安全、简单，动态注册适合多租户和工具市场，但需要签名、健康检查和权限治理。
- 工具太多怎么办？先按任务 domain 裁剪，再用 router 选候选，最后只给模型少量 schema。
- owner 字段有什么用？owner 负责版本、SLA、错误码、文档和事故响应。

## 多轮追问模拟

第一轮追问：Registry 和 Dispatcher 的职责怎么拆？
回答要点：Registry 管工具元数据、版本、权限、健康和 owner；Dispatcher 负责按 registry resolve 执行器、校验策略、调用运行时并写 trace。考察点是控制面和执行面的边界。陷阱是把 registry 写成函数 Map，既无治理也无审计。

第二轮追问：工具太多时如何避免模型选错？
回答要点：先按用户权限和任务 domain 过滤，再用 router/retrieval 召回候选，最后只把少量 schema 放进上下文；监控 `unused_exposed_tools` 和 `tool_selection_accuracy`。考察点是候选裁剪。陷阱是把所有工具一次性暴露给模型。

第三轮追问：动态接入 MCP Server 有什么额外风险？
回答要点：需要签名、来源验证、健康检查、scope 同步、工具下线策略和服务端二次鉴权；动态发现不等于动态授权。考察点是插件化治理。陷阱是把远端 tools 列表原样交给模型。

第四轮追问：工具版本升级如何不破坏旧任务？
回答要点：使用 version pinning、schema hash、灰度、兼容层和 trace replay；新增 required 字段属于破坏性变更，需要 fixtures 和 shadow run。考察点是版本兼容。陷阱是直接覆盖 schema，导致历史 prompt 和评测样本失效。

## 项目化回答

项目中我会把 Registry 做成一个可审计目录。新增工具必须提交 schema、examples、权限策略、错误协议和验收 fixture。运行时 trace 记录 tool id、version、参数摘要、权限决策、latency、error_code 和 observation summary。面试表达时可以说：这套设计让架构可治理，数据流可追踪，指标可归因，取舍也清晰。

## 常见错误

- 把工具注册表写成函数 Map，缺少版本、owner 和权限。
- 一次性把所有工具暴露给模型，导致选择错误和上下文膨胀。
- 工具定义和执行凭证耦合，安全边界不清。
- 没有 schema 兼容性和下线策略，升级后破坏旧任务。

## 深挖技术细节

工具注册表要同时服务模型可见层和运行时执行层。模型可见层需要 `name`、`description`、`input_schema`、`output_schema`、`examples` 和 `when_not_to_use`；运行时层需要 `tool_id`、`handler_ref`、`owner`、`version`、`permission_scope`、`risk_level`、`side_effect`、`idempotent`、`timeout_ms`、`health_status`、`rate_limit` 和 `audit_policy`。

每次执行都应该重新从 registry resolve 到 `tool_id@version`，而不是相信模型传来的工具名。Dispatcher 要检查工具是否启用、schema 是否兼容、用户是否有 scope、工具是否健康、是否需要确认。trace 记录 `tool_id`、`version`、`args_hash`、`policy_decision`、`latency_ms` 和 `error_code`，这样才能定位某个版本上线后错误率上升。

## 边界条件与反例

静态 registry 简单、安全、类型清楚，适合小团队和核心工具；动态 registry 适合多租户、插件市场或 MCP Server，但必须有签名、健康检查、权限同步和下线策略。不能因为“动态发现”就把远端工具全部交给模型自由选择。

另一个反例是把工具权限写在 Agent prompt 里。prompt 可以帮助模型少犯错，但不能防止越权执行。权限必须在 registry metadata 和 Permission Gate 中做 deterministic 校验，尤其是财务、HR、生产运维和写操作工具。

## 深问准备

面试官问“工具太多怎么办”，可以回答三段式裁剪：先按用户权限和任务 domain 过滤，再用 router/retrieval 召回候选工具，最后只把少量 schema 放进上下文。指标看 `unused_exposed_tools`、`tool_selection_accuracy`、`invalid_args_rate` 和 `permission_denial_rate`。

问“工具版本怎么升级”，可以讲 version pinning、灰度、兼容层和 trace replay。新增 required 字段或改变输出结构是破坏性变更，必须跑历史 fixtures；旧任务可以固定旧版本，新版本 shadow 一段时间后再切流量。

## 来源与延伸阅读

- [Model Context Protocol](https://modelcontextprotocol.io/)：用于理解外部工具能力如何以 tools/resources 暴露给 Host，并映射到统一 registry。
- [OpenAI A practical guide to building agents](https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf)：用于支持工具治理、人工审核和可控执行的工程实践。
