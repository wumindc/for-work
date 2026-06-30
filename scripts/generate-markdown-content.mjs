// @author codex
import fs from "node:fs";
import path from "node:path";
import { categories, domains, projectEvidence, questions, sources, topics } from "../src/data/index.ts";

const root = process.cwd();
const topicDir = path.join(root, "content", "topics");
const questionDir = path.join(root, "content", "questions");

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

const buildTopicMarkdown = (topic) => {
  const playbook = playbookFor(topic);
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
            bulletList(
              [
                "入口层校验用户请求、权限、租户、参数和幂等键。",
                "业务服务层决定同步处理、异步处理、缓存读写、数据库回源或降级返回。",
                "状态层保存业务状态、缓存版本、事件状态和恢复点。",
                "执行层处理存储访问、下游调用、异步任务和补偿动作，并把结构化结果写入 trace。",
                "观测层用指标、日志和链路追踪证明系统可运行、可排障、可复盘。",
              ],
              [],
            ),
            "",
            "**数据流**",
            bulletList(
              [
                "请求进入入口层后生成 request_id/run_id。",
                "业务服务读取缓存、数据库或异步事件状态，选择执行路径。",
                "执行结果写回状态存储，并向监控系统上报延迟、错误和业务结果。",
                "保护策略根据成功标准、失败次数、SLA 和风险等级决定继续、降级、补偿或停止。",
              ],
              [],
            ),
          ].join("\n"),
    ),
    sectionText(
      "真实问题与排障",
      [
        playbook.troubleshooting,
        "",
        "**排查顺序**",
        bulletList(
          [
            "先确认用户可感知问题：错误率、延迟、成功率、数据一致性或结果质量是否异常。",
            "再沿数据流定位是哪一段出了问题：入口、状态、缓存、数据库、异步事件、外部依赖或消费端。",
            "对比最近发布、配置变更、流量变化、数据倾斜和下游限流。",
            "先止血：限流、降级、回滚、暂停消费、隔离高风险工具或切换只读模式。",
            "最后把失败样例进入 regression/eval，避免同类问题复发。",
          ],
          [],
        ),
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
        "面试深挖时要把对象、状态、协议、执行顺序和失败分支讲出来。不要只说“可以用 Redis/数据库/MQ 解决”，而要说明 key、字段、版本、超时、重试、幂等、降级和观测指标如何共同工作。",
      ].join("\n"),
    ),
    sectionText(
      "关键数据结构与协议",
      [
        "| 字段 | 所属对象 | 作用 | 排障价值 |",
        "| :--- | :--- | :--- | :--- |",
        "| `request_id` | 请求 | 串联入口、缓存、DB 和下游调用 | 定位单次异常 |",
        "| `key_schema` | Redis/存储 | 固定业务域、实体和版本 | 排查误删、串租户和旧版本 |",
        "| `source_version` | value/event | 标识事实源版本 | 防止旧值覆盖新值 |",
        "| `ttl_policy` | 缓存策略 | 控制过期、抖动和刷新 | 排查击穿、雪崩和旧值窗口 |",
        "| `trace_id` | 观测链路 | 串联服务、存储和异步任务 | 复盘慢请求和失败分支 |",
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
            bulletList(
              [
                "入口层：参数校验、权限、租户、幂等和 request_id。",
                "业务服务层：决定同步流程、异步流程、缓存读写、数据库回源、下游调用或降级返回。",
                "执行层：封装存储访问、外部调用和异步任务，统一 timeout、retry、error code 和审计。",
                "状态层：保存任务状态、业务状态、checkpoint 和版本。",
                "观测层：指标、日志、trace、回放和 regression case。",
              ],
              [],
            ),
            "",
            "**数据流**",
            bulletList(
              [
                "请求进入系统后生成唯一标识，并把用户约束和业务上下文落入状态。",
            "业务服务读取缓存、数据库、异步事件或下游状态，选择执行路径。",
                "执行结果以结构化结果写回状态，同时上报指标。",
                "保护策略判断是否完成、重试、降级、补偿或转人工。",
              ],
              [],
            ),
          ].join("\n"),
    ),
    sectionText(
      "真实问题与排障",
      [
        sentences(playbooks.map((item) => item.troubleshooting), 4).join("\n\n"),
        "",
        "**现场排障回答法**",
        bulletList(
          [
            "先说影响面：成功率、错误率、延迟、积压、成本或质量指标是否异常。",
            "按数据流分段定位，不要一上来就改参数或调 prompt。",
            "查看最近发布、配置变更、数据分布变化、下游限流和资源水位。",
            "先止血再根因：降级、回滚、限流、暂停高风险动作、隔离异常租户或重放失败样本。",
            "最后把样本沉淀为 eval/regression case，并补齐监控告警。",
          ],
          [],
        ),
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
            "关键数据结构要带版本、状态、trace、超时、重试和审计字段。",
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
  if (fileExists(topicDir, topic.id)) {
    skippedTopics.push(topic.id);
    continue;
  }
  writeMarkdown(topicDir, topic.id, buildTopicMarkdown(topic));
  createdTopics.push(topic.id);
}

for (const question of questions) {
  if (fileExists(questionDir, question.id)) {
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
