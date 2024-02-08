import { launch } from 'puppeteer';
import { data } from './data.js';
import 'dotenv/config';

/**
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await launch({
	headless: false,
});

const page = await browser.newPage();
await page.goto('https://www.registermychapter.com/tsa/wa/Register.asp');
await page.$eval('input[name="UserName"]', (el) => {
	el.value = process.env.USERNAME;
});
await page.$eval('input[name="Password"]', (el) => {
	el.value = process.env.PASSWORD;
});
await page.$eval('input[name="SubmitBtn"]', (el) => {
	el.click();
});
await page.waitForNavigation();
for (const user of data.filter((u) => u.events.length > 0)) {
	console.log(user.email);
	await page.goto(`https://www.registermychapter.com/tsa/wa/AddRegister.asp?PID=${user.waId}`);

	if (await page.$('.errmsg')) {
		console.log('Error found; skipping');
		continue;
	}

	await page.$$eval('input[name="Sel"]', (els) => {
		els.forEach((el) => {
			if (!el.checked) return;
			el.click();
		});
	});

	for (const event of user.events) {
		await page.$eval(`input[name="Sel"][value="${event.eventId}"]`, (el) => {
			if (el.checked) return;
			el.click();
		});

		if (event.isTeamEvent) {
			await page.$eval(
				`input[name="TeamNo${event.eventId}"]`,
				(el, teamNumber) => {
					el.value = String(teamNumber);
				},
				event.teamNumber,
			);

			if (event.isCaptain) {
				await page.$eval(`input[name="TeamCaptain${event.eventId}"]`, (el) => {
					if (el.checked) return;
					el.click();
				});
			}
		}
	}

	await page.click('input#SaveBtn1');
	await sleep(1000);
}

await page.close();
await browser.close();
