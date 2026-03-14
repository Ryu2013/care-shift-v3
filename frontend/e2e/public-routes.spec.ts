import { expect, test } from '@playwright/test'

test.describe('public routes', () => {
  test('home page shows public navigation', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: '新規登録' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'ログイン' }).first()).toBeVisible()
  })

  test('register page renders the sign up form', async ({ page }) => {
    await page.goto('/register')

    await expect(page.getByRole('heading', { name: '新規アカウント作成' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'アカウントを作成' })).toBeVisible()
  })

  test('register flow redirects to login with the success message', async ({ page }) => {
    const uniqueEmail = `playwright-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`

    await page.goto('/register')

    await page.getByPlaceholder('山田 太郎').fill('Playwright User')
    await page.getByPlaceholder('example@email.com').fill(uniqueEmail)
    await page.getByPlaceholder('6文字以上').fill('safe-password-123!')
    await page.getByRole('button', { name: 'アカウントを作成' }).click()

    await expect(page).toHaveURL(/\/login(?:\?registered=true)?$/)
    await expect(page.getByText('確認メールを送信しました。メール内のリンクを開いてからログインしてください。')).toBeVisible()
  })

  test('login page shows an error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('example@email.com').fill('missing-user@example.com')
    await page.locator('input[type="password"]').first().fill('wrong-password')
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()

    await expect(page.getByText(/Unprocessable Content|アカウントが存在しないか、またはロックされています|メールアドレスまたはパスワードが正しくありません/)).toBeVisible()
  })

  test('unauthenticated users are redirected from private routes to login', async ({ page }) => {
    await page.goto('/rooms')

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
  })
})
