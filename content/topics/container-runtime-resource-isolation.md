# 容器运行时、资源隔离与安全边界

## 面试定位

容器运行时、资源隔离与安全边界 属于 Docker / Kubernetes / DevOps / 容器运行时与资源隔离。面试里它不是背概念题，而是用来判断你是否能把知识落到架构、数据流、指标和取舍上。
一句话定位：容器通过 namespace、cgroup、filesystem、capability 和安全策略隔离进程、网络、挂载点和资源，但隔离边界仍弱于虚拟机。

**必须讲清楚**
- 容器运行时负责创建、启动、停止和隔离容器进程。
- Namespace 控制进程看到什么资源视图，cgroup 控制能用多少资源。
- 容器安全边界由内核能力、文件系统权限、网络策略和运行用户共同决定。
- 容器通过 namespace、cgroup、filesystem、capability 和安全策略隔离进程、网络、挂载点和资源，但隔离边界仍弱于虚拟机。
- namespace 隔离视图
- cgroup 限制资源
- capability/seccomp 控制权限

**常见追问方向**
- Docker 题先讲镜像、容器、层、卷、网络和资源边界。
- Kubernetes 题先讲 Pod、Controller、Service、Ingress、Config/Secret、探针和发布策略。
- DevOps 题要把 CI/CD、镜像版本、灰度、回滚、指标、日志和事故复盘连成一条链。
- 如果这个点落到 Coding Agent：代码库任务 Harness，架构如何设计？
- 线上失败时看哪些 trace、日志、指标，怎么回滚或补偿？

## 架构与运行机制

### 核心机制

- 容器共享宿主机内核，所以内核漏洞和过高权限仍可能影响宿主机。
- 资源限制是稳定性边界，也是容量规划输入。
- 只读根文件系统和非 root 用户能减少运行时写入和权限风险。
- 挂载 Docker socket、host network 或 privileged 模式会显著放大风险。
- Namespace 让进程看到独立的 PID、网络、挂载、UTS、IPC 等视图。
- cgroup 控制 CPU、内存、IO 等资源使用，防止单容器拖垮宿主机。
- capability、seccomp、AppArmor/SELinux、只读文件系统和非 root 用户共同降低逃逸和误操作风险。
- Least privilege container。
- Read-only root filesystem。
- Seccomp/AppArmor profile。
- Resource requests and limits。
- 为 CPU、memory、ephemeral storage 设置 requests/limits，并把 OOMKilled 纳入告警。
- 把临时文件写入明确挂载点，避免根文件系统不可写导致启动失败。
- 高风险工具执行放入隔离容器，限制网络、文件系统、CPU、内存和超时。


### 通用数据流

可以按代码提交、CI 构建、镜像仓库、配置注入、Kubernetes 工作负载、Service/Ingress、资源限制、探针、HPA、Prometheus、日志、Trace 和回滚来讲。数据流通常是代码合并后构建不可变镜像，镜像按环境推广，Deployment 拉起 Pod，Service 和 Ingress 接入流量，ConfigMap/Secret 注入配置，Prometheus 抓取指标，发布异常时通过 rollout、告警和 Runbook 回滚或止血。


### 工程落点

- 为服务定义 Dockerfile、镜像标签、启动命令、健康检查、配置注入和资源限制。
- 为 Kubernetes 工作负载定义 requests/limits、readiness/liveness probes、滚动发布、Service、Ingress 和回滚策略。
- 上线后跟踪部署成功率、Pod 重启、镜像拉取失败、探针失败、CPU/内存、p95、错误率和回滚次数。
- Java 容器要关注 JVM 对 cgroup 内存和 CPU 限制的识别，避免 OOMKilled 和 GC 抖动。
- 生产容器默认最小权限，禁止 privileged、hostPath 和宿主网络，除非有明确审批。
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

图 1：容器运行时、资源隔离与安全边界 的回答要从业务入口进入，先讲边界和数据结构，再讲机制、失败模式、指标和取舍。

## 系统设计案例

### 容器运行时、资源隔离与安全边界 的面试级设计题

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
- container_cpu_usage
- container_memory_working_set
- oom_killed_count
- restart_count
- security_policy_violation_count

**常见误区**
- 容器内 root 等于安全
- 不设内存限制导致节点被打爆
- 把 Docker socket 挂进业务容器

## 业界方案与技术取舍

DevOps 的取舍是可复现交付、弹性和自愈能力换来了配置复杂度、平台依赖、观测成本和发布治理要求。面试追问通常会围绕镜像层和缓存、容器隔离边界、Compose 与 K8s 区别、Pod/Deployment/Service/Ingress、ConfigMap/Secret、探针、HPA、灰度发布、回滚和 Prometheus 观测展开。

**方案对比**
- Least privilege container。
- Read-only root filesystem。
- Seccomp/AppArmor profile。
- Resource requests and limits。
- 更严格权限提升安全但可能影响调试和兼容。
- 更低资源限制节省成本但更容易 OOM 或抖动。
- 共享内核轻量高效但隔离弱于虚拟机。
- 先把 DevOps 看成从代码、镜像、配置、发布到运行态观测的一条交付链路，而不是只会写几条 Docker 或 kubectl 命令。
- Docker 解决应用和依赖的可移植运行单元，Kubernetes 解决多副本调度、服务发现、滚动发布和故障自愈。
- 面试回答要从本地可复现推进到生产发布、资源隔离、配置治理、观测告警和回滚。
- cgroup 限制可以和 JVM 堆、线程池、连接池容量一起讲。
- Agent tool sandbox 可直接复用容器隔离思路。

**复习时要能讲出的细节**
- 这个知识点解决什么问题，不解决什么问题。
- 关键数据结构、状态变化、失败边界和可观测指标是什么。
- 面试官继续追问时，能从架构图、数据流、线上排障和项目证据四个角度展开。
- 能说明为什么这个取舍适合当前业务，而不是只背业界名词。

## 深入技术细节

容器通过 namespace、cgroup、filesystem、capability 和安全策略隔离进程、网络、挂载点和资源，但隔离边界仍弱于虚拟机。 容器运行时负责创建、启动、停止和隔离容器进程。 Namespace 控制进程看到什么资源视图，cgroup 控制能用多少资源。 容器安全边界由内核能力、文件系统权限、网络策略和运行用户共同决定。 容器共享宿主机内核，所以内核漏洞和过高权限仍可能影响宿主机。 资源限制是稳定性边界，也是容量规划输入。 只读根文件系统和非 root 用户能减少运行时写入和权限风险。 挂载 Docker socket、host network 或 privileged 模式会显著放大风险。

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

- [Docker Documentation: What is a container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)：用于确认官方语义边界、命令行为和工程约束。
- [Kubernetes Documentation: Pods](https://kubernetes.io/docs/concepts/workloads/pods/)：用于确认官方语义边界、命令行为和工程约束。
