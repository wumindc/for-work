# 研发面试知识体系

面向 AI Agent 研发、后端工程和系统设计面试复习的中文知识站点。站点把「知识体系」和「面试训练」放在同一个前端应用里，知识点正文使用 Markdown 编写，并支持 Mermaid 架构图、排障链路、关键指标、追问和来源材料。

线上地址：

- GitHub Pages: https://wumindc.github.io/for-work/

## 内容范围

当前站点覆盖 9 个主要专题：

- AI Agent 与 RAG
- Elasticsearch
- MQ
- Redis
- 数据库
- 可观测性
- Java / JVM
- 分布式系统
- Web 工程

每个专题都尽量按真实面试和工程落地方式组织：先讲边界和核心机制，再讲架构、数据流、失败模式、线上排障、指标、取舍、常见误区和追问。

## 功能

- 知识体系：按专题和分类浏览知识点。
- 面试训练：按专题刷题，题解包含参考答案、追问、错误回答和工程化扩展。
- Markdown 内容：所有知识点和面试题都有独立 Markdown 正文。
- Mermaid 图表：正文支持架构图、流程图和排障链路图。
- 学习状态：本地记录知识点和题目的掌握状态。
- 内容门禁：提供数据、图谱、Markdown、技术深度和覆盖度校验脚本。

## 本地开发

```bash
npm install
npm run dev
```

默认开发服务会监听 `127.0.0.1`，打开终端输出的本地地址即可预览。

## 验证

发布前建议至少运行：

```bash
npm run validate:all
npm run audit:coverage-map
npm run audit:technical-depth
npm run audit:content-rigor
npm run build
```

说明：

- `validate:all` 校验数据引用、图谱、Markdown 内容和 UI 合同。
- `audit:coverage-map` 校验主要专题的知识点、题目和分类覆盖度。
- `audit:technical-depth` 校验正文是否包含架构、排障、指标、取舍和来源等技术深度要素。
- `audit:content-rigor` 对高频样本文档做更严格的内容质量检查。
- `build` 执行 TypeScript 构建和 Vite 生产打包。

## GitHub Pages 发布

仓库内置 GitHub Actions workflow：

```text
.github/workflows/deploy-pages.yml
```

每次推送到 `main` 分支后，Actions 会自动：

1. 安装依赖。
2. 运行内容和覆盖度校验。
3. 运行 `npm run build:pages`，使用 GitHub Pages 子路径 `/for-work/` 构建站点。
4. 将 `dist/` 发布到 GitHub Pages。

部署完成后访问：

```text
https://wumindc.github.io/for-work/
```
