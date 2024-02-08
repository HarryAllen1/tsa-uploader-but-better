import { launch } from 'puppeteer';
import { data } from './data.js';
import 'dotenv/config';

/**
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await launch();

const page = await browser.newPage();
await page.goto('https://www.registermychapter.com/tsa/wa/Register.asp');
await page.$eval(
	'input[name="UserName"]',
	(el, process) => {
		el.value = process.env.USERNAME;
	},
	process,
);
await page.$eval(
	'input[name="Password"]',
	(el, process) => {
		el.value = process.env.PASSWORD;
	},
	process,
);
await page.$eval('input[name="SubmitBtn"]', (el) => {
	el.click();
});
await page.waitForNavigation();
for (const user of data.filter((u) => u.events.length > 0)) {
	console.log(user.email);
	await page.goto(`https://www.registermychapter.com/tsa/wa/AddRegister.asp?PID=${user.waId}`);

	if (process.env.MODE === 'regionals') {
		if (await page.$('.errmsg')) {
			console.log('Error found; skipping');
			continue;
		}
	} else {
		if (user.gender === 'Male' || user.gender === 'Non-Binary') {
			switch (user.tShirt) {
				case 'WXS':
					user.tShirt = 'M XS';
					break;
				case 'S':
					user.tShirt = 'M Small';
					break;
				case 'M':
					user.tShirt = 'M Medium';
					break;
				case 'L':
					user.tShirt = 'M Large';
					break;
				case 'XL':
					user.tShirt = 'M XL';
					break;
				case 'XXL':
					user.tShirt = 'M XXL';
					break;
			}
		} else {
			switch (user.tShirt) {
				case 'WXS':
					user.tShirt = 'W XS';
					break;
				case 'S':
					user.tShirt = 'W Small';
					break;
				case 'M':
					user.tShirt = 'W Medium';
					break;
				case 'L':
					user.tShirt = 'W Large';
					break;
				case 'XL':
					user.tShirt = 'W XL';
					break;
				case 'XXL':
					user.tShirt = 'W XXL';
					break;
			}
		}
		await page.select('select[name="TShirtSize"]', user.tShirt);
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
