const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs/promises');
const { checkFixed, checkTemporary, resolveSource, freeIntervals, occupiedOnDate, sourceMatches } = require('../dist/modules/schedules/schedule-conflict.engine');

async function main() {
  const { default: puppeteer } = await import('puppeteer-core');
  const browser = await puppeteer.launch({ executablePath: process.env.EDUTRACK_CHROME_EXECUTABLE_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, pipe: true, timeout: 15000 });
  const artifacts = path.resolve(__dirname, '../../.schedule-qa');
  await fs.mkdir(artifacts, { recursive: true });
  const classId = '6a990ef27ba2731df96fdc22';
  const otherId = '6a990ef27ba2731df96fdc23';
  const user = { id: '6a990ef27ba2731df96fdc24', fullName: 'Giáo viên kiểm thử', email: 'qa@example.test', role: 'teacher', isEmailVerified: true };
  const slots = [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }, { dayOfWeek: 1, startTime: '13:00', endTime: '14:00' }];
  const fixed = { id: '6a990ef27ba2731df96fdc25', version: 1, effectiveFrom: '2026-08-01T00:00:00+07:00', effectiveTo: null, schedules: slots };
  const classroom = { id: classId, teacherId: user.id, name: 'Tiếng Anh cơ bản', imageUrl: '/logo.png', description: 'Lớp kiểm thử', colorIndex: 0, regularPrice: 150000, makeupPrice: 150000, status: 'active', studentCount: 0, students: [], latestFixedSchedule: fixed };
  const snapshot = { classes: new Map([[classId, classroom.name], [otherId, 'Lớp nâng cao']]), versions: [
    { id: fixed.id, classId, version: 1, from: '2026-08-01', schedules: slots },
    { id: 'v-b', classId: otherId, version: 1, from: '2026-08-01', schedules: [{ dayOfWeek: 1, startTime: '11:00', endTime: '12:00' }] },
  ], overrides: [{ id: 'future-extra', classId: otherId, action: 'extra', newDate: '2028-09-04', startTime: '09:45', endTime: '10:15' }] };
  const requests = [];
  const errors = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1000 });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.setRequestInterception(true);
    page.on('request', async (request) => {
      const url = new URL(request.url());
      if (!url.pathname.startsWith('/api/')) { await request.continue(); return; }
      const route = url.pathname.slice(4);
      const body = request.postData() ? JSON.parse(request.postData()) : {};
      if (request.method() !== 'OPTIONS') requests.push({ route, method: request.method(), body });
      let result; let status = 200;
      try {
        if (request.method() === 'OPTIONS') result = {};
        else if (route === '/auth/refresh') result = { accessToken: 'test-only-token', user };
        else if (route === '/auth/me') result = user;
        else if (route === `/classes/${classId}`) result = classroom;
        else if (route === `/classes/${classId}/schedules`) result = { fixedSchedules: [fixed], latestFixedSchedule: fixed, temporarySchedules: [] };
        else if (route === '/schedules/week') {
          const requested = new Date(`${url.searchParams.get('weekStart')}T00:00:00Z`);
          requested.setUTCDate(requested.getUTCDate() - ((requested.getUTCDay() || 7) - 1));
          const days = Array.from({ length: 7 }, (_, i) => ({ date: new Date(+requested + i * 86400000).toISOString().slice(0, 10), dayOfWeek: i + 1 }));
          result = { weekStart: days[0].date, weekEnd: days[6].date, days, classes: [classroom], events: slots.map((s, i) => ({ ...s, id: `fixed:${fixed.id}:${days[0].date}:${s.startTime}:${s.endTime}`, classId, className: classroom.name, classImageUrl: '/logo.png', colorIndex: 0, date: days[0].date, type: 'fixed', topic: `Buổi học ${i + 1}`, content: 'Luyện từ vựng và phát âm' })) };
        } else if (route === '/schedules/conflicts/check-fixed') result = checkFixed(snapshot, body.classId, body.effectiveFrom, body.schedules);
        else if (route === '/schedules/conflicts/check-temporary') result = checkTemporary(snapshot, { ...body, id: 'draft' }, body.ignoreOverrideId);
        else if (route === '/schedules/source-slots') result = slots;
        else if (route === '/schedules/availability') {
          let busy;
          if (body.mode === 'fixed') busy = checkFixed(snapshot, body.classId, body.date, [{ dayOfWeek: body.dayOfWeek, startTime: body.startTime, endTime: body.endTime }]).blockingConflicts;
          else {
            const source = body.originalDate ? resolveSource(snapshot, { ...body, id: 'draft', action: 'reschedule' }) : undefined;
            busy = occupiedOnDate(snapshot, body.date).filter((e) => !source || !sourceMatches(e, source));
          }
          result = { slots: freeIntervals(busy, body.startTime, body.endTime, body.duration), warnings: [] };
        } else if (route.endsWith('/schedules/fixed')) result = { ...fixed, ...body };
        else if (route.endsWith('/schedules/temporary')) result = { id: 'new-temp', classId, ...body };
        else result = [];
      } catch (error) { status = 400; result = { message: error.message }; }
      await request.respond({ status, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': 'http://localhost:3002', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'authorization,content-type', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS' }, body: JSON.stringify(result) });
    });
    const clickText = async (text, exact = true) => {
      const selector = `::-p-xpath(//button[${exact ? `normalize-space(.)='${text}'` : `contains(normalize-space(.),'${text}')`}])`;
      await page.waitForSelector(selector, { visible: true });
      await page.click(selector);
    };
    const fillLabel = async (label, value) => {
      const handle = await page.waitForSelector(`::-p-xpath(//label[span[normalize-space(.)='${label}']]/input)`, { visible: true });
      await handle.click(); await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control'); await handle.press('Backspace'); await handle.type(value, { delay: 25 }); await handle.press('Tab');
    };
    const waitText = (text) => page.waitForFunction((value) => document.body.innerText.includes(value), {}, text);
    await page.goto(`http://localhost:3002/classes/${classId}`, { waitUntil: 'networkidle0' });
    await clickText('Thời khóa biểu');
    await waitText('Phiên bản 1');
    await clickText('Lịch cố định');
    await fillLabel('Bắt đầu', '1100'); await fillLabel('Kết thúc', '1200');
    await clickText('Lưu lịch'); await waitText('Trùng lịch, vui lòng chọn giờ khác');
    assert.equal(requests.filter((r) => r.route.endsWith('/schedules/fixed')).length, 0);
    await page.screenshot({ path: path.join(artifacts, 'fixed-conflict-desktop.png') });
    await fillLabel('Bắt đầu', '0930'); await fillLabel('Kết thúc', '1030');
    await clickText('Lưu lịch'); await waitText('Xác nhận lưu lịch cố định');
    await waitText('Có lịch tạm trùng');
    assert.equal(requests.filter((r) => r.route.endsWith('/schedules/fixed')).length, 0);
    await page.screenshot({ path: path.join(artifacts, 'fixed-warning-confirm.png') });
    const dialogs = await page.$$('div[role="dialog"]');
    const confirmButtons = await dialogs[dialogs.length - 1].$$('button');
    await confirmButtons[confirmButtons.length - 1].click();
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
    assert.equal(requests.filter((r) => r.route.endsWith('/schedules/fixed')).length, 1);
    await clickText('Tạo lịch tạm');
    await clickText('Tìm giờ trống'); await clickText('Tìm'); await waitText('06:00 - 09:00');
    const widths = [];
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewport({ width, height: 900 });
      const size = await page.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth, dialog: [...document.querySelectorAll('[role="dialog"]')].at(-1).firstElementChild.getBoundingClientRect().width }));
      assert.ok(size.page <= width, `Page overflows ${width}: ${size.page}`);
      assert.ok(size.dialog <= width, `Dialog overflows ${width}`);
      widths.push(size);
      await page.screenshot({ path: path.join(artifacts, `availability-${width}.png`) });
    }
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto('http://localhost:3002/schedule', { waitUntil: 'networkidle0' });
    await clickText('Buổi học 1', false);
    await clickText('Dời lịch');
    await fillLabel('Giờ bắt đầu', '0930'); await fillLabel('Giờ kết thúc', '1130');
    await clickText('Lưu lịch dời'); await waitText('Trùng lịch, vui lòng chọn giờ khác');
    await fillLabel('Giờ kết thúc', '1030');
    await clickText('Lưu lịch dời'); await waitText('Xác nhận dời lịch');
    const check = requests.filter((r) => r.route === '/schedules/conflicts/check-temporary').at(-1);
    assert.equal(check.body.originalStartTime, '09:00'); assert.equal(check.body.originalEndTime, '10:00');
    assert.equal(requests.filter((r) => r.route.endsWith('/schedules/temporary')).length, 0);
    assert.deepEqual(errors, []);
    const report = { assertions: 'fixed conflict blocked; fixed temporary warning confirm; mutation deferred until confirmation; exact source excluded; other slot blocked; desktop/mobile no overflow', viewports: widths, pageErrors: errors };
    await fs.writeFile(path.join(artifacts, 'ui-report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    const page = (await browser.pages()).at(-1);
    if (page) {
      await page.screenshot({ path: path.join(artifacts, 'failure.png') });
      console.error('Visible page:', (await page.$eval('body', (el) => el.innerText)).slice(-4000));
      console.error('Checks:', requests.filter((r) => r.route.includes('/conflicts/')));
      console.error('Inputs:', await page.$$eval('input', (items) => items.map((item) => ({ type: item.type, value: item.value }))));
    }
    throw error;
  } finally { await browser.close(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
