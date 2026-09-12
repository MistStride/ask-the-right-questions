import type { Locale } from '../schema/levelTypes'

export const GITHUB_REPOSITORY_URL = 'https://github.com/MistStride/ask-the-right-questions'

interface Props {
  locale: Locale
  placement: 'nav' | 'footer'
}

export default function GitHubLink({ locale, placement }: Props) {
  const accessibleLabel =
    locale === 'zh'
      ? '在 GitHub 查看项目源码（新窗口打开）'
      : 'View the project source on GitHub (opens in a new tab)'
  const footerLabel = locale === 'zh' ? '查看源码 · 贡献关卡' : 'View source · Contribute'

  return (
    <a
      href={GITHUB_REPOSITORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={accessibleLabel}
      title={accessibleLabel}
      className={
        placement === 'nav'
          ? 'inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-500/60 hover:bg-white/70 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500'
          : 'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 font-semibold text-amber-700 transition hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500'
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 fill-current"
      >
        <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.9 10.9 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.41-2.71 5.38-5.29 5.67.42.36.79 1.06.79 2.14v3.18c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
      </svg>
      <span className={placement === 'nav' ? 'hidden sm:inline' : undefined}>
        {placement === 'nav' ? 'GitHub' : footerLabel}
      </span>
      {placement === 'footer' && <span aria-hidden="true">↗</span>}
    </a>
  )
}
