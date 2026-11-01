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

## 同步后的验证

定制功能回归：

```sh
yarn test --runInBand --runTestsByPath \
  __tests__/conf/siteCustomization.test.js \
  __tests__/components/ExternalPlugins.test.js \
  __tests__/scripts/final-validation.test.js
```

继续执行全量测试、Lint、类型检查和生产构建。使用本站数据检查首页、文章、分类/标签、搜索和图片；确认关闭的角色与特效没有重新出现。构建环境未配置线上数据源或密钥时，必须明确记录验证范围。

升级缓存、鉴权、搜索索引等链路时，阅读对应版本迁移说明，验证现有调用方；不要为保持旧调用方式而撤销上游的安全校验。
