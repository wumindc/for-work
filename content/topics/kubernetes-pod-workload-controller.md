# Kubernetes Pod、Deployment 与工作负载控制器

## 面试定位

Kubernetes Pod、Deployment 与工作负载控制器 属于 Docker / Kubernetes / DevOps / Kubernetes Pod 与工作负载。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：Pod 是 Kubernetes 最小调度单元，Deployment、ReplicaSet、StatefulSet、DaemonSet 等控制器通过 reconciliation 保持期望副本和发布状态。

**必须讲清楚**
- Pod 是 Kubernetes 中最小可部署、可调度的计算单元。
- Deployment 是管理无状态副本和滚动发布的控制器。
- Controller 通过调谐循环让实际状态接近期望状态。
- Pod 是 Kubernetes 最小调度单元，Deployment、ReplicaSet、StatefulSet、DaemonSet 等控制器通过 reconciliation 保持期望副本和发布状态。
- Pod 是调度单元
- Controller 持续调谐期望状态
- Deployment 管理无状态服务滚动发布

**常见追问方向**
- Docker 题先讲镜像、容器、层、卷、网络和资源边界。
- Kubernetes 题先讲 Pod、Controller、Service、Ingress、Config/Secret、探针和发布策略。
- DevOps 题要把 CI/CD、镜像版本、灰度、回滚、指标、日志和事故复盘连成一条链。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- Pod 会被重建和迁移，所以状态不能只存在本地容器文件系统。
- readiness 决定是否接流量，liveness 决定是否重启，startup 保护慢启动服务。
- requests 影响调度，limits 影响运行边界。
- 滚动发布要控制 maxUnavailable、maxSurge 和回滚路径。
- Pod 内的容器共享网络命名空间和部分存储卷，通常表达一个紧密协作的运行单元。
- Deployment 管理 ReplicaSet，实现滚动更新、回滚和副本数维持。
- Controller loop 会不断比较 desired state 与 actual state，并尝试让实际状态收敛。
- Deployment rollout。
- Readiness/liveness/startup probes。
- Resource requests/limits。
- PDB。
- 上线前验证镜像拉取、环境变量、Secret/ConfigMap、端口、探针和资源配置。
- 发布失败时用 rollout undo、暂停发布、扩旧版本或切流量止血。
- Pod 频繁重启要查 exit code、OOMKilled、probe failure、依赖超时和启动脚本。


### 通用数据流

可以按代码提交、CI 构建、镜像仓库、配置注入、Kubernetes 工作负载、Service/Ingress、资源限制、探针、HPA、Prometheus、日志、Trace 和回滚来讲。数据流通常是代码合并后构建不可变镜像，镜像按环境推广，Deployment 拉起 Pod，Service 和 Ingress 接入流量，ConfigMap/Secret 注入配置，Prometheus 抓取指标，发布异常时通过 rollout、告警和 Runbook 回滚或止血。


### 工程落点

- 为服务定义 Dockerfile、镜像标签、启动命令、健康检查、配置注入和资源限制。
- 为 Kubernetes 工作负载定义 requests/limits、readiness/liveness probes、滚动发布、Service、Ingress 和回滚策略。
- 上线后跟踪部署成功率、Pod 重启、镜像拉取失败、探针失败、CPU/内存、p95、错误率和回滚次数。
- 生产服务必须设置 requests/limits、readiness/liveness/startup probes、滚动发布策略和 PodDisruptionBudget。
- 排障先看 pod phase、events、container status、logs、describe、probe failure 和 rollout history。
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

图 1：Kubernetes Pod、Deployment 与工作负载控制器 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### Kubernetes Pod、Deployment 与工作负载控制器 的面试级设计题

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
- deployment_available_replicas
- pod_restart_count
- probe_failure_count
- rollout_duration
- oom_killed_count

**常见误区**
- 把 Pod 当永久机器使用
- 没有 readiness 就接流量
- requests/limits 缺失导致调度和稳定性不可控

## 业界方案与技术取舍

DevOps 的取舍是可复现交付、弹性和自愈能力换来了配置复杂度、平台依赖、观测成本和发布治理要求。面试追问通常会围绕镜像层和缓存、容器隔离边界、Compose 与 K8s 区别、Pod/Deployment/Service/Ingress、ConfigMap/Secret、探针、HPA、灰度发布、回滚和 Prometheus 观测展开。

**方案对比**
- Deployment rollout。
- Readiness/liveness/startup probes。
- Resource requests/limits。
- PDB。
- 更严格 readiness 可保护用户但发布变慢。
- 更高副本数提升可用性但增加成本。
- limits 太低会 OOM，太高会降低节点利用率。
- 先把 DevOps 看成从代码、镜像、配置、发布到运行态观测的一条交付链路，而不是只会写几条 Docker 或 kubectl 命令。
- Docker 解决应用和依赖的可移植运行单元，Kubernetes 解决多副本调度、服务发现、滚动发布和故障自愈。
- 面试回答要从本地可复现推进到生产发布、资源隔离、配置治理、观测告警和回滚。
- Deployment 的期望状态和控制器调谐类似后台任务状态机。
- 探针和服务健康检查与后端 SLO/告警直接相关。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

Pod 是 Kubernetes 最小调度单元，Deployment、ReplicaSet、StatefulSet、DaemonSet 等控制器通过 reconciliation 保持期望副本和发布状态。 Pod 是 Kubernetes 中最小可部署、可调度的计算单元。 Deployment 是管理无状态副本和滚动发布的控制器。 Controller 通过调谐循环让实际状态接近期望状态。 Pod 会被重建和迁移，所以状态不能只存在本地容器文件系统。 readiness 决定是否接流量，liveness 决定是否重启，startup 保护慢启动服务。 requests 影响调度，limits 影响运行边界。 滚动发布要控制 maxUnavailable、maxSurge 和回滚路径。

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

- [Kubernetes Documentation: Pods](https://kubernetes.io/docs/concepts/workloads/pods/)：用于确认官方语义边界、命令行为和工程约束。
- [Kubernetes Documentation: Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)：用于确认官方语义边界、命令行为和工程约束。
- [Kubernetes Documentation: Liveness, readiness, and startup probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/)：用于确认官方语义边界、命令行为和工程约束。
