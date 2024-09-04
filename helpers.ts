import mammoth from "mammoth";
import fs from "node:fs";
import puppeteer, { type Page } from 'puppeteer';

interface PersonInfo {
    name: string;
    officeAddress: string;
    email: string;
    researchArea: string;
}

export function extractPersonInfo(text: string): PersonInfo {
    const lines = text.split('\n').map(line => line.trim());

    const info: PersonInfo = {
        name: '',
        officeAddress: '',
        email: '',
        researchArea: ''
    };

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('Name:')) {
            info.name = lines[i].replace('Name:', '').trim();
        } else if (lines[i].startsWith('Office Address:')) {
            info.officeAddress = lines[i].replace('Office Address:', '').trim();
            // Check if address continues on next line
            if (i + 1 < lines.length && !lines[i + 1].includes(':')) {
                info.officeAddress += ` ${lines[i + 1].trim()}`;
                i++; // Skip next line as we've included it
            }
        } else if (lines[i].startsWith('Email:')) {
            info.email = lines[i].replace('Email:', '').trim();
        } else if (lines[i].includes('Teaching and Research Area:')) {
            info.researchArea = lines[i].replace('Teaching and Research Area:', '').trim();
            // Check if research area continues on next line
            if (i + 1 < lines.length) {
                info.researchArea += ` ${lines[i + 1].trim()}`;
            }
        }
    }

    return info;
}

export interface Links {
    [key: string]: string;
}


export function extractLinks(text: string): Links {
    const links: Links = {};
    const linkKeys = [
        'Scopus',
        'ORCID',
        'Google Scholar',
        'ResearchGate',
        'ResearcherID (WoS ID)',
        'LinkedIn',
        'Academia',
        'ResearchId',
        'Link to Publication'
    ];

    // Find the start of the Links section
    const linksStart = text.indexOf('Links');
    if (linksStart === -1) return links;

    const linksSection = text.slice(linksStart);

    linkKeys.forEach((key, index) => {
        const regex = new RegExp(`${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.*?)(?=${linkKeys[index + 1]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') || '$'})`, 's');
        const match = linksSection.match(regex);
        // biome-ignore lint/complexity/useOptionalChain: <explanation>
        if (match && match[1]) {
            const url = match[1].trim().split('\n')[0].trim();
            if (url.startsWith('http')) {
                links[key] = url;
            }
        }
    });

    return links;
}

export function extractBiography(content: string): string {
    const biographyRegex = /Biography:\s*([\s\S]*?)(?=\n\n\S|$)/i;
    const match = content.match(biographyRegex);

    if (match?.[1]) {
        return match[1].trim().replace("Biography:", "")

    }

    return null;
}



export async function parseDocx(filePath: string): Promise<string> {
    try {
        const result = await mammoth.extractRawText({ path: filePath });

        // fs.writeFile(`${filePath}.html`, result.value, (a) => a)

        return result.value;
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        return '';
    }
}

export async function fillTableInputs(page: Page, links: Links) {
    await page.evaluate((fillData) => {
        const rows = document.querySelectorAll('table.acf-table tbody tr:not(.acf-clone)');
        const entries = Object.entries(fillData);

        rows.forEach((row, index) => {
            if (index < entries.length) {
                const [title, url] = entries[index];
                const inputs = row.querySelectorAll('input[type="text"]');
                if (inputs.length >= 2) {
                    (inputs[0] as HTMLInputElement).value = title;
                    (inputs[1] as HTMLInputElement).value = url;
                }
            }
        });
    }, links);
}

export function filterNames(targetName, namesList) {
    const targetParts = targetName.toLowerCase().split(' ');

    return namesList.filter(name => {
        const nameParts = name.toLowerCase().split(' ');
        let matchCount = 0;

        // Count matches
        // biome-ignore lint/complexity/noForEach: <explanation>
        targetParts.forEach(part => {
            if (nameParts.includes(part)) {
                matchCount++;
            }
        });

        // Only return names with at least 2 matches
        return matchCount >= 2;
    });
}

// Usage


export async function fillTableInputsModified(page: Page, links: Links) {
    const linkKeys = [
        'Scopus',
        'ORCID',
        'Google Scholar',
        'ResearchGate',
        'ResearcherID (WoS ID)',
        'LinkedIn',
        'Academia',
        'ResearchId',
        'Link to Publication'
    ];
    await page.evaluate((fillData) => {
        const rows = document.querySelectorAll('table.acf-table tbody tr:not(.acf-clone)');
        const entries = Object.entries(fillData);

        rows.forEach((row, index) => {
            if (index < entries.length) {
                const title = fillData[index];
                const inputs = row.querySelectorAll('input[type="text"]');
                if (inputs.length >= 2) {
                    (inputs[0] as HTMLInputElement).value = title;
                    (inputs[1] as HTMLInputElement).value = "";
                }
            }
        });
    }, linkKeys);
}