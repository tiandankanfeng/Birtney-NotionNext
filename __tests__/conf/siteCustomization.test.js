/** @jest-environment node */
import { execFileSync } from 'node:child_process'

describe('site customization after upstream sync', () => {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith('NEXT_PUBLIC_')
    )
  )
  const config = JSON.parse(
    execFileSync(
      process.execPath,
      [
        '--env-file=.env.production',
        '-e',
        `const config = require('./blog.config');
        const keys = ['THEME', 'THEME_SWITCH', 'CUSTOM_RIGHT_CLICK_CONTEXT_MENU_THEME_SWITCH',
          'MUSIC_PLAYER', 'WIDGET_PET', 'WIDGET_PET_SWITCH_THEME', 'DEBUG',
          'MOUSE_FOLLOW', 'SAKURA', 'STARRY_SKY', 'AUTHOR', 'BIO', 'LINK',
          'NEXT_REVALIDATE_SECOND', 'ALGOLIA_INDEX', 'FONT_URL', 'FONT_SERIF',
          'COMMENT_TWIKOO_ENV_ID', 'POST_SHARE_BAR_ENABLE', 'POSTS_SHARE_SERVICES',
          'CAN_COPY', 'ANALYTICS_BUSUANZI_ENABLE'];
        console.log(JSON.stringify(Object.fromEntries(keys.map(key => [key, config[key]]))));`
      ],
      { cwd: process.cwd(), env, encoding: 'utf8' }
    )
  )

  it('keeps Fukasawa and disables the requested presentation extras', () => {
    expect(config.THEME).toBe('fukasawa')
    for (const key of [
      'THEME_SWITCH',
      'CUSTOM_RIGHT_CLICK_CONTEXT_MENU_THEME_SWITCH',
      'MUSIC_PLAYER',
      'WIDGET_PET',
      'WIDGET_PET_SWITCH_THEME',
      'DEBUG',
      'MOUSE_FOLLOW',
      'SAKURA',
      'STARRY_SKY'
    ]) {
      expect([key, config[key]]).toEqual([key, 'false'])
    }
  })

  it('keeps the site identity, search index and refresh interval', () => {
    expect(config).toMatchObject({
      AUTHOR: 'Komoribe',
      BIO: '沉潜修身，厚积薄发',
      LINK: 'https://komoribe.ink',
      ALGOLIA_INDEX: 'Odyssey',
      NEXT_REVALIDATE_SECOND: 5
    })
  })

  it('allows copying and keeps only link sharing without comments or public counters', () => {
    expect(config).toMatchObject({
      COMMENT_TWIKOO_ENV_ID: 'false',
      POST_SHARE_BAR_ENABLE: 'true',
      POSTS_SHARE_SERVICES: 'link',
      CAN_COPY: 'true',
      ANALYTICS_BUSUANZI_ENABLE: 'false'
    })
  })

  it('keeps the existing web fonts and custom serif fallback', () => {
    expect(JSON.parse(config.FONT_URL)).toEqual([
      'https://fonts.googleapis.com/css?family=Bitter:300,400,700&display=swap',
      'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700&display=swap'
    ])
    expect(config.FONT_SERIF).toContain('"LXGW WenKai"')
  })
})
