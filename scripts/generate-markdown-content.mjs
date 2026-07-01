// @author codex
import fs from "node:fs";
import path from "node:path";
import { categories, domains, projectEvidence, questions, sources, topics } from "../src/data/index.ts";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");
const force = process.argv.includes("--force");

const categoryById = new Map(categories.map((category) => [category.id, category]));
const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const topicById = new Map(topics.map((topic) => [topic.id, topic]));
const sourceById = new Map(sources.map((source) => [source.id, source]));
const projectTitleById = new Map(projectEvidence.map((item) => [item.id, item.title]));

const uniq = (items) => [...new Set(items.filter((item) => Boolean(item?.trim())))];
const sentences = (items, limit = 8) => uniq(items).slice(0, limit);
const bulletList = (items, fallback) => {
  const normalized = sentences(items.length > 0 ? items : fallback, 24);
  return normalized.map((item) => `- ${item}`).join("\n");
};
const sectionText = (title, body) => `## ${title}\n\n${body.trim()}\n`;
const subSectionText = (title, body) => `### ${title}\n\n${body.trim()}\n`;
const paragraph = (items) => sentences(items, 8).join(" ");
const trimSentenceEnd = (text) => text.replace(/[。；;,.，\s]+$/g, "");
const fileExists = (dir, id) => fs.existsSync(path.join(dir, `${id}.md`));
const writeMarkdown = (dir, id, markdown) => {
  fs.writeFileSync(path.join(dir, `${id}.md`), `${markdown.trim()}\n`, "utf8");
};

const inferDomainId = (topic) => topic.domainId ?? categoryById.get(topic.categoryId)?.domainId ?? "ai-agent-rag";
const domainLabel = (topic) => domainById.get(inferDomainId(topic))?.title ?? "AI Agent 与 RAG";
const projectLabels = (projectEvidenceIds = []) =>
  projectEvidenceIds.map((id) => projectTitleById.get(id) ?? id).join("、");

const playbookFor = (topic) => {
  const domainId = inferDomainId(topic);
  if (domainId === "elasticsearch") {
    return {
      architecture:
        "可以按业务请求、索引建模、写入链路、查询链路、分片副本、JVM/线程池、容量治理七层来讲。数据流通常是业务库或日志源通过 CDC、Logstash、Flink 或应用双写进入 ES，先经过 mapping、analyzer、routing、primary shard、replica、refresh，再通过 query/filter、score、sort、aggregation 返回结果。",
      scenario:
        "典型设计题是订单/商品/日志检索平台：MySQL 仍是强事务主库，ES 负责全文检索、组合过滤、近实时分析和日志排障。架构上要包含数据同步、索引模板、alias 切换、冷热分层、查询模板、慢查询 profile 和容量监控。",
      troubleshooting:
        "真实线上问题一般从慢查询、热点分片、refresh/merge 压力、heap 使用率、fielddata、磁盘水位、thread pool rejected、segment 数、GC pause 和 query cache 命中率看起。回答时要说明先止血、再定位、最后做容量和 mapping 治理。",
      tradeoff:
        "ES 的取舍是检索能力强、近实时、横向扩展方便，但不适合做强事务主库，也不适合任意深分页和无限制高基数字段聚合。面试追问通常会围绕倒排索引、B+ 树区别、refresh 为什么近实时、分片怎么规划、如何避免双写不一致展开。",
    };
  }

  if (domainId === "mq") {
    return {
      architecture:
        "可以按 producer、broker、topic/queue、partition、consumer group、ack、retry、DLQ、幂等表和监控告警来讲。数据流是业务事务产生事件，producer 带 message key、event_id 和 payload schema 发送到 broker，broker 持久化并按分区投递，consumer 处理后提交 ack，并把失败消息进入 retry topic 或 DLQ。",
      scenario:
        "典型设计题是订单创建后通知库存、积分、风控、搜索索引和 AI Agent 异步任务。架构上要明确同步主链路只保证核心事务，异步事件通过 MQ 解耦，消费者使用幂等键、状态机和补偿任务实现最终一致性。",
      troubleshooting:
        "真实线上问题一般从 consumer lag、retry rate、DLQ count、processing latency、duplicate rate、rebalance 次数、broker 磁盘和网络、单条毒丸消息、下游限流和消费者线程池饱和看起。回答时要区分消息丢失、重复、乱序、积压和事务不一致。",
      tradeoff:
        "MQ 的取舍是吞吐和解耦换来了异步一致性、重复消费、顺序限制和排障复杂度。面试追问通常会问可靠投递端到端怎么闭环、为什么不能只靠 MQ 保证 exactly-once、全局顺序为什么代价高、Outbox 和事务消息如何选。",
    };
  }

  if (domainId === "redis") {
    return {
      architecture:
        "可以按 key/value 数据模型、数据结构编码、过期与淘汰、持久化、复制高可用、Cluster 分片、Lua 原子脚本、客户端连接池和可观测性来讲。数据流通常是应用先做 key schema 和参数校验，再访问 Redis；Redis 根据数据结构执行命令，命中内存后返回；写入侧还要考虑 AOF/RDB、replica backlog、failover 和内存淘汰策略。",
      scenario:
        "典型设计题是商品详情缓存、排行榜、分布式锁、限流器、会话状态或延迟任务。架构上要明确 Redis 是缓存/协同状态/轻量队列，不是关系数据库事实源；关键路径要包含 DB 事实源、缓存失效、回源保护、降级开关和 Redis 指标看板。",
      troubleshooting:
        "真实线上问题一般从 hot key、big key、slowlog、latency monitor、evicted_keys、expired_keys、used_memory、mem_fragmentation_ratio、connected_clients、blocked_clients、replication lag、AOF rewrite 和 Cluster slot 迁移看起。回答时要先保护 DB 和核心接口，再定位是命令模型、数据结构、内存、网络、复制还是客户端问题。",
      tradeoff:
        "Redis 的取舍是低延迟和丰富数据结构换来了内存成本、过期/淘汰不确定性、复制延迟、故障切换窗口和一致性治理成本。面试追问通常会围绕 String/Hash/List/Set/ZSet 选型、跳表和字典编码、AOF/RDB、分布式锁安全性、Cluster reshard 和缓存一致性展开。",
    };
  }

  if (domainId === "database") {
    return {
      architecture:
        "可以按业务查询入口、SQL 访问路径、索引、执行计划、锁/MVCC、事务边界、复制链路、备份恢复、Schema 变更和观测指标来讲。数据流通常是应用带着 request_id、tenant_id、幂等键和查询条件进入服务层，服务层选择读主库、读副本、缓存或异步事件；数据库优化器根据统计信息和索引选择 plan，事务层通过 MVCC、锁和日志保证并发正确性，运维层通过备份、复制和 DDL 流程保证可恢复、可演进。",
      scenario:
        "典型设计题是订单库、库存库、任务表、消息 outbox、搜索同步或 AI Agent trace 存储。架构上要明确数据库是事实源，Redis/ES 是读模型或缓存，MQ/CDC 负责事件传播；核心设计要包含索引评审、事务边界、读写分离、分片键、Online DDL、备份恢复演练和慢查询看板。",
      troubleshooting:
        "真实线上问题一般从 slow query、rows examined、plan regression、lock wait、deadlock、replication lag、buffer pool hit rate、connection pool saturation、DDL blocking、backup lag 和 schema migration error 看起。回答时要先确认业务影响和止血路径，再沿 SQL、索引、锁、事务、复制、容量和发布变更逐层定位。",
      tradeoff:
        "数据库的取舍是强一致、事务和成熟查询能力换来了 schema 演进成本、锁竞争、扩展边界和运维复杂度。面试追问通常会围绕 B+ 树和执行计划、MVCC 和锁、Join 和分页优化、主从延迟、分库分表、Online DDL、备份恢复和缓存/读模型一致性展开。",
    };
  }

  if (domainId === "java-jvm") {
    return {
      architecture:
        "可以按请求入口、线程池、任务队列、JMM 可见性、锁/CAS、异步编排、类加载边界、堆/非堆内存、GC、JFR/dump 证据和观测指标来讲。数据流通常是请求进入 Java 服务后带着 trace、tenant 和上下文进入同步或异步执行路径；线程池调度任务，锁和内存模型保证并发语义，JVM 通过 GC 和运行时管理内存，观测系统把线程、堆、GC、异常、下游和业务 SLA 串成证据链。",
      scenario:
        "典型设计题是订单服务异步化、MQ 消费者、定时任务平台、Agent tool execution worker 或高并发缓存回源。架构上要包含线程池隔离、有界队列、超时取消、上下文传播、锁竞争治理、JFR/GC log、heap/thread dump、Prometheus 指标和故障降级。",
      troubleshooting:
        "真实线上问题一般从接口 p95/p99、线程池 active/queue/reject、lock contention、deadlock、CPU、GC pause、allocation rate、heap used after GC、direct memory、metaspace、classloader leak、JFR event 和 thread dump 看起。回答时要先确认影响面和止血动作，再区分线程池、锁、对象分配、GC、类加载、下游依赖和代码发布变更。",
      tradeoff:
        "Java/JVM 的取舍是成熟生态、强类型和高吞吐运行时换来了并发语义复杂、对象分配成本、GC 停顿、线程和类加载治理成本。面试追问通常会围绕 JMM happens-before、volatile 是否保证原子性、synchronized/ReentrantLock/AQS、ConcurrentHashMap、CompletableFuture 超时取消、类加载隔离、GC 日志和内存泄漏定位展开。",
    };
  }

  if (domainId === "spring-java-backend") {
    return {
      architecture:
        "可以按 HTTP 入口、DispatcherServlet、Controller、Service、事务代理、Mapper、数据库、缓存、下游服务、网关、安全和 Actuator 指标来讲。数据流通常是请求经过网关和鉴权进入 Spring MVC，参数绑定和校验后进入业务层；AOP 代理控制事务、鉴权、日志或重试，MyBatis/Repository 访问事实源，Spring Cloud 负责发现、负载均衡、熔断、配置和网关路由，观测层用 metrics、trace、log 和健康检查证明系统可运行。",
      scenario:
        "典型设计题是把一个订单、审批、内容平台或 Agent 后端服务做成 Spring Boot/Spring Cloud 生产系统。架构上要包含 Controller/DTO/Service/Mapper 分层、事务边界、错误码、幂等键、MyBatis SQL、配置治理、服务发现、Gateway、OpenFeign、Resilience4j、Spring Security、Actuator、日志 Trace 和灰度发布。",
      troubleshooting:
        "真实线上问题一般从接口 p95/p99、错误码分布、Spring Bean 创建失败、自动配置不生效、事务失效、连接池耗尽、慢 SQL、Mapper 参数错误、Feign 超时、Gateway 5xx、熔断打开、鉴权失败、Actuator health 和最近配置/发布变更看起。回答时要先确认影响面和止血动作，再沿入口、代理、事务、SQL、下游、配置和观测逐层定位。",
      tradeoff:
        "Spring 体系的取舍是成熟生态、约定配置和生产治理能力换来了抽象层多、代理边界隐蔽、自动配置调试成本和微服务治理复杂度。面试追问通常会围绕 Bean 生命周期、AOP 自调用、@Transactional 失效、自动配置条件、REST 契约、MyBatis 缓存、N+1、OpenFeign 超时、Gateway Filter 顺序、熔断限流和 Security 鉴权链展开。",
    };
  }

  if (domainId === "coding-algorithms-interview") {
    return {
      architecture:
        "可以按题意翻译、输入规模、复杂度上限、数据结构选择、算法范式、状态定义、边界用例、Java 模板和验证过程来讲。数据流通常是先把题目对象化，抽出数组、图、树、区间、状态或约束；再选双指针、哈希、栈队列、二分、回溯、DP、贪心、堆、BFS/DFS、并查集或拓扑排序；最后用样例、反例、空值、重复值、极值和复杂度证明代码正确。",
      scenario:
        "典型面试场景是 30 到 45 分钟完成一道中等题或两道基础题。回答要包含暴力解、瓶颈分析、优化方向、核心不变量、代码结构、复杂度、测试用例和 bug 修复过程；如果卡住，要能主动降级到可运行版本并说明后续优化。",
      troubleshooting:
        "真实编码翻车一般从边界条件、下标越界、循环不收敛、二分边界、状态转移漏初始化、回溯忘撤销、图访问重复、堆排序方向、哈希计数更新、整数溢出和 Java API 误用看起。回答时要用打印变量、手跑样例、构造反例和复杂度复核快速定位。",
      tradeoff:
        "算法题的取舍是可读性、正确性、复杂度和面试表达之间的平衡。面试追问通常会围绕为什么这个结构足够、能否从 O(n^2) 优化到 O(n log n) 或 O(n)、边界怎么证明、空间能否压缩、递归能否改迭代、以及 Java 代码是否能在压力数据下通过展开。",
    };
  }

  if (domainId === "prometheus-observability") {
    return {
      architecture:
        "可以按业务 SLO、指标、日志、Trace、事件、告警、Dashboard、Runbook、事故复盘和回归验证来讲。数据流通常是服务暴露 metrics、写结构化日志、传播 trace context；Collector/Prometheus/日志系统采集后执行 recording rules、采样、索引和告警，Incident Console 把症状、路径、日志细节、发布变更和用户影响串成时间线。",
      scenario:
        "典型设计题是订单服务可观测体系、MQ 消费积压排障、JVM/Redis 联动事故、RAG 质量退化或 Agent tool 调用失败。架构上要包含 RED/USE 指标、SLO burn rate、trace_id 日志关联、错误链路保留、告警路由、Dashboard 分层、Runbook、复盘任务和 regression/eval 样本。",
      troubleshooting:
        "真实线上问题一般从用户影响、错误率、p95/p99、slo_burn_rate、consumer_lag、gc_pause、redis_latency、span_error_rate、log_error_code、recent_deploy、series_count 和 dropped_spans 看起。回答时要先用指标确认症状，再用 Trace 定位路径，日志补局部细节，最后用复盘和回归防止复发。",
      tradeoff:
        "可观测性的取舍是定位能力和事故恢复速度换来了采集成本、标签基数、存储、隐私和告警噪声。面试追问通常会围绕指标类型、PromQL、SLO burn rate、日志脱敏、Trace 采样、Dashboard 设计、Runbook、MTTR、标签基数和 AI/RAG 质量指标展开。",
    };
  }

  if (domainId === "system-design") {
    return {
      architecture:
        "可以按用户入口、流量路由、负载均衡、服务发现、限流熔断、超时重试、状态存储、异步事件、一致性、容量、灾备和可观测性来讲。数据流通常是请求经过网关和负载均衡进入服务，服务通过发现/配置选择依赖，按 timeout、retry、circuit breaker 和 bulkhead 执行；状态变化写 DB/MQ/缓存，观测系统用指标、日志和 Trace 判断是否过载、降级或恢复。",
      scenario:
        "典型设计题是订单系统、支付链路、消息通知平台、Agent tool execution 集群或 RAG 检索服务。架构上要包含入口限流、路由策略、健康检查、服务发现、配置灰度、幂等重试、熔断降级、热点隔离、容量预估、多区域灾备、RPO/RTO 和演练。",
      troubleshooting:
        "真实线上问题一般从错误率、p95/p99、timeout_rate、retry_rate、queue_depth、consumer_lag、dependency_error_rate、circuit_open_count、hot_key_qps、capacity_headroom、failover_time 和 inconsistent_count 看起。回答时要先保护核心链路，再定位是入口流量、路由、依赖、状态、一致性、容量还是发布配置问题。",
      tradeoff:
        "系统设计的取舍是可用性、性能、一致性、成本、复杂度和可运维性之间的平衡。面试追问通常会围绕负载均衡策略、重试风暴、限流熔断、服务发现、配置灰度、选主共识、多活灾备、热点治理和容量规划展开。",
    };
  }

  if (domainId === "web-engineering") {
    return {
      architecture:
        "可以按浏览器、CDN、网关/BFF、认证授权、API 契约、缓存、文件传输、实时连接、安全策略和可观测性来讲。数据流通常是浏览器带着 cookie/token 和 trace context 访问 CDN 或 Gateway，网关做认证、限流、CORS/CSRF/权限校验，BFF/API 按 schema 执行业务，响应通过 Cache-Control、CSP、Set-Cookie、错误码和 trace_id 把协议边界暴露清楚。",
      scenario:
        "典型设计题是管理后台、文件上传下载、实时通知、Web Agent 控制台、RAG 文档权限和 API 网关治理。架构上要包含 Cookie/SameSite/CSRF、CORS allowlist、CSP/XSS 防护、Session/Token/OAuth、CDN 缓存、签名 URL、WebSocket/SSE、BFF、版本兼容、错误码、审计和前后端契约测试。",
      troubleshooting:
        "真实线上问题一般从 status_code、api_error_rate、auth_error_rate、cors_error_count、csrf_block_count、xss_report_count、cache_hit_rate、cdn_origin_fetch_rate、upload_fail_rate、ws_disconnect_rate、schema_validation_error 和 trace_id 看起。回答时要先判断是浏览器策略、缓存、认证授权、网络、API 契约、实时连接还是后端依赖问题。",
      tradeoff:
        "Web 工程的取舍是用户体验、性能、安全、兼容性、可演进和可观测性之间的平衡。面试追问通常会围绕 HTTP 缓存、Cookie/Session/JWT/OAuth、CORS/CSRF/XSS/CSP、CDN、上传下载、WebSocket/SSE、BFF、API 版本、错误码和 Agent tool schema 展开。",
    };
  }

  if (domainId === "devops-docker-kubernetes") {
    return {
      architecture:
        "可以按代码提交、CI 构建、镜像仓库、配置注入、Kubernetes 工作负载、Service/Ingress、资源限制、探针、HPA、Prometheus、日志、Trace 和回滚来讲。数据流通常是代码合并后构建不可变镜像，镜像按环境推广，Deployment 拉起 Pod，Service 和 Ingress 接入流量，ConfigMap/Secret 注入配置，Prometheus 抓取指标，发布异常时通过 rollout、告警和 Runbook 回滚或止血。",
      scenario:
        "典型设计题是把一个 Java/RAG/Agent 服务从本地 Docker 运行推进到 Kubernetes 生产发布。架构上要包含 Dockerfile、多阶段构建、镜像标签、Compose 本地依赖、Deployment、Service、Ingress、ConfigMap、Secret、readiness/liveness/startup probes、requests/limits、HPA、Prometheus 指标、日志采集、发布门禁和回滚策略。",
      troubleshooting:
        "真实线上问题一般从镜像拉取失败、容器启动失败、CrashLoopBackOff、OOMKilled、探针失败、Service 无 endpoints、Ingress 5xx、DNS 解析失败、配置版本错误、HPA 抖动、Pod 重启、p95 升高和 SLO burn rate 看起。回答时要先确认影响面和最近发布，再沿镜像、调度、配置、网络、资源、应用日志和指标逐层定位。",
      tradeoff:
        "DevOps 的取舍是可复现交付、弹性和自愈能力换来了配置复杂度、平台依赖、观测成本和发布治理要求。面试追问通常会围绕镜像层和缓存、容器隔离边界、Compose 与 K8s 区别、Pod/Deployment/Service/Ingress、ConfigMap/Secret、探针、HPA、灰度发布、回滚和 Prometheus 观测展开。",
    };
  }

  if (domainId === "python-ai-engineering") {
    return {
      architecture:
        "可以按 Python 运行环境、依赖锁定、FastAPI 入口、Pydantic schema、异步 HTTP client、模型 SDK、结构化输出、后台任务、测试夹具、配置密钥、OpenTelemetry 和限流成本治理来讲。数据流通常是请求进入 API 后完成鉴权和 schema 校验，再调用模型网关或 provider SDK，流式或结构化返回经过 verifier、trace、quota 和错误映射后交给调用方。",
      scenario:
        "典型设计题是把一个 RAG、Agent tool、评测服务或 Java 主系统旁路的 Python AI 服务做成生产 API。架构上要包含 venv/lockfile、FastAPI 生命周期、timeout/retry、streaming、JSON Schema、pytest fixture、trace_id、secret 管理、rate limit、cost budget 和跨语言契约。",
      troubleshooting:
        "真实线上问题一般从依赖版本漂移、启动失败、请求超时、stream 中断、schema validation error、provider 429/5xx、pytest flaky、后台任务取消、trace 缺失、secret 泄漏和成本异常看起。回答时要先确认影响面，再沿运行环境、API 契约、模型调用、异步任务、观测和限额逐层定位。",
      tradeoff:
        "Python AI 服务的取舍是 AI 生态丰富、迭代快、SDK 便利，换来了依赖治理、异步语义、运行时性能、类型边界和生产运维成本。面试追问通常会围绕 FastAPI async、Pydantic 校验、httpx timeout、OpenAI/Anthropic SDK、结构化输出、pytest fixture、OpenTelemetry、配置密钥和 Java/Spring 集成展开。",
    };
  }

  if (domainId === "llmops-eval-quality") {
    return {
      architecture:
        "可以按 golden dataset、grader rubric、LLM-as-judge、RAG eval、Agent trajectory eval、线上 shadow、trace 聚类、prompt/model/config registry、CI release gate、安全红队和事故回归来讲。数据流通常是生产样本脱敏后进入数据集，离线 eval 计算质量指标，线上 shadow 和人工抽检发现漂移，失败样本回流成 regression case。",
      scenario:
        "典型设计题是让一个 RAG/Agent/AI 助手从 demo 进入可发布系统。架构上要明确 fixture 来源、标注标准、grader 校准、阈值、发布门禁、成本延迟预算、线上观测、人工复核、安全测试和回滚策略。",
      troubleshooting:
        "真实问题一般从 eval pass 但线上差、judge 漂移、golden set 过旧、RAG 召回下降、Agent 工具成功率下降、shadow 指标冲突、prompt 版本不可追溯、成本飙升和安全样本漏检看起。回答时要把失败 trace 转成可复现 fixture，再区分数据、检索、模型、prompt、工具、评测器和线上分布变化。",
      tradeoff:
        "LLMOps 的取舍是质量可控和发布信心换来了标注成本、评测延迟、judge 偏差、样本维护和 CI 复杂度。面试追问通常会围绕 golden set、rubric、LLM-as-judge 校准、RAG groundedness、Agent task success、shadow eval、release gate、安全红队和 incident regression 展开。",
    };
  }

  if (domainId === "production-rag-data-infra") {
    return {
      architecture:
        "可以按文档接入、PDF/Word/HTML/表格解析、OCR、layout-aware chunking、metadata/ACL、embedding、向量索引、过滤下推、BM25+vector hybrid search、rerank、增量索引、拒答策略、检索观测和权限测试来讲。数据流通常是文档经过解析和权限绑定后分块，embedding 写入向量库，查询时先做租户和 ACL 过滤，再召回、重排、生成和引用校验。",
      scenario:
        "典型设计题是企业知识库、客服 RAG、研发文档问答或合规文档检索。架构上要包含解析沙箱、chunk version、document lineage、embedding model、HNSW/IVF/PQ 选型、hybrid search、reranker、index freshness、no-answer、ablation 和 permission leak test。",
      troubleshooting:
        "真实线上问题一般从文档解析丢表格、OCR 错字、chunk 断裂、metadata 缺失、ACL 泄漏、embedding 维度不一致、索引构建慢、过滤后召回为空、rerank 过慢、删除未生效、引用不可信和 no-answer 误判看起。回答时要沿摄入、切分、索引、检索、重排、生成、权限和观测逐层定位。",
      tradeoff:
        "生产 RAG 数据工程的取舍是可追溯事实和权限安全换来了数据管道、索引维护、召回质量、延迟成本和隐私治理复杂度。面试追问通常会围绕 chunking、metadata filter、向量索引参数、hybrid search、rerank、增量 reindex、引用 groundedness、no-answer 和权限泄漏展开。",
    };
  }

  if (domainId === "ai-career-portfolio") {
    return {
      architecture:
        "可以按业务场景发现、用户 workflow、人机协同、置信度/引用/fallback、产品指标、失败 UX、生产 readiness、项目 one-pager、系统设计图、README、eval report、简历 bullet 和面试讲述来讲。数据流不是纯技术链路，而是从真实痛点进入方案、证据、指标、失败复盘和可展示产物。",
      scenario:
        "典型场景是把个人 AI 项目、公司 AI 功能或 take-home 作业包装成可信作品集。架构上要包含用户任务、约束、数据来源、模型/工具/RAG/Agent 设计、评测指标、上线边界、失败样例、截图/trace、成本和后续路线。",
      troubleshooting:
        "真实求职表达问题一般从项目像 demo、没有业务指标、没有失败边界、README 只写安装、简历 bullet 没影响、系统设计讲不出取舍、面试故事过长或过短看起。回答时要把项目压成 5/15/45 分钟三个版本，并准备失败、成本、质量、安全和权衡追问。",
      tradeoff:
        "作品集表达的取舍是展示深度和可读性之间的平衡。面试追问通常会围绕为什么需要 AI、为什么不是规则系统、HITL 怎么设计、低置信度怎么处理、上线还差什么、指标如何证明有效、失败案例怎么复盘展开。",
    };
  }

  return {
    architecture:
      "可以按用户目标、模型、上下文、状态、工具、执行循环、评测、安全和可观测性来讲。数据流是用户任务进入编排层，Context Builder 汇总系统指令、用户约束、RAG 证据、短期状态和工具结果，模型输出结构化动作，宿主程序执行工具并把 observation 写回 State 和 Trace。",
    scenario:
      "典型设计题是企业内部 Agent、Coding Agent、Paper Agent 或 Web Agent：外层 deterministic workflow 管理权限、预算、审批和最终提交，内层 Agent loop 处理开放探索，Eval Gate 根据 golden case、轨迹评分、工具结果和人工反馈决定是否继续。",
    troubleshooting:
      "真实线上问题一般从任务成功率、工具调用成功率、invalid args、上下文漂移、幻觉率、引用准确率、token 成本、延迟、guardrail block rate 和 human handoff rate 看起。回答时要把模型问题、检索问题、工具问题、状态问题和权限问题分开归因。",
    tradeoff:
      "AI Agent 的取舍是开放任务能力换来了不确定性、成本、延迟和治理复杂度。面试追问通常会围绕 workflow 与 agent 边界、memory 与 RAG 区别、function calling 是否等于 agent、eval 怎么证明不是 demo、如何做安全边界展开。",
  };
};

const caseLines = (topic) => {
  const designCases = topic.systemDesignCases ?? [];
  const scenarios = topic.scenarios ?? [];
  if (designCases.length > 0) {
    return designCases.flatMap((caseItem) => [
      `### ${caseItem.title}`,
      "",
      "**需求与边界**",
      bulletList(caseItem.requirements, ["先明确业务目标、数据规模、延迟要求、失败边界和成功标准。"]),
      "",
      "**架构拆解**",
      bulletList(caseItem.architecture, ["按入口、状态、执行、存储、权限、评测和监控拆模块。"]),
      "",
      "**数据流**",
      bulletList(caseItem.dataFlow, ["请求进入系统后写入状态，执行模块处理后返回观察结果，最终通过验证器收敛。"]),
      "",
      "**扩展点与观测指标**",
      bulletList(
        [...caseItem.scalingPoints, ...caseItem.observability],
        ["吞吐、延迟、错误率、失败恢复率、成本和用户可感知成功率都要纳入指标。"],
      ),
      "",
      "**取舍**",
      bulletList(caseItem.tradeoffs, ["复杂度、成本、可控性和准确率需要结合业务风险做取舍。"]),
    ]);
  }

  return scenarios.flatMap((scenario) => [
    `### ${scenario.title}`,
    "",
    `**场景背景**：${scenario.context}`,
    "",
    `**核心问题**：${scenario.problem}`,
    "",
    "**设计动作**",
    bulletList(scenario.design, ["拆出输入、处理、状态、失败恢复和可观测指标。"]),
    "",
    "**失败模式**",
    bulletList(scenario.failureModes, ["边界不清、数据不一致、工具失败或下游不可用会让系统失控。"]),
    "",
    "**指标**",
    bulletList(scenario.metrics, ["成功率、延迟、错误率、重试率和人工接管率。"]),
  ]);
};

const sourceSection = (sourceIds) => {
  const uniqueSourceIds = [...new Set(sourceIds)];
  const sourceLines = uniqueSourceIds
    .map((sourceId) => sourceById.get(sourceId))
    .filter(Boolean)
    .map((source) => `- [${source.title}](${source.url})：用于确认官方语义边界、命令行为和工程约束。`);

  return sectionText(
    "来源与延伸阅读",
    (sourceLines.length > 0
      ? sourceLines
      : ["- 当前条目使用项目内已登记资料和工程复习结构整理，后续补充官方链接时仍按本模板校验。"]
    ).join("\n"),
  );
};

const topicDiagram = (topic) => `\`\`\`mermaid
flowchart LR
  Input[业务请求 / 面试场景] --> Contract[边界与数据结构]
  Contract --> Mechanism[核心机制]
  Mechanism --> Failure[失败模式]
  Failure --> Metrics[指标与 Trace]
  Metrics --> Decision[取舍与项目表达]
\`\`\`

图 1：${topic.title} 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。`;

const questionDiagram = (question) => `\`\`\`mermaid
flowchart LR
  Q[面试问题] --> Boundary[先划边界]
  Boundary --> Mechanism[解释机制]
  Mechanism --> Design[落到系统设计]
  Design --> Incident[补事故排障]
  Incident --> Tradeoff[总结取舍]
\`\`\`

图 1：这类题不要直接背结论，先划清边界，再沿机制、设计、事故和取舍回答。`;

const domainScaffoldFor = (domainId) => {
  if (domainId === "ai-agent-rag" || domainId === "ai-engineering-trends") {
    return {
      architectureModules: [
        "入口层：生成 request_id，识别用户、租户、任务类型、风险等级和预算。",
        "Context Builder：组装 system policy、用户目标、历史摘要、RAG evidence、工具结果和输出约束。",
        "Model Gateway：选择模型、解码参数、timeout、retry、fallback 和成本记录。",
        "Tool/Verifier 层：执行受控工具，校验 schema、citation、权限、业务规则和安全策略。",
        "Trace/Eval 层：保存上下文 manifest、模型输出、工具 observation、verdict 和失败样本。",
      ],
      dataFlow: [
        "用户请求进入后生成 request_id，并绑定 tenant、user_scope、task_type 和 risk_level。",
        "Context Builder 按 token budget 和可信级别选择证据、历史、状态和工具说明。",
        "模型生成结构化输出或工具调用意图，宿主程序负责执行、权限、错误和审计。",
        "Verifier 检查引用、格式、安全和业务规则；失败样本进入 eval/regression。",
      ],
      troubleshootingSteps: [
        "先确认是事实错误、格式错误、工具错误、权限错误、成本异常还是延迟异常。",
        "查看 context manifest：模型看到哪些证据、哪些内容被裁剪、是否有权限污染。",
        "查看 model/tool/verifier trace，定位是检索、上下文、模型、工具还是校验层失败。",
        "先止血：降级到检索摘要、关闭高风险工具、回滚 prompt/model/config 或转人工。",
        "把失败样本加入 golden set，并补 citation、schema、权限或工具回归。",
      ],
      keyRows: [
        "| `request_id` | 请求 | 串联模型、工具、检索和 verifier | 定位一次错答或超时 |",
        "| `context_pack` | 上下文 | 记录系统指令、证据、记忆、工具和预算 | 排查遗漏、污染和越权 |",
        "| `evidence_id` | 证据 | 绑定文档、chunk、权限和版本 | 校验 citation 和事实来源 |",
        "| `tool_call_id` | 工具调用 | 记录工具、参数 hash、结果和错误码 | 复盘外部动作失败 |",
        "| `verifier_result` | 输出校验 | 标记 schema、citation、安全和业务规则结果 | 判断是否应重试、降级或拒答 |",
      ],
      deepDiveReminder:
        "面试深挖时要把模型、上下文、工具、证据、状态、verifier 和 trace 的边界讲清楚。不要把问题都归因于模型，也不要把 prompt 当作唯一治理手段。",
    };
  }

  if (domainId === "prometheus-observability") {
    return {
      architectureModules: [
        "指标暴露层：应用或 exporter 暴露 `/metrics`，定义 metric name、type、unit 和 label allowlist。",
        "采集层：Prometheus 通过 scrape_config 和 service discovery 找到 target 并定期抓取。",
        "存储层：样本进入 head block、WAL 和本地 TSDB block，按 retention 保留。",
        "计算层：recording rules 预聚合复杂查询，alerting rules 产生告警事件。",
        "响应层：Alertmanager 分组、去重、抑制、静默和路由，Runbook 指导止血和复盘。",
      ],
      dataFlow: [
        "服务暴露 metrics，Prometheus 根据 job、target、interval 和 timeout 定期抓取。",
        "样本带 metric name 和 label 进入 TSDB，recording rules 生成聚合序列。",
        "alerting rules 根据 SLO、错误率、延迟或容量阈值生成告警。",
        "Alertmanager 做 grouping/dedup/inhibition/routing，值班人员按 Runbook 处理并复盘。",
      ],
      troubleshootingSteps: [
        "先确认用户影响和 SLO：错误率、延迟、可用性、质量指标是否异常。",
        "检查 `up`、scrape_duration、samples、target 数量和 active series，确认采集是否健康。",
        "检查 rule evaluation duration、query duration、Alertmanager 路由和通知错误。",
        "对比最近发布、label 变化、target 发现规则、remote write 和 retention 配置。",
        "止血可以 drop 高基数标签、禁用问题 rule、回滚配置或切换只读/降级面板。",
      ],
      keyRows: [
        "| `job` | Scrape 配置 | 标识一组抓取目标 | 排查采集边界和 owner |",
        "| `target` | 抓取目标 | 表示 instance 地址和标签集合 | 判断目标是否被发现和抓取 |",
        "| `metric_name` | 时间序列 | 表达指标语义和单位 | 判断是否重复、废弃或误用 |",
        "| `label_set` | 时间序列身份 | 决定 series 基数 | 排查高基数和查询成本 |",
        "| `rule_group` | 规则 | 定义 recording/alerting 计算 | 排查 rule 超时、噪声和漏报 |",
        "| `alert_fingerprint` | 告警 | 标识去重和分组后的告警 | 排查通知、抑制和静默 |",
      ],
      deepDiveReminder:
        "面试深挖时要把指标语义、标签基数、scrape、TSDB/WAL、rules、Alertmanager 和 Runbook 串起来。不要只说会写 PromQL，也要说明监控系统自身如何不被打爆。",
    };
  }

  if (domainId === "devops-docker-kubernetes") {
    return {
      architectureModules: [
        "构建层：CI 根据 Dockerfile/BuildKit 构建不可变镜像，产出 digest、SBOM、扫描结果和构建日志。",
        "分发层：镜像进入 registry，按 dev/staging/prod 推广，发布引用镜像 digest 而不是浮动 tag。",
        "运行层：Kubernetes Deployment/StatefulSet 创建 Pod，设置 requests/limits、env、volume 和 probes。",
        "流量层：Service、EndpointSlice、Ingress/Gateway 负责服务发现、负载均衡、TLS 和入口策略。",
        "运维层：Prometheus、日志、Trace、events、rollout history 和 Runbook 支撑发布观察和回滚。",
      ],
      dataFlow: [
        "代码合并触发 CI，构建镜像、运行测试、安全扫描并推送 registry。",
        "CD 更新 Deployment 或 Helm values，Kubernetes controller 逐步创建新 ReplicaSet 和 Pod。",
        "readiness 通过后 Pod 进入 Service endpoints，Ingress/Gateway 开始转发流量。",
        "Prometheus 和日志系统观察错误率、延迟、重启、探针失败和 SLO，异常时暂停或回滚 rollout。",
      ],
      troubleshootingSteps: [
        "先确认影响面和最近发布：哪些服务、版本、namespace、节点和用户受影响。",
        "按镜像、调度、配置、Secret、存储、网络、探针、资源和应用日志逐层排查。",
        "查看 Pod events、describe、container status、previous logs、rollout history 和 Service endpoints。",
        "先止血：回滚 Deployment、扩旧版本、摘流、提高资源、暂停 HPA 或切换只读/降级。",
        "复盘补发布门禁、探针、资源模型、告警、Runbook 和回归演练。",
      ],
      keyRows: [
        "| `image_digest` | 镜像 | 固定构建产物身份 | 排查发布版本和供应链风险 |",
        "| `deployment_revision` | 发布 | 标识 rollout 版本 | 支持回滚和变更对比 |",
        "| `pod_uid` | 运行实例 | 标识一次 Pod 生命周期 | 关联 events、logs 和 restart |",
        "| `readiness_probe` | 流量门禁 | 决定 Pod 是否接流量 | 排查未启动接流和摘流问题 |",
        "| `service_endpoint` | 服务发现 | 记录 Service 后端 Pod | 排查无 endpoints 和流量错路由 |",
        "| `config_version` | 配置 | 标识 ConfigMap/Secret/values 版本 | 排查配置漂移和回滚 |",
      ],
      deepDiveReminder:
        "面试深挖时要把镜像、容器、Pod、Service、Ingress、配置、资源、探针、发布、回滚和观测串成链路。不要只背 kubectl 命令，要讲清对象关系和故障路径。",
    };
  }

  if (domainId === "spring-java-backend") {
    return {
      architectureModules: [
        "入口层：Gateway/Filter/Security 处理路由、认证、限流、trace_id、租户和基础安全策略。",
        "Web 层：DispatcherServlet、HandlerMapping、参数绑定、Bean Validation、ControllerAdvice 和消息转换形成 REST 契约。",
        "业务层：Service 定义事务边界、领域状态变更、幂等校验、事件发布和下游调用策略。",
        "数据层：MyBatis Mapper、动态 SQL、ResultMap、分页、批处理、连接池和数据库事务共同决定数据访问质量。",
        "治理层：服务发现、配置、OpenFeign、LoadBalancer、Resilience4j、Actuator、日志、Trace 和指标支撑生产运行。",
      ],
      dataFlow: [
        "请求进入 Gateway 后完成路由、鉴权、限流和 trace 上下文传播。",
        "Spring MVC 完成参数解析、校验、Controller 调用、返回值处理和统一异常映射。",
        "Service 通过 AOP 代理进入事务边界，执行幂等校验、状态变更、Mapper SQL 和必要的 outbox 记录。",
        "远程依赖通过 OpenFeign/LoadBalancer/Resilience4j 执行超时、重试、熔断、降级和指标上报。",
        "Actuator、Micrometer、日志和 Trace 把错误码、慢 SQL、事务耗时、下游延迟和健康状态串成排障证据。",
      ],
      troubleshootingSteps: [
        "先确认影响面：哪个接口、租户、版本、错误码、p95/p99、下游和数据库指标异常。",
        "检查最近发布、配置、Profile、自动配置条件、Bean 创建日志和 Actuator health。",
        "沿请求链路排查 Controller 参数、校验、异常映射、AOP 代理、事务边界和安全过滤链。",
        "沿数据链路排查 SQL、索引、ResultMap、分页、连接池、锁等待、死锁和慢查询。",
        "沿微服务链路排查服务发现、Gateway 路由、Feign timeout、retry、circuit breaker、fallback 和限流配置。",
        "止血可以回滚配置/版本、摘流、限流、扩大连接池短期容量、关闭问题开关或降级非核心接口。",
      ],
      keyRows: [
        "| `bean_name` | Spring Bean | 标识容器对象和依赖关系 | 排查循环依赖、条件装配和覆盖问题 |",
        "| `proxy_target` | AOP 代理 | 标识事务、安全、缓存等增强目标 | 排查自调用和事务失效 |",
        "| `request_id` | HTTP 请求 | 串联 Gateway、Controller、Service、SQL 和下游 | 定位单次失败链路 |",
        "| `transaction_id` | 事务边界 | 标识连接绑定、传播行为和回滚状态 | 排查长事务、死锁和错误提交 |",
        "| `mapper_id` | MyBatis 语句 | 标识 namespace + statement | 排查慢 SQL、参数绑定和 ResultMap 问题 |",
        "| `route_id` | Gateway 路由 | 标识入口路由、断言和过滤器链 | 排查错路由、5xx 和限流策略 |",
        "| `error_code` | REST 契约 | 标识可行动错误语义 | 排查前后端联调、告警聚合和客服定位 |",
      ],
      deepDiveReminder:
        "面试深挖时要把 Spring 容器、代理、Web 请求链路、事务、SQL、微服务治理和生产观测串起来。不要只背注解用法，要说明注解背后的生效条件、失败边界和排障证据。",
    };
  }

  if (domainId === "coding-algorithms-interview") {
    return {
      architectureModules: [
        "题意层：提炼输入输出、数据范围、是否有序、是否可重复、是否需要稳定性和是否存在负数/空值。",
        "复杂度层：根据 n、边数、字符集、值域和调用次数判断可接受的时间与空间上限。",
        "范式层：选择双指针、滑窗、哈希、栈队列、二分、排序、回溯、树遍历、堆、贪心、DP、BFS/DFS、并查集或拓扑排序。",
        "代码层：用 Java 模板固定变量含义、循环不变量、边界处理、返回条件和异常输入。",
        "验证层：用样例、反例、极值、重复值、空输入、单元素和随机小数据对拍验证正确性。",
      ],
      dataFlow: [
        "先把自然语言题目翻译成数据结构对象，例如数组、区间、字符串、树节点、图节点、状态数组或频次数组。",
        "根据数据规模确定暴力解是否可过，再识别瓶颈并选择优化范式。",
        "写代码前明确变量含义、循环区间、终止条件、状态转移或递归回溯撤销动作。",
        "写完后手跑样例和至少三个边界用例，再复核复杂度和内存使用。",
        "如果出错，先最小化失败样例，检查下标、初始化、重复访问、溢出和 Java API 语义。",
      ],
      troubleshootingSteps: [
        "先确认输入规模和复杂度是否已经超限，避免在错误算法上修小 bug。",
        "检查数组下标、左右边界、闭开区间、mid 计算、循环退出条件和返回值。",
        "检查哈希计数、栈顶语义、队列入出顺序、堆比较器和去重条件。",
        "检查递归 base case、回溯撤销、访问标记、DP 初始化、状态转移方向和空间压缩依赖。",
        "检查图算法的建图方向、重复访问、拓扑入度更新、并查集路径压缩和连通分量计数。",
        "用小规模暴力解对拍优化解，快速证明思路而不是只靠直觉。",
      ],
      keyRows: [
        "| `n / m` | 输入规模 | 决定复杂度上限 | 判断 O(n^2)、O(n log n)、O(n) 是否可行 |",
        "| `left / right` | 双指针/二分 | 标识搜索或窗口边界 | 排查越界和死循环 |",
        "| `freq` | 哈希/计数 | 保存元素出现次数或状态 | 排查重复、缺失和窗口收缩错误 |",
        "| `stack_top` | 栈/单调栈 | 保存最近未匹配或候选元素 | 排查弹出条件和答案更新 |",
        "| `dp[i][state]` | 动态规划 | 表示子问题最优值或方案数 | 排查初始化、转移和遍历方向 |",
        "| `visited` | 图/树/回溯 | 标识访问状态 | 排查重复访问、漏访问和环 |",
        "| `parent` | 并查集 | 标识集合代表元 | 排查合并方向和连通分量 |",
      ],
      deepDiveReminder:
        "面试深挖时要把题目识别、复杂度、算法范式、循环不变量、边界用例和代码调试过程讲出来。不要只背模板；模板必须能解释为什么正确、为什么复杂度够、哪里最容易错。",
    };
  }

  if (domainId === "python-ai-engineering") {
    return {
      architectureModules: [
        "运行环境层：使用 venv/uv/poetry、lockfile、Python 版本和 Docker 镜像固定依赖边界。",
        "API 契约层：FastAPI 路由、Pydantic schema、OpenAPI、错误码和 streaming response 固定调用契约。",
        "模型调用层：httpx/provider SDK 管理 timeout、retry、rate limit、streaming、structured output 和 fallback。",
        "后台执行层：异步任务、队列、取消、幂等、状态机和 Java/Spring 主系统回调管理长任务。",
        "质量与观测层：pytest fixture、mock provider、OpenTelemetry trace、日志脱敏、成本指标和 quota 证明可运行。",
      ],
      dataFlow: [
        "请求进入 FastAPI 后生成 request_id，完成鉴权、租户、输入 schema 和业务参数校验。",
        "服务层选择同步调用、streaming、后台任务或队列，并组装 provider SDK 请求和结构化输出 schema。",
        "模型响应经过 Pydantic/JSON Schema 校验、错误映射、成本统计和 trace 记录后返回调用方。",
        "失败样本进入 pytest fixture 或 eval 数据集，依赖、prompt、模型和配置版本一起纳入回归。",
      ],
      troubleshootingSteps: [
        "先确认是启动、依赖、API 契约、provider、异步任务、配置密钥、观测还是成本异常。",
        "检查 Python 版本、lockfile、环境变量、镜像 digest、SDK 版本和最近发布。",
        "检查 request trace、httpx timeout、retry、429/5xx、stream chunk、schema validation error 和日志脱敏。",
        "对 flaky 测试使用 mock provider、recorded fixture、固定 seed 和超时预算复现。",
        "止血可以降级模型、关闭 streaming、降低并发、切换 fallback、暂停后台任务或回滚配置。",
      ],
      keyRows: [
        "| `python_version` | 运行环境 | 固定解释器语义 | 排查依赖和部署漂移 |",
        "| `lockfile_hash` | 依赖 | 标识依赖集合 | 排查 SDK 版本变更 |",
        "| `request_id` | API 请求 | 串联 FastAPI、模型调用和回调 | 定位单次异常 |",
        "| `schema_version` | 输出契约 | 固定 JSON/Pydantic 结构 | 排查结构化输出失败 |",
        "| `provider_status` | 模型调用 | 标识 429/5xx/timeout/stream error | 排查模型依赖问题 |",
        "| `cost_units` | 成本 | 记录 token、请求数或额度消耗 | 排查预算和限流 |",
      ],
      deepDiveReminder:
        "面试深挖时要把 Python 的快迭代优势讲成生产 API 能力：依赖可复现、契约可校验、异步可取消、模型调用可观测、成本可治理。",
    };
  }

  if (domainId === "llmops-eval-quality") {
    return {
      architectureModules: [
        "数据集层：golden set、生产抽样、脱敏、版本、标签、owner 和覆盖维度。",
        "评测层：rule-based grader、LLM-as-judge、人工复核、rubric、阈值和置信区间。",
        "对象层：RAG 检索、groundedness、Agent trajectory、tool result、safety case 和业务任务成功率。",
        "发布层：prompt/model/config registry、CI release gate、shadow eval、canary 和 rollback。",
        "闭环层：trace 聚类、失败归因、incident regression、样本回流和成本延迟质量看板。",
      ],
      dataFlow: [
        "生产 trace 和人工反馈经过脱敏、采样、聚类后形成候选 eval case。",
        "标注规范和 rubric 固定通过/失败定义，golden dataset 按版本进入 CI 和离线评测。",
        "候选 prompt/model/config 在离线 eval、shadow eval、安全样本和成本延迟门禁中逐层过滤。",
        "线上失败回流到 regression case，并更新 rubric、阈值、监控和发布策略。",
      ],
      troubleshootingSteps: [
        "先确认是 eval 数据过旧、grader 偏差、线上分布变化、RAG 召回、Agent 工具、prompt/config 还是模型版本问题。",
        "对比 offline、shadow、canary 和人工抽检结果，定位指标冲突来源。",
        "检查 judge 校准样本、inter-rater agreement、rubric 变更、阈值和置信区间。",
        "查看失败 trace，把失败归因为检索、上下文、模型、工具、权限、安全或业务规则。",
        "止血可以回滚 prompt/model/config，降低自动化等级，打开 HITL，或阻断高风险工具。",
      ],
      keyRows: [
        "| `case_id` | 评测样本 | 标识一个可复现输入 | 排查样本覆盖和回归 |",
        "| `dataset_version` | 数据集 | 固定样本集合 | 对比不同发布结果 |",
        "| `rubric_version` | 评分标准 | 固定通过/失败定义 | 排查评分漂移 |",
        "| `judge_model` | LLM-as-judge | 标识评分模型和配置 | 排查 judge 偏差 |",
        "| `trace_cluster` | 失败聚类 | 汇总相似失败 | 排查系统性问题 |",
        "| `release_gate` | 发布门禁 | 标识质量阈值 | 判断能否上线 |",
      ],
      deepDiveReminder:
        "面试深挖时要把 eval 讲成工程闭环，不是跑一组 prompt。关键是样本来源、评分标准、线上反馈、发布门禁和事故回归如何持续工作。",
    };
  }

  if (domainId === "production-rag-data-infra") {
    return {
      architectureModules: [
        "摄入解析层：连接器、PDF/Word/HTML/表格解析、OCR、解析沙箱和失败隔离。",
        "切分建模层：chunk、parent-child、semantic window、document lineage、metadata、ACL 和版本。",
        "索引层：embedding model、向量维度、HNSW/IVF/PQ、BM25、过滤字段和增量构建。",
        "检索层：query rewrite、filter pushdown、hybrid search、rerank、citation 和 no-answer 策略。",
        "治理层：index freshness、recall@k、groundedness、permission leak test、ablation 和成本延迟看板。",
      ],
      dataFlow: [
        "文档进入摄入队列后先做权限绑定、解析、OCR、表格/公式保留和解析质量检查。",
        "内容按语义和版面切分成 chunk，绑定 document_id、tenant_id、acl、version、source_range 和 lineage。",
        "embedding 和 BM25 索引按版本写入，删除、更新和 reindex 通过 tombstone 与索引版本保证可追溯。",
        "查询时先做租户/ACL/filter 下推，再执行 hybrid search、rerank、证据裁剪、生成、引用和拒答判定。",
      ],
      troubleshootingSteps: [
        "先确认是解析质量、chunk 质量、metadata/ACL、embedding、索引、filter、rerank、生成引用还是权限问题。",
        "抽取失败 query，查看召回列表、分数、过滤条件、rerank 前后变化和最终引用。",
        "检查 document version、chunk lineage、index freshness、delete/reindex 状态和权限快照。",
        "用 ablation 对比 BM25、vector、hybrid、rerank 和 query rewrite 对结果的影响。",
        "止血可以禁用问题数据源、回滚索引版本、提高 no-answer 阈值或临时关闭高风险回答。",
      ],
      keyRows: [
        "| `document_id` | 原始文档 | 标识知识来源 | 排查来源和权限 |",
        "| `chunk_id` | 检索单元 | 绑定文本片段和位置 | 排查引用和召回 |",
        "| `acl_snapshot` | 权限 | 固定可见范围 | 排查越权泄漏 |",
        "| `embedding_model` | 向量 | 标识维度和语义空间 | 排查索引兼容性 |",
        "| `index_version` | 索引 | 标识可回滚版本 | 排查 freshness 和删除生效 |",
        "| `retrieval_trace` | 检索链路 | 记录召回、过滤、重排和引用 | 复盘错答与漏答 |",
      ],
      deepDiveReminder:
        "面试深挖时要把 RAG 讲成数据工程和权限工程，不是把文档塞进向量库。解析、切分、索引、过滤、重排、引用、拒答和观测每层都要有证据。",
    };
  }

  if (domainId === "ai-career-portfolio") {
    return {
      architectureModules: [
        "问题发现层：明确用户、业务痛点、AI 适配度、非 AI baseline 和成功指标。",
        "体验层：设计 HITL、置信度、引用、低置信度 fallback、失败 UX 和用户可控边界。",
        "工程层：展示数据流、模型/工具/RAG/Agent 组件、权限、安全、成本和上线门禁。",
        "证据层：README、系统设计图、eval report、trace screenshot、demo、incident/failure case 和指标。",
        "表达层：简历 bullet、one-pager、5/15/45 分钟讲述、take-home 模板和行为面试复盘。",
      ],
      dataFlow: [
        "从真实用户任务出发，先定义 baseline、目标用户、成功指标和失败不可接受边界。",
        "把 AI 能力拆成输入、上下文、模型、工具、验证、人审、输出和观测。",
        "把工程结果沉淀为 README、架构图、eval 表、trace 截图、错误案例和产品指标。",
        "面试时按时间窗口裁剪讲述：5 分钟讲价值和架构，15 分钟讲机制和指标，45 分钟讲系统设计与取舍。",
      ],
      troubleshootingSteps: [
        "先确认项目表达问题是业务价值不清、工程深度不够、指标缺失、失败边界空白还是材料不可读。",
        "检查 README 是否有问题、架构、Quick Start、eval、quality gates、limitations 和 roadmap。",
        "检查简历 bullet 是否包含动作、技术、指标、影响和约束，而不是只列框架名。",
        "用模拟面试追问失败案例、成本、质量、安全、HITL、低置信度和上线差距。",
        "把不能证明的能力降级表达为 future work 或 unsupported，避免 demo-only 叙事。",
      ],
      keyRows: [
        "| `user_problem` | 场景 | 标识真实痛点 | 判断 AI 是否必要 |",
        "| `baseline` | 对照方案 | 标识非 AI 或规则方案 | 证明收益不是空话 |",
        "| `quality_metric` | 质量指标 | 衡量准确率、成功率或 groundedness | 支撑作品集可信度 |",
        "| `cost_metric` | 成本指标 | 记录 token、延迟、人工审核或云资源 | 回答商业取舍 |",
        "| `failure_case` | 失败样本 | 记录错答、拒答、越权或 UX 失败 | 证明你做过复盘 |",
        "| `portfolio_artifact` | 展示材料 | README、one-pager、eval report 或 demo | 支撑面试讲述 |",
      ],
      deepDiveReminder:
        "面试深挖时要把作品集从“我做了一个 AI demo”提升到“我发现问题、设计系统、验证指标、处理失败、知道上线差距”。",
    };
  }

  return {
    architectureModules: [
      "入口层校验用户请求、权限、租户、参数和幂等键。",
      "业务服务层决定同步处理、异步处理、缓存读写、数据库回源或降级返回。",
      "状态层保存业务状态、缓存版本、事件状态和恢复点。",
      "执行层处理存储访问、下游调用、异步任务和补偿动作，并把结构化结果写入 trace。",
      "观测层用指标、日志和链路追踪证明系统可运行、可排障、可复盘。",
    ],
    dataFlow: [
      "请求进入入口层后生成 request_id/run_id。",
      "业务服务读取缓存、数据库或异步事件状态，选择执行路径。",
      "执行结果写回状态存储，并向监控系统上报延迟、错误和业务结果。",
      "保护策略根据成功标准、失败次数、SLA 和风险等级决定继续、降级、补偿或停止。",
    ],
    troubleshootingSteps: [
      "先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。",
      "再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。",
      "对比最近发布、配置变更、流量变化、数据倾斜和下游限流。",
      "先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。",
      "最后把失败样例进入 regression/eval，避免同类问题复发。",
    ],
    keyRows: [
      "| `request_id` | 请求 | 串联入口、缓存、DB 和下游调用 | 定位单次异常 |",
      "| `key_schema` | Redis/存储 | 固定业务域、实体和版本 | 排查误删、串租户和旧版本 |",
      "| `source_version` | value/event | 标识事实源版本 | 防止旧值覆盖新值 |",
      "| `ttl_policy` | 缓存策略 | 控制过期、抖动和刷新 | 排查击穿、雪崩和旧值窗口 |",
      "| `trace_id` | 观测链路 | 串联服务、存储和异步任务 | 复盘慢请求和失败分支 |",
    ],
    deepDiveReminder:
      "面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。",
  };
};

const buildTopicMarkdown = (topic) => {
  const playbook = playbookFor(topic);
  const scaffold = domainScaffoldFor(inferDomainId(topic));
  const category = categoryById.get(topic.categoryId);
  const deepDive = topic.deepDive;
  const definitions = sentences([...(topic.definition ?? []), topic.summary, ...topic.mustRemember], 12);
  const mechanisms = sentences([
    ...(topic.principles ?? []),
    ...topic.details,
    ...(topic.industrySolutions ?? []),
    ...(topic.engineeringDetails ?? []),
  ], 24);
  const metrics = sentences([...(deepDive?.metrics ?? []), ...((topic.scenarios ?? []).flatMap((item) => item.metrics))], 16);
  const cases = caseLines(topic);

  return [
    `# ${topic.title}`,
    "",
    sectionText(
      "面试定位",
      [
        `${topic.title} 属于 ${domainLabel(topic)} / ${category?.title ?? topic.categoryId}。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。`,
        `一句话定位：${topic.summary}`,
        "",
        "**必须讲清楚**",
        bulletList(definitions, ["先定义边界，再讲机制，最后落到工程案例和排障。"]),
        "",
        "**常见追问方向**",
        bulletList(
          [
            ...(deepDive?.interviewAngles ?? []),
            `如果这个点落到 ${projectLabels(topic.projectEvidenceIds) || "真实项目"}，架构如何设计？`,
            "线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？",
          ],
          ["追问会从定义进入系统设计、故障排查、指标证明和工程取舍。"],
        ),
      ].join("\n"),
    ),
    sectionText(
      "架构与运行机制",
      [
        subSectionText("核心机制", bulletList(mechanisms, ["先讲执行路径，再讲数据结构、状态变化和失败处理。"])),
        subSectionText("通用数据流", playbook.architecture),
        subSectionText(
          "工程落点",
          bulletList(
            [
              ...(deepDive?.implementationChecklist ?? []),
              ...topic.engineeringNotes,
              "把每个关键步骤都映射到可观测指标，避免只描述功能。",
              "回答时主动说明哪些信息是强一致状态，哪些只是上下文或缓存视图。",
            ],
            ["输入、状态、执行、验证和观测要形成闭环。"],
          ),
        ),
      ].join("\n\n"),
    ),
    sectionText("可画图", topicDiagram(topic)),
    sectionText(
      "系统设计案例",
      cases.length > 0
        ? cases.join("\n")
        : [
            `### ${topic.title} 的面试级设计题`,
            "",
            playbook.scenario,
            "",
            "**可画架构**",
            bulletList(scaffold.architectureModules, []),
            "",
            "**数据流**",
            bulletList(scaffold.dataFlow, []),
          ].join("\n"),
    ),
    sectionText(
      "真实问题与排障",
      [
        playbook.troubleshooting,
        "",
        "**排查顺序**",
        bulletList(scaffold.troubleshootingSteps, []),
        "",
        "**重点指标**",
        bulletList(metrics, ["success_rate", "latency_p95", "error_rate", "retry_rate", "cost", "human_handoff_rate"]),
        "",
        "**常见误区**",
        bulletList(topic.commonPitfalls, ["只讲概念，不讲数据流、失败模式、指标和取舍。"]),
      ].join("\n"),
    ),
    sectionText(
      "业界方案与技术取舍",
      [
        playbook.tradeoff,
        "",
        "**方案对比**",
        bulletList(
          [
            ...(topic.industrySolutions ?? []),
            ...(topic.tradeoffs ?? []),
            ...(deepDive?.mentalModel ?? []),
            ...(topic.experienceBridge ?? []),
          ],
          ["先用简单可控方案建立 baseline，再用指标证明复杂方案的收益。"],
        ),
        "",
        "**复习时要能讲出的细节**",
        bulletList(
          [
            "这个知识点解决什么问题，不解决什么问题。",
            "关键数据结构、状态变化、失败边界和可观测指标是什么。",
            "面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。",
            "能说明为什么这个取舍适合当前业务，而不是只背业界名词。",
          ],
          [],
        ),
      ].join("\n"),
    ),
    sectionText(
      "深入技术细节",
      [
        paragraph([
          topic.summary,
          ...(topic.definition ?? []),
          ...(topic.principles ?? []),
          ...(topic.engineeringDetails ?? []),
        ]),
        "",
        scaffold.deepDiveReminder,
      ].join("\n"),
    ),
    sectionText(
      "关键数据结构与协议",
      [
        "| 字段 | 所属对象 | 作用 | 排障价值 |",
        "| :--- | :--- | :--- | :--- |",
        ...scaffold.keyRows,
      ].join("\n"),
    ),
    sectionText(
      "深问准备",
      [
        "被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。",
        "",
        bulletList(
          [
            "反例要明确，例如强事务事实源不能交给缓存或搜索读模型。",
            "指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。",
            "回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。",
          ],
          [],
        ),
      ].join("\n"),
    ),
    sourceSection(topic.sourceIds),
  ].join("\n");
};

const buildQuestionMarkdown = (question) => {
  const relatedTopics = question.topicIds.map((id) => topicById.get(id)).filter(Boolean);
  const primaryTopic = relatedTopics[0];
  const scaffold = domainScaffoldFor(primaryTopic ? inferDomainId(primaryTopic) : "");
  const playbooks = relatedTopics.map(playbookFor);
  const topicSignals = relatedTopics.flatMap((topic) => [
    topic.summary,
    ...(topic.definition ?? []),
    ...(topic.principles ?? []),
    ...(topic.details ?? []),
  ]);
  const mechanisms = relatedTopics.flatMap((topic) => [
    ...(topic.industrySolutions ?? []),
    ...(topic.engineeringDetails ?? []),
    ...(topic.engineeringNotes ?? []),
    ...(topic.deepDive?.implementationChecklist ?? []),
  ]);
  const metrics = relatedTopics.flatMap((topic) => [
    ...(topic.deepDive?.metrics ?? []),
    ...((topic.scenarios ?? []).flatMap((item) => item.metrics)),
  ]);
  const caseBlocks = relatedTopics.flatMap(caseLines);
  const followUpSteps = question.followUpSteps ?? [];

  return [
    `# ${question.title}`,
    "",
    sectionText(
      "面试定位",
      [
        `这道题关联 ${relatedTopics.map((topic) => topic.title).join("、") || "核心知识点"}，难度 ${question.difficulty}/5，出现频率 ${question.frequency}。面试官真正想看的是：你能否把概念回答升级成架构、数据流、指标、取舍和真实故障处理。`,
        primaryTopic ? `回答主轴可以从「${primaryTopic.title}」切入：${primaryTopic.summary}` : "",
        "",
        "**第一句话建议**",
        `我会先划清边界，再解释运行机制，最后用一个系统设计案例说明数据流、失败模式、指标和取舍。`,
        "",
        "**不要只答**",
        bulletList(question.commonMistakes, ["只给名词解释，不讲工程实现和追问延伸。"]),
      ].join("\n"),
    ),
    sectionText(
      "30 秒回答",
      [
        question.answerOutline[0] ?? "我会先划清边界，再解释运行机制，最后用系统设计和事故排障证明方案可落地。",
        "回答时必须主动补数据流、关键字段、失败模式、指标和取舍，否则很容易停留在背概念。",
      ].join("\n\n"),
    ),
    sectionText(
      "架构与运行机制",
      [
        subSectionText(
          "标准回答骨架",
          bulletList(
            [
              ...question.answerOutline,
              ...topicSignals,
              "把核心对象、状态变化、执行顺序和异常路径讲出来，避免只说结论。",
            ],
            ["先讲边界，再讲机制，然后讲工程实现、指标和取舍。"],
          ),
        ),
        subSectionText(
          "数据流怎么讲",
          sentences(playbooks.map((item) => item.architecture), 4).join("\n\n"),
        ),
        subSectionText(
          "落地实现细节",
          bulletList(
            [
              ...mechanisms,
              "关键接口要有 schema、version、timeout、retry、幂等键和审计字段。",
              "关键状态要能恢复，关键动作要能回放，关键结果要有验证器或指标证明。",
            ],
            ["输入、处理、状态、存储、外部依赖和观测闭环都要讲到。"],
          ),
        ),
      ].join("\n\n"),
    ),
    sectionText("可画图", questionDiagram(question)),
    sectionText(
      "系统设计案例",
      caseBlocks.length > 0
        ? caseBlocks.join("\n")
        : [
            "### 面试可展开的系统设计",
            "",
            sentences(playbooks.map((item) => item.scenario), 4).join("\n\n"),
            "",
            "**答题时建议画出的模块**",
            bulletList(scaffold.architectureModules, []),
            "",
            "**数据流**",
            bulletList(scaffold.dataFlow, []),
          ].join("\n"),
    ),
    sectionText(
      "真实问题与排障",
      [
        sentences(playbooks.map((item) => item.troubleshooting), 4).join("\n\n"),
        "",
        "**现场排障回答法**",
        bulletList(scaffold.troubleshootingSteps, []),
        "",
        "**重点指标**",
        bulletList(metrics, ["success_rate", "latency_p95", "error_rate", "retry_rate", "duplicate_rate", "human_handoff_rate"]),
      ].join("\n"),
    ),
    sectionText(
      "多轮追问模拟",
      [
        ...followUpSteps.flatMap((step, index) => [
          `### 追问 ${index + 1}：${step.question}`,
          "",
          `**回答要点**：${step.answerHint}`,
          "",
          `**考察点**：${step.probes.join("、")}`,
          "",
        ]),
        ...question.followUps.map((followUp, index) => [
          `### 延伸追问 ${index + 1}：${followUp}`,
          "",
          `回答时继续沿着边界、架构、数据流、指标、失败模式和取舍展开。可以落到这些项目证据：${trimSentenceEnd(question.projectAnswerHints.join("；"))}。`,
          "",
        ].join("\n")),
      ].join("\n"),
    ),
    sectionText(
      "项目化回答与取舍",
      [
        "**项目证据怎么挂钩**",
        bulletList(question.projectAnswerHints, ["用真实项目里的模块边界、数据流、指标和失败案例证明你不是只背概念。"]),
        "",
        "**取舍总结**",
        sentences(playbooks.map((item) => item.tradeoff), 4).join("\n\n"),
        "",
        "**收尾句**",
        "这类问题最后要回到可验证结果：设计上有什么边界，线上看什么指标，失败后怎么恢复，哪些场景不该用这个方案。这样回答才经得起连续追问。",
      ].join("\n"),
    ),
    sectionText(
      "深挖技术细节",
      [
        bulletList(
          [
            ...mechanisms,
            ...topicSignals,
            scaffold.deepDiveReminder,
            "关键链路要说明同步路径、异步路径、失败路径和补偿路径。",
          ],
          ["把机制拆成对象、状态、协议、执行顺序和失败分支。"],
        ),
      ].join("\n"),
    ),
    sectionText(
      "边界条件与反例",
      [
        "反例一：如果业务需要强事务一致性，不能只靠缓存、搜索索引或异步读模型承载最终正确性。",
        "",
        "反例二：如果没有指标、trace 和回归样例，方案在线上出问题时只能靠猜，不能证明稳定性。",
        "",
        "反例三：为了追求低延迟而省略权限、幂等、超时或降级，会把局部性能优化变成系统性风险。",
      ].join("\n"),
    ),
    sectionText(
      "深问准备",
      [
        "被追问时优先沿四条线展开：为什么需要这个方案、关键数据结构是什么、失败后如何止血和定位、最终用什么指标证明修复有效。",
        "",
        bulletList(
          [
            "准备一个线上事故：影响面、止血、根因、修复、回归。",
            "准备一个系统设计：入口、状态、执行、存储、观测。",
            "准备一个取舍：一致性、延迟、吞吐、成本和可维护性。",
          ],
          [],
        ),
      ].join("\n"),
    ),
    sourceSection(relatedTopics.flatMap((topic) => topic.sourceIds)),
  ].join("\n");
};

fs.mkdirSync(topicDir, { recursive: true });
fs.mkdirSync(questionDir, { recursive: true });

const createdTopics = [];
const skippedTopics = [];
const createdQuestions = [];
const skippedQuestions = [];

for (const topic of topics) {
  if (!force && fileExists(topicDir, topic.id)) {
    skippedTopics.push(topic.id);
    continue;
  }
  writeMarkdown(topicDir, topic.id, buildTopicMarkdown(topic));
  createdTopics.push(topic.id);
}

for (const question of questions) {
  if (!force && fileExists(questionDir, question.id)) {
    skippedQuestions.push(question.id);
    continue;
  }
  writeMarkdown(questionDir, question.id, buildQuestionMarkdown(question));
  createdQuestions.push(question.id);
}

console.log(
  JSON.stringify(
    {
      topics: { created: createdTopics.length, skipped: skippedTopics.length },
      questions: { created: createdQuestions.length, skipped: skippedQuestions.length },
      createdTopics,
      createdQuestions,
    },
    null,
    2,
  ),
);
