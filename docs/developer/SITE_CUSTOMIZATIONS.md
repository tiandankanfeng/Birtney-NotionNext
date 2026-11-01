# 本站定制与上游同步

本仓库持续合并 `notionnext-org/NotionNext`，保留合并历史。同步时先以共同祖先核对本站差异，再验证合并后的行为，不能仅以“没有 Git 冲突”判定兼容。

## 需要保留的配置与功能

- `.env.production`：生产默认主题为 Fukasawa；关闭主题切换、调试入口、音乐播放器、宠物挂件、鼠标跟随、樱花和暗色星空；显式保留原有 Web 字体资源。
- `public/komoribe-icon.png`：本站夜空人物头像的 128×128 PNG，由 `NEXT_PUBLIC_FAVICON` 指定为标签页图标；独立于上游默认 `favicon.ico`，同步时保留。它是当前 Notion 头像的静态副本，后续修改 Notion 头像不会自动更新此文件。
- `blog.config.js`：本站作者、简介、域名、欢迎语和 5 秒页面重验证间隔。
- `conf/plugin.config.js`：本站 Algolia 搜索配置；管理密钥只通过部署环境提供。
- `conf/contact.config.js`、`conf/analytics.config.js`、`conf/font.config.js`：本站联系入口、统计配置和字体栈。
- `public/js/widget-pet.js`、`mascot/`：定制角色及资源。角色脚本由 `ExternalPlugins` 在 `WIDGET_PET` 开启时加载；`public/js/custom.js` 保留为通用入口，不能重新放入无条件加载的角色代码。
- `scripts/final-validation.js`：本站校验脚本；上游升级 Next.js 时同步核对依赖版本检查。

公开展示偏好优先通过 `.env.production` 维护，避免扩大主题和框架差异。配置仍遵循现有 `siteConfig` 优先级；除 `THEME_SWITCH` 的环境变量优先规则外，Notion 同名配置可能覆盖环境变量。环境变量修改后需要重新构建部署并刷新页面。

### 阅读页精简配置

2026-11-01 已在 Notion 配置中心启用下列配置，同时在 `.env.production` 保留相同默认值。Notion 通过页面重验证生效；部署平台已有环境变量也可能覆盖文件默认值，因此不能只改文件后假定线上已生效。

| Notion 配置名 | 值 | 环境变量 | 效果 |
| --- | --- | --- | --- |
| `COMMENT_TWIKOO_ENV_ID` | `false` | `NEXT_PUBLIC_COMMENT_ENV_ID` | 不加载 Twikoo，不删除已有评论数据 |
| `POSTS_SHARE_SERVICES` | `link` | `NEXT_PUBLIC_POST_SHARE_SERVICES` | 分享栏只保留复制链接；`POST_SHARE_BAR_ENABLE` 保持开启 |
| `CAN_COPY` | `true` | `NEXT_PUBLIC_CAN_COPY` | 允许正文复制；原 Notion 值为 `false` |
| `ANALYTICS_BUSUANZI_ENABLE` | `false` | `NEXT_PUBLIC_ANALYTICS_BUSUANZI_ENABLE` | 停止加载不蒜子计数，隐藏公开访问量和访客数 |
| `FUKASAWA_SIDEBAR_TAGS` | `false` | `NEXT_PUBLIC_FUKASAWA_SIDEBAR_TAGS` | 关闭侧栏标签云，保留标签菜单、标签页及文章标签 |

必要的主题差异：`AsideLeft` 使用新增的 `FUKASAWA_SIDEBAR_TAGS`（未配置时默认开启）；`ArticleDetail` 沿用 `hasEnabledComments` 判断，关闭评论时同时移除空白容器；`SocialButton` 的 Twitter 联系入口使用现有 Font Awesome 的 `fa-x-twitter` 图标，保留联系地址。后两项及新开关需构建部署后生效。同步上游时优先检查是否已提供等价实现，避免重复维护。

恢复时先修改或停用 Notion 对应行，再同步环境变量并重新构建。恢复 Twikoo 需重新提供原服务地址；恢复分享服务需填回服务列表；侧栏标签开关改为 `true` 即可恢复。只回退 Git 提交不会回退 Notion 配置。

## 同步后的验证

定制功能回归：

```sh
yarn test --runInBand --runTestsByPath \
  __tests__/conf/siteCustomization.test.js \
  __tests__/themes/fukasawa/presentation.test.js \
  __tests__/components/ExternalPlugins.test.js \
  __tests__/scripts/final-validation.test.js
```

继续执行全量测试、Lint、类型检查和生产构建。使用本站数据检查首页、文章、分类/标签、搜索和图片；确认关闭的角色与特效没有重新出现。构建环境未配置线上数据源或密钥时，必须明确记录验证范围。

升级缓存、鉴权、搜索索引等链路时，阅读对应版本迁移说明，验证现有调用方；不要为保持旧调用方式而撤销上游的安全校验。
