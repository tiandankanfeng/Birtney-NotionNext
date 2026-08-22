/**
 * 一些插件
 */
module.exports = {
  // 网站全文搜索
  ALGOLIA_APP_ID: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '0YB01V4DKM', // 在这里查看 https://dashboard.algolia.com/account/api-keys/
  ALGOLIA_ADMIN_APP_KEY: process.env.ALGOLIA_ADMIN_APP_KEY || null, // 管理后台的KEY，不要暴露在代码中，在这里查看 https://dashboard.algolia.com/account/api-keys/
  ALGOLIA_SEARCH_ONLY_APP_KEY:
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_APP_KEY ||
    '11929d83e9e2ff4fb8f46a312e45bcf4', // 客户端搜索用的KEY
  ALGOLIA_INDEX: process.env.NEXT_PUBLIC_ALGOLIA_INDEX || 'Odyssey', // 在Algolia中创建一个index用作数据库

  // AI 相关配置已迁移至 conf/ai.config.js

  // 邮件
  MAILCHIMP_LIST_ID: process.env.MAILCHIMP_LIST_ID || null, // 开启mailichimp邮件订阅 客户列表ID ，具体使用方法参阅文档
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || null // 开启mailichimp邮件订阅 APIkey
}
