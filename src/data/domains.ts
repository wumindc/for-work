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
    id: "engineering-quality",
    title: "工程质量与故障治理",
    description: "发布、回滚、压测、可观测性、故障复盘、质量门禁和工程效率。",
    status: "planned",
    priority: "later",
  },
] satisfies Domain[];
