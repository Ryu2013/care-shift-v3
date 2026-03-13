import { expect, test } from '@playwright/test'

test.describe('authenticated routes', () => {
  async function login(
    page: Parameters<typeof test>[1] extends never ? never : any,
    email: string,
    password: string,
    expectedPath: RegExp = /\/shifts$/,
  ) {
    await page.goto('/login')
    await page.getByPlaceholder('example@email.com').fill(email)
    await page.locator('input[type="password"]').first().fill(password)
    await page.getByRole('button', { name: 'ログイン', exact: true }).click()
    await expect(page).toHaveURL(expectedPath)
  }

  async function seedAdmin(request: Parameters<typeof test>[1] extends never ? never : any) {
    const email = `playwright-admin-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`
    const password = 'Playwright-Admin-Password-123!'

    const response = await request.post('/api/test_support/users', {
      data: {
        email,
        password,
        role: 'admin',
        name: 'Playwright Admin',
      },
    })

    expect(response.ok()).toBeTruthy()

    return { email, password }
  }

  async function loginAsAdmin(page: Parameters<typeof test>[1] extends never ? never : any, request: Parameters<typeof test>[1] extends never ? never : any) {
    const credentials = await seedAdmin(request)

    await login(page, credentials.email, credentials.password)

    return credentials
  }

  async function seedWorkStatusScenario(
    request: Parameters<typeof test>[1] extends never ? never : any,
    overrides: Record<string, unknown> = {},
  ) {
    const response = await request.post('/api/test_support/work_status_scenarios', {
      data: {
        admin_name: 'Work Status Admin',
        employee_name: 'Playwright Staff',
        client_name: `Playwright 利用者 ${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        work_status: 'work',
        ...overrides,
      },
    })

    expect(response.ok()).toBeTruthy()

    return response.json()
  }

  test('admin users can log in and reach the shifts page', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await expect(page.getByRole('button', { name: '新規シフト' })).toBeVisible()
  })

  test('admin users can create a department from settings', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await page.goto('/settings')
    await expect(page.getByRole('button', { name: '部署管理' })).toBeVisible()

    const teamName = `E2E部署-${Date.now()}`
    await page.getByPlaceholder('部署名を入力').fill(teamName)
    await page.getByRole('button', { name: '追加', exact: true }).click()

    await expect(page.getByText(teamName)).toBeVisible()
  })

  test('admin users can update office information from settings', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await page.goto('/settings')
    await page.getByRole('button', { name: '会社情報' }).click()

    const officeName = `E2E会社-${Date.now()}`
    await page.getByLabel('会社名 / 事業所名').fill(officeName)
    await page.getByRole('button', { name: '情報を更新する' }).click()

    await expect(page.getByText('会社情報を更新しました。')).toBeVisible()
    await expect(page.getByLabel('会社名 / 事業所名')).toHaveValue(officeName)
  })

  test('admin users can create a room and send a message', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await page.goto('/rooms')
    await page.getByRole('button', { name: '新規', exact: true }).click()

    const roomName = `E2Eルーム-${Date.now()}`
    await page.getByPlaceholder('例: 介護スタッフ連絡板').fill(roomName)
    await page.getByRole('button', { name: 'ルームを作成' }).click()

    await expect(page).toHaveURL(/\/rooms\/\d+$/)
    await expect(page.getByRole('heading', { name: roomName })).toBeVisible()

    const message = `E2Eメッセージ-${Date.now()}`
    await page.getByPlaceholder('メッセージを入力...').fill(message)
    await page.locator('button[type="submit"]').last().click()

    await expect(page.getByText(message)).toBeVisible()
  })

  test('admin users can register a client from the clients page', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await page.goto('/clients')
    await page.getByRole('button', { name: '新規登録' }).click()

    const clientName = `E2E利用者-${Date.now()}`
    await page.getByLabel('部署（チーム）').selectOption({ index: 1 })
    await page.getByLabel('お名前').fill(clientName)
    await page.getByLabel('住所').fill('東京都渋谷区テスト1-2-3')
    await page.getByRole('button', { name: '登録する' }).click()

    await expect(page.getByText(clientName)).toBeVisible()
    await expect(page.getByText('東京都渋谷区テスト1-2-3')).toBeVisible()
  })

  test('admin users can edit a client from the clients page', async ({ page, request }) => {
    const scenario = await seedWorkStatusScenario(request)

    await login(page, scenario.admin.email, scenario.admin.password)
    await page.goto('/clients')
    await page.getByText(scenario.client.name).click()

    const updatedAddress = '東京都港区テスト7-8-9'
    await page.getByLabel('住所').fill(updatedAddress)
    await page.getByRole('button', { name: '更新する' }).click()

    await expect(page.getByText(scenario.client.name)).toBeVisible()
    await expect(page.getByText(updatedAddress)).toBeVisible()
  })

  test('admin users can view the empty work statuses page', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await page.goto('/work-statuses')

    await expect(page.getByRole('heading', { name: '勤務状況' })).toBeVisible()
    await expect(page.getByText(/^出勤: 0$/)).toBeVisible()
    await expect(page.getByText(/^未出勤: 0$/)).toBeVisible()
    await expect(page.getByText('指定された日付のシフトはありません。')).toBeVisible()
  })

  test('admin users can view seeded work statuses data', async ({ page, request }) => {
    const scenario = await seedWorkStatusScenario(request)

    await login(page, scenario.admin.email, scenario.admin.password)
    await page.goto('/work-statuses')

    await expect(page.getByText(/^出勤: 1$/)).toBeVisible()
    await expect(page.getByText(/^未出勤: 0$/)).toBeVisible()
    await expect(page.getByRole('heading', { name: scenario.client.name })).toBeVisible()
    await expect(page.getByText(scenario.employee.name)).toBeVisible()
    await expect(page.getByText(`${scenario.shift.start_time} - ${scenario.shift.end_time}`)).toBeVisible()
    await expect(page.getByText(/^出勤$/)).toBeVisible()
  })

  test('admin users can update an employee from the users page', async ({ page, request }) => {
    const scenario = await seedWorkStatusScenario(request)

    await login(page, scenario.admin.email, scenario.admin.password)
    await page.goto('/users')

    await page.getByText(scenario.employee.name).click()

    const updatedAddress = '東京都新宿区テスト4-5-6'
    await page.getByLabel('住所').fill(updatedAddress)
    await page.getByRole('button', { name: '更新する' }).click()

    await expect(page.getByText(scenario.employee.name)).toBeVisible()
    await expect(page.getByText(updatedAddress)).toBeVisible()
  })

  test('employees can mark their today shift as worked from user shifts', async ({ page, request }) => {
    const scenario = await seedWorkStatusScenario(request, { work_status: 'not_work' })

    await login(page, scenario.employee.email, scenario.employee.password, /\/user-shifts$/)
    await page.goto('/user-shifts')

    await expect(page.getByText('本日のシフト')).toBeVisible()
    await expect(page.getByText(scenario.client.name).first()).toBeVisible()
    await page.getByRole('button', { name: '出勤する' }).click()

    await expect(page.getByRole('button', { name: '出勤済み' })).toBeVisible()
  })

  test('authenticated users can sign out and return to the login page', async ({ page, request }) => {
    await loginAsAdmin(page, request)

    await page.getByRole('button', { name: 'ログアウト' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
  })
})
