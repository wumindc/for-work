// @author codex
import type { Domain } from "../types/knowledge";

export const domains = [
  {
    id: "ai-agent-rag",
    title: "AI Agent 与 RAG",
    description: "Agent、RAG、Memory、Context、Tool、Eval 和可观测性。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "elasticsearch",
    title: "Elasticsearch",
    description: "搜索、日志检索、索引设计、查询优化、稳定性和 RAG 检索连接。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "mq",
    title: "MQ",
    description: "异步解耦、削峰填谷、可靠投递、顺序消息、事务消息和消费治理。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "redis",
    title: "Redis",
    description: "缓存、分布式锁、限流、热点治理、持久化和高可用。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "database",
    title: "数据库",
    description: "索引、事务、锁、MVCC、分库分表、读写分离和容量治理。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "prometheus-observability",
    title: "Prometheus 与监控体系",
    description: "指标、日志、链路追踪、告警、SLO、故障定位和容量观测。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "java-jvm",
    title: "Java 并发与 JVM",
    description: "线程池、锁、并发容器、JMM、GC、JVM 调优和线上排障。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "system-design",
    title: "分布式与系统设计",
    description: "高并发、高可用、一致性、幂等、限流、降级、容量和容灾。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "web-engineering",
    title: "Web 工程",
    description: "HTTP 缓存、会话认证、API 契约、幂等、安全、前后端协作和网关治理。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "ai-engineering-trends",
    title: "AI 工程趋势与实战方案",
    description: "Loop Engineering、Coding Agent、RAG 基础设施、Agent Memory、本地 AI、Skill 化和企业 Agent 方案。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "devops-docker-kubernetes",
    title: "Docker / Kubernetes / DevOps",
    description:
      "容器、镜像、运行时隔离、Compose、本地开发、Kubernetes 工作负载、服务网络、配置、发布和可观测性。",
    status: "sample_ready",
    priority: "important",
  },
  {
    id: "spring-java-backend",
    title: "Spring Java 后端体系",
    description:
      "Spring、Spring Boot、MyBatis、MyBatis Plus、Spring Cloud、REST、权限、事务和生产排障。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "coding-algorithms-interview",
    title: "算法题与编码面试",
    description:
      "复杂度、Java 解题模板、数组字符串、哈希栈队列、链表、二分、回溯、树、堆、贪心、DP、图和面试复盘。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "python-ai-engineering",
    title: "Python AI 工程与 API 服务",
    description:
      "Python 环境、FastAPI、Pydantic、异步服务、AI Provider SDK、测试、观测、部署和 Java 集成。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "llmops-eval-quality",
    title: "LLMOps、Eval 与 AI 质量工程",
    description:
      "Golden set、LLM-as-judge、RAG/Agent eval、线上影子评测、Trace 归因、发布门禁和事故回归。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "production-rag-data-infra",
    title: "生产级 RAG 数据工程",
    description:
      "文档解析、OCR、Chunk、Metadata、ACL、Embedding、向量索引、重排、增量索引和检索观测。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "ai-career-portfolio",
    title: "AI 求职作品集与项目表达",
    description:
      "AI 功能发现、Human-in-the-loop、质量指标、失败体验、项目 one-pager、简历 bullet 和面试讲述。",
    status: "sample_ready",
    priority: "core",
  },
  {
    id: "engineering-quality",
    title: "工程质量与故障治理",
    description: "发布、回滚、压测、可观测性、故障复盘、质量门禁和工程效率。",
    status: "planned",
    priority: "later",
  },
] satisfies Domain[];
