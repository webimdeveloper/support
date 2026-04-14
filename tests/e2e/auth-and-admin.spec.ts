import { expect, test } from '@playwright/test'

test('login page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
})

test('unauthenticated dashboard access redirects to login', async ({ page }) => {
  await page.goto('/dashboard/demo/example-com')
  await expect(page).toHaveURL(/\/login$/)
})

test.describe('admin flow', () => {
  test.skip(!process.env.E2E_ADMIN_USER || !process.env.E2E_ADMIN_PASSWORD, 'Admin credentials are required for admin flow')

  test('admin can access dashboard and see add client button', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Site Name / Username').fill(process.env.E2E_ADMIN_USER!)
    await page.getByLabel('Password').fill(process.env.E2E_ADMIN_PASSWORD!)
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Client' })).toBeVisible()
  })
})
