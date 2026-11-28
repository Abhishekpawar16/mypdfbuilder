import { test, expect } from '@playwright/test';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

let fixtures;

test.beforeAll(async () => {
  fixtures = await fs.mkdtemp(path.join(os.tmpdir(), 'mypdfbuilder-e2e-'));

  for (const [name, pageCount] of [['first.pdf', 1], ['two-pages.pdf', 2]]) {
    const pdf = await PDFDocument.create();
    for (let index = 0; index < pageCount; index += 1) {
      const page = pdf.addPage([300, 400]);
      page.drawText(`Browser test page ${index + 1}`, {
        x: 30,
        y: 340,
        size: 16,
        color: rgb(0.1, 0.1, 0.2),
      });
    }
    await fs.writeFile(path.join(fixtures, name), await pdf.save());
  }

  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/8vkAAAAASUVORK5CYII=',
    'base64',
  );
  await fs.writeFile(path.join(fixtures, 'photo-a.png'), png);
  await fs.writeFile(path.join(fixtures, 'photo-b.png'), png);
  await fs.writeFile(path.join(fixtures, 'note.txt'), 'Text imported in the browser test.');
});

test.afterAll(async () => {
  if (fixtures) await fs.rm(fixtures, { recursive: true, force: true });
});

const toolRoutes = [
  ['text-to-pdf', 'Text to PDF'],
  ['jpg-to-pdf', 'JPG to PDF'],
  ['merge-pdf', 'Merge PDF'],
  ['split-pdf', 'Split PDF'],
  ['compress-pdf', 'Compress PDF'],
  ['pdf-to-jpg', 'PDF to JPG'],
  ['pdf-to-text', 'PDF to Text'],
  ['html-to-pdf', 'HTML to PDF'],
  ['word-to-pdf', 'Word to PDF'],
  ['powerpoint-to-pdf', 'PowerPoint to PDF'],
  ['excel-to-pdf', 'Excel to PDF'],
  ['pdf-to-word', 'PDF to Word'],
  ['pdf-to-powerpoint', 'PDF to PowerPoint'],
  ['pdf-to-excel', 'PDF to Excel'],
  ['pdf-to-pdfa', 'PDF Archive Metadata'],
  ['edit-pdf', 'Edit PDF'],
];

test('every direct tool URL opens its matching workflow', async ({ page }) => {
  for (const [slug, heading] of toolRoutes) {
    const response = await page.goto(`/${slug}/`);
    expect(response.status(), slug).toBe(200);
    await expect(page.locator('#generator h2').first()).toHaveText(heading);
    expect(new URL(page.url()).pathname).toBe(`/${slug}/`);
  }
});

test('tool tabs keep URL, browser history, and file selection in sync', async ({ page }) => {
  await page.goto('/merge-pdf/');

  const chooseFile = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Choose file', exact: true }).first().click();
  const chooser = await chooseFile;
  await chooser.setFiles([path.join(fixtures, 'first.pdf'), path.join(fixtures, 'two-pages.pdf')]);
  await expect(page.locator('#generator ul li')).toHaveCount(2);
  expect(new URL(page.url()).pathname).toBe('/merge-pdf/');

  const activeInput = page.locator('#generator input[type="file"]').first();
  await activeInput.setInputFiles(path.join(fixtures, 'first.pdf'));
  await expect(page.locator('#generator ul li')).toHaveCount(3);
  await page.locator('#generator ul li').nth(2).getByRole('button').nth(2).click();
  await expect(page.locator('#generator ul li')).toHaveCount(2);

  const [mergeDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Merge & Download PDF' }).click(),
  ]);
  expect(mergeDownload.suggestedFilename()).toBe('merged-mypdfbuilder.pdf');
  expect(new URL(page.url()).pathname).toBe('/merge-pdf/');

  await page.locator('#generator').getByRole('button', { name: 'JPG to PDF', exact: true }).click();
  await page.waitForURL('**/jpg-to-pdf/');
  await page.goBack();
  await page.waitForURL('**/merge-pdf/');
  await expect(page.locator('#generator h2').first()).toHaveText('Merge PDF');
  await page.goForward();
  await page.waitForURL('**/jpg-to-pdf/');

  await page.locator('#generator input[type="file"]').first().setInputFiles([
    path.join(fixtures, 'photo-a.png'),
    path.join(fixtures, 'photo-b.png'),
  ]);
  await expect(page.locator('#generator img[alt^="photo-"]')).toHaveCount(2);
  expect(new URL(page.url()).pathname).toBe('/jpg-to-pdf/');
  const [imageDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Convert to PDF' }).click(),
  ]);
  expect(imageDownload.suggestedFilename()).toBe('images-mypdfbuilder.pdf');
  expect(new URL(page.url()).pathname).toBe('/jpg-to-pdf/');
});

test('Split PDF and Text to PDF keep their selected routes after file input', async ({ page }) => {
  await page.goto('/split-pdf/');
  await page.locator('#generator input[type="file"]').first().setInputFiles(path.join(fixtures, 'two-pages.pdf'));
  await expect(page.getByText(/two-pages\.pdf \(2 pages\)/)).toBeVisible();
  await page.locator('#generator input[type="text"]').fill('1-1');
  const [splitDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Extract & Download PDF' }).click(),
  ]);
  expect(splitDownload.suggestedFilename()).toBe('split-two-pages.pdf');
  expect(new URL(page.url()).pathname).toBe('/split-pdf/');

  await page.goto('/text-to-pdf/');
  await page.locator('#generator input[type="file"]').first().setInputFiles(path.join(fixtures, 'note.txt'));
  await expect(page.locator('#generator textarea[aria-label="Document text editor"]')).toHaveValue(
    'Text imported in the browser test.',
  );
  expect(new URL(page.url()).pathname).toBe('/text-to-pdf/');
  const [textDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Generate & Download PDF' }).click(),
  ]);
  expect(textDownload.suggestedFilename()).toMatch(/\.pdf$/i);
});

test('cookie choices can be customized, saved, reopened, and changed', async ({ page }) => {
  await page.goto('/text-to-pdf/');
  const banner = page.getByRole('region', { name: 'Privacy and cookie preferences' });
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Customize' }).click();

  const checks = banner.locator('input[type="checkbox"]');
  await expect(checks).toHaveCount(3);
  await expect(checks.nth(0)).toBeChecked();
  await checks.nth(1).check();
  await checks.nth(2).check();
  await banner.getByRole('button', { name: 'Save Preferences' }).click();
  await expect(banner).toHaveCount(0);
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mypdfbuilder_cookie_consent_v2')));
  expect(saved).toMatchObject({ essential: true, analytics: true, ads: true });

  await page.reload();
  await expect(page.getByRole('region', { name: 'Privacy and cookie preferences' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await expect(banner).toBeVisible();
  const reopened = banner.locator('input[type="checkbox"]');
  await expect(reopened.nth(1)).toBeChecked();
  await reopened.nth(1).uncheck();
  await banner.getByRole('button', { name: 'Save Preferences' }).click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mypdfbuilder_cookie_consent_v2')));
  expect(saved).toMatchObject({ essential: true, analytics: false, ads: true });

  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await banner.getByRole('button', { name: 'Reject Non-Essential' }).click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mypdfbuilder_cookie_consent_v2')));
  expect(saved).toMatchObject({ essential: true, analytics: false, ads: false });
  await page.getByRole('button', { name: 'Cookie Settings' }).click();
  await banner.getByRole('button', { name: 'Accept All' }).click();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('mypdfbuilder_cookie_consent_v2')));
  expect(saved).toMatchObject({ essential: true, analytics: true, ads: true });
});

test('policy links explain inactive analytics/ads and the regional CMP requirement', async ({ page }) => {
  await page.goto('/text-to-pdf/');
  await page
    .getByRole('region', { name: 'Privacy and cookie preferences' })
    .getByRole('button', { name: 'Reject Non-Essential' })
    .click();
  await expect(
    page.locator('script[src*="googletagmanager"], script[src*="google-analytics"], script[src*="adsbygoogle"]'),
  ).toHaveCount(0);

  await page.getByRole('button', { name: 'Privacy Policy' }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(/retention periods/i);
  await dialog.getByRole('button', { name: 'Close modal' }).click();

  await page.getByRole('button', { name: 'Cookie Policy' }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(/not a certified CMP/i);
  await expect(dialog).toContainText(/EEA, UK, or Switzerland/i);
});

test('tool layout stays within desktop, tablet, and mobile viewports', async ({ page }) => {
  for (const viewport of [{ width: 1365, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/merge-pdf/');
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(Math.max(dimensions.document, dimensions.body), JSON.stringify(viewport)).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});
