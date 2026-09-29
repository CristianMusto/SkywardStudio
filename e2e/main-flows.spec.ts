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

  test('hero buttons jump to the right system after coming back from another one', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('button', { name: EN.skip }).click();
    const work = page.getByRole('button', { name: new RegExp(EN.heroSeeWork) });
    const contact = page.getByRole('button', { name: EN.heroWriteMe });

    await work.click();
    await expect(page).toHaveURL(/\/en\/work$/, { timeout: 15_000 });
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/en\/?$/);

    // Regression: a leftover hover on Work used to send this jump to Work again.
    await contact.click();
    await expect(page).toHaveURL(/\/en\/contact$/, { timeout: 15_000 });
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/en\/?$/);

    await work.click();
    await expect(page).toHaveURL(/\/en\/work$/, { timeout: 15_000 });
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

test.describe('mobile layout', () => {
  const noHorizontalOverflow = async (page: import('@playwright/test').Page) => {
    const overflow = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const wide = [...document.querySelectorAll<HTMLElement>('body *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return false;
          for (let p = el.parentElement; p; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (s.overflowX === 'hidden' || s.overflowX === 'clip') return false;
          }
          return r.right > vw + 1 || r.left < -1;
        })
        .map((el) => el.className || el.tagName);
      return { scroll: document.documentElement.scrollWidth - vw, wide: wide.slice(0, 5) };
    });
    expect(overflow.scroll, 'page scrolls sideways').toBeLessThanOrEqual(0);
    expect(overflow.wide, 'elements outside the viewport').toEqual([]);
  };

  for (const lang of ['en', 'it'] as const) {
    const S = lang === 'en' ? EN : IT;

    test(`list view fits the screen (${lang})`, async ({ page, isMobile }) => {
      test.skip(!isMobile, 'Mobile layout only');
      await page.goto(`/${lang}`);
      await page.getByRole('button', { name: S.skip }).click();
      await page.getByRole('button', { name: S.list, exact: true }).click();
      const list = page.getByRole('region', { name: S.systemListView });
      await expect(list).toBeVisible();
      const box = await list.boundingBox();
      for (const item of await list.getByRole('button').all()) {
        const b = await item.boundingBox();
        expect(b && box && b.x >= box.x && b.x + b.width <= box.x + box.width + 1).toBeTruthy();
      }
      await noHorizontalOverflow(page);
    });

    for (const path of ['work', 'work/skyward', 'contact', 'contact/message']) {
      test(`/${lang}/${path} has no sideways scroll`, async ({ page, isMobile }) => {
        test.skip(!isMobile, 'Mobile layout only');
        await page.goto(`/${lang}/${path}`);
        await page.waitForLoadState('networkidle');
        await noHorizontalOverflow(page);
      });
    }
  }
});
