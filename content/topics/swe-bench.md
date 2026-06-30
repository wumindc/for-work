# SWE-bench 与代码任务评测

## 面试定位

SWE-bench 考的是你是否理解 coding agent 的真实评测闭环。面试官不是让你背榜单，而是看你能否把 issue、repository、patch、unit tests、harness 和 trajectory 转成工程质量判断。

## 一句话定义

SWE-bench 是用真实 GitHub issue 和 repository snapshot 评估模型生成 patch 能力的基准，核心是让 Agent 修改代码并通过相关 unit tests。

## 为什么需要它

传统代码生成题太短，无法覆盖真实工程问题。真实 issue 需要理解仓库结构、定位跨文件逻辑、生成最小 patch、运行测试、处理依赖和避免破坏既有行为。SWE-bench 把 coding agent 从“写一个函数”推进到“修一个真实软件问题”。

## 核心架构

```mermaid
flowchart LR
  Issue[GitHub issue] --> Repo[repository snapshot]
  Repo --> Agent[Coding Agent]
  Agent --> Patch[patch]
  Patch --> Harness[Test harness]
  Harness --> Tests[unit tests]
  Tests --> Result[resolved / failed]
  Agent --> Trajectory[search-read-edit-test trajectory]
  Trajectory --> Review[Path Quality Review]
```

测试通过是强信号，但不是完整质量结论。还要看补丁是否过拟合、是否改无关文件，以及 trajectory 是否可解释。

## 架构与运行机制

每个实例包含问题描述、代码仓库、目标提交附近的环境和测试。Agent 读取 issue，搜索 repository，生成 patch。harness 应用补丁、安装依赖、运行 unit tests，并输出 resolved 指标。更严谨的评测还会保留 trajectory，分析定位路径、测试命令、失败恢复和最终 diff。

核心数据流是 issue 与 repository snapshot 进入 Agent，Agent 输出 patch，harness 应用补丁并运行 unit tests，报告再结合 trajectory 与 review rubric 判断质量。

SWE-bench Verified 通过人工过滤提高样本可靠性。Lite、Verified、Full 等集合适合不同成本和覆盖范围。企业内部可以借鉴这种结构，把线上 bug、PR 和回归测试沉淀成私有 eval。

## 运行机制

评测流程要固定环境，否则结果不可比。Docker 或隔离环境安装依赖，patch 应用失败、测试超时、测试不稳定都要单独分类。failure taxonomy 可以包括 `localization_failed`、`patch_compile_error`、`test_timeout`、`overfit_tests`、`irrelevant_diff` 和 `missing_regression_test`。

## 关键设计取舍

| 评测维度 | 优点 | 风险 | 工程补充 |
| --- | --- | --- | --- |
| unit tests | 客观可自动化 | 覆盖有限 | 加 hidden tests |
| patch review | 看可维护性 | 成本高 | 抽样或高风险必审 |
| trajectory eval | 能归因 | trace 成本高 | 失败样本全量保留 |
| Verified 子集 | 噪声低 | 样本少 | 适合作发布 gate |

## 生产落地细节

私有 SWE-style eval 应保存 issue_id、repo_version、base_commit、patch、test_command、exit_code、logs_ref、changed_files 和 review verdict。指标包括 `resolved_rate`、`patch_apply_rate`、`test_pass_rate`、`irrelevant_diff_rate`、`cost_per_resolved` 和 `regression_escape_rate`。

## 系统设计案例

公司内部可以把真实线上 bug 转成 eval case。输入是 bug 描述和 repo snapshot，期望输出是 patch。harness 运行相关单测和回归测试。若 Agent 修改了配置绕过测试，即使 tests 过了，patch review 和 trajectory eval 仍应失败。

## 真实问题与排障

如果 resolved_rate 低，先区分定位失败还是 patch 失败。定位失败看搜索和上下文读取。patch 失败看编译错误和测试日志。测试超时看环境和命令。若分数高但人工 review 差，说明 benchmark 被过拟合或 verifier 覆盖不足。

## 常见误区与排障

- 把 SWE-bench 当排行榜谈资，不讲 harness。
- 只看 tests passed，不看 patch 最小性。
- 忽略 flaky tests 和环境复现。
- 不记录 search-read-edit-test trajectory。

## 面试追问

1. SWE-bench 和 LeetCode 区别？真实仓库、真实 issue、真实测试。
2. 单测通过为什么还不够？可能过拟合、改错边界或破坏未测行为。
3. 如何做企业内部版本？用线上 bug、repo snapshot、回归测试和 review rubric。
4. 如何评估 coding agent 过程？看 trajectory、diff、测试和人工 review。

## 项目化表达

可以说：我会用 SWE-bench 思路设计 Coding Agent Eval。每个 case 有 issue、repository snapshot、允许工具、patch 输出、unit tests 和 trajectory review。发布前看 resolved_rate 与回归逃逸率。

## 深入技术细节

SWE-bench 的价值在于把代码任务评测从“生成片段”变成“真实仓库修复闭环”。一次 case 至少包含 issue 描述、repo snapshot、base commit、依赖环境、期望 patch 行为和测试命令。Agent 的运行轨迹应该记录 search、read、edit、test、revert、retry 等步骤，而不是只保存最终 diff。

Harness 是评测可信度的核心。它负责应用 patch、安装依赖、运行测试、处理超时和分类失败。失败不能只有 failed，要细分 `patch_apply_failed`、`install_failed`、`test_timeout`、`compile_error`、`test_failed`、`irrelevant_diff` 和 `flaky_test`。这样才能知道是定位能力差、修改能力差，还是环境复现有问题。

## 关键数据结构与协议

| 字段 | 作用 | 评测意义 |
| --- | --- | --- |
| `issue_id` | 关联问题描述 | 支持样本追踪 |
| `base_commit` | 固定仓库版本 | 保证可复现 |
| `patch` | Agent 输出变更 | 检查最小性和正确性 |
| `test_command` | harness 执行命令 | 保证结果可比 |
| `exit_code` | 测试结果 | resolved 的基础 |
| `trajectory_ref` | 工具调用轨迹 | 支持过程归因 |
| `review_verdict` | 人工或规则审查 | 防止过拟合测试 |

协议上要把 public tests、hidden tests 和 review rubric 分开。只用公开测试容易被过拟合；只靠人工 review 成本太高。更稳的是自动 harness 做硬门槛，高风险或异常 diff 再做人审。

## 深问准备

如果被问“为什么单测通过还不够”，可以回答：测试覆盖有限，Agent 可能删除断言、修改测试配置、绕开逻辑或引入未测回归。因此还要看 diff 最小性、无关文件变更、trajectory 是否合理、hidden tests 和人工抽样。

如果追问“企业内部怎么做 SWE-style eval”，可以从线上 bug、客服工单、历史 PR 和回归测试构建样本。每个样本固定 repo version 和 test command，保留失败日志和人工 verdict。指标看 `resolved_rate`、`patch_apply_rate`、`cost_per_resolved`、`irrelevant_diff_rate` 和 `regression_escape_rate`。

## 来源与延伸阅读

- [SWE-bench 官方网站](https://www.swebench.com/)：查看 benchmark family 与 resolved 指标。
- [SWE-bench GitHub](https://github.com/swe-bench/SWE-bench)：理解数据集和运行方式。
- [SWE-bench paper](https://arxiv.org/abs/2310.06770)：理解真实 GitHub issue 评测设计。
