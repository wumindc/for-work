# ChatGPT 的运行链路

## 一句话定义

ChatGPT 类应用的运行链路，是一次用户请求从 API Gateway 进入后，经过身份与限流、Conversation Store、Context Builder、Model Gateway、safety filter、streaming 输出、Trace/Eval Store 的完整在线推理流程。

## 面试定位

面试官问 ChatGPT 运行链路，通常不是让你复述产品功能，而是看你能否从后端服务视角描述一个 LLM 应用请求如何稳定、安全、可观测地完成。

回答要覆盖架构、数据流、指标、取舍和追问。重点包括上下文如何构建、权限如何隔离、输出如何流式返回、失败如何降级。

## 为什么需要它

很多人以为 ChatGPT 就是“前端把问题发给模型”。真实系统要处理会话、权限、检索、工具、内容安全、成本、延迟、重试、审计和评测。

理解运行链路后，才能回答企业内部助手、代码助手、客服助手如何做权限隔离和可观测性。

## 核心架构

```mermaid
flowchart TD
  A[Client] --> B[API Gateway]
  B --> C[Auth and rate limit]
  C --> D[Conversation Store]
  D --> E[Context Builder]
  F[RAG and tools] --> E
  E --> G[Model Gateway]
  G --> H[Safety filter]
  H --> I[Streaming response]
  H --> J[Trace and Eval Store]
```

| 模块 | 职责 | 关键指标 |
| --- | --- | --- |
| API Gateway | 鉴权、限流、request_id | 4xx/5xx、qps |
| Conversation Store | 保存消息和元数据 | read/write latency |
| Context Builder | 拼接指令、历史、证据和工具 | context_tokens |
| Model Gateway | 路由模型、timeout、retry、fallback | latency、cost |
| safety filter | 输入输出安全策略 | block_rate |
| streaming | 增量返回 token | first_token_latency |

## 架构与运行机制

一次请求会先通过网关鉴权、限流和场景路由。Conversation Store 读取历史消息和摘要。Context Builder 根据权限、窗口预算和任务类型组装上下文，包括 system instruction、用户问题、历史摘要、RAG evidence、tool schema 或 tool observation。

Model Gateway 选择模型和参数，并处理 timeout、retry、fallback、成本记录。输出可以 streaming 返回给客户端，同时进入 safety filter 和 trace。高风险输出需要 verifier 或人工确认。

## 运行机制

1. Client 发送请求，API Gateway 生成 request_id。
2. Auth 层确认用户、租户、权限和速率限制。
3. Conversation Store 读取会话历史和摘要。
4. Context Builder 只拼接当前用户有权访问的内容。
5. Model Gateway 调用模型，并处理超时、重试和降级。
6. 输出通过 safety filter、schema check 或 verifier。
7. streaming 将 token 增量返回，Trace/Eval Store 记录链路。

## 关键设计取舍

| 取舍 | 收益 | 代价 | 建议 |
| --- | --- | --- | --- |
| streaming | 体感延迟低 | 中途拦截复杂 | 高延迟模型常用 |
| 长历史全量注入 | 上下文完整 | 成本和污染高 | 用摘要和检索 |
| 强安全过滤 | 风险低 | 误杀和延迟 | 分风险等级 |
| 多模型 fallback | 可用性高 | 一致性变差 | trace 记录模型 |

## 生产落地细节

- request_id 要贯穿客户端、网关、模型、工具和 trace。
- Context Builder 必须做权限过滤，避免跨用户或跨租户数据进入上下文。
- streaming 输出仍要做安全策略和最终审计。
- 对模型服务要设置 timeout、retry、circuit breaker 和 fallback。
- 指标包括 first_token_latency、end_to_end_latency、context_tokens、output_tokens、cost、fallback_rate、safety_block_rate 和 user_feedback_rate。

## 系统设计案例

企业内部 ChatGPT 助手处理制度问答时，API Gateway 先验证用户部门。Context Builder 只检索该用户有权限的制度文档。Model Gateway 选择低温度参数。答案输出前，verifier 检查 citation 和敏感信息。

数据流是：请求 -> 鉴权 -> 会话读取 -> 权限检索 -> 上下文构建 -> 模型 -> safety filter -> streaming -> trace。任何一步失败都能按 request_id 回放。

## 真实问题与排障

如果用户看到别的部门信息，优先查 Context Builder 的权限过滤和缓存 key。若首 token 很慢，拆分网关、检索、模型和安全过滤耗时。若成本激增，看 context_tokens、重试率和模型路由。

排障时不要只看模型日志，要看整条数据流。

## 常见误区与排障

- 把运行链路简化成前端调用模型。
- 历史消息无限拼接。
- 安全过滤只做输入，不做输出。
- streaming 时不记录完整 trace。
- 缓存 key 缺少 user 或 tenant。

## 面试追问

- Context Builder 如何控制权限和 token？
- streaming 输出如何做安全拦截？
- 模型超时时如何降级？
- 会话历史如何压缩？
- 企业内部助手如何防跨租户泄漏？

## 项目化表达

项目里可以说：“我把 ChatGPT 类应用设计成一条在线推理链路。API Gateway 管入口，Context Builder 管上下文和权限，Model Gateway 管模型调用，safety filter 管安全，Trace/Eval 管可观测和回归。”

## 深入技术细节

ChatGPT 类应用的核心状态不是单条 prompt，而是一组被版本化的上下文层。入口层生成 `request_id` 后，Auth 把 `tenant_id`、`user_id`、role、department、data_scope 写入 request context。Context Builder 根据 task type 选择是否读取 conversation summary、RAG evidence、memory record、tool schema。这里最容易出错的是把历史摘要、检索证据和用户新指令混成一段纯文本，导致权限、来源和优先级丢失。

Streaming 也不是简单把模型 token 原样转发。真实系统常见做法是首 token 快速返回，但同时保留最终输出审计：流式片段进入 buffer，结束后跑 schema check、citation verifier、PII/secret scan 和 safety verdict。高风险场景可以采用 delayed streaming 或 sentence-level buffering，让 safety filter 能在更完整的语义单元上判断。

## 关键数据结构与协议

请求上下文可以建模为 `RequestContext`：`request_id`、`session_id`、`tenant_id`、`user_scope`、`rate_limit_bucket`、`risk_level`、`model_route`、`trace_flags`。上下文包可以建模为 `ContextPack`：`system_policy`、`conversation_summary`、`evidence_items`、`tool_descriptors`、`memory_items`、`token_budget`、`dropped_context`。每个 evidence item 都应包含 `source_id`、`acl`、`version`、`retriever_score` 和 `expires_at`。

Trace 协议要能回答三个问题：请求为什么用了这个模型，模型看到了哪些证据，输出为什么被允许。建议记录 `model_name`、`prompt_hash`、`context_token_count`、`retrieval_top_k`、`first_token_ms`、`total_latency_ms`、`safety_verdict`、`fallback_reason`。这些字段比一大段不可检索日志更适合面试里讲可观测性。

## 深问准备

- 如果追问“streaming 时如何做安全”，回答要区分输入安全、流式中间缓冲、最终输出审计和高风险场景延迟发送。
- 如果追问“历史摘要会不会泄露权限”，要说明摘要本身也需要 scope、version 和重新授权，不能跨用户复用。
- 如果追问“Model Gateway 怎么做 fallback”，要讲 timeout、rate limit、模型不可用、质量降级和 trace 中的 fallback_reason。
- 如果追问“为什么缓存 key 要包含 tenant”，要说明相同 prompt 在不同权限上下文下答案证据不同，共享缓存会造成数据泄漏。

## 来源与延伸阅读

- [OpenAI Text generation guide](https://platform.openai.com/docs/guides/text)
- [OpenAI Streaming guide](https://platform.openai.com/docs/api-reference/streaming)
- [OpenAI Prompt engineering guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [OpenAI Agents SDK Tracing](https://openai.github.io/openai-agents-python/tracing/)
