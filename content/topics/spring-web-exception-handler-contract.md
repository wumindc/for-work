# 统一异常处理、错误码与 REST 契约治理

## 面试定位

统一异常处理、错误码与 REST 契约治理 属于 Spring Java 后端体系 / Spring MVC、REST 与参数校验。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：统一异常处理把业务异常、参数错误、权限失败、依赖超时和系统错误转换为稳定错误码、HTTP 状态和可观测事件。

**必须讲清楚**
- 统一异常处理是服务端错误语义的出口层。
- 错误码是前后端、客服、监控和排障共享的契约。
- REST 契约治理要求成功和失败响应都稳定。
- 统一异常处理把业务异常、参数错误、权限失败、依赖超时和系统错误转换为稳定错误码、HTTP 状态和可观测事件。
- 错误码要可行动
- 异常要分层
- 不要泄露内部细节

**常见追问方向**
- Spring 核心题先讲 IoC、Bean 生命周期、代理和 AOP，再落到事务、MVC 或 Security 的实现。
- Spring Boot 题先讲自动配置、条件装配和配置绑定，再讲启动、部署、Actuator 和生产排障。
- Spring Cloud 题要把注册发现、配置、调用、网关、熔断、限流、链路追踪和灰度发布串成一条线。
- 如果这个点落到 Web Agent：公开网页任务自动化与评测、Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 错误分类要能指导用户、前端和运维动作。
- 内部异常和对外错误响应要解耦。
- 可重试和不可重试错误必须区分。
- 错误响应要能关联 trace。
- ControllerAdvice/ExceptionHandler 负责将异常映射为标准响应，并记录 trace_id、错误码、影响面和告警维度。
- 业务异常、校验异常、认证授权异常、幂等冲突、下游超时和系统异常应有不同处理策略。
- ControllerAdvice。
- Problem Details / error envelope。
- Error code registry。
- Consumer-driven contract。
- 错误码注册表要包含 owner、含义、HTTP 状态、是否可重试和排查建议。
- 参数校验错误返回字段级详情，但避免泄露敏感 schema。
- 依赖超时要记录 dependency、timeout、retry 和 fallback。


### 通用数据流

可以按 HTTP 入口、DispatcherServlet、Controller、Service、事务代理、Mapper、数据库、缓存、下游服务、网关、安全和 Actuator 指标来讲。数据流通常是请求经过网关和鉴权进入 Spring MVC，参数绑定和校验后进入业务层；AOP 代理控制事务、鉴权、日志或重试，MyBatis/Repository 访问事实源，Spring Cloud 负责发现、负载均衡、熔断、配置和网关路由，观测层用 metrics、trace、log 和健康检查证明系统可运行。


### 工程落点

- 为服务定义 Controller、Service、Mapper、事务边界、错误码、日志、指标、配置和测试策略。
- 明确哪些逻辑属于业务事务，哪些属于远程调用、异步事件、缓存或最终一致性补偿。
- 上线后跟踪 HTTP p95、错误率、线程池、连接池、慢 SQL、事务回滚、依赖超时和配置变更。
- 错误响应应包含 code、message、trace_id、retryable 和必要上下文，不包含堆栈或敏感信息。
- 异常统计要进入指标和日志，支持按接口、错误码、版本和租户聚合。
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

图 1：统一异常处理、错误码与 REST 契约治理 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### 统一异常处理、错误码与 REST 契约治理 的面试级设计题

典型设计题是把一个订单、审批、内容平台或 Agent 后端服务做成 Spring Boot/Spring Cloud 生产系统。架构上要包含 Controller/DTO/Service/Mapper 分层、事务边界、错误码、幂等键、MyBatis SQL、配置治理、服务发现、Gateway、OpenFeign、Resilience4j、Spring Security、Actuator、日志 Trace 和灰度发布。

**可画架构**
- 入口层：Gateway/Filter/Security 处理路由、认证、限流、trace_id、租户和基础安全策略。
- Web 层：DispatcherServlet、HandlerMapping、参数绑定、Bean Validation、ControllerAdvice 和消息转换形成 REST 契约。
- 业务层：Service 定义事务边界、领域状态变更、幂等校验、事件发布和下游调用策略。
- 数据层：MyBatis Mapper、动态 SQL、ResultMap、分页、批处理、连接池和数据库事务共同决定数据访问质量。
- 治理层：服务发现、配置、OpenFeign、LoadBalancer、Resilience4j、Actuator、日志、Trace 和指标支撑生产运行。

**数据流**
- 请求进入 Gateway 后完成路由、鉴权、限流和 trace 上下文传播。
- Spring MVC 完成参数解析、校验、Controller 调用、返回值处理和统一异常映射。
- Service 通过 AOP 代理进入事务边界，执行幂等校验、状态变更、Mapper SQL 和必要的 outbox 记录。
- 远程依赖通过 OpenFeign/LoadBalancer/Resilience4j 执行超时、重试、熔断、降级和指标上报。
- Actuator、Micrometer、日志和 Trace 把错误码、慢 SQL、事务耗时、下游延迟和健康状态串成排障证据。

## 真实问题与排障

真实线上问题一般从接口 p95/p99、错误码分布、Spring Bean 创建失败、自动配置不生效、事务失效、连接池耗尽、慢 SQL、Mapper 参数错误、Feign 超时、Gateway 5xx、熔断打开、鉴权失败、Actuator health 和最近配置/发布变更看起。回答时要先确认影响面和止血动作，再沿入口、代理、事务、SQL、下游、配置和观测逐层定位。

**排查顺序**
- 先确认影响面：哪个接口、租户、版本、错误码、p95/p99、下游和数据库指标异常。
- 检查最近发布、配置、Profile、自动配置条件、Bean 创建日志和 Actuator health。
- 沿请求链路排查 Controller 参数、校验、异常映射、AOP 代理、事务边界和安全过滤链。
- 沿数据链路排查 SQL、索引、ResultMap、分页、连接池、锁等待、死锁和慢查询。
- 沿微服务链路排查服务发现、Gateway 路由、Feign timeout、retry、circuit breaker、fallback 和限流配置。
- 止血可以回滚配置/版本、摘流、限流、扩大连接池短期容量、关闭问题开关或降级非核心接口。

**重点指标**
- error_code_cardinality
- unknown_error_rate
- validation_error_rate
- retryable_error_rate
- trace_lookup_success_rate

**常见误区**
- 所有异常都返回 500
- 把数据库异常原样暴露给用户
- 前端根据中文 message 判断分支

## 业界方案与技术取舍

Spring 体系的取舍是成熟生态、约定配置和生产治理能力换来了抽象层多、代理边界隐蔽、自动配置调试成本和微服务治理复杂度。面试追问通常会围绕 Bean 生命周期、AOP 自调用、@Transactional 失效、自动配置条件、REST 契约、MyBatis 缓存、N+1、OpenFeign 超时、Gateway Filter 顺序、熔断限流和 Security 鉴权链展开。

**方案对比**
- ControllerAdvice。
- Problem Details / error envelope。
- Error code registry。
- Consumer-driven contract。
- 错误码越细定位越好但治理成本越高。
- 隐藏内部细节更安全但客服定位需要 trace_id。
- 统一包装便于前端处理但要避免破坏标准 HTTP 语义。
- 先把 Spring Java 后端看成容器、Web 层、数据访问、事务、微服务治理和生产观测组合起来的工程体系。
- 面试回答不能只背注解，要解释注解背后的 Bean、代理、拦截器、连接、线程、事务和调用链。
- 架构师级回答要能从单体服务推进到微服务、权限、配置、发布、观测和故障恢复。
- 这类题特别适合讲架构师如何建立团队 API 规范。
- 能和前后端契约、观测、客服工单和事故复盘连起来。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

统一异常处理把业务异常、参数错误、权限失败、依赖超时和系统错误转换为稳定错误码、HTTP 状态和可观测事件。 统一异常处理是服务端错误语义的出口层。 错误码是前后端、客服、监控和排障共享的契约。 REST 契约治理要求成功和失败响应都稳定。 错误分类要能指导用户、前端和运维动作。 内部异常和对外错误响应要解耦。 可重试和不可重试错误必须区分。 错误响应要能关联 trace。

面试深挖时要把 Spring 容器、代理、Web 请求链路、事务、SQL、微服务治理和生产观测串起来。不要只背注解用法，要说明注解背后的生效条件、失败边界和排障证据。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `bean_name` | Spring Bean | 标识容器对象和依赖关系 | 排查循环依赖、条件装配和覆盖问题 |
| `proxy_target` | AOP 代理 | 标识事务、安全、缓存等增强目标 | 排查自调用和事务失效 |
| `request_id` | HTTP 请求 | 串联 Gateway、Controller、Service、SQL 和下游 | 定位单次失败链路 |
| `transaction_id` | 事务边界 | 标识连接绑定、传播行为和回滚状态 | 排查长事务、死锁和错误提交 |
| `mapper_id` | MyBatis 语句 | 标识 namespace + statement | 排查慢 SQL、参数绑定和 ResultMap 问题 |
| `route_id` | Gateway 路由 | 标识入口路由、断言和过滤器链 | 排查错路由、5xx 和限流策略 |
| `error_code` | REST 契约 | 标识可行动错误语义 | 排查前后端联调、告警聚合和客服定位 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 来源与延伸阅读

- [Spring Framework Reference Documentation](https://docs.spring.io/spring-framework/reference/index.html)：用于确认官方语义边界、命令行为和工程约束。
- [OWASP API Security Project](https://owasp.org/www-project-api-security/)：用于确认官方语义边界、命令行为和工程约束。
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/info/rfc9110)：用于确认官方语义边界、命令行为和工程约束。
