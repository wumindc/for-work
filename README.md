# for-work

[![Deploy GitHub Pages](https://github.com/wumindc/for-work/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/wumindc/for-work/actions/workflows/deploy-pages.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vite.dev/)

一个面向 **AI Agent 研发、后端工程、系统设计面试复习** 的中文开源知识站点。

它不是简单的题目列表，也不是只做概念解释的学习笔记。项目目标是把面试高频知识点整理成可复习、可追问、可验证的工程化知识库：每个知识点都尽量覆盖核心机制、架构图、真实排障、关键指标、工程取舍、常见误区和延伸来源。

**Live Demo:** https://wumindc.github.io/for-work/

## Why

准备研发面试时，常见资料有三个问题：

- 只给结论，不讲系统边界和底层机制。
- 只有八股问答，缺少真实工程场景、指标和排障链路。
- 知识点分散，复习时很难知道一个专题是否已经覆盖完整。

`for-work` 希望把这些内容变成一个结构化站点：既能按专题系统复习，也能按面试题训练表达，并用自动化脚本检查内容覆盖度和技术深度。

## Features

- **Knowledge map**: 按专题、分类和依赖关系浏览知识点。
- **Interview drill**: 按专题刷题，题解包含回答主线、追问、常见错误和场景扩展。
- **Markdown-first content**: 知识点和面试题正文都以 Markdown 维护，方便 review 和持续迭代。
- **Mermaid diagrams**: 支持在正文中渲染架构图、流程图和排障链路图。
- **Local progress**: 使用浏览器本地存储记录知识点和题目的掌握状态。
- **Quality gates**: 内置数据、图谱、Markdown、内容深度、覆盖度和 UI 合同校验脚本。
- **GitHub Pages deploy**: 推送到 `main` 后自动构建并发布到 GitHub Pages。

## Content Coverage

当前内容规模：

- 106 个知识点
- 168 道面试题
- 12 条学习路径
- 397 条知识图谱边
- 9 个主要专题

主要专题：

| Domain | Focus |
| --- | --- |
| AI Agent 与 RAG | LLM、Agent、工具调用、RAG、Memory、评测、安全和项目表达 |
| Elasticsearch | 倒排索引、mapping、写入链路、查询优化、RAG hybrid search |
| MQ | 可靠投递、顺序消息、事务消息、消费积压和异步任务治理 |
| Redis | 数据结构、缓存一致性、热点、持久化、高可用、锁、限流和 Lua |
| 数据库 | 索引、SQL 优化、MVCC、锁、复制、分库分表、备份和 Online DDL |
| 可观测性 | Prometheus、Trace、结构化日志、SLO、告警、Runbook 和成本治理 |
| Java / JVM | 线程池、JMM、锁、并发集合、异步编排、类加载、内存和 GC |
| 分布式系统 | 幂等、重试、超时、负载均衡、限流熔断、共识、容灾和容量规划 |
| Web 工程 | HTTP、认证授权、浏览器安全、CDN、实时通信、网关/BFF 和契约观测 |

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Mermaid
- GitHub Actions
- GitHub Pages

## Quick Start

```bash
git clone https://github.com/wumindc/for-work.git
cd for-work
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite dev server |
| `npm run build` | Build the production bundle for normal hosting |
| `npm run build:pages` | Build with `/for-work/` as the GitHub Pages base path |
| `npm run preview` | Preview the production build locally |
| `npm run validate:all` | Run the main data, graph, Markdown and UI contract checks |
| `npm run audit:coverage-map` | Check domain-level topic/question/category coverage |
| `npm run audit:technical-depth` | Check technical depth signals in generated Markdown |
| `npm run audit:content-rigor` | Run stricter checks on high-frequency sample documents |
| `npm run generate:markdown-content` | Generate missing Markdown documents from structured data |

## Quality Gates

The project treats content as code. Before publishing a change, run:

```bash
npm run validate:all
npm run audit:coverage-map
npm run audit:technical-depth
npm run audit:content-rigor
npm run build
```

What these checks protect:

- broken topic/question/source references
- invalid graph edges and learning paths
- missing Markdown documents
- shallow content that lacks architecture, troubleshooting, metrics or trade-offs
- domain coverage gaps, such as a backend topic containing only one or two isolated notes
- UI contract regressions in the interview drill flow

## Project Structure

```text
.
├── content/                  # Markdown documents for topics and interview questions
├── docs/                     # Planning and design notes
├── public/                   # Static public assets
├── scripts/                  # Validation, audit and content generation scripts
├── src/
│   ├── app/                  # App shell
│   ├── components/           # UI components
│   ├── data/                 # Structured domains, topics, questions and sources
│   ├── hooks/                # Local progress state
│   ├── styles/               # Global styles
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Graph and label helpers
└── .github/workflows/        # GitHub Pages deployment workflow
```

## Deployment

GitHub Pages deployment is handled by:

```text
.github/workflows/deploy-pages.yml
```

On every push to `main`, the workflow will:

1. install dependencies with `npm ci`;
2. run validation and audit scripts;
3. build the site with `npm run build:pages`;
4. upload `dist/` to GitHub Pages.

The published site is available at:

```text
https://wumindc.github.io/for-work/
```

## Roadmap

- Improve the quality of selected high-frequency answers with more source-backed diagrams and production examples.
- Add more visual examples for system design, RAG, Web engineering and observability topics.
- Add contributor-facing templates for issues, pull requests and content review.
- Split large frontend chunks when the app grows beyond the current single-site use case.
- Continue tightening content audits so new topics keep the same technical depth.

## Contributing

Contributions are welcome. Useful contribution types include:

- adding or correcting interview topics;
- improving answer rigor, diagrams, examples and source links;
- adding validation rules for content quality;
- fixing UI and accessibility issues;
- improving GitHub Pages deployment and developer experience.

Before opening a pull request, please run:

```bash
npm run validate:all
npm run audit:coverage-map
npm run audit:technical-depth
npm run audit:content-rigor
npm run build
```

## License

Licensed under the [Apache License 2.0](LICENSE).
