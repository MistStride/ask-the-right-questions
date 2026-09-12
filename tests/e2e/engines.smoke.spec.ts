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
