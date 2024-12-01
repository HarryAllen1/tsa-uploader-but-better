# TSA Uploader

Created to streamline registering for WTSA state and regionals.

## Initially Adding Members

Before you can add events to members, you have to register everyone. Click "Add Students" at the bottom, click search, and run the following script in the console to automatically change everyone's attendance to "Competition Registration." Make sure you go over and ensure that it didn't select people it shouldn't have.

```js
document
	.querySelector('#f')
	.querySelectorAll('select[onchange]')
	.forEach((el) => {
		el.value = 'S';
		el.onchange();
	});
```

## Setup

Download Chrome, Node.js and PNPM.

Launch Chrome with the run dialog with the following command:

```sh
chrome --remote-debugging-port=9222
```

Go to [http://localhost:9222/json/version](http://localhost:9222/json/version) and copy the `webSocketDebuggerUrl` value.

Clone this repo, install dependencies with `pnpm i`, then create a `.env` file. Populate the following variables:

```[.env]
# regionals or state. State requires tShirtSize (see below)
MODE=""
# webSocketDebuggerUrl value
WSS_ENDPOINT_URL=""
```

Create a `data.js` file. Export a variable called `data`, which must have the following shape:

```ts
declare const data: Data;

type Data = Member[];

interface Member {
	// the number in the "ID" column in state registration
	waId: string;
	// only required when registering for state
	tShirt: TShirt;
	// not required, but helpful for debugging
	email: string;
	events: Events;
}

type TShirtGender = 'M' | 'F';
type TShirtSize = 'XS' | 'S' | 'Small' | 'M' | 'Medium' | 'L' | 'Large' | 'XL' | 'XXL' | 'XXXL';
type TShirt = `${TShirtGender} ${TShirtSize}`;

type Events = Event[];
interface Event {
	// not required but useful for debugging
	event: string;
	// inspect-element an event. See script below for acquiring.
	eventId: number;
	teamNumber: number;
	// If the max team size is one, this should be false.
	isTeamEvent: boolean;
	isCaptain: true;
}
```

```js
// script to get event IDs.
// Paste into console when editing someone's events.

document
	.querySelector('form[name="AddNew"] tbody table[border] tbody')
	.childNodes.forEach((element, i) => {
		if (i === 0 || element.nodeType === Node.TEXT_NODE) return;

		console.log(
			`${element.querySelector('font').innerHTML}: ${element.querySelector('input[name="Sel"]').value}`,
		);
	});
```

Then, in your launched Chrome instance, open a new tab, visit [https://www.registermychapter.com/tsa/wa/Register.asp](https://www.registermychapter.com/tsa/wa/Register.asp), and log in. Then, with that tab open, run `node .`. The program will navigate to each user and set their events.
