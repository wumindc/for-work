<!-- @author codex -->
# Spring And Algorithm Interview Ladders Design

## 背景

用户过往履历是 Java 研发工程师兼架构师，真实面试一定会追问既有工作内容。当前站点已经覆盖 AI Agent、Redis、数据库、Java/JVM、系统设计、Web、Prometheus 和 DevOps，但缺少两块中国企业面试中非常高频的内容：

- Spring 家族工程体系：Spring、Spring Boot、MyBatis、MyBatis Plus、Spring Cloud、REST、认证鉴权、事务、生产排障。
- 算法题复习体系：数组、字符串、哈希、栈队列、链表、二分、排序、回溯、树、堆、贪心、DP、图、并查集、拓扑排序和面试刷题策略。

这两块都不是“补几个面试题”可以解决，必须作为独立大专题进入知识体系、面试训练、学习路径、覆盖审计和 Markdown 内容链路。

## 目标

1. 新增 `spring-java-backend` 专题，覆盖用户过去 Java/Spring 后端工作栈，并能承接架构师级追问。
2. 新增 `coding-algorithms-interview` 专题，覆盖中国企业常见算法题复习路径，并强调 Java 解题模板、复杂度和面试表达。
3. 为两个专题各建立从基础到高频追问的复习路径，而不是只列孤立知识点。
4. 新增审计门禁，保证必备 topic、学习路径、题目数量、分类数量和 Markdown 内容不会遗漏。

## 内容架构

### Spring Java Backend

Domain:

- `spring-java-backend` / `Spring Java 后端体系`

Categories:

- Spring IoC、Bean 与 AOP
- Spring Boot 自动配置与启动
- Spring MVC、REST 与参数校验
- 数据访问、事务与一致性
- MyBatis Mapper 与动态 SQL
- MyBatis Plus 工程化
- Spring Cloud 注册配置
- OpenFeign、Gateway 与服务调用
- 熔断、限流与微服务韧性
- Spring Security 与权限边界
- 测试、质量与发布门禁
- Actuator、观测与生产排障

Required topics:

- `spring-ioc-bean-lifecycle`
- `spring-aop-proxy-transaction-boundary`
- `spring-boot-autoconfiguration-starter`
- `spring-boot-configuration-properties-profile`
- `spring-mvc-rest-controller-validation`
- `spring-web-exception-handler-contract`
- `spring-transaction-propagation-isolation`
- `spring-mybatis-sqlsession-mapper`
- `mybatis-dynamic-sql-resultmap-cache`
- `mybatis-plus-crud-wrapper-pagination`
- `spring-cloud-service-discovery-config`
- `spring-cloud-openfeign-loadbalancer`
- `spring-cloud-gateway-filter-routing`
- `spring-cloud-resilience4j-circuitbreaker`
- `spring-security-authentication-authorization`
- `spring-boot-actuator-observability-troubleshooting`

Learning path:

- `spring-java-backend-review`
- 顺序：IoC/Bean -> AOP/事务代理 -> Boot 自动配置 -> 配置/Profile -> MVC/REST -> 统一异常 -> 事务 -> MyBatis -> MyBatis Plus -> Spring Cloud -> Feign/Gateway -> 熔断限流 -> Security -> Actuator 排障。

### Coding Algorithms Interview

Domain:

- `coding-algorithms-interview` / `算法题与编码面试`

Categories:

- 复杂度、Java 模板与输入输出
- 数组、双指针与滑动窗口
- 字符串与模式匹配
- 哈希、集合与频次统计
- 栈、队列与单调结构
- 链表与指针操作
- 二分、排序与答案空间
- 回溯、递归与搜索树
- 树、BST 与递归分治
- 堆、TopK、贪心与区间
- 动态规划
- 图、并查集与拓扑排序

Required topics:

- `algorithm-complexity-java-template`
- `array-two-pointers-sliding-window`
- `string-pattern-matching`
- `hash-map-set-frequency`
- `stack-queue-monotonic-structure`
- `linked-list-fast-slow-pointer`
- `binary-search-boundary-answer`
- `sorting-selection-topk-heap`
- `recursion-backtracking-subsets-permutation`
- `tree-traversal-depth-recursion`
- `binary-tree-bst-lca`
- `dynamic-programming-state-transition`
- `greedy-interval-sweep-line`
- `graph-bfs-dfs-shortest-path`
- `union-find-topological-sort`
- `coding-interview-simulation-debugging`

Learning path:

- `coding-algorithms-interview-review`
- 顺序：复杂度/模板 -> 数组字符串 -> 哈希栈队列 -> 链表 -> 二分排序 TopK -> 回溯树 -> DP -> 图/并查集/拓扑 -> 模拟面试与复盘。

## 数据与生成策略

延续现有静态数据模型：

- `domains.ts` 新增 2 个 sample-ready domain。
- `categories.ts` 新增 24 个分类。
- `sources.ts` 新增 Spring/MyBatis/MyBatis Plus/Spring Cloud/算法资料来源。
- `deepSamples.ts` 新增两个 topic 数组，并复用生成式 core/deep 问题逻辑。
- `topics.ts` 将两个 topic 数组接入总 topic 列表。
- `learningPaths.ts` 新增 2 条复习路径。
- `audit-coverage-map.mjs` 增加两个 domain 的 minimum。
- 新增 `audit-career-ladders.mjs`，专门验证 Spring/算法两个大专题的必备 topic 和 path。
- `generate-markdown-content.mjs` 增加 Spring/算法领域的正文脚手架，让生成 Markdown 更像专业学习材料，而不是泛用模板。

## 验收标准

- `spring-java-backend` 至少 12 个分类、16 个 topic、32 道题。
- `coding-algorithms-interview` 至少 12 个分类、16 个 topic、32 道题。
- 每个新增 topic 至少有 2 道面试题、1 个 deepDive、1 个官方或权威资料来源。
- 两条学习路径存在，且覆盖各自必备 topic。
- 所有新增 topic/question 都有 Markdown。
- `validate:all`、`audit:coverage-map`、`audit:technical-depth`、`build` 通过。
- 浏览器中能看到两个新专题、复习路径、左侧分类和详情正文。

