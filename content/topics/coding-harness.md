# Coding Agent Harness

## 面试定位

Coding Agent Harness 考的是你是否理解“模型写代码”背后的运行时。面试官会追问：workspace sandbox 如何隔离，Patch Engine 如何生成 diff，Test Runner 如何给出 ground truth，写操作如何 approval 和 rollback。

## 一句话定义

Coding Agent Harness 是围绕代码搜索、文件读取、补丁生成、测试执行、权限控制、审计和回滚构建的受控执行环境，让模型只能通过工具完成可验证的代码修改。

## 为什么需要它

模型本身不能安全地读写仓库、运行 shell 或判断测试是否真的通过。Harness 把开放式 coding 任务拆成受控动作：搜索、读取、计划、patch、测试、复盘。它提供 workspace sandbox、权限边界、结构化 trace 和验证命令，避免模型凭感觉声称修复完成。

## 核心架构

```mermaid
flowchart LR
  Issue[User Issue] --> Planner[Plan Builder]
  Planner --> Search[Code Search Tool]
  Search --> Reader[File Reader]
  Reader --> Patch[Patch Engine]
  Patch --> Gate[approval / policy gate]
  Gate --> Test[Test Runner]
  Test --> Verdict[Verifier Verdict]
  Verdict --> Trace[Run Trace + rollback]
```

Harness 的核心不是“让模型能执行更多命令”，而是让每个高风险动作都有 preview、验证和恢复路径。

## 架构与运行机制

workspace sandbox 隔离文件系统、网络、环境变量和命令权限。Code Search 负责 `rg`、symbol search、dependency map。File Reader 控制上下文窗口和敏感文件。Patch Engine 只接受 unified diff 或 apply_patch 风格修改，并保存 before hash。Test Runner 执行 lint、unit tests、build 和目标回归命令。Verifier 读取真实 exit code 与输出，不接受模型自报。

写操作进入 approval gate。低风险文档或测试修改可自动 preview，高风险 shell、删除、发布、依赖升级需要人工确认。rollback 依赖 patch 反向应用、备份文件或工作区快照。

## 运行机制

典型数据流是 issue 进入 Planner，模型先搜索相关代码，再读取最小上下文，Patch Engine 生成 diff，Test Runner 运行验证命令，Verifier 根据输出决定继续、回滚或完成。每一步都写入 trace：tool、args、artifact、stdout 摘要、state diff 和 verdict。

## 关键设计取舍

| 设计点 | 方案 | 收益 | 风险 |
| --- | --- | --- | --- |
| sandbox | 临时 workspace | 隔离误写 | 环境准备成本 |
| patch-only write | diff 作为唯一写入口 | 易 review 与 rollback | 不适合大规模生成 |
| command allowlist | 限制 shell 能力 | 降低破坏面 | 可能挡住必要调试 |
| test gate | 真实命令验证 | 证据强 | 测试慢或不完备 |

## 生产落地细节

关键字段包括 `run_id`、`workspace_id`、`changed_files`、`patch_id`、`approval_id`、`test_command`、`exit_code`、`artifact_ref`、`rollback_ref`。指标包括 `issue_resolution_rate`、`test_pass_rate`、`patch_apply_failure_rate`、`rollback_success_rate`、`unsafe_command_block_count` 和 `review_findings_per_patch`。

## 系统设计案例

修复一个前端按钮溢出 bug 时，Agent 先读取失败截图或测试，再搜索组件和 CSS。Patch Engine 生成最小 diff。Test Runner 运行类型检查、UI contract 和构建。若构建失败，Verifier 把错误写回状态，Agent 继续修复。若补丁修改无关文件，review rubric 失败。

## 真实问题与排障

如果测试通过但问题未修，说明 verifier 覆盖不够。若 Agent 总是改无关文件，检查检索和计划阶段。若命令失败率高，排查 sandbox 依赖和环境变量。若误删文件，检查 Patch Engine 是否绕过 preview，以及 rollback 是否可用。

## 常见误区与排障

- 让模型直接运行任意 shell。
- 没读代码就生成补丁。
- 只看测试通过，不看 diff 范围和需求符合度。
- 没有 before hash、approval 和 rollback。

## 面试追问

1. Harness 和模型能力有什么关系？Harness 决定可执行、可验证和可恢复边界。
2. 为什么 patch-only？方便 review、审计和回滚。
3. 自动测试通过还要人工 review 吗？要，因为测试覆盖不了可维护性和安全风险。
4. workspace sandbox 限制什么？文件、网络、进程、凭据和外部副作用。

## 项目化表达

可以说：我的 Coding Agent 不直接写文件，而是通过 workspace sandbox、Patch Engine、Test Runner 和 Verifier 工作。每次修改都有 diff、approval、测试证据和 rollback 记录。

## 深入技术细节

Harness 的关键是把“模型想改代码”变成一组可审计事务。Patch Engine 不能只写文件，它要保存 `before_hash`、`after_hash`、`patch_id`、`changed_ranges`、`conflict_status` 和 `rollback_ref`。Test Runner 也不能只返回一段日志，而要返回 `command`、`exit_code`、`duration_ms`、`failed_tests`、`log_ref` 和 `environment_hash`。Verifier 用这些事实判断是否继续，而不是相信模型口头总结。

沙箱要限制文件系统、网络、环境变量、进程和凭据。读操作可以更宽，写操作必须经过 workspace scope 和 patch preview。命令执行最好有 allowlist、timeout 和输出截断；依赖安装、删除文件、发布、访问外网都应该被标成高风险。这样即使模型被 prompt injection 或错误计划影响，执行层仍能把破坏面收住。

## 关键数据结构与协议

| 字段 | 所属模块 | 作用 |
| --- | --- | --- |
| `workspace_id` | sandbox | 隔离一次任务的文件和命令 |
| `patch_id` | Patch Engine | 绑定 diff、review 和 rollback |
| `before_hash` | Patch Engine | 防止覆盖并发修改 |
| `approval_id` | Policy Gate | 记录高风险写操作确认 |
| `test_command` | Test Runner | 固定验证口径 |
| `exit_code` | Verifier | 判断真实通过或失败 |
| `rollback_ref` | Recovery | 支持撤回补丁 |

协议上要把测试失败当成 observation，而不是工具崩溃。`run_tests` 退出码非 0 时，Agent 应读取失败摘要并定位修复；只有命令不存在、环境坏、超时或权限拒绝才算工具错误。这个区分能显著提升排障质量。

## 深问准备

如果被问“测试通过为什么还要 review”，可以回答：测试覆盖不了可维护性、安全边界、无关 diff 和需求符合度。Harness 可以先做自动门禁，再对高风险补丁或大范围 diff 触发人工 review。

如果追问“如何防止 Agent 改无关文件”，我会用检索约束、plan scope、patch size limit、changed_files allowlist 和 diff verifier。指标看 `irrelevant_diff_rate`、`review_findings_per_patch`、`rollback_success_rate` 和 `regression_escape_rate`。

## 来源与延伸阅读

- [SWE-bench GitHub](https://github.com/swe-bench/SWE-bench)：理解 issue-to-patch 的评测形式。
- [SWE-bench Paper](https://arxiv.org/abs/2310.06770)：理解真实仓库问题对 coding agent 的挑战。
- [OpenAI Agents SDK Tracing](https://openai.github.io/openai-agents-python/tracing/)：参考工具调用、handoff 和 guardrail trace。
