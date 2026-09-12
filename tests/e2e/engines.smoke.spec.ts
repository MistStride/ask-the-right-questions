import { expect, test } from '@playwright/test'

const engineLevels = [
  ['xray', 'ch02-level01'],
  ['courtroom', 'ch07-level01'],
  ['scale', 'ch04-level01'],
  ['defusal', 'ch10-level01'],
  ['tamer', 'ch01-level01'],
] as const

test('home primary action starts the first unfinished level', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('atrq-onboarding-v1', 'complete'))
  await page.goto('./')
  await page.getByRole('button', { name: /从第一关开始|Start at Level One/ }).click()

  await expect(page).toHaveURL(/#\/level\/ch01-level01$/)
  await expect(page.locator('[data-engine="tamer"]')).toBeVisible()
})

test('first visit delivers a nuanced judgment before the full learning path', async ({ page }) => {
  await page.goto('./')

  const onboarding = page.getByTestId('first-run-onboarding')
  await expect(onboarding).toBeVisible()
  await onboarding.getByRole('button', { name: /开始挑战|Take the challenge/ }).click()
  await onboarding.getByRole('button', { name: /参与员工是否普遍喜欢|Did participating employees/ }).click()

  await expect(onboarding).toContainText(/相关，但还不够|Relevant, not sufficient/)
  await expect(onboarding).toContainText(/真数据支撑了一个过强的结论|real data carrying a conclusion/)
  await onboarding.getByRole('button', { name: /进入第一章|Enter Chapter One/ }).click()

  await expect(page).toHaveURL(/#\/level\/ch01-level01$/)
  await expect(page.locator('[data-engine="tamer"]')).toBeVisible()
})

test('completion summary stays operable and scrolls inside a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 560 })
  await page.goto('./#/level/ch01-level01')

  await page.getByRole('button', { name: /淘金者|Gold Panner/ }).click()
  await page
    .getByRole('button', { name: /我爸一个人的经历，能证明所有医生都骗钱吗？|Can my dad's experience prove/ })
    .click()
  await page
    .getByRole('button', { name: /我爸的体验能代表所有人的情况吗？|Can my dad's experience represent/ })
    .click()
  await page
    .getByRole('button', { name: /上没上过大学，与他说的内容有没有道理是两回事|Education and whether his claim/ })
    .click()

  const dialog = page.getByRole('dialog')
  const scrollArea = page.getByTestId('completion-scroll')
  const actions = page.getByTestId('completion-actions')
  const closeButton = page.getByRole('button', { name: /关闭总结|Close summary/ })

  await expect(dialog).toBeVisible()
  await expect(closeButton).toBeVisible()
  await expect(actions).toBeVisible()

  const dialogBox = await dialog.boundingBox()
  expect(dialogBox).not.toBeNull()
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0)
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(560)

  await page.getByRole('button', { name: /查看本关每步判定|Step-by-step review/ }).click()
  const scrollMetrics = await scrollArea.evaluate((element) => {
    element.scrollTop = element.scrollHeight
    return {
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
      bodyOverflow: document.body.style.overflow,
      rootOverflow: document.documentElement.style.overflow,
    }
  })

  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight)
  expect(scrollMetrics.scrollTop).toBeGreaterThan(0)
  expect(scrollMetrics.bodyOverflow).toBe('hidden')
  expect(scrollMetrics.rootOverflow).toBe('hidden')
  await expect(actions).toBeVisible()

  await closeButton.click()
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/#\/$/)
  await expect
    .poll(() =>
      page.evaluate(() => ({
        bodyOverflow: document.body.style.overflow,
        rootOverflow: document.documentElement.style.overflow,
      })),
    )
    .toEqual({ bodyOverflow: '', rootOverflow: '' })
})

for (const [engine, levelId] of engineLevels) {
  test(`${engine} engine renders from the production build`, async ({ page }) => {
    const runtimeErrors: string[] = []
    page.on('pageerror', (error) => runtimeErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeErrors.push(message.text())
    })

    await page.goto(`./#/level/${levelId}`)

    await expect(page.locator(`[data-engine="${engine}"]`)).toBeVisible()
    await expect(page.locator('body')).not.toContainText('关卡数据校验失败')
    expect(runtimeErrors).toEqual([])
  })
}
