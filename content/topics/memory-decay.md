# 记忆衰退与污染控制

## 一句话定义

记忆衰退与污染控制，是给 Agent 长期记忆建立 TTL、confidence、staleness、correction、quarantine 和 version 机制，防止旧信息、错误偏好或跨任务噪声长期影响后续决策。

## 面试定位

这道题通常跟长期记忆连着问。面试官想知道你是否理解：记忆一旦写入，就会变成未来上下文的一部分，因此它必须像缓存、索引和配置一样有生命周期治理。

好的回答要把“衰退”讲成工程系统，而不是说“定期清理”。你需要解释怎样识别 stale memory，怎样处理冲突版本，怎样让用户纠错，以及如何用指标证明污染下降。

## 为什么需要它

Agent 的用户偏好、项目状态和外部事实都会变化。今天正确的部署命令，三个月后可能已经被 CI 替换；用户曾经喜欢的格式，也可能在新团队里不再适用。

如果没有衰退机制，Memory Store 会逐渐变成高置信噪声库。模型召回越多，越容易出现上下文污染、错误个性化和越权使用旧数据。

## 核心架构

```mermaid
flowchart LR
  A[Memory Record] --> B[Freshness Scorer]
  B --> C{staleness high?}
  C -->|no| D[Rank normally]
  C -->|yes| E[Confidence Decay]
  E --> F{conflict or user correction?}
  F -->|conflict| G[Quarantine]
  F -->|correction| H[New Version]
  F -->|expired| I[Archive or Delete]
  G --> J[Human or policy review]
  H --> K[Retriever uses latest valid version]
```

图 1：记忆衰退与污染控制的状态转换链路。

图中 Memory Record 先进入 Freshness Scorer，系统根据时间、来源、scope、纠错历史和使用结果判断是否进入正常排序、降权、隔离、归档或新版本链路。关键状态变化是：旧记忆不是被模型“凭感觉少用”，而是被显式标记为 decayed、superseded、quarantined 或 expired；Retriever 只允许使用当前 scope 内、置信度足够且未隔离的版本。

| 控制点 | 作用 | 典型字段 | 失败信号 |
| :--- | :--- | :--- | :--- |
| TTL | 控制可用时间 | expiresAt、ttlReason | 过期信息仍被读取 |
| confidence | 表示可信程度 | score、lastVerifiedAt | 低置信内容影响答案 |
| staleness | 衡量陈旧度 | lastUsedAt、sourceAge | 旧项目约束覆盖新指令 |
| correction | 处理用户纠错 | correctedBy、reason | 同错反复出现 |
| quarantine | 隔离可疑记忆 | riskLabel、reviewState | 污染扩散到上下文 |
| version | 保留演进历史 | version、supersedes | 新旧记录互相打架 |

## 架构与运行机制

记忆衰退可以分成三条链路。第一条是时间衰退：TTL 到期、长期未使用或来源过旧时降低权重。第二条是证据衰退：RAG citation、业务 API 或用户纠错证明旧记录不再可信。第三条是行为衰退：某条记忆被使用后导致任务失败，就要把失败样本回灌给评测和写入策略。

系统不应该直接删除所有旧记忆。对用户偏好，可能降低 confidence 并等待确认；对事实类记录，应该用来源复核或重新索引；对敏感、冲突或疑似污染内容，可以进入 quarantine。

## 运行机制

1. 写入时根据 memory type 设置 TTL 和初始 confidence。
2. 每次 retrieval 前计算 freshness score，过滤已过期或不在 scope 内的记录。
3. 如果当前证据与旧记忆冲突，生成 conflict event，而不是把文本粗暴合并。
4. 用户纠错时创建新 version，并将旧版本标记为 superseded。
5. 对可疑来源、跨租户痕迹或被攻击内容进入 quarantine。
6. 定期用 correction rate、stale_memory_rate 和 task impact 更新策略。

## 关键设计取舍

| 取舍 | 好处 | 代价 | 建议 |
| --- | --- | --- | --- |
| 硬删除 | 彻底消除污染 | 丢失审计和回溯 | 对隐私删除必须支持 |
| 软失效 | 可追踪历史 | 需要过滤逻辑 | 对普通过期更合适 |
| 自动衰退 | 运营成本低 | 可能误降权 | 结合人工纠错样本 |
| 人工确认 | 准确性高 | 打扰用户 | 用于高影响或冲突记忆 |

## 生产落地细节

- memory record 要保存 version、source、scope、confidence、TTL、lastVerifiedAt 和 correction history。
- 检索排序不能只看 embedding similarity，还要加入 freshness 与 staleness penalty。
- 事实类记忆要能回到原始 citation 或业务对象，避免只保存自然语言摘要。
- quarantine 中的记录默认不可进入上下文，只能提供给审核或安全评估。
- 指标要看 stale_memory_rate、conflict_rate、correction_latency、quarantine_release_rate 和 repeated_error_rate。

生产系统还要把“删除”“纠错”“降权”拆开处理。删除通常来自用户隐私要求或合规策略，必须传播到主存储、向量索引、缓存和备份策略；纠错表示旧记录不再作为当前事实，但仍需要保留审计关系；降权则适合时间敏感但未被明确否定的偏好。三者混用会造成两类问题：要么为了安全过度删除，丢掉可解释历史；要么只是降权但没有同步向量索引，旧内容仍被召回。

另一个容易漏掉的点是 memory eval。应该构造带旧偏好、冲突事实、用户纠错和跨项目噪声的回归集，检查系统是否会错误召回旧记忆。评估不只看命中率，还要看 `memory_caused_failure_rate` 和 `correction_propagation_latency`。如果一次纠错后同错仍反复出现，说明衰退策略没有打穿写入、索引和上下文构建链路。

## 系统设计案例

假设 Paper Agent 会记住用户常看的领域、论文筛选标准和历史总结模板。用户改研究方向后，旧偏好可能继续影响推荐。系统应该给偏好类记忆设置可衰退 confidence，并在新查询与旧偏好冲突时追问：“这次是否仍按旧方向筛选？”

数据流是：检索候选记忆后先计算 freshness，再对冲突记录触发 review；如果用户确认新偏好，系统写入新 version 并降低旧版本权重。后续 eval 用推荐点击率、用户纠错率和引用准确率判断衰退策略是否有效。

## 真实问题与排障

线上看到 Agent 总按旧项目路径回答时，先查被读取的 memory_id。确认它的 scope 是否正确、TTL 是否过期、source 是否来自旧会话，以及最近是否有用户 correction 被漏处理。

止血可以先对该 workspace 禁用相关 memory type，或者把可疑记录放入 quarantine。根因修复通常在 Write Policy、Retriever freshness scoring、缓存失效和用户删除传播这几层。

排障时不要只看“模型为什么这么想”，要先看系统把哪些记忆放进了上下文。trace 里至少应保留 memory_id、召回分数、freshness score、scope match、最终是否注入 prompt、被哪个 answer span 使用。这样才能判断问题是写入策略污染、检索排序错误、上下文构建漏过滤，还是模型忽略了新证据。

## 常见误区与排障

- 只靠时间删除，不看事实冲突和用户纠错。
- 把 stale memory 当成普通低相似度问题。
- 忘记对 embedding index 同步删除或降权。
- 没有 version，导致新旧记忆互相覆盖。
- 只统计命中率，不统计错误命中造成的任务失败。

## 面试追问

- 新旧记忆冲突时，系统应自动选择还是向用户追问？
- 过期记忆是否需要从 trace 中删除？
- 如何区分用户临时指令和长期偏好？
- quarantine 记录什么时候能释放？
- 如何设计 memory eval 来捕捉污染问题？

## 项目化表达

可以把这个点讲成“长期记忆的治理层”。项目里不是简单加一个定时任务，而是把 TTL、confidence、staleness、correction、quarantine、version 都进入数据模型和 trace。这样面试官继续追问时，你能从数据结构、检索排序、用户纠错和线上指标四个方向展开。

## 深入技术细节

记忆衰退要作用在写入、检索和使用三个阶段。写入时为不同 memory type 设置 TTL、scope、source 和初始 confidence；检索时 freshness scorer 将 embedding similarity、scope match、last_verified_at、source_age 和 correction history 一起排序；使用后如果导致任务失败，要把 memory_id 和失败类型回灌到衰退策略。

冲突处理不能简单合并文本。系统应生成 conflict event，记录旧记忆、新证据、来源、影响范围和建议动作。用户纠错时写入新版本，并把旧版本标记 superseded；对疑似 prompt injection、跨租户泄漏或敏感信息，进入 quarantine，默认不参与上下文构建。

## 关键数据结构与协议

| 字段 | 作用 | 失败风险 |
| :--- | :--- | :--- |
| `memory_id` | 可追踪记录 | 无法定位污染 |
| `scope` | 工作区/用户/项目边界 | 跨任务误用 |
| `confidence` | 可信度 | 低质记忆高权重 |
| `expires_at` | TTL | 过期仍命中 |
| `supersedes` | 版本关系 | 新旧冲突 |
| `quarantine_state` | 隔离状态 | 可疑内容扩散 |

协议上，事实类记忆必须能回到原始 source 或 citation；偏好类记忆可以更软，但在新任务冲突时要询问用户。删除或纠错还要同步到向量索引，否则文本库删除了，embedding 仍可能召回。

## 深问准备

被问“新旧记忆冲突怎么办”时，可以按风险回答：低风险偏好可询问或临时覆盖，高风险事实要回源验证，敏感或跨租户冲突要 quarantine。不能让模型自己静默选择看起来更顺的版本。

被问“如何评估污染下降”，看 `stale_memory_rate`、`conflict_rate`、`correction_latency`、`repeated_error_rate`、`quarantine_precision` 和 `memory_caused_failure_rate`。只看记忆命中率会鼓励召回更多噪声。

## 公开阅读校验

Memory Decay 的公开稿要避免写成“定期清理记忆”。真正的生产问题是错误记忆会持续污染后续任务，而且污染经常不是过期这么简单，还包括跨项目误用、用户纠错未生效、embedding 索引残留、来源不可信和新旧版本冲突。读者需要看到写入、检索、使用、纠错、删除和隔离是一条闭环链路。

验收可以准备一组污染回归样本：用户偏好变更、事实更新、项目切换、恶意网页写入、跨租户相似内容、旧记忆被 supersede。每个样本都要验证文本库、向量索引、context manifest 和 trace 一致更新。若旧记录在文本库里标记失效，但 embedding 仍被召回，或者 conflict event 没有进入用户确认流程，说明衰退策略没有真正落地。

线上不应只奖励命中率。更可靠的看板应包含 `memory_precision_at_k`、`stale_memory_escape_count`、`superseded_hit_rate`、`quarantine_false_positive_rate`、`correction_to_effective_latency` 和 `memory_caused_task_failure_count`。这样团队能判断是 TTL 太长、scope 太宽、freshness scorer 太弱，还是用户纠错链路没有同步到检索层。

## 来源与延伸阅读

- [OpenAI Agents SDK Sessions](https://openai.github.io/openai-agents-python/sessions/)：官方文档用于支持 session memory 会把会话历史持久化，因此需要显式生命周期和清理策略。
- [OpenAI Cookbook: Session memory](https://developers.openai.com/cookbook/examples/agents_sdk/session_memory)：用于说明短期会话记忆可以按 turn 裁剪，支撑“记忆治理不只是自然语言摘要”的观点。
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)：用于支持上下文选择、隔离和压缩会影响 Agent 行为边界。
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)：用于说明 Agent 需要清晰工作流和外部反馈，而不是让模型自行管理全部状态。
- [Model Context Protocol 文档](https://modelcontextprotocol.io/docs/learn/architecture)：用于解释资源、工具和上下文可以被协议化暴露，支撑 memory scope 与 resource reference 的设计。
