import puppeteer from 'puppeteer';
import staff from "./staffs.json";
import csvParser from 'csv-parser';
import fs from "node:fs";

const titleClass = "wp-block-post-title"
const postPath = "#acf-field_666d898832a6d-field_666d8b0332a70";
const namePath = "#acf-field_666d898832a6d-field_666d89d932a6f";
const photoCapitonPath = "#acf-field_666d898832a6d-field_66704668f1c33"
const departmentPath = "#acf-field_666d898832a6d-field_666d8b0b32a71"
const drawerPath = "#editor > div.edit-post-layout.is-mode-visual.is-sidebar-opened.has-metaboxes.interface-interface-skeleton.has-footer > div.interface-interface-skeleton__editor > div.interface-navigable-region.interface-interface-skeleton__header > div > div.edit-post-header__settings > div.interface-pinned-items > button"
const publishButtonClass = ".editor-post-publish-button__button"
const postAttributesHider = "#tabs-0-edit-post\/document-view > div:nth-child(3) > h2 > button"
const orderInput = ".components-input-control__input.css-r7q9dd.em5sgkm5"
const departmentName = "Physics"

const results = [];

const pages = [

  "che.engineering.unilorin.edu.ng",
  "ce.engineering.unilorin.edu.ng",
  "coe.engineering.unilorin.edu.ng",
  "eee.engineering.unilorin.edu.ng",

]

fs.createReadStream('staffs.csv')
  .pipe(csvParser())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log(results);

  });

async function runAutomation() {

  const browser = await puppeteer.launch({
    headless: false,
    acceptInsecureCerts: true,
    userDataDir: "C:/Users/Ione/AppData/Local/Google/Chrome/User Data/Default",
    timeout: 100_000
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  pages.forEach(async k => {
    const page = await browser.newPage();
    await page.setViewport({ height: 720, width: 1080, deviceScaleFactor: 2, hasTouch: true })


    await page.goto(`https://${k}/wp-admin/edit.php?post_type=page`, {
      timeout: 0
    })
  }
  )
}




const runBrowsers = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    acceptInsecureCerts: true,
    userDataDir: "C:/Users/Ione/AppData/Local/Google/Chrome/User Data/Default",
    timeout: 100_000
  });


  for (const s of results) {

    const page = await browser.newPage();
    await page.setViewport({ height: 720, width: 1080, deviceScaleFactor: 2, hasTouch: true })
    console.log(s)

    // Navigate the page to a URL.
    try {
      const response = await page.goto('https://physics.physicalsciences.unilorin.edu.ng/wp-admin/post-new.php?post_type=staffmember');
    } catch (error) {
      console.log("A navigation error occured")
      continue;
    }


    const name = (s.name as string).trim();
    const post = (s.post as string).trim();
    const number = (s.number as string).trim();
    const title = (s.title as string).trim();

    // await page.locator("label").filter((p) => p.innerText == "Academic Staff").click()
    await page.locator(`.${titleClass}`).fill(`${title} ${name}`);

    await page.click('input[name="acf[field_666d898832a6d][field_666d899f32a6e]"][value="Academic Staff"]');

    await page.locator(namePath).fill(`${title} ${name}`);
    await page.locator(photoCapitonPath).fill(`${title} ${name}`);
    await page.locator(departmentPath).fill(departmentName);
    await page.locator(postPath).fill(post);
    // await page.locator(drawerPath).click();
    // await page.locator(postAttributesHider).click();


    let order = 3;

    if (title.includes("Prof")) order = 1;
    else if (title.includes("Dr")) order = 2;

    const orderInputElement = await page.waitForSelector(orderInput);

    if (orderInputElement) {
      await page.locator(orderInput).click();
      await page.keyboard.press("Backspace");
      await page.locator(orderInput).fill(order.toString());
    }

    try {

      if (Number(number) > 0) {
        await page.click('.components-button.editor-post-featured-image__toggle');
        await page.waitForSelector(`li[aria-label="${number}"] .check`, {
          timeout: 10000
        }).catch(() => {
          console.log("Image doesn't exist")
          page.locator(".media-modal-close").click().catch(() => {
            "We will close it ourselves"
          })
        }).then(async () => {
          await page.click(`li[aria-label="${number}"]`);
          await page.click('.button.media-button.button-primary.button-large.media-button-select');
        })


      }

    } catch (e) {

    }





    // await page.locator(publishButtonClass).click();
    // await page.locator(publishButtonClass).click();


  }





  // if (input) await input.fill("12")







  // Set screen size.
  // await page.setViewport({ width: 1920, height: 1080 });

  // // Type into search box.
  // await page.locator('.devsite-search-field').fill('automate beyond recorder');

  // // Wait and click on first result.
  // await page.locator('.devsite-result-item-link').click();

  // // Locate the full title with a unique string.
  // const textSelector = await page
  //   .locator('text/Customize and automate')
  //   .waitHandle();
  // const fullTitle = await textSelector?.evaluate(el => el.textContent);

  // // Print the full title.
  // console.log('The title of this blog post is "%s".', fullTitle);

  // await browser.close();
}

// runBrowsers();
// runSelectImage()

runAutomation()

// Launch the browser and open a new blank page
