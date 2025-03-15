import puppeteer from "puppeteer";
//46eb202f87eb01b550c72fe637333c098ae625e0a03ed5cf48222efcc94d7c6ai0
let url = "https://blue.vermilion.place/content/46eb202f87eb01b550c72fe637333c098ae625e0a03ed5cf48222efcc94d7c6ai0";

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
let ss = await page.screenshot({ fullPage: false });
console.log(ss);
//console.log(response.status());
