import { NextApiRequest, NextApiResponse } from "next";
import { chromium } from "playwright";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("https://referralmanager.churchofjesuschrist.org/", { waitUntil: "domcontentloaded" });

    // ✅ Type in username and click login
    await page.fill("#input28", username);
    await page.click("#form20 > div.o-form-button-bar > input");

    // ✅ Wait for password field (ensures username submission was successful)
    await page.waitForSelector("#input53", { timeout: 60000 });

    // ✅ Type in password and submit
    await page.fill("#input53", password);
    await page.click("#form45 > div.o-form-button-bar > input");

    // ✅ Fix: Wait for URL to change after login
    await page.waitForURL("**/dashboard/**", { timeout: 60000 });

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
  } finally {
    await browser.close();
  }
};
