import puppeteer from "puppeteer";

let url = "https://blue.vermilion.place/content/8e7839c80db434ff6f2ecb5c9ebf954152fbe492ea00ec58928c0da41f625bc2i0";

let browser = await puppeteer.launch({
  headless: true,
});

let page = await browser.newPage();
await page.setViewport({ width: 600, height: 600 });
let response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

console.log(response.status());
