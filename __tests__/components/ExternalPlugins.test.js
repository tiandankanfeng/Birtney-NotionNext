import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { act, cleanup, render } from '@testing-library/react'
import ExternalPlugin from '@/components/ExternalPlugins'
import BLOG from '@/blog.config'
import { loadExternalResource } from '@/lib/utils'

jest.mock('@/blog.config', () => ({ WIDGET_PET: 'false', CAN_COPY: true }))
jest.mock('@/lib/global', () => ({
  useGlobal: () => ({ lang: 'zh-CN' }),
  getGlobalSnapshot: () => ({})
}))
jest.mock('@/components/GlobalStyle', () => ({ GlobalStyle: () => null }))
jest.mock('@/components/IconFont', () => () => null)
jest.mock('@/components/Webwhiz', () => () => null)
jest.mock('@/components/GoogleAdsense', () => ({
  initGoogleAdsense: jest.fn()
}))
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  loadExternalResource: jest.fn()
}))
jest.mock('@/lib/db/notion/convertInnerUrl', () => ({
  convertInnerUrl: jest.fn()
}))

describe('custom mascot WIDGET_PET switch', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    BLOG.WIDGET_PET = 'false'
    // Static custom scripts execute outside the Next.js bundle. Run the actual
    // files so the test also catches a mascot left in the always-loaded hook.
    const anchor = document.createElement('script')
    document.head.appendChild(anchor)
    loadExternalResource.mockImplementation((url, type) => {
      if (type === 'js' && url.startsWith('/js/')) {
        vm.runInNewContext(
          fs.readFileSync(path.join(process.cwd(), 'public', url), 'utf8'),
          { window, document, console }
        )
      }
      return Promise.resolve(url)
    })
  })

  afterEach(() => {
    cleanup()
    jest.useRealTimers()
  })

  async function mountPlugins(notionConfig = {}) {
    render(<ExternalPlugin NOTION_CONFIG={notionConfig} />)
    await act(async () => {
      await jest.runOnlyPendingTimersAsync()
    })
  }

  function hasMascotResources() {
    return document.querySelector('link[href*="/live2d/lib/pio.css"]') !== null
  }

  it.each([false, 'false'])(
    'does not load the mascot when WIDGET_PET=%p',
    async value => {
      await mountPlugins({ WIDGET_PET: value })

      expect(hasMascotResources()).toBe(false)
      expect(loadExternalResource).not.toHaveBeenCalledWith(
        '/js/widget-pet.js',
        'js'
      )
      expect(loadExternalResource).toHaveBeenCalledWith('/js/custom.js', 'js')
      expect(loadExternalResource).toHaveBeenCalledWith(
        '/css/custom.css',
        'css'
      )
    }
  )

  it.each([true, 'true'])(
    'loads the existing mascot when WIDGET_PET=%p',
    async value => {
      await mountPlugins({ WIDGET_PET: value })

      expect(hasMascotResources()).toBe(true)
    }
  )

  it('uses the environment-backed setting when Notion has no override', async () => {
    await mountPlugins()

    expect(hasMascotResources()).toBe(false)
  })

  it('keeps a Notion false override above the environment-backed true setting', async () => {
    BLOG.WIDGET_PET = 'true'
    await mountPlugins({ WIDGET_PET: 'false' })

    expect(hasMascotResources()).toBe(false)
  })

  it('cancels pending resource loads when unmounted before the idle task', async () => {
    const { unmount } = render(
      <ExternalPlugin NOTION_CONFIG={{ WIDGET_PET: true }} />
    )
    unmount()
    await act(async () => {
      await jest.runOnlyPendingTimersAsync()
    })

    expect(loadExternalResource).not.toHaveBeenCalled()
    expect(hasMascotResources()).toBe(false)
  })
})
