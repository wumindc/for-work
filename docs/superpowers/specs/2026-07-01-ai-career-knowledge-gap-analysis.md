<!-- @author codex -->
# AI 岗位求职知识缺口分析

日期：2026-07-01

## 结论先行

当前站点已经不是“内容少”的问题。以当前工作区数据为准，站点已有 14 个 domain、97 个 category、165 个 topic、286 道 question 和 18 条 learning path。已经覆盖得比较扎实的是：

- AI Agent / RAG 主线：Agent 边界、Tool、Memory、Context、RAG、Eval、Safety、Browser/Coding Agent、项目表达。
- Java 后端与架构师基础：Spring、Java/JVM、数据库、Redis、MQ、Web、系统设计。
- 工程运行基础：Prometheus、Docker、Kubernetes、DevOps、可观测性。
- 算法题与编码面试：中文技术面常见算法模式。

真正的缺口在另一层：如果目标是 AI 相关岗位，尤其是 AI 软件研发工程师 / AI 应用架构师 / Agent 工程师 / RAG 工程师 / LLMOps 工程师，站点还需要补齐“AI 工程生产化”的知识面。也就是：Python AI 工程、模型服务、微调与数据集、LLMOps/Eval、向量检索基础设施、多模态、AI 安全治理、云平台生态、AI 产品化与求职作品集。

换句话说，现有站点已经能支撑“懂 Agent/RAG 的 Java 架构师”面试，但还不够支撑“能独立把企业 AI 应用从数据、模型、推理、评测、发布、治理一路做上线的 AI 工程架构师”。

## 当前覆盖证据

### 当前站点覆盖

来自当前工作区 `src/data/index.ts` 聚合数据：

| 指标 | 当前数量 |
| --- | ---: |
| domains | 14 |
| categories | 97 |
| topics | 165 |
| questions | 286 |
| learning paths | 18 |

当前 domain 结构：

| Domain | Topic 数 | Question 数 | 判断 |
| --- | ---: | ---: | --- |
| AI Agent 与 RAG | 54 | 115 | 强，仍可继续做生产化扩展 |
| AI 工程趋势与实战方案 | 12 | 24 | 有趋势入口，但偏第一批样板 |
| Spring Java 后端体系 | 17 | 34 | 强，适合承接既有工作经历 |
| 算法题与编码面试 | 16 | 32 | 强，适合中文机试/算法面 |
| DevOps / Docker / Kubernetes | 8 | 16 | 基础够用，模型服务层不足 |
| Prometheus 与监控体系 | 8 | 12 | 传统可观测性够用，AI 质量观测需独立化 |
| Redis / Database / MQ / ES / Java / Web / System Design | 50 | 68 | 传统架构基础扎实 |
| 工程质量与故障治理 | 0 | 0 | planned 但空，适合作为质量治理扩展入口 |

### 关键词缺口

对当前 165 个 topic 的标题、摘要、details、engineeringNotes 做关键词粗检：

| 关键词 | 当前 topic 命中 |
| --- | ---: |
| Python / FastAPI / PyTorch | 0 |
| LoRA / fine-tuning | 0 |
| vLLM / GPU / CUDA / NIM | 0 |
| multimodal / OCR / speech / voice | 0 |
| Foundry / Vertex / Bedrock / Databricks | 0 |
| LlamaIndex / LangSmith | 0 |
| privacy / PII | 1 |
| resume / portfolio / 作品集 | 约 1 |

这说明当前内容虽然有 Agent/RAG 的概念和工程模式，但还没有系统覆盖 AI 岗位常见的 Python AI 应用开发、模型推理服务、云平台、微调、多模态和 LLMOps 工具链。

## 外部岗位能力趋势

这里不把社交媒体或培训文章当作唯一事实，而是参考官方文档和平台方向。

- OpenAI API 文档已经把 Agents SDK、orchestration、guardrails、state、observability、agent eval、voice agents、structured outputs、tool use、streaming、production best practices、cost/latency optimization 放在同一套开发者导航里。这说明 AI 应用工程不只是 prompt，而是完整运行时与上线体系。
- Anthropic 的 agent 工程文章强调：成功实现通常靠简单、可组合的模式，而不是一上来堆复杂框架；并且要区分 workflow 和 agent，明确成本、延迟和灵活性的取舍。
- Anthropic 的 context engineering 文章把 context 视为有限资源，强调上下文不只是 prompt，而是模型采样时可见的完整状态；这和当前站点已有 Context Engineering 主线一致，但可以继续往生产治理、压缩评测和长期任务恢复扩展。
- Anthropic 和 OpenAI 都强调 eval。OpenAI 明确指出生成式 AI 有不确定性，传统测试不够；Anthropic 进一步强调 agent 因为多轮、工具调用、状态修改而更难评估。
- Microsoft Foundry 和 LangSmith 文档都把 tracing、monitoring、online/offline evaluation、quality gates、token/latency/cost、安全和工具调用可观测性作为生产 AI 应用的核心能力。
- vLLM 和 NVIDIA NIM 代表模型推理服务生产化：batching、prefix cache、quantization、OpenAI-compatible API、health probes、observability、安全硬化，这些是当前站点几乎没有的模型基础设施内容。
- Google Cloud 和 LlamaIndex 的 RAG 资料都指向 production RAG：RAG 不是简单 top-k 向量召回，而是文档解析、结构化元数据、检索/合成 chunk 分离、动态检索、向量/关键词混合和评测闭环。

## 面向目标岗位的能力地图

### 1. Applied AI Engineer / AI 软件研发工程师

这类岗位最关心“能不能把模型 API 做成稳定产品功能”。

当前已覆盖：

- Agent、Tool、RAG、Memory、Context、Eval 的基础概念。
- Web/API、数据库、Redis、MQ、系统设计。
- Spring/Java 后端经验可作为生产系统优势。

还需补充：

- Python / FastAPI / Pydantic / async / pytest / packaging。
- OpenAI / Anthropic / Azure / Vertex / Bedrock SDK 的请求、流式、重试、限流、错误语义、成本控制。
- Structured output、JSON schema、tool call、function calling 的跨厂商差异。
- Prompt/version/config 管理、model gateway、fallback、A/B、灰度。
- AI 功能的产品指标：acceptance rate、deflection rate、groundedness、human override、cost per successful task。

### 2. Agent Engineer / Coding Agent Engineer

这类岗位看重 loop、state、tools、sandbox、eval、trace、long task recovery。

当前已覆盖：

- Agent loop、Tool schema、MCP、Skills、Coding Agent Harness、Context compaction、Trace replay。
- Browser Agent、Computer Use、SWE-bench。

还需补充：

- Agent runtime 的工程实现：event log、step store、checkpoint、resume packet、budget scheduler、pause/resume。
- Tool-use eval：tool selection accuracy、argument accuracy、side-effect safety、rollback test。
- Sandboxed execution 更深入：文件系统、网络、secret、process、container、policy engine、approval。
- Multi-agent 不要只讲 supervisor/handoff，还要讲 shared state、conflict resolution、credit assignment、cost attribution。
- Coding Agent 产品形态：repo memory、PR review、CI repair、test generation、codebase indexing、IDE integration。

### 3. RAG / Knowledge AI Engineer

这类岗位要求能把企业知识库做准、做稳、做可治理。

当前已覆盖：

- RAG pipeline、hybrid search、rerank、citation、agentic RAG。
- ES 与 RAG Hybrid Search。

还需补充：

- 文档解析与结构化：PDF、Word、HTML、表格、图片、公式、OCR、layout-aware chunk。
- Ingestion pipeline：增量同步、去重、版本、权限、数据质量、失败重试、re-index。
- Vector DB 底层：HNSW、IVF、PQ、DiskANN、距离函数、向量维度、index build、compaction、filter pushdown。
- Retrieval eval：recall@k、MRR、nDCG、citation precision、answerability、no-answer detection。
- Enterprise RAG：ACL、tenant、department scope、data lineage、document lifecycle、evidence freshness。

### 4. LLMOps / AI Platform Engineer

这类岗位更像“AI 系统平台工程师”，需要模型、推理、评测、发布、监控全链路。

当前已覆盖：

- Prometheus、日志、Trace、SLO、Dashboard、Runbook。
- DevOps、K8s、发布回滚。

还需补充：

- LLM observability：trace schema、span taxonomy、prompt/model/tool/evidence/cost/token 指标。
- EvalOps：golden dataset、human labeling、LLM-as-judge 校准、online eval、failure clustering。
- Model gateway：routing、fallback、rate limit、quota、cache、cost attribution、tenant policy。
- Prompt/config/model registry：版本、审批、灰度、回滚、diff、experiment tracking。
- AI release gates：eval threshold、safety threshold、cost threshold、latency threshold、regression buckets。

### 5. AI Infra / Model Serving Engineer

这类岗位要求更靠近 GPU、推理引擎和服务性能。

当前已覆盖：

- LLM 推理链路、KV cache、解码参数。
- K8s/DevOps 基础。

还需补充：

- vLLM / TensorRT-LLM / NVIDIA NIM / Triton 的边界与选型。
- GPU 基础：显存、batching、prefill/decode、attention cache、tensor parallel、pipeline parallel。
- 推理优化：continuous batching、prefix cache、speculative decoding、quantization、KV cache reuse。
- Serving SLO：TTFT、tokens/sec、throughput、p95 latency、queue time、GPU utilization。
- K8s 模型服务：readiness、warmup、model loading、autoscaling、node pool、GPU scheduling、multi-tenant isolation。

这块如果目标不是 AI Infra，可以做中等深度；但作为 AI 架构师，至少要能讲清“我知道模型服务为什么贵、慢、难扩”。

## 建议新增一级专题

### P0：Python AI 工程与 API 服务

原因：当前站点几乎没有 Python，而多数 AI 工程岗位默认 Python 是工作语言。用户可以继续以 Java 架构师为优势，但必须能证明 AI 应用侧的 Python 工程能力。

建议 topic：

1. Python 运行模型、虚拟环境、依赖与包管理
2. FastAPI / Pydantic / async API 服务
3. Python HTTP client、timeout、retry、streaming
4. OpenAI / Anthropic / Azure / Vertex SDK 调用模式
5. Structured output、schema validation 与 error envelope
6. pytest、mock、fixture 与 AI API 测试
7. async worker、队列、background task 与 cancellation
8. Python 日志、OpenTelemetry、trace context
9. 配置、secret、环境隔离与部署
10. AI 服务的限流、配额、成本统计
11. Java/Spring 与 Python AI 服务的集成方式
12. Python 代码质量、typing、ruff/mypy 与工程规范

学习路径：`python-ai-application-engineering-review`

### P0：LLMOps、Eval 与 AI 质量工程

原因：现有 Eval 分布在 Agent/RAG 里，但还没有把“质量体系”作为独立能力。AI 岗位现在非常看重能不能证明系统可靠，而不是 demo 能跑。

建议 topic：

1. Eval 基本模型：fixture、grader、rubric、threshold
2. Golden dataset 与真实流量样本沉淀
3. LLM-as-judge：校准、偏差、版本漂移与人工对齐
4. RAG eval：retrieval、citation、groundedness、answerability
5. Agent eval：tool accuracy、task completion、state correctness
6. Online eval 与 shadow evaluation
7. Trace-driven failure clustering
8. Prompt/model/config registry 与灰度发布
9. AI release gate 与 CI/CD
10. Safety eval 与 red teaming
11. Cost/latency/quality 三角权衡
12. 线上事故复盘：从 bad answer 到 regression case

学习路径：`llmops-eval-quality-review`

### P0：生产级 RAG 数据工程与向量检索基础设施

原因：当前 RAG 概念和 hybrid search 已有，但还不够“企业知识库生产化”。面试里如果被问“你怎么把公司文档接进 AI 系统”，需要更深的数据工程答案。

建议 topic：

1. 文档解析：PDF/Word/HTML/表格/图片/公式
2. OCR 与 layout-aware chunk
3. Chunk 策略：semantic、sentence window、section-aware、parent-child
4. Metadata、ACL、tenant、freshness 与 lineage
5. Embedding 模型选型、维度、归一化和成本
6. Vector DB 索引：HNSW、IVF、PQ、DiskANN
7. Filter pushdown 与混合检索
8. Rerank：cross-encoder、LLM judge、两阶段排序
9. Incremental indexing、delete、re-index、版本切换
10. No-answer、低置信、冲突证据处理
11. Retrieval observability 与消融实验
12. RAG 数据安全与权限泄漏防护

学习路径：`production-rag-data-infra-review`

### P1：模型服务、推理优化与 AI Infra

原因：AI 软件架构师不一定要写 CUDA，但要懂推理服务的成本、延迟、扩展和运行机制。

建议 topic：

1. LLM serving 架构：frontend、scheduler、engine、worker
2. Prefill / decode / KV cache / paged attention
3. Continuous batching、queueing 与 TTFT
4. Quantization：INT8/INT4/FP8/GPTQ/AWQ
5. vLLM、NIM、Triton、TensorRT-LLM 选型
6. OpenAI-compatible API server 与多模型网关
7. GPU 显存、utilization、OOM 和容量估算
8. K8s GPU 调度、warmup、health probes
9. Autoscaling、scale-to-zero 与冷启动
10. 推理可观测性：tokens/sec、queue time、cache hit、GPU metrics
11. 成本优化：prompt cache、batch、fallback、小模型路由
12. 私有化部署、网络隔离与安全边界

学习路径：`llm-serving-inference-infra-review`

### P1：微调、模型定制与数据集工程

原因：不是所有岗位都要求训练模型，但 AI 工程师至少要知道什么时候 prompt/RAG 不够，什么时候微调有意义，以及如何评估是否真的变好。

建议 topic：

1. Prompt / RAG / Fine-tuning / Tool 的边界
2. SFT 数据格式、质量、去重和分桶
3. LoRA / QLoRA / PEFT 基本原理
4. DPO / RFT / RLHF 的面试级边界
5. 数据标注、偏好数据、hard negative
6. Train/validation/test split 与 leakage
7. 过拟合、checkpoint、结果文件和回滚
8. 微调模型部署、版本、灰度与 eval gate
9. Embedding fine-tuning 与检索提升
10. 小模型蒸馏、路由与成本优化
11. 合规、版权、敏感数据与训练数据治理
12. 微调失败案例：指标好看但线上退化

学习路径：`model-customization-finetuning-review`

### P1：多模态、文档智能与 Voice Agent

原因：AI 相关岗位越来越多涉及文档、图片、语音和实时交互。当前站点只有 Browser/Computer Use，缺少多模态应用工程。

建议 topic：

1. Vision-language model 输入输出边界
2. OCR、layout、table extraction 与公式处理
3. 多模态 RAG：text/image/table/audio evidence
4. Document intelligence pipeline
5. Realtime / WebRTC / WebSocket / streaming audio
6. Speech-to-text、TTS、VAD、barge-in
7. Voice agent 状态、延迟和打断处理
8. 多模态 eval：OCR accuracy、groundedness、task success
9. 文件上传、病毒扫描、PII 脱敏
10. 图像/文档权限与审计
11. 多模态成本与缓存
12. 客服、合同、票据、知识库场景设计

学习路径：`multimodal-document-voice-ai-review`

### P1：AI 安全、隐私、治理与企业落地

原因：现有有 prompt injection、sandbox、tool permissions，但还没覆盖企业级治理体系。架构师面试容易被追问“怎么防止数据泄漏、越权、合规事故”。

建议 topic：

1. AI threat model：prompt injection、data exfiltration、tool abuse
2. RAG 权限过滤、租户隔离和 evidence policy
3. PII 检测、脱敏、保留周期与删除
4. Secret handling 与 tool credential isolation
5. Model/provider data policy 与企业采购边界
6. Audit log、human approval 和不可抵赖性
7. Output moderation、policy engine 与拒答策略
8. Red teaming 与 safety regression
9. AI supply chain：模型、依赖、数据、prompt、tool schema
10. Enterprise governance：owner、risk level、approval、rollback
11. 法务/合规/安全协作流程
12. 事故复盘：越权检索、敏感输出、工具误操作

学习路径：`ai-security-governance-review`

### P2：云平台与厂商生态

原因：很多企业 AI 岗位会落在 Azure / Google / AWS / Databricks / OpenAI / Anthropic 之一。不是要背控制台，而是要会比较托管平台与自建架构。

建议 topic：

1. OpenAI Platform：Responses、Agents、tools、realtime、production
2. Anthropic Claude：prompt、tools、context、computer use、eval 思路
3. Azure AI Foundry：agent、eval、observability、control plane
4. Google Vertex AI / Agent Platform / ADK / Vector Search
5. AWS Bedrock：model access、agents、guardrails、knowledge bases
6. Databricks Mosaic AI：agent、MLflow、data governance
7. LangSmith / LangFuse / OpenTelemetry AI tracing
8. LlamaIndex / LangChain / LangGraph / PydanticAI 取舍
9. Managed vector search：OpenSearch、Milvus、Pinecone、Weaviate
10. 多云与私有化部署边界

学习路径：`ai-platform-vendor-ecosystem-review`

### P2：AI 产品化、交互设计与作品集表达

原因：找 AI 岗位不是只背知识。最终要把经验讲成“我能交付 AI 产品”。现有有项目表达，但还不够针对求职材料和作品集。

建议 topic：

1. AI feature discovery：从业务问题判断是否该用 AI
2. Human-in-the-loop 与审批流设计
3. Confidence、citation、explanation、fallback UX
4. AI 产品指标：adoption、acceptance、deflection、quality、cost
5. Failure UX：不确定、无答案、需要人工、权限不足
6. Demo 到 production 的差距清单
7. AI 项目 one-pager：问题、架构、指标、失败模式、收益
8. 简历 bullet：把 AI 项目写成业务结果 + 技术深度
9. 面试项目讲述：5 分钟、15 分钟、45 分钟版本
10. Take-home / 现场系统设计模板
11. GitHub 作品集：README、架构图、eval report、demo data
12. 行为面试：如何讲不确定性、失败、协作和取舍

学习路径：`ai-career-portfolio-interview-review`

## 现有专题应怎么改

### AI Agent 与 RAG

不建议继续无限扩基础概念。应该把新增重点转向：

- Agent runtime 的具体数据结构。
- EvalOps 与 trace-driven regression。
- RAG 数据工程和 retrieval infra。
- 多模态与 voice agent。
- AI security/governance。

### AI 工程趋势与实战方案

现在是趋势入口，适合扩成“案例映射层”，不要变成新闻流。建议每个新趋势都必须落到：

- 可复用架构 pattern。
- 关键数据结构。
- 失败模式。
- 面试追问。
- 与现有知识点的连接。

### 工程质量与故障治理

这个 domain 当前 planned 但 0 topic。建议不再只做传统工程质量，而是升级成：

`工程质量、LLMOps 与故障治理`

里面承接：

- AI release gate。
- Eval-driven development。
- Prompt/model/config registry。
- AI incident review。
- Online monitoring and failure clustering。
- Cost and latency regression。

### DevOps / Prometheus

传统服务已经够用，应补：

- 模型服务与 GPU workload。
- AI app specific telemetry。
- Token/cost/quality dashboard。
- Eval job / embedding job / indexing job 的队列和容量治理。

### Spring / Java

已经够强。后续重点不是继续加 Spring 注解，而是加“Java 后端如何接 AI 服务”：

- Java 调用 Python AI service。
- Java 调用 OpenAI-compatible model gateway。
- AI 任务异步化、幂等和 MQ。
- RAG 索引任务与业务库 CDC。
- AI feature flag、灰度和回滚。

## 推荐落地顺序

### 第一阶段：最能提高 AI 岗位命中率

1. `Python AI 工程与 API 服务`
2. `LLMOps、Eval 与 AI 质量工程`
3. `生产级 RAG 数据工程与向量检索基础设施`
4. `AI 求职作品集与项目表达`

原因：这四块直接对应 Applied AI Engineer / Agent Engineer / RAG Engineer 的日常工作，也最能弥补 Java 背景转 AI 岗位时的短板。

### 第二阶段：拉开架构师差距

1. `模型服务、推理优化与 AI Infra`
2. `AI 安全、隐私、治理与企业落地`
3. `微调、模型定制与数据集工程`
4. `多模态、文档智能与 Voice Agent`

原因：这些是架构师级追问高发区，能把你从“会调 API”拉到“懂生产 AI 系统”的位置。

### 第三阶段：按目标岗位选择

- 如果投 AI Infra：补 GPU、vLLM、NIM、KServe、Ray Serve、Triton。
- 如果投 AI Data/RAG：补 data pipeline、lakehouse、document intelligence、vector DB internals。
- 如果投 AI Fullstack：补 Next.js、Vercel AI SDK、streaming UI、chat UX、auth/billing。
- 如果投 ML Engineer：补 PyTorch、训练循环、优化器、loss、分布式训练、MLOps。

## 不建议过度投入的方向

- 不要为了“AI 岗位”一开始深挖完整机器学习数学体系。概率、线代、优化要懂，但应用 AI 工程面试更看重系统落地、数据、评测、稳定性。
- 不要堆 10 个 Agent 框架。重点是抽象能力：state、tool、eval、trace、guardrail、runtime。框架只是实现载体。
- 不要把趋势内容做成新闻站。每个趋势必须能回到面试题、项目案例和生产指标。
- 不要只做本地 demo。求职更需要可复现 README、架构图、eval report、失败样本、部署方式和质量门禁。

## 面试表达主线

用户的优势不是“我会一点 AI”，而是：

> 我有 Java 后端和架构经验，理解数据库、缓存、消息队列、微服务、可观测性、DevOps 和生产事故；我把这些工程能力迁移到 AI 应用里，用 RAG、Agent、Eval、Trace、Model Gateway、Prompt/Config Registry、Tool Permission、AI Release Gate 来把模型能力做成可上线、可治理、可复盘的系统。

这条主线应该贯穿后续内容：

- 讲 AI 概念时，要落到工程边界。
- 讲后端系统时，要迁移到 AI 场景。
- 讲项目时，要给出指标、失败模式和复盘。
- 讲架构时，要同时覆盖模型、数据、服务、评测、安全和成本。

## 建议的新覆盖门禁

后续可以新增一个 `audit:ai-career-coverage`，至少检查：

- Python AI 工程：>= 10 topics，>= 20 questions。
- LLMOps/Eval：>= 12 topics，>= 24 questions。
- Production RAG Data Infra：>= 12 topics，>= 24 questions。
- Model Serving/Inference：>= 10 topics，>= 20 questions。
- Fine-tuning/Customization：>= 8 topics，>= 16 questions。
- Multimodal/Document/Voice：>= 8 topics，>= 16 questions。
- AI Security/Governance：>= 10 topics，>= 20 questions。
- Portfolio/Interview：>= 8 topics，>= 16 questions。

这不是为了追数量，而是防止“每个方向只写 1-2 个概念题”，最后仍然不能支撑真实面试。

## 参考资料

- OpenAI API Docs: Agents SDK, tools, structured output, production, latency/cost optimization, realtime and evaluation navigation.
- Anthropic Engineering: Building effective agents.
- Anthropic Engineering: Effective context engineering for AI agents.
- Anthropic Engineering: Demystifying evals for AI agents.
- OpenAI API Docs: Evaluation best practices.
- Microsoft Foundry: AI application and agent platform, observability and evaluation.
- LangSmith Docs: LLM application observability and production monitoring.
- vLLM Docs: LLM inference and serving.
- NVIDIA NIM Docs: production-ready vLLM container, health probes, observability and security hardening.
- Google Cloud Architecture Center: RAG reference architectures and AI/ML operational patterns.
- LlamaIndex Docs: production RAG techniques.
- OpenSearch Docs: vector search.
- Milvus Docs: multi-vector hybrid search.

