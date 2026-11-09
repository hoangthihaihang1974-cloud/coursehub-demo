import { test, expect } from "@playwright/test";
const backend = "http://127.0.0.1:8000";

test("real API: read, filters, validation, 201/409/204, reload, history, 390px and recovery", async ({ page, context, request }) => {
  const base = await (await request.get(backend + "/sections")).json();
  const section = base.find(row => row.class_id === "WEB-01");
  const ids = ["22000004", "22000003"];
  for (const id of ids) {
    const current = await (await request.get(backend + "/students/" + id + "/enrollments")).json();
    expect(current.some(row => row.class_section_id === "WEB-01"), "Test requires no existing WEB-01 for " + id).toBe(false);
  }
  expect(section.remaining, "Test needs the standard one-free-seat WEB-01 fixture").toBe(1);
  const jsErrors = [];
  page.on("pageerror", error => jsErrors.push(error.message));
  page.on("dialog", dialog => dialog.accept());
  let created = false;
  try {
    await page.goto("/");
    const row = page.getByTestId("section-WEB-01");
    await expect(row).toBeVisible();
    await page.getByLabel("Tìm lớp / học phần").fill("no-such-course");
    await expect(page.getByText("Không có lớp phù hợp với bộ lọc.")).toBeVisible();
    await page.getByLabel("Tìm lớp / học phần").fill("");
    await page.getByLabel("Học phần", { exact: true }).selectOption("INT2205");
    await expect(row).toHaveCount(0);
    await page.getByLabel("Học phần", { exact: true }).selectOption("");
    await page.getByLabel("Mã sinh viên").fill("123");
    await page.getByRole("button", { name: "Xem đăng ký", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("8 chữ số");
    await page.getByLabel("Mã sinh viên").fill("99999999");
    await page.getByRole("button", { name: "Xem đăng ký", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("404");
    await expect(row).toHaveCount(0);
    await page.getByLabel("Mã sinh viên").fill(ids[0]);
    await page.getByRole("button", { name: "Xem đăng ký", exact: true }).click();
    await expect(row).toBeVisible();
    const other = await context.newPage();
    await other.goto("/");
    await other.getByLabel("Mã sinh viên").fill(ids[1]);
    await other.getByRole("button", { name: "Xem đăng ký", exact: true }).click();
    const otherRow = other.getByTestId("section-WEB-01");
    await expect(otherRow.getByRole("button", { name: "Đăng ký", exact: true })).toBeEnabled();
    const post = page.waitForResponse(r => r.url().endsWith("/enrollments") && r.request().method() === "POST");
    await row.getByRole("button", { name: "Đăng ký", exact: true }).click();
    expect((await post).status()).toBe(201); created = true;
    await expect(row.getByRole("button", { name: "Đã đăng ký", exact: true })).toBeDisabled();
    await page.reload();
    await expect(row.getByRole("button", { name: "Đã đăng ký", exact: true })).toBeDisabled();
    const conflict = other.waitForResponse(r => r.url().endsWith("/enrollments") && r.request().method() === "POST");
    await otherRow.getByRole("button", { name: "Đăng ký", exact: true }).click();
    expect((await conflict).status()).toBe(409);
    await expect(other.getByRole("alert")).toContainText("409");
    await expect(otherRow.getByRole("button", { name: "Hết chỗ", exact: true })).toBeDisabled();
    await other.close();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const deletion = page.waitForResponse(r => r.request().method() === "DELETE");
    await page.locator(".enrollments li").filter({ has: page.getByText("WEB-01", { exact: true }) })
      .getByRole("button", { name: "Hủy đăng ký", exact: true }).click();
    expect((await deletion).status()).toBe(204); created = false;
    await expect(row.getByRole("button", { name: "Đăng ký", exact: true })).toBeEnabled();
    await expect(page.getByRole("heading", { name: "4. Lịch sử đăng ký" })).toBeVisible();
    await page.route(backend + "/**", route => route.abort());
    await page.getByRole("button", { name: "Tải lại dữ liệu", exact: true }).click();
    await expect(page.getByRole("alert")).toContainText("Backend/CORS");
    await expect(row).toHaveCount(0);
    await page.unroute(backend + "/**");
    await page.getByRole("button", { name: "Tải lại dữ liệu", exact: true }).click();
    await expect(row).toBeVisible();
    await page.screenshot({ path: "test-results/coursehub-mobile.png", fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: "test-results/coursehub-desktop.png", fullPage: true });
    expect(jsErrors).toEqual([]);
  } finally {
    if (created) await request.delete(backend + "/enrollments/" + ids[0] + "/WEB-01");
    const after = await (await request.get(backend + "/sections")).json();
    expect(after).toEqual(base);
  }
});

test("history endpoint: validation, stable pagination, filtering and unknown student", async ({ request }) => {
  const url = backend + "/enrollment-events";
  expect((await request.get(url + "?student_id=22000004&limit=101")).status()).toBe(422);
  expect((await request.get(url + "?student_id=22000004&skip=-1")).status()).toBe(422);
  expect((await request.get(url + "?student_id=22000004&event_type=INVALID")).status()).toBe(422);
  expect((await request.get(url + "?student_id=99999999")).status()).toBe(404);
  const all = await (await request.get(url + "?student_id=22000004&limit=2")).json();
  const first = await (await request.get(url + "?student_id=22000004&limit=1")).json();
  const second = await (await request.get(url + "?student_id=22000004&limit=1&skip=1")).json();
  expect([...first, ...second]).toEqual(all);
  const filtered = await (await request.get(url + "?student_id=22000004&event_type=CANCELLED")).json();
  expect(filtered.every(row => row.event_type === "CANCELLED")).toBe(true);
});
