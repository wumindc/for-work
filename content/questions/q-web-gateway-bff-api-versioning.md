# API Gateway、BFF 和版本治理分别负责什么？

## 面试定位

这道题关联 Gateway、BFF、API 版本与兼容演进、API 契约、幂等与安全治理，难度 4/5，出现频率 high。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。
回答主轴可以从「Gateway、BFF、API 版本与兼容演进」切入：Gateway/BFF 题要从入口治理、认证限流、聚合裁剪、版本兼容、灰度、错误码和客户端兼容展开。

**第一句话建议**
我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。

**不要只答**
- 把所有业务逻辑塞进网关
- BFF 没有契约测试
- 破坏性改字段不通知旧客户端
- 错误码只有中文 message

## 30 秒回答

API Gateway 更偏统一入口，负责认证、TLS、限流、路由、灰度、CORS、WAF、日志和 trace 注入；不应承载大量业务编排。

回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。

## 架构与运行机制

### 标准回答骨架

- API Gateway 更偏统一入口，负责认证、TLS、限流、路由、灰度、CORS、WAF、日志和 trace 注入；不应承载大量业务编排。
- BFF 面向具体端体验，聚合后端接口、裁剪字段、适配移动端/管理端/Agent 控制台的视图模型，但仍要保持契约、权限和错误语义清楚。
- 版本治理要兼容旧客户端：新增字段默认兼容，删除和语义变更要 deprecation、灰度、双写/双读、契约测试和客户端升级窗口。
- 工程指标看 api_error_rate、gateway_4xx_5xx、rate_limit_count、schema_validation_error、deprecated_api_traffic、bff_fanout_count 和 trace_coverage。
- Gateway/BFF 题要从入口治理、认证限流、聚合裁剪、版本兼容、灰度、错误码和客户端兼容展开。
- Gateway 是 API 入口治理层，处理横切能力和路由。
- BFF 是面向特定前端或客户端体验的后端聚合层。
- API 版本是对契约变更兼容性的管理机制。
- Gateway 做通用治理，BFF 做客户端适配，核心业务规则仍应在领域服务。
- API 字段新增默认兼容，删除、重命名和语义变化必须有迁移窗口。
- 错误码、request_id、trace_id、retryable 和文档要稳定。
- 客户端版本分布要可观测，不能盲目下线旧契约。
- Gateway 负责认证、授权、限流、路由、审计和横切治理；BFF 面向具体客户端聚合和裁剪数据。
- API 版本演进要兼容旧客户端，字段新增容易，字段删除和语义变更要灰度迁移。
- API 设计题要讲清 request/response schema、版本、错误码、幂等键、权限、限流、安全审计和可观测性。
- API 契约是客户端和服务端对请求、响应、错误、版本和行为边界的稳定约定。
- API 安全治理是对认证、授权、输入、幂等、限流、审计和数据暴露的系统控制。
- Schema 要稳定可演进。
- 错误码要可行动。
- 写请求要幂等。
- 权限必须服务端校验。
- 高风险操作要审计和二次确认。
- API 契约包括字段、状态码、错误码、分页、排序、幂等和兼容策略。
- 安全治理要覆盖认证、授权、输入校验、限流和审计。


### 数据流怎么讲

可以按浏览器、CDN、网关/BFF、认证授权、API 契约、缓存、文件传输、实时连接、安全策略和可观测性来讲。数据流通常是浏览器带着 cookie/token 和 trace context 访问 CDN 或 Gateway，网关做认证、限流、CORS/CSRF/权限校验，BFF/API 按 schema 执行业务，响应通过 Cache-Control、CSP、Set-Cookie、错误码和 trace_id 把协议边界暴露清楚。


### 落地实现细节

- API Gateway policies：认证、限流、路由、审计。
- BFF aggregation：为 Web/Mobile/Admin 提供定制视图。
- Consumer-driven contract testing：从消费者角度验证兼容性。
- Deprecation policy：弃用公告、灰度、指标和下线窗口。
- BFF 聚合要避免 N+1 下游调用，必要时并行、缓存或批量接口。
- 版本兼容要看实际客户端版本占比和错误率。
- 网关错误要保留原始下游错误分类，同时对外返回稳定错误码。
- Agent tool schema 也需要版本、兼容和弃用策略。
- 网关策略要有灰度、审计和回滚，避免一条规则影响全量流量。
- BFF 聚合多个下游时要设置超时、部分失败、降级和 trace 关联。
- 定义 HTTP 缓存策略、会话边界、认证续期、CSRF/CORS 和敏感响应头。
- 为 API 设计 request schema、response schema、error code、idempotency key 和 version。
- 上线后跟踪 cache hit、auth error、api p95、4xx/5xx、idempotency conflict 和 security audit。
- OpenAPI/JSON Schema。
- Idempotency-Key。
- Rate limit。
- RBAC/ABAC。
- Audit log。
- 错误响应包含 code、message、retryable、request_id。
- 幂等记录保存 request_hash 和 result。
- 高风险 API 要有审批和审计。
- 字段新增要向后兼容，删除要灰度。
- 写接口支持 Idempotency-Key 和 request_id。
- 关键接口要有 schema、version、timeout、retry、幂等键和审计字段。

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

### API 契约治理平台

**需求与边界**
- 契约可版本化。
- 写接口幂等。
- 安全与审计可观测。

**架构拆解**
- Schema Registry。
- Gateway 校验和限流。
- Authz Service。
- Audit Store。

**数据流**
- 请求校验 schema。
- 鉴权授权。
- 检查幂等键。
- 执行业务并审计。

**扩展点与观测指标**
- 按租户限流。
- schema 兼容检查。
- 监控 validation_error、rate_limited、permission_denied。

**取舍**
- 强契约降低灵活性但提升稳定性。
- 审计越细成本越高。

## 真实问题与排障

真实线上问题一般从 status_code、api_error_rate、auth_error_rate、cors_error_count、csrf_block_count、xss_report_count、cache_hit_rate、cdn_origin_fetch_rate、upload_fail_rate、ws_disconnect_rate、schema_validation_error 和 trace_id 看起。回答时要先判断是浏览器策略、缓存、认证授权、网络、API 契约、实时连接还是后端依赖问题。

**现场排障回答法**
- 先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。
- 按数据流分段定位，不要一上来就改参数或调 prompt。
- 查看最近发布、配置变更、数据分布变化、下游限流和资源水位。
- 先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。
- 最后把样本沉淀为 eval/regression case，并补齐监控告警。

**重点指标**
- gateway_error_rate
- bff_downstream_timeout_count
- api_version_usage
- schema_validation_error
- route_rollback_count
- api_error_rate
- idempotency_conflict_count
- permission_denied_count
- rate_limited_count

## 多轮追问模拟

### 追问 1：BFF 会不会变成大泥球？

**回答要点**：会，所以 BFF 应只做端侧视图聚合和协议适配，复杂业务规则留在领域服务；BFF 代码要按页面/场景拆模块，有契约测试、超时预算、并发 fan-out 限制和错误降级。重复聚合逻辑可以沉淀到共享查询服务，但不要过早抽象。

**考察点**：视图聚合、契约测试

### 追问 2：版本号放 URL 还是 Header？

**回答要点**：两者都可，关键是语义清晰和治理流程。公开 REST API 常用 /v1，内部或媒体类型协商可用 Header。无论哪种，都要有兼容策略、弃用公告、流量统计、契约测试和灰度发布，不能把版本号当成随意分支。

**考察点**：兼容、deprecation

### 追问 3：网关限流和业务限流怎么分层？

**回答要点**：网关限流保护入口和租户公平，按 IP、用户、租户、路径、token 做粗粒度限制；业务限流保护具体资源和下游容量，比如导出任务、支付创建、模型调用额度。两个层面都要返回可行动错误码、Retry-After 和 request_id。

**考察点**：租户公平、Retry-After

### 延伸追问 1：BFF 会不会变成大泥球？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲管理后台、移动端首页、Web Agent 控制台和开放 API 平台。；用 OpenAPI/JSON Schema、consumer-driven contract、灰度路由和 deprecated traffic 指标作为证据。

### 延伸追问 2：版本号放 URL 还是 Header？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲管理后台、移动端首页、Web Agent 控制台和开放 API 平台。；用 OpenAPI/JSON Schema、consumer-driven contract、灰度路由和 deprecated traffic 指标作为证据。

### 延伸追问 3：网关限流和业务限流怎么分层？

回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：可以讲管理后台、移动端首页、Web Agent 控制台和开放 API 平台。；用 OpenAPI/JSON Schema、consumer-driven contract、灰度路由和 deprecated traffic 指标作为证据。

## 项目化回答与取舍

**项目证据怎么挂钩**
- 可以讲管理后台、移动端首页、Web Agent 控制台和开放 API 平台。
- 用 OpenAPI/JSON Schema、consumer-driven contract、灰度路由和 deprecated traffic 指标作为证据。

**取舍总结**
Web 工程的取舍是用户体验、性能、安全、兼容性、可演进和可观测性之间的平衡。面试追问通常会围绕 HTTP 缓存、Cookie/Session/JWT/OAuth、CORS/CSRF/XSS/CSP、CDN、上传下载、WebSocket/SSE、BFF、API 版本、错误码和 Agent tool schema 展开。

**收尾句**
这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。

## 深挖技术细节

- API Gateway policies：认证、限流、路由、审计。
- BFF aggregation：为 Web/Mobile/Admin 提供定制视图。
- Consumer-driven contract testing：从消费者角度验证兼容性。
- Deprecation policy：弃用公告、灰度、指标和下线窗口。
- BFF 聚合要避免 N+1 下游调用，必要时并行、缓存或批量接口。
- 版本兼容要看实际客户端版本占比和错误率。
- 网关错误要保留原始下游错误分类，同时对外返回稳定错误码。
- Agent tool schema 也需要版本、兼容和弃用策略。
- 网关策略要有灰度、审计和回滚，避免一条规则影响全量流量。
- BFF 聚合多个下游时要设置超时、部分失败、降级和 trace 关联。
- 定义 HTTP 缓存策略、会话边界、认证续期、CSRF/CORS 和敏感响应头。
- 为 API 设计 request schema、response schema、error code、idempotency key 和 version。
- 上线后跟踪 cache hit、auth error、api p95、4xx/5xx、idempotency conflict 和 security audit。
- OpenAPI/JSON Schema。
- Idempotency-Key。
- Rate limit。
- RBAC/ABAC。
- Audit log。
- 错误响应包含 code、message、retryable、request_id。
- 幂等记录保存 request_hash 和 result。
- 高风险 API 要有审批和审计。
- 字段新增要向后兼容，删除要灰度。
- 写接口支持 Idempotency-Key 和 request_id。
- Gateway/BFF 题要从入口治理、认证限流、聚合裁剪、版本兼容、灰度、错误码和客户端兼容展开。

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

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/info/rfc9110)：用于确认官方语义边界、命令行为和工程约束。
- [OWASP API Security Project](https://owasp.org/www-project-api-security/)：用于确认官方语义边界、命令行为和工程约束。
- [Kubernetes Documentation: Service](https://kubernetes.io/docs/concepts/services-networking/service/)：用于确认官方语义边界、命令行为和工程约束。
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/info/rfc9110)：用于确认官方语义边界、命令行为和工程约束。
- [OWASP API Security Project](https://owasp.org/www-project-api-security/)：用于确认官方语义边界、命令行为和工程约束。
- [Model Context Protocol](https://modelcontextprotocol.io/)：用于确认官方语义边界、命令行为和工程约束。
