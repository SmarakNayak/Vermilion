import puppeteer from "puppeteer";
//46eb202f87eb01b550c72fe637333c098ae625e0a03ed5cf48222efcc94d7c6ai0
//1904a95b8bcded81476fa589cff59d04b9a17665f6f935a0e4bb59a646895a69i0
//47bc38d3c86465992525060c2db4d9c9fd1ad7d15e45d9f756ec17a3454eecc0i0
//47bc38d3c86465992525060c2db4d9c9fd1ad7d15e45d9f756ec17a3454eecc0i0
let url = "https://blue.vermilion.place/content/4d326dbaaa80bad89b2fa8e1b2325195c523b64df8836be9d9d9de0b312d2670i0";

let browser = await puppeteer.launch({
  headless: false,
  protocolTimeout: 10000,
});

let page = await browser.newPage();
await page.setViewport({ width: 600, height: 600 });
page.on('dialog', async dialog => { // handle dialogs that block navigation (.goto)
  console.log(dialog.message());
});

let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
let ss = await page.screenshot({ fullPage: true });
console.log(ss);
//console.log(response.status());
