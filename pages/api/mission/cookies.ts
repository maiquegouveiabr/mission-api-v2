import { NextApiRequest, NextApiResponse } from "next";
import { chromium } from "playwright-core";

// Reuse browser connection for better performance
let browser: any;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.connectOverCDP("wss://chrome.browserless.io?token=RgUZmLd0KF5gxG3b93d4771a20b2783b6d4ba1ed21");
  }
  return browser;
}

// API Route
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const browser = await getBrowser();
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("https://referralmanager.churchofjesuschrist.org/", { waitUntil: "domcontentloaded" });

    // ✅ Type in username and click login at the same time
    await Promise.all([page.fill("#input28", username), page.click("#form20 > div.o-form-button-bar > input")]);

    // ✅ Wait for password field before typing
    await page.waitForSelector("#input53", { timeout: 10000 });

    // ✅ Type in password and submit simultaneously
    await Promise.all([page.fill("#input53", password), page.click("#form45 > div.o-form-button-bar > input")]);

    await page.waitForURL("**/dashboard/**", { timeout: 10000 });

    // ✅ Get cookies after successful login
    const cookies = await context.cookies();

    await page.close(); // Free memory

    if (cookies.length > 0) {
      res.status(200).json(cookies);
    } else {
      res.status(404).json({ message: "No cookies found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
};
