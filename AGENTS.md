# AGENTS.md — 项目工作约定

> 任何 AI 工具或新对话打开本仓库时,先读本文件 + `docs/PROGRESS.md`,即可恢复项目上下文。

## 项目是什么

帮助俄罗斯学生了解并申请中国高校的信息平台。第一阶段(MVP):高校/项目/奖学金信息浏览 + 用户注册登录 + 收藏。详细背景见 `docs/01-竞品调研与业务逻辑洞察.md`(中文版,`.ru.md` 为俄语版)。

## 技术栈

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL(本地用 docker-compose 起,见 `docker-compose.yml`)
- Better Auth(邮箱密码认证,Prisma 适配器)
- 包管理:**pnpm**(不要用 npm/yarn)
- i18n:计划用 next-intl,`[locale]` 路由(ru 优先,zh/en 后续)——**模块 #2 实施,骨架阶段未接入**

## 目录结构约定(模块化单体)

```
src/
  modules/
    auth/           # 认证(Better Auth 封装)
    universities/   # 学校
    programs/       # 招生项目
    scholarships/   # 奖学金
    news/           # 动态资讯
    users/          # 用户资料/收藏
  shared/           # db client、工具、共享类型
```

规则:每个模块有自己的 service 层和 API 路由;模块之间只允许通过 service 函数通信,不直接 import 别人的 Prisma 查询;不直接读别的模块的表。

## 常用命令

```bash
pnpm dev              # 启动开发服务器
docker compose up -d  # 启动本地 PostgreSQL(需先装 Docker Desktop)
pnpm prisma migrate dev   # 建/改表后生成迁移
pnpm prisma studio    # 浏览器 GUI 看数据
```

## 环境变量

复制 `.env.example` 为 `.env` 并填写。**绝不提交 `.env`。** 密钥纪律从第一天立好。

## 工作流约定(与用户的约定)

- 按模块拆分任务,每完成一个模块提交一次 git
- **AI 不自动执行 git commit/push,每次执行前必须征得用户确认**
- 远程仓库:https://github.com/stickuser2022/foreign_student_platform.git
- 分支策略:main 主干 + 每模块一个 feature 分支,合并即删
- 重要决策及其原因记录在 `docs/PROGRESS.md`

## 关键业务决策(已定,勿轻易推翻)

1. 覆盖全部招收国际学生的中国高校(约 800–1000 所),授课语言是 Program 的字段而非平台边界(中/英/俄语授课都要)
2. 数据分三层更新:静态层(人工)、周期层(年度)、时效层(变更检测);爬虫是录入助手不是产品
3. freemium:信息全免费;收费点是增值服务(录取数据、提醒、对比、进度跟踪)+ 留学服务
4. 结构可抄成熟平台,内容文案不可照抄(版权 + SEO)
5. Scholarship 独立建模(俄语市场刚需)
6. 角色预留:student / university_admin / platform_admin(后期 counselor)
