import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

// oauth-abw_refresh_token
// oauth-abw_church_account_id

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { username } = req.body;
  const { password } = req.body;
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=RgUZmLd0KF5gxG3b93d4771a20b2783b6d4ba1ed21`,
  });

  try {
    if (username && password) {
      const page = await browser.newPage();
      await page.goto("https://referralmanager.churchofjesuschrist.org/");

      await page.waitForSelector("#input28", { visible: true });
      await page.type("#input28", String(username));
      await page.waitForSelector("#form20 > div.o-form-button-bar > input", {
        visible: true,
      });
      await page.click("#form20 > div.o-form-button-bar > input");
      await page.waitForSelector("#input53", { visible: true, timeout: 3000 });
      await page.type("#input53", String(password));
      await page.waitForSelector("#form45 > div.o-form-button-bar > input", {
        visible: true,
      });
      await page.click("#form45 > div.o-form-button-bar > input");
      await page.waitForResponse((response) => response.url().includes("auth") && response.status() === 200);
      const cookies = await page.cookies();
      if (cookies) {
        res.status(200).json(cookies);
      } else {
        res.status(404).json({ message: "No cookies found" });
      }
    } else {
      res.status(404).json({ message: "No username or password found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  } finally {
    browser.close();
  }
};
