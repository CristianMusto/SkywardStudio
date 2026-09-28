import { expect, test } from '@playwright/test';
import { ENGINE_STRINGS } from '../src/app/i18n/engine-strings';
import { UI_STRINGS } from '../src/app/i18n/ui-strings';

const EN = { ...ENGINE_STRINGS.en, ...UI_STRINGS.en };
const IT = { ...ENGINE_STRINGS.it, ...UI_STRINGS.it };

test.describe('deep links', () => {
  test('opens the Skyward case study directly', async ({ page }) => {
    await page.goto('/en/work/skyward');
    await expect(page.getByRole('heading', { name: EN.skywardSJourney })).toBeVisible();
    await expect(page.getByRole('heading', { name: EN.fromTheSketchbook })).toBeAttached();
  });

  test('serves the Italian version on /it', async ({ page }) => {
    await page.goto('/it/work/skyward');
    await expect(page.getByRole('heading', { name: IT.skywardSJourney })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  });

  test('shows the 404 dialog for unknown paths', async ({ page }) => {
    await page.goto('/en/nowhere');
    await expect(page.getByRole('alertdialog')).toBeVisible();
  });
});

test.describe('galaxy map', () => {
  test('skips the intro and jumps to a system with the keyboard', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: EN.skip }).click();
    // System labels become visible on the first map frame; a hidden button cannot take focus.
    const work = page.getByRole('button', { name: new RegExp('^' + EN.work) }).first();
    await expect(work).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(work).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/en\/work$/, { timeout: 15_000 });
  });

  test('Escape from a planet page returns to the system, then to the map', async ({ page }) => {
    await page.goto('/en/work/skyward');
    await expect(page.getByRole('heading', { name: EN.skywardSJourney })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/en\/work$/);
    // Inside a system the planet stays selected: the first Esc deselects it, the second leaves.
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test('browser back follows the engine history', async ({ page }) => {
    await page.goto('/en/work');
    await page.goto('/en/work/skyward');
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/work$/);
  });
});

test.describe('keyboard shortcuts', () => {
  test('opens with ? and closes with Esc without leaving the page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'No keyboard on touch devices');
    await page.goto('/en/work/skyward');
    await expect(page.getByRole('heading', { name: EN.skywardSJourney })).toBeVisible();
    await page.keyboard.press('?');
    const dialog = page.getByRole('dialog', { name: EN.keyboardShortcuts });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/en\/work\/skyward$/);
  });
});

test.describe('contact form', () => {
  test('shows errors next to the fields on an empty submit', async ({ page }) => {
    await page.goto('/en/contact/message');
    await page.getByRole('button', { name: EN.sendMessage }).click();
    await expect(page.getByText(EN.enterYourName)).toBeVisible();
    await expect(page.locator('#f-nome')).toBeFocused();
  });
});
