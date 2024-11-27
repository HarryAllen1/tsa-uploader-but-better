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

const browser = await puppeteer.connect({
	browserWSEndpoint: process.env.WSS_ENDPOINT_URL,
});

const page = await browser.newPage();
page.setUserAgent(
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
);
await page.goto('https://www.registermychapter.com/tsa/wa/Register.asp');

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
		switch (user.tShirt.split(' ')[1]) {
			case 'S': {
				user.tShirt += 'mall';
				break;
			}
			case 'M': {
				user.tShirt += 'edium';
				break;
			}
			case 'L': {
				user.tShirt += 'arge';
				break;
			}
		}

		await page.select('select[name="TShirtSize"]', user.tShirt);
	}
	await page.$$eval('input[name="Sel"]', (els) => {
		for (const element of els) {
			if (!element.checked) continue;
			element.click();
		}
	});

	for (const event of user.events) {
		await page.$eval(`input[name="Sel"][value="${event.eventId}"]`, (element) => {
			if (element.checked) return;
			element.click();
		});

		if (event.isTeamEvent) {
			await page.$eval(
				`input[name="TeamNo${event.eventId}"]`,
				(element, teamNumber) => {
					element.value = String(teamNumber);
				},
				event.teamNumber,
			);

			if (event.isCaptain) {
				await page.$eval(`input[name="TeamCaptain${event.eventId}"]`, (element) => {
					if (element.checked) return;
					element.click();
				});
			}
		}
	}

	await page.click('input#SaveBtn1');
	await sleep(1000);
}

await page.goto('https://www.registermychapter.com/tsa/wa/Register.asp');
