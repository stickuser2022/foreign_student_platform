# PROGRESS.md — 开发日志

> 按时间倒序记录。每次完成一个模块,在这里记一笔:做了什么、为什么这么做、下一步是什么。

## 2026-08-07 — 第一批数据灌入:60 所学校 + 富字段 + logo ✅

### 完成

- **第一批 60 所学校入库(全部 DRAFT 走审核)**:985×36 + 211×15 + 语言/地缘特色×9(国防科大军校排除;hit/sjtu/blcu/swjtu 已在库跳过)。`prisma/data/universities-batch1.csv` + `prisma/import-universities.ts`;**60 个官网全部探活核验**(5 个需浏览器 UA,兰大 412 反爬但域名正确)
- **审核队列升级为一体工作台**:折叠卡片内嵌完整表单(三类内容都是),看→改→发一页走完;保存后跳回审核页(表单组件加 redirectTo,action 校验只许 /admin 内跳转)
- **富字段 LLM 生成导入**(俄文名/中俄简介/优势学科,`prisma/data/enrich/*.json` + `enrich-universities.ts`,只更新 DRAFT)。纪律:只写通用事实+确切建校年份,不碰排名/人数/学费。**自报低把握条目**(buaa/neu/seu/csu/jnu/shzu/ybu/tjfsu 俄文名口径等)待合伙人俄语复核
- **logo 抓取 + 视觉复核**(`fetch-logos.ts`):官网首页按 HTML 规律找 logo 候选→下载存 public/uploads→写草稿。53 所抓到;**灰底拼图肉眼复核抓出 3 张错图已清除**(ustc 宣传横幅/uestc 占位图标/dlufl 校庆标识);7 所未抓到(pku/zju/scut/scu/lzu/ybu/bisu)
- **logo 补抓(同日)**:pku/ybu 改 UA+Referer 直连下载成功;zju/scut/scu/lzu/bisu/uestc/dlufl 用 **Playwright 无头浏览器**渲染后取 DOM(JS 渲染站)或绕反爬(兰大 412),全部二次肉眼复核。**最终 58/60 有校徽**;ustc(官网头部无 logo 图)/lzu(图片接口反爬到底)放弃自动抓,归入人工
- **缺图提示**:学校表单 logo 区无图时显示「⚠ 未抓取到校徽,请自行搜索后上传」+ 必应搜图直链(校名预填)

### logo 抓取工程化记录(后续批次复用此流程)

1. **一级:静态抓取** `pnpm tsx prisma/fetch-logos.ts`——读 CSV 官网首页,img 标签打分(文件名含 logo +6、alt/class 含 logo +4、png/svg +1、banner/广告类 -5、位置靠前加分),下载存 `public/uploads/logo-<slug>.<ext>`,写入 DRAFT。覆盖约 85%
2. **二级:无头浏览器(Playwright MCP)**——JS 渲染站(渲染后 DOM 取含 logo 的 img)和反爬站(412/202)用它;页内 `fetch` 带浏览器会话可绕反爬
3. **三级:人工**——表单内提示 + 搜图链接,管理员手动上传
4. **质检纪律(必须做)**:抓完用 PIL 拼**灰底**大图肉眼复核(白底会让白色横版校徽隐形,误杀一片);已知错图类型:宣传横幅、占位图标、周年校庆标识。SVG 无法拼图,靠路径约定(官网模板目录 logo.svg)验收
5. 下载的是**本地副本**不是热链,避免对方改站/防盗链导致图裂;版权口径:校徽用于学校识别,目录类站点通行做法

### 决策

- 灌数据路线(用户拍板):第一批 60 所按"985 全部 + 对俄热门"选;**走审核不直接发布**(防 LLM 幻觉);生活费不预填(用户对学生侧费用功能另有想法,后议)
- 审核页定位:核查工作台而非简单发布队列——信息全展示 + 可编辑 + 可跳转官网对照
- 照片版权路线:校园/宿舍照走 Wikimedia Commons(CC 自由版权),不抓官网宣传图;未实施
- 西南交大(is211 漏勾双一流)由用户自行在编辑页修正——不动已发布数据的纪律

### 下一步

- [ ] 用户核查发布 60 所(审核队列,重点:低把握俄文名)
- [ ] ustc/lzu 两所校徽人工上传(审核卡片/编辑页里有搜图链接)
- [ ] 校园/宿舍照片:Wikimedia 抓取(未实施)
- [ ] 项目/费用详情数据(灌数据第二层,手动+半自动)
- [ ] UI 改版(数据到位后;shadcn/ui;上传控件换拖拽组件)
- [x] ~~数据库备份脚本~~(`pnpm backup` → `backups/db-<时间戳>.sql`,docker CLI 自动回退用户级路径;backups/ 已 gitignore;已实测 0.1MB 全库导出有效)
- [ ] 品牌/域名、部署方案(服务器海外优先:免 ICP/离用户近/CBR 直连)
- [ ] AI 抽取录入助手、数据健康标黄、next-intl(二期及以后)

## 2026-08-02 — /admin 第二轮完工:三类内容录入 + 管理/编辑 ✅

### 完成

- **项目录入表单** `/admin/programs/new`:学校下拉(待审核学校标注)、层次下拉、中/英/俄授课勾选、费用四项(元/年)、批次/开学日/截止日、申请要求、奖学金说明、来源 URL;提交进 DRAFT → 审核队列发布。**闭环已验收**(西南交大「优才计划」录入→发布→学校详情页项目卡片可见)
- **项目管理** `/admin/programs` + 编辑页(预填,保存即生效)。**已验收**(改学费前台即时生效,状态不变)
- **学校管理** `/admin/universities` + 编辑页。**已验收**(编辑不影响 PUBLISHED 状态)
- **奖学金**:录入表单 `/admin/scholarships/new`(类型下拉、绑定学校可选=平台级)+ 管理/编辑页。**已验收**
- 录入/编辑共用表单组件:`modules/admin/{program,university,scholarship}-form.tsx`
- 数字输入框加 `min={0}`(学制允许小数 step="any")
- 看板入口收齐:审核队列 / 三个录入 / 三个管理
- 提交 `9d7e854` 已推送 main(学校/奖学金管理部分待下次提交)

### 决策

- **顺序调整(用户认可)**:原计划 ②奖学金录入 ③④编辑功能,调整为**先做项目列表+编辑**(用户高频需求),奖学金录入押后
- 编辑已定两条规则:编辑不改审核状态;编辑**不自动更新** lastVerifiedAt(改错别字 ≠ 重新核实)

### 环境备忘

- **git 代理已改为 Clash 7890**:用户有两个翻墙工具换着用——Clash(127.0.0.1:7890,git 全局代理现默认指向它)和自由猫(127.0.0.1:7892,备用)。**push 失败时自动换另一个端口重试**:`git -c http.proxy=http://127.0.0.1:7892 -c https.proxy=http://127.0.0.1:7892 push`。两个都不通 = 都没开,提醒用户开一个。本机直连 github.com 不通(已实测)

### 下一步

- [x] ~~实时汇率~~(money.ts **双源自动切换**:俄央行 CBR 每日官方汇率 → 中国银行牌价中行折算价,均缓存 6h/8s 超时;两源都挂则只显示人民币不显示卢布,**代码零硬编码汇率**;页面标注来源 ЦБ РФ / Банк Китая。实测:本机直连 CBR 不通自动切中行,显示真实牌价 12.18)
- [x] ~~学校 logo/photos~~(logoUrl/photos 字段 v2.1 就有,本轮补全链路:后台表单 logo 上传/外链二选一 + photos 多图上传/外链,文件存 `public/uploads/` 已 gitignore,server action bodySizeLimit 调至 20mb;前台列表卡片+详情页头部渲染,无图显示首字母占位。已验收——上海交大校徽上传显示正常。部署注意:无服务器平台需迁对象存储)
- [x] ~~P2 筛选器~~(省份/类型/层次/生活费区间,GET 表单 + searchParams,已验收;**MVP 清单 100% 收齐**)
- [ ] UI 改版(时机:第一批数据灌入后、对外推广前;shadcn/ui 组件库 + 用户提供参考站,逐页验收;/admin 不美化;**上传控件原生样式简陋,届时统一换拖拽上传组件**)
- [ ] AI 抽取录入助手(手动流程跑顺后再做,草稿进审核队列)
- [ ] 数据健康:lastVerifiedAt 超期标黄(蓝图第 8 节)
- [ ] next-intl 接入(二期)
- [ ] 品牌/域名

## 2026-07-31 — MVP 功能面收齐 + /admin 后台骨架 ✅

### 完成(均已推送 main,最新 `489360f` 之后的 admin 提交见当日 git log)

- **P4 项目详情页**:参数表(层次/授课语言/学制/招生批次)、费用卡(学费+住宿+保险,双币种换算)、所属学校链接、收藏按钮
- **收藏功能全链路**:详情页收藏/取消按钮(server action)→ 顶部导航"♥ Избранное"→ `/favorites` 页面(分学校/项目两组);未登录点收藏跳登录页(注册钩子)
- **个人账户页**:登录后可见自己收藏的内容
- **/admin 后台 MVP(蓝图第 8 节)**:
  - `src/modules/auth/require-admin.ts` 守卫:未登录 → /sign-in;非 platform_admin → **404**(故意不暴露后台存在)
  - 看板 `/admin`:三类内容 待审核/已发布 计数
  - 审核队列 `/admin/review`:DRAFT 一键发布(置 PUBLISHED + lastVerifiedAt)
  - 学校录入 `/admin/universities/new`:提交进 DRAFT → 队列确认 → 发布。**闭环已验收**(西南交大录入→发布→前台可见)
  - **后台界面用中文**(蓝图第 0 节已定:管理员是中国人)
- **测试账号提权**:`UPDATE users SET role='platform_admin' WHERE email='test@example.com'`(docker exec … psql -U fsp -d foreign_student_platform)

### 技术备忘

- **Prisma 7 动态表名不可用**:`prisma[model].count()` 联合类型不可调用,计数要逐表写
- **Better Auth 附加字段**:session.user.role 需 `as unknown as { role?: string }` 强转
- **dev 服务器固定 3001**, curl 验证登录态:`POST /api/auth/sign-in/email` 拿 cookie 再请求受保护页

### 后台演进路线(已讨论,用户认可方向)

后台即"编辑部",逐步长出:编辑已有内容(高频)→ 项目/奖学金录入表单(下一轮)→ 图片上传 → 数据质量提醒(lastVerifiedAt 超期标红)→ AI 抽取辅助(草稿进审核队列)→ 用户/订单管理。**不另建编辑系统,后台前台是同一份数据的两个视图。**

### 下一步

- [ ] 项目/奖学金录入表单(/admin 第二轮)
- [ ] 编辑已有内容(学校/项目/奖学金的 update 表单)
- [ ] 学校简介 descriptionRu、logoUrl/photos 数据填充
- [ ] 第一批 50–100 所学校名单来源(录入工作开始)
- [ ] next-intl 接入(二期)
- [ ] 品牌/域名

## 2026-07-29 — 最小闭环跑通 ✅

### 数据模型六问讨论(全部拍板,schema v2 依据)

- **第 0 问·数据质量字段**:University/Program/Scholarship 加 sourceUrl、lastVerifiedAt、dataStatus(待审核/已发布)——AI 抽取管道配套 + 页面信任卖点("信息核实于 X 月")
- **第 1 问·费用**:方案 B——Program 加 hostelFeePerYear、insuranceFeePerYear;University 加 livingCostPerMonth。定位为"费用速览"功能(用户语:让学生快速了解城市+学校费用)。卢布不入库,存人民币,展示时换算。可比字段必须结构化、单位统一(为二期对比功能铺路)
- **第 2 问·奖学金**:保持两级(学校级/平台级),不建 programId;项目级奖学金额外用 coverage 文本说明;Program 加 scholarshipNote 文本字段。奖学金一处维护,项目页自动带出本校全部奖学金
- **第 3 问·语言年衔接**:文本说明,不建衔接关系表(真实映射 90% 是"语言班+HSK 达标→本校本科",关系表信息增量极低)。远期项:Program 加 chineseRequirement(HSK 要求)结构化字段 → 支持"按 HSK 等级筛选"
- **第 4 问·收藏**:学校+项目都能收;收藏是注册钩子(浏览免登录,收藏需登录)
- **第 5 问·学生档案**:方案一,注册轻(邮箱)+渐进收集;建 StudentProfile 表,字段可空逐步填

### 讨论中产生的蓝图条目(待写入 docs/03)

- 对比工具:二期,并排表格 v1 / AI 解读 v2(远期),付费层候选;无需新表,依赖字段对齐纪律
- 智能推荐:远期,设计原则"推荐辅助浏览,不替代浏览"(用户对信息茧房的顾虑,以目录驱动规避)
- CSCA(来华留学本科入学学业水平测试):2026/2027 起 CSC 奖学金院校本科必考,2028 拟全面铺开;俄罗斯暂无考点。远期项:Program 加 requiresCsca 布尔筛选;俄语 CSCA 指南是合伙人内容金矿(空白市场)
- 网站建构:复刻 CUCAS 骨架(8 页面类型/模块结构),裁剪 iAgent/coupon/tribe,优化俄语+费用换算+奖学金整合;蓝图文档 docs/03 在五问结论后产出

### 完成

- Docker Desktop 已安装并运行(engine 29.6.2);**注意:用户级安装,docker CLI 不在系统 PATH**,位于
  `C:\Users\21128\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe`,shell 里需补 PATH 或用全路径
- PostgreSQL 17 容器启动(docker compose up -d,healthy)
- `prisma migrate dev --name init` 建表完成,`prisma db seed` 灌入 3 所学校 + CSC 奖学金
- **验证通过**:注册接口(返回 token + user,role=student)、登录接口、/universities 列表页从数据库渲染 3 所学校

### 环境坑(重要,记入备忘)

- **git 推送需走代理**:本机直连 github.com 不通;用户使用"自由猫" VPN(系统代理 127.0.0.1:7892),已配置 `git config --global http(s).proxy`。若以后 push 失败,先检查 VPN 是否开启
- **git 代理配置的注意事项**:代理写入全局配置后,VPN 关闭时 push 必然失败(git 会执意走向已关闭的代理)。规则:**push/pull 前先开自由猫**。恢复直连:`git config --global --unset http.proxy && git config --global --unset https.proxy`
- **VPN 失效备案(用户已确认自由猫不稳定,2026-07-29)**:若自由猫彻底不可用,按以下顺序切换——
  1. remote 从 HTTPS 换成 SSH(GitHub 支持 SSH over 443,大陆环境下常比 HTTPS 稳)
  2. 加 Gitee 做备用远程双推(GitHub 仍为主仓库)
  3. 更换代理服务后重新配置 git proxy
- **工作原则:git commit 纯本地,不依赖网络;push 只是备份/同步,攒几次一起推也可以**
- **本机 3000 端口被用户另一个项目长期占用(且从公网转发进来)**,本项目 dev 固定用 3001:package.json dev 脚本已加 `-p 3001`,`.env` 的 BETTER_AUTH_URL 已改为 3001
- TypeScript 从 5.0.2 升到 5.9(create-next-app 装了过旧版本;`pnpm add -D typescript@^5` 不会升级已满足范围的旧版,需显式指定 `typescript@5.9`)

### 完成(2026-07-30 追加)

- schema v2.1:University 加 universityType(枚举 9 类,列表筛选维度)/ strongDisciplines(自由文本数组)/ photos(URL 数组,远期迁自有图床)
- **P3 学校详情页上线**:头部/费用速览卡(双币种)/简介/优势学科/项目列表/奖学金(本校+平台级)/核实标记;列表页卡片可点击
- 新增 `src/shared/money.ts`(CNY→RUB 汇率 11,展示用常量)、`src/modules/universities/labels.ts`(枚举俄语标签)
- **坑:给已有表加带默认值的新字段时,存量数据会吃默认值**——dataStatus 默认 DRAFT 导致老 seed 项目在前台消失。教训:schema 变更后 seed 的 update 分支要同步处理存量数据

### 下一步

- [ ] git 提交推送(P3 + schema v2.1)
- [ ] P4 项目详情页、收藏功能、/admin 审核队列(蓝图第 9 节)
- [ ] 学校简介 descriptionRu、图片 logoUrl/photos 数据填充
- [ ] 第一批 50–100 所学校名单来源
- [ ] next-intl 接入(二期)
- [ ] 品牌/域名

## 2026-07-28 — 项目启动

### 背景调研(已完成)

- 完成竞品与开源项目调研,产出 `docs/01-竞品调研与业务逻辑洞察.md`(中俄双语)
- 核心结论:以 Program 为核心实体;Scholarship 独立建模;俄语市场无真正信息平台,全量无偏见数据库是空白;freemium + 服务变现
- 详见调研文档第 9 节讨论纪要

### 技术决策

- 栈:Next.js 16 + React 19 + TS + Tailwind 4 + **Prisma 7** + PostgreSQL + Better Auth,pnpm
- Prisma 版本:起初锁 6 求稳,但 IDE 插件已按 Prisma 7 规范校验(datasource 不再支持 url),用户决定直接上 7
  - Prisma 7 要点:`prisma.config.ts` 管理连接串;generator 为 `prisma-client` + 自定义 output(`src/generated/prisma`,已 gitignore);Client 必须配 driver adapter(`@prisma/adapter-pg`);TypeScript 需 ≥5.4
- 数据库选 PostgreSQL 而非 SQLite:避免日后 provider 迁移导致 migration 作废;多语言内容需要 JSON 字段
- PostgreSQL 本地部署:用户选择安装 Docker Desktop(进行中),项目内提供 `docker-compose.yml`
- 架构:模块化单体,目录约定见 AGENTS.md

### 环境状态

- Node v22.14.0 / pnpm 11.17.0 / git 已配置(Qingger)
- Docker Desktop:**未安装**,用户自行安装中
- 项目骨架已由 create-next-app 生成(Next 16.2.12)
- pnpm-workspace.yaml 中 sharp 构建脚本设为 ignore(Windows 用预编译二进制,无影响)

### 今晚计划(最小闭环)

1. docker-compose.yml + .env.example
2. Prisma schema v1:User(Better Auth 三件套)/ University / Program / Scholarship / Post
3. Better Auth 邮箱密码登录
4. 学校列表页(先灌几条种子数据)
5. git init + 关联远程 + 首次提交

### 待办/未决

- [ ] Docker Desktop 安装(用户)
- [ ] next-intl 接入(模块 #2)
- [ ] 第一批 50–100 所学校名单来源
- [ ] 收藏功能(MVP 范围内,排在列表页之后)
- [ ] 品牌/域名
