import puppeteer from "puppeteer";


import * as fs from 'node:fs';
import * as path from 'node:path';
import * as util from 'node:util';
import { extractBiography, extractLinks, extractPersonInfo, fillTableInputs, type Links, parseDocx } from "./helpers";

const readdir = util.promisify(fs.readdir);

const BASE_URL = "https://csc.cis.unilorin.edu.ng/"
export type Person = {
    name: string,
    biography: string,
    email: string,
    researchArea: string,
    officeAddress: string
    links: Links
}

const results: Person[] = [

]




async function processDirectory(directoryPath: string) {
    try {
        const files = await readdir(directoryPath);

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const extension = path.extname(file).toLowerCase();

            if (extension === '.docx') {
                console.log(`Processing: ${file}`);
                const content = await parseDocx(filePath);
                console.log(`Content of ${file}:`);


                const biography = extractBiography(content);
                const personInfo = extractPersonInfo(content);
                const links = extractLinks(content);
                console.log(links)
                results.push({
                    ...personInfo, biography, links
                })

                console.log('-----------------------------------');


            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
    }
}

// Usage
const directoryPath = './docs';
// processDirectory(directoryPath);


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

const biographySelector = ".wp-block-paragraph"

const numbers = [
    616, 615, 614, 608, 603, 606, 605
]



const runBrowsers = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        acceptInsecureCerts: true,
        userDataDir: "C:/Users/Ione/AppData/Local/Google/Chrome/User Data/Default",
        timeout: 100_000
    });


    for (const s of numbers) {

        console.log(s)

        const page = await browser.newPage();
        await page.setViewport({ height: 720, width: 1080, deviceScaleFactor: 2, hasTouch: true })


        await page.goto(`${BASE_URL}wp-admin/post.php?post=${s}&action=edit`, {
            timeout: 0
        })


        const displayNum = await page.$$("span.displaying-num");
        if (displayNum[0]) {
            const innerText = await (await displayNum[0].getProperty("innerText")).jsonValue()
            if (innerText.split(" ")[0]) {
                const pageNumber = Number.parseInt(innerText.split(" ")[0])
                if (pageNumber > 1) {
                    // await page.waitForSelector(`a[aria-label="Page ${pageNumber - 1}"]`).click()
                    await page.waitForNavigation();
                }
                else if (pageNumber === 1) {
                    await page.locator(".row-title").click()
                } else {
                    console.log("No staff member found with this name.")
                    continue;
                }
            }
        }






        await page.waitForNavigation({ timeout: 0 })

        await page.waitForSelector("input#acf-field_666d898832a6d-field_666d8b1132a72", { timeout: 0 })

        // await page.locator("p.wp-block_paragraph").click();
        // if (s.biography) {
        //     await page.keyboard.type(s.biography)
        // }

        await page.locator("input#acf-field_666d898832a6d-field_666d8b1132a72").scroll()

        // await page.locator("input#acf-field_666d898832a6d-field_666d8b1132a72").fill(s.email);
        // await page.locator("input#acf-field_666d898832a6d-field_666d8b1f32a73").fill(s.officeAddress);
        // await page.locator("input#acf-field_666d898832a6d-field_666d8b2832a74").fill(s.researchArea);


        for (let index = 0; index < 9; index++) {
            await page.locator(`a[data-event="add-row"]`).click()
        }




        for (let index = 0; index < 9; index++) {
            // console.log(i)
            await page.click("#acf-group_66cdce5f8d396 > div.inside.acf-fields.-top > div > div.acf-input > div > div.acf-field.acf-field-repeater.acf-field-66cdce5f91d58 > div.acf-input > div > div > a")
        }

        //     await page.click("#editor > div.edit-post-layout.is-mode-visual.has-metaboxes.interface-interface-skeleton.has-footer > div.interface-interface-skeleton__editor > div.interface-interface-skeleton__body > div.interface-navigable-region.interface-interface-skeleton__content > div.edit-post-visual-editor.has-inline-canvas > div > div.editor-styles-wrapper.block-editor-writing-flow > div.is-root-container.is-desktop-preview.is-layout-flow.wp-block-post-content.block-editor-block-list__layout")

        //     if (s.biography) {
        //         await page.locator(".wp-block-paragraph").fill(s.biography)
        //     }

        //     await fillTableInputs(page, s.links)
        // }
    }

}


runBrowsers();