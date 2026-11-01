import { render, screen } from '@testing-library/react'
import { getGlobalSnapshot } from '@/lib/global'
import { useRouter } from 'next/router'
import AsideLeft from '@/themes/fukasawa/components/AsideLeft'
import ArticleDetail from '@/themes/fukasawa/components/ArticleDetail'
import SocialButton from '@/themes/fukasawa/components/SocialButton'

jest.mock('next/router', () => ({ useRouter: jest.fn() }))
jest.mock('@/lib/global', () => ({
  getGlobalSnapshot: jest.fn(),
  useGlobal: () => ({ fullWidth: false, locale: { COMMON: {} } })
}))
jest.mock('@/components/Comment', () => () => <div data-testid='comments' />)
jest.mock('@/components/GoogleAdsense', () => ({ AdSlot: () => null }))
jest.mock('@/components/LazyImage', () => () => null)
jest.mock('@/components/NotionPage', () => () => <p>Article body</p>)
jest.mock('@/components/ShareBar', () => () => null)
jest.mock('@/components/WWAds', () => () => null)
jest.mock('@/components/DarkModeButton', () => () => null)
jest.mock('@/components/SmartLink', () => ({ children, href }) => (
  <a href={href}>{children}</a>
))
jest.mock('@/themes/fukasawa/components/ArticleAround', () => () => null)
jest.mock('@/themes/fukasawa/components/Announcement', () => () => null)
jest.mock('@/themes/fukasawa/components/Catalog', () => () => null)
jest.mock('@/themes/fukasawa/components/GroupCategory', () => () => null)
jest.mock('@/themes/fukasawa/components/Logo', () => () => null)
jest.mock('@/themes/fukasawa/components/MailChimpForm', () => () => null)
jest.mock('@/themes/fukasawa/components/SearchInput', () => () => null)
jest.mock('@/themes/fukasawa/components/SiteInfo', () => () => null)
jest.mock('@/themes/fukasawa/components/MenuList', () => ({
  MenuList: () => <a href='/tag'>Browse tags</a>
}))

const tag = { name: 'Engineering', count: 3, color: 'blue' }
const post = { id: 'post', type: 'Post', title: 'A post', tagItems: [tag] }
let notionConfig

beforeEach(() => {
  localStorage.clear()
  useRouter.mockReturnValue({ asPath: '/' })
  notionConfig = {
    COMMENT_ARTALK_SERVER: false,
    COMMENT_TWIKOO_ENV_ID: 'false',
    COMMENT_WALINE_SERVER_URL: false,
    COMMENT_VALINE_APP_ID: false,
    COMMENT_GISCUS_REPO: false,
    COMMENT_CUSDIS_APP_ID: false,
    COMMENT_UTTERRANCES_REPO: false,
    COMMENT_GITALK_CLIENT_ID: false,
    COMMENT_WEBMENTION_ENABLE: false,
    COMMENT_NOTION_ENABLE: false,
    FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL: false
  }
  getGlobalSnapshot.mockImplementation(() => ({ NOTION_CONFIG: notionConfig }))
})

it.each([false, 'false'])('hides only the sidebar tag cloud with %p', value => {
  notionConfig.FUKASAWA_SIDEBAR_TAGS = value
  const { container } = render(
    <>
      <AsideLeft tagOptions={[tag]} />
      <ArticleDetail post={post} />
    </>
  )
  expect(container.querySelector('#tags-group')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Browse tags' })).toHaveAttribute(
    'href',
    '/tag'
  )
  expect(screen.getByRole('link', { name: 'Engineering(3)' })).toHaveAttribute(
    'href',
    '/tag/Engineering'
  )
  expect(screen.getByText('Article body')).toBeInTheDocument()
})

it('keeps the upstream default tag cloud and the tag-index exclusion', () => {
  const { container, rerender } = render(<AsideLeft tagOptions={[tag]} />)
  expect(container.querySelector('#tags-group')).toHaveTextContent('Engineering')
  notionConfig.FUKASAWA_SIDEBAR_TAGS = 'true'
  useRouter.mockReturnValue({ asPath: '/tag' })
  rerender(<AsideLeft tagOptions={[tag]} />)
  expect(container.querySelector('#tags-group')).not.toBeInTheDocument()
})

it('removes the entire comment panel when providers are off and restores it when enabled', () => {
  const { container, rerender } = render(<ArticleDetail post={post} />)
  expect(screen.queryByTestId('comments')).not.toBeInTheDocument()
  expect(container.querySelector('.shadow')).not.toBeInTheDocument()
  notionConfig.COMMENT_TWIKOO_ENV_ID = 'https://comments.example.com'
  rerender(<ArticleDetail post={post} />)
  expect(screen.getByTestId('comments').parentElement).toHaveClass('shadow')
  rerender(<ArticleDetail post={{ ...post, comment: 'Hide' }} />)
  expect(container.querySelector('.shadow')).not.toBeInTheDocument()
})

it('keeps the social destination while displaying the X brand', () => {
  notionConfig.CONTACT_TWITTER = 'https://twitter.com/example'
  render(<SocialButton />)
  const link = screen.getByRole('link', { name: 'X' })
  expect(link).toHaveAttribute('href', notionConfig.CONTACT_TWITTER)
  expect(link.querySelector('i')).toHaveClass('fa-x-twitter')
})
