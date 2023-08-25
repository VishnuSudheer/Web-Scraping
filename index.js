import puppeteer from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";
import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/webscrapeDB");
const itemSchema = new mongoose.Schema({
    _id : Number,
    title : String
});
const item = mongoose.model("item",itemSchema);

async function scrap(){
    console.log("Server Running");

    const csvWriter = createObjectCsvWriter({
        path: 'news.csv',
        header: [
            { id: 'title',title: "Title" }
        ]
    })

    const browser =await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto("https://newsable.asianetnews.com/");
    await page.type("#query","school");
    await page.keyboard.press('Enter');

    await page.waitForNavigation()
    const search = await page.$(".searchright h2 a");
    await search.click();

    await page.waitForNavigation();
    const title = await page.$("#mainArticleContent h1");
    const titleText = await title.evaluate(el => el.textContent);
    
    const data = [{title: titleText}]
    csvWriter.writeRecords(data).then(() =>console.log("Saved") );

    //Counting the dbs
    const itemCount = await item.countDocuments();

    //Adding to dbs
    const Item = new item({
        _id : itemCount,
        title: titleText
    });
    Item.save();

    await browser.close();
}
scrap();