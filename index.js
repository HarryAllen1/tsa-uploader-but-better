// @ts-check

import puppeteer from 'puppeteer-extra';
import { data } from './data.js';
import 'dotenv/config';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

/**
 * @param {number} ms
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
	headless: false,
	timeout: 0,
});

const page = await browser.newPage();
page.setUserAgent(
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
);
await page.goto('https://www.registermychapter.com/tsa/wa/Register.asp');

await page.waitForNavigation({
	timeout: 0,
});
await page.waitForSelector('a[href="SchoolInfo.asp"');
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
