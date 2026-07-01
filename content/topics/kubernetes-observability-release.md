# Kubernetes 发布、探针、HPA 与可观测性

## 面试定位

Kubernetes 发布、探针、HPA 与可观测性 属于 Docker / Kubernetes / DevOps / DevOps 发布、回滚与可观测性。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Kubernetes 生产发布要把镜像推广、滚动更新、探针、HPA、日志指标、告警、回滚和事故复盘串成闭环。

**必须讲清楚**
- 发布是把镜像和配置变更安全推进到运行环境的流程。
- 探针是 Kubernetes 判断容器启动、存活和可接流量的机制。
- HPA 根据指标自动调整副本数，是容量治理的一部分而不是万能扩容按钮。
- Kubernetes 生产发布要把镜像推广、滚动更新、探针、HPA、日志指标、告警、回滚和事故复盘串成闭环。
- 发布要可灰度可回滚
- 探针决定流量和重启
- HPA 依赖可信指标

**常见追问方向**
- Docker 题先讲镜像、容器、层、卷、网络和资源边界。
- Kubernetes 题先讲 Pod、Controller、Service、Ingress、Config/Secret、探针和发布策略。
- DevOps 题要把 CI/CD、镜像版本、灰度、回滚、指标、日志和事故复盘连成一条链。
- 如果这个点落到 Coding Agent：代码库任务 Harness、Web Agent：公开网页任务自动化与评测，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 发布前有门禁，发布中有灰度，发布后有观察，失败时有回滚。
- readiness 保护用户流量，liveness 处理不可恢复卡死，startup 保护慢启动。
- 扩缩容指标要稳定、低噪声，并和业务容量相关。
- 发布事故要沉淀到 Runbook、告警、回归测试和容量模型。
- 滚动发布通过逐步替换副本降低风险，失败时可暂停或回滚。
- readiness/liveness/startup probes 影响服务接流量、容器重启和慢启动保护。
- HPA 根据 CPU、内存或自定义指标扩缩副本，但指标滞后和冷启动会影响效果。
- Rolling update。
- Canary release。
- Readiness/liveness/startup probes。
- HPA。
- SLO-based rollback。
- CI 产出不可变镜像和 SBOM，CD 按环境推广镜像 digest。
- 发布后观察 p95、error_rate、restart_count、probe_failure、slo_burn_rate 和业务成功率。
- 自动回滚要避免误判，通常结合短窗口错误率、探针失败、核心业务 SLO 和人工确认。


### 通用数据流

可以按代码提交、CI 构建、镜像仓库、配置注入、Kubernetes 工作负载、Service/Ingress、资源限制、探针、HPA、Prometheus、日志、Trace 和回滚来讲。数据流通常是代码合并后构建不可变镜像，镜像按环境推广，Deployment 拉起 Pod，Service 和 Ingress 接入流量，ConfigMap/Secret 注入配置，Prometheus 抓取指标，发布异常时通过 rollout、告警和 Runbook 回滚或止血。


### 工程落点

- 为服务定义 Dockerfile、镜像标签、启动命令、健康检查、配置注入和资源限制。
- 为 Kubernetes 工作负载定义 requests/limits、readiness/liveness probes、滚动发布、Service、Ingress 和回滚策略。
- 上线后跟踪部署成功率、Pod 重启、镜像拉取失败、探针失败、CPU/内存、p95、错误率和回滚次数。
- 发布门禁包括镜像扫描、单测、集成测试、迁移检查、探针验证、SLO 观察和自动回滚条件。
- DevOps 面试要能从 CI/CD、镜像、K8s rollout、Prometheus、日志、Trace 和 Runbook 讲完整发布链路。
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

图 1：Kubernetes 发布、探针、HPA 与可观测性 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Kubernetes 发布、探针、HPA 与可观测性 的面试级设计题

典型设计题是把一个 Java/RAG/Agent 服务从本地 Docker 运行推进到 Kubernetes 生产发布。架构上要包含 Dockerfile、多阶段构建、镜像标签、Compose 本地依赖、Deployment、Service、Ingress、ConfigMap、Secret、readiness/liveness/startup probes、requests/limits、HPA、Prometheus 指标、日志采集、发布门禁和回滚策略。

**可画架构**
- 构建层：CI 根据 Dockerfile/BuildKit 构建不可变镜像，产出 digest、SBOM、扫描结果和构建日志。
- 分发层：镜像进入 registry，按 dev/staging/prod 推广，发布引用镜像 digest 而不是浮动 tag。
- 运行层：Kubernetes Deployment/StatefulSet 创建 Pod，设置 requests/limits、env、volume 和 probes。
- 流量层：Service、EndpointSlice、Ingress/Gateway 负责服务发现、负载均衡、TLS 和入口策略。
- 运维层：Prometheus、日志、Trace、events、rollout history 和 Runbook 支撑发布观察和回滚。

**数据流**
- 代码合并触发 CI，构建镜像、运行测试、安全扫描并推送 registry。
- CD 更新 Deployment 或 Helm values，Kubernetes controller 逐步创建新 ReplicaSet 和 Pod。
- readiness 通过后 Pod 进入 Service endpoints，Ingress/Gateway 开始转发流量。
- Prometheus 和日志系统观察错误率、延迟、重启、探针失败和 SLO，异常时暂停或回滚 rollout。

## 真实问题与排障

真实线上问题一般从镜像拉取失败、容器启动失败、CrashLoopBackOff、OOMKilled、探针失败、Service 无 endpoints、Ingress 5xx、DNS 解析失败、配置版本错误、HPA 抖动、Pod 重启、p95 升高和 SLO burn rate 看起。回答时要先确认影响面和最近发布，再沿镜像、调度、配置、网络、资源、应用日志和指标逐层定位。

**排查顺序**
- 先确认影响面和最近发布：哪些服务、版本、namespace、节点和用户受影响。
- 按镜像、调度、配置、Secret、存储、网络、探针、资源和应用日志逐层排查。
- 查看 Pod events、describe、container status、previous logs、rollout history 和 Service endpoints。
- 先止血：回滚 Deployment、扩旧版本、摘流、提高资源、暂停 HPA 或切换只读/降级。
- 复盘补发布门禁、探针、资源模型、告警、Runbook 和回归演练。

**重点指标**
- rollout_success_rate
- deployment_duration
- probe_failure_count
- hpa_scale_events
- rollback_count
- slo_burn_rate

**常见误区**
- 没有 readiness 导致未启动服务接流量
- HPA 指标不稳定引发抖动
- 发布失败只会手工删 Pod

## 业界方案与技术取舍

DevOps 的取舍是可复现交付、弹性和自愈能力换来了配置复杂度、平台依赖、观测成本和发布治理要求。面试追问通常会围绕镜像层和缓存、容器隔离边界、Compose 与 K8s 区别、Pod/Deployment/Service/Ingress、ConfigMap/Secret、探针、HPA、灰度发布、回滚和 Prometheus 观测展开。

**方案对比**
- Rolling update。
- Canary release。
- Readiness/liveness/startup probes。
- HPA。
- SLO-based rollback。
- 灰度发布降低风险但拉长发布周期。
- 自动回滚恢复快但误触发会造成发布震荡。
- HPA 提升弹性但对指标延迟和冷启动敏感。
- 先把 DevOps 看成从代码、镜像、配置、发布到运行态观测的一条交付链路，而不是只会写几条 Docker 或 kubectl 命令。
- Docker 解决应用和依赖的可移植运行单元，Kubernetes 解决多副本调度、服务发现、滚动发布和故障自愈。
- 面试回答要从本地可复现推进到生产发布、资源隔离、配置治理、观测告警和回滚。
- 发布门禁可以和现有质量门禁、validate/build、GitHub Actions 经验连接。
- K8s 观测和 Prometheus/SLO 正好补上你原来的监控经验。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Kubernetes 生产发布要把镜像推广、滚动更新、探针、HPA、日志指标、告警、回滚和事故复盘串成闭环。 发布是把镜像和配置变更安全推进到运行环境的流程。 探针是 Kubernetes 判断容器启动、存活和可接流量的机制。 HPA 根据指标自动调整副本数，是容量治理的一部分而不是万能扩容按钮。 发布前有门禁，发布中有灰度，发布后有观察，失败时有回滚。 readiness 保护用户流量，liveness 处理不可恢复卡死，startup 保护慢启动。 扩缩容指标要稳定、低噪声，并和业务容量相关。 发布事故要沉淀到 Runbook、告警、回归测试和容量模型。

面试深挖时要把镜像、容器、Pod、Service、Ingress、配置、资源、探针、发布、回滚和观测串成链路。不要只背 kubectl 命令，要讲清对象关系和故障路径。

## 关键数据结构与协议

| 字段 | 所属对象 | 作用 | 排障价值 |
| :--- | :--- | :--- | :--- |
| `image_digest` | 镜像 | 固定构建产物身份 | 排查发布版本和供应链风险 |
| `deployment_revision` | 发布 | 标识 rollout 版本 | 支持回滚和变更对比 |
| `pod_uid` | 运行实例 | 标识一次 Pod 生命周期 | 关联 events、logs 和 restart |
| `readiness_probe` | 流量门禁 | 决定 Pod 是否接流量 | 排查未启动接流和摘流问题 |
| `service_endpoint` | 服务发现 | 记录 Service 后端 Pod | 排查无 endpoints 和流量错路由 |
| `config_version` | 配置 | 标识 ConfigMap/Secret/values 版本 | 排查配置漂移和回滚 |

## 深问准备

被追问边界时，先说这个方案适合什么、不适合什么，再给反例。被追问线上故障时，按影响面、止血、根因、修复、回归五段回答。被追问项目时，把回答落到你做过的接口、缓存、队列、数据库、监控或 Agent 工程链路。

- 反例要明确，例如强事务事实源不能交给缓存或搜索读模型。
- 指标要可执行，例如 p95、error_rate、retry_rate、lag、miss_rate、stale_rate。
- 回归要可复现，例如固定输入、故障注入、压测脚本或 golden case。

## 来源与延伸阅读

- [Kubernetes Documentation: Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)：用于确认官方语义边界、命令行为和工程约束。
- [Kubernetes Documentation: Liveness, readiness, and startup probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)：用于确认官方语义边界、命令行为和工程约束。
- [Prometheus Documentation: Alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)：用于确认官方语义边界、命令行为和工程约束。
