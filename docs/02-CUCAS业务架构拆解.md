# CUCAS 网站建构拆解(页面架构视角)

> 产出日期:2026-07-29(重写版,替代原"业务变现"视角)
> 用途:回答"**这个网站是怎么搭起来的**"——站点怎么组织、有哪些页面类型、每类页面由什么模块组成、用户在页面之间怎么流动。这是我们设计自己网站页面结构的直接模板。
> 注:变现逻辑仅在与页面设计直接相关处提及,详见 `docs/01` 第 2 节。

---

## 1. 先看全局:CUCAS 的站点拓扑

CUCAS 不是一个网站,而是**一组按职能拆开的子站群**:

```
www.cucas.cn           主站:搜索 + 项目库(转化中枢)
<学校名>.cucas.cn      学校子站:每所大学一个(uibe.cucas.cn 等)
scholarship.cucas.cn   奖学金目录站
help.cucas.cn          帮助中心(申请指南/状态/缴费 FAQ)
news.cucas.cn          内容营销站(攻略文章,SEO 获客)
tribe.cucas.cn         社区/生活内容(行前、校园生活)
iagent.cucas.cn        代理后台(B2B,不对学生开放)
m.cucas.cn             移动版
```

**设计逻辑:按"用户意图"拆站。** 搜索项目的人去 www,查奖学金的人去 scholarship,看攻略的人从 news 进来,已经录取的人看 tribe——每个入口接住一种意图,最后都导向主站的项目详情页。

**对我们**:我们不需要子域群,单域名 + 目录结构即可(`/`、`/universities`、`/programs`、`/scholarships`、`/guides`),但"按意图分入口"的思路照抄。

## 2. 页面类型清单(8 种)

CUCAS 全站只有 8 种页面类型,每种都是一个"模板 + 数据"的渲染结果:

| # | 页面类型 | 例子 | 数据实体 | 作用 |
|---|---|---|---|---|
| P1 | 首页(项目卡片流) | www.cucas.cn | Program + University | 直接推项目,不做门户 |
| P2 | 列表/搜索结果页 | 筛选后的项目列表 | Program | 收敛选择 |
| P3 | 项目详情页 | /program/xxx-84002.html | Program + University + 材料清单 | **转化主战场** |
| P4 | 学校主页 | uibe.cucas.cn | University + Post + Review | 建立信任 |
| P5 | 奖学金目录/详情 | scholarship.cucas.cn | Scholarship | 高意图流量入口 |
| P6 | 内容/攻略页 | news、tribe 的文章 | Post | SEO 获客 |
| P7 | 申请流程页 | 表单→上传→支付 | Application + Document + Payment | 变现核心 |
| P8 | 用户中心 | 登录后 | Application 状态 | 留存与追踪 |

辅助功能页:大学对比工具(嵌在学校子站)、优惠券页。

## 3. 每类页面的内部结构(实测拆解)

### P1 首页——没有"门户",直接是项目卡片流

首屏不是轮播图、不是公司介绍,而是**一屏项目卡片**。卡片固定结构(实测抓取):

```
项目名(MBBS / Civil Engineering ...)
学校名
Degree:        Bachelor 6 Years        ← 学位+学制
Teaching Language: English             ← 授课语言
Tuition:         RMB 30,000 Per Year   ← 学费
Recommended Reasons: 1..2..3..         ← 三条推荐理由(人工提炼的卖点)
Learn More >                            ← 进详情页
```

**设计逻辑:用户在留学平台的第一需求是"有什么项目可选",不是"你是谁"。首页 = 搜索结果页的精选版。**

### P3 项目详情页——转化主战场(信息密度最高)

区块顺序(自顶向下):

1. 项目参数表:Degree / Starting Date / Duration / Teaching Language / Tuition / **Application Deadline** / **Application Fee** / **Service Fee**(费用全部前置透明)
2. 学校简介(带 "Why choose" 卖点)
3. **Application Materials**(材料清单,带必填标记;附翻译/监护增值服务的预订入口)
4. 申请按钮(CTA)
5. 相似项目推荐

### P4 学校主页——信任建设流水线(实测 uibe.cucas.cn 的模块顺序)

```
1. Highlights(图片轮播)           ← 视觉冲击
2. School Introduction(简介摘要)   ← 是什么学校
3. Why Choose UIBE(学生证言流!)   ← 不是官方吹牛,是真实学生写"我为什么选它",带名字国籍时间
4. 校园照片
5. Useful Documents(可下载文档:注册指南、社团介绍)
6. University Comparison(VS 对比工具,放在页面中下部"NOT SURE WHERE TO GO?")
7. Students' Reviews(评分)
8. $10 Coupon 弹层                 ← 页面末尾才出现营销钩子
```

**设计逻辑:按"信任建立顺序"排列——先吸引(图)→ 再了解(简介)→ 再相信(证言)→ 再比较(对比工具)→ 最后才推营销。** 注意证言内容高度结构化(姓名/国籍/时间/长文),说明背后有一张 Review 表和一套征集机制。

### P2 列表/搜索页

筛选器收敛在 5–6 个维度:学位、学科、城市、授课语言、学费(奖学金列表多"全额/半额")。结果项就是首页那种卡片。

### P5 奖学金目录

独立站,筛选维度:类型(全额/半额,半额再分 Tuition/Accommodation/Living 覆盖项)、城市、学校、学位、授课语言、入学年份、专业。奖学金在这里是**独立可检索的实体**,不是项目的附属标签——印证我们"Scholarship 独立建表"的决策。

### P6 内容页(news/tribe)

标准攻略文章站:标题 + 正文 + 相关阅读。作用单一:SEO 获客,文末导流相关项目。注意它拆了 news(申请攻略)和 tribe(行前/生活)两个站——**按用户阶段分内容**:申请前看 news,录取后看 tribe。

### P7 申请流程页(注册墙之后)

线性四步,一屏一步:在线申请表(8 区块)→ 上传材料(带格式/大小限制)→ 缴费(申请费+服务费,5 种支付方式)→ 提交。**注册是轻量的(邮箱),重表单在申请时才出现**——注册门槛后置。

### P8 用户中心

核心就一块:**申请状态追踪**(6 态:Incomplete/Completed/Processing/Pending/Accepted/Rejected)+ 邮件通知辅助。

## 4. 用户在站内的流动路径

```
                    SEO/社媒/广告
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          P6 攻略文   P5 奖学金   P2 搜索结果
              │          │          │
              └────┬─────┴─────┬────┘
                   ▼           ▼
                 P3 项目详情页 ◄── P1 首页卡片
                   │
              [点"申请"]──► 注册/登录(轻)
                   ▼
                 P7 申请四步 ──► P8 用户中心(状态追踪)
                   │
              P4 学校子站 在任意环节横向出现:从详情页"学校简介"点进去建立信任
```

**关键跳转钩子**:卡片的 Learn More、详情页的学校链接、子站的对比工具、攻略文的相关项目——每个页面都有指向下一步的单一 CTA,页面之间不交叉干扰。

## 5. 这套建构背后的四条设计逻辑

1. **项目是原子单位**:首页、搜索、详情、申请全部围绕 Program 组织,University 只是 Program 的属性+信任背书页。→ 我们的 schema 已经对了
2. **页面 = 模板 + 数据**:8 种页面类型渲染全站几万页面,说明数据建模先行、页面是数据的视图。→ 我们的 CMS 录入的数据质量决定页面质量
3. **信任元素产品化**:学生证言、Reviews、对比工具、可下载文档都是结构化数据,不是编辑手写死的。→ 我们二期要建 Review 表
4. **门槛后置**:浏览全免费免登录,注册在点"申请"时才要求,重表单在申请时才出现。→ 我们的收藏功能同理:浏览免登录,收藏时才提示注册

## 6. 映射到我们的网站(页面建设优先级)

```
MVP(当前):        P2 学校列表(已有雏形)→ P4 学校主页 → P3 项目详情页 → P5 奖学金列表
二期:            P1 首页卡片流改版、收藏(注册钩子)、P6 攻略内容页(CSC 俄语向导)
三期:            对比工具、Review 证言体系
远期(接服务时):   P7 申请流程、P8 用户中心状态追踪
```

站点拓扑:单域名,`/universities` `/programs` `/scholarships` `/guides` 目录结构,学校页用 `/universities/[slug]`(slug 已在 schema 里)。

## 7. 来源

- 首页卡片结构实测:https://www.cucas.cn/
- 学校子站模块结构实测:https://uibe.cucas.cn/
- 项目详情页:https://bisu.cucas.cn/program/Chinese-Language-81448.html
- 奖学金目录:https://scholarship.cucas.cn/
- 帮助中心:https://help.cucas.cn/index/lists/2243/2244
- 内容站:https://news.cucas.cn/ 、https://tribe.cucas.cn/
