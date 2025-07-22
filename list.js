import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import paginate from "express-paginate";

const app = express();
const PORT = 3103;

app.use(paginate.middleware(10, 50)); // Default: 10 items per page, max 50

const URL = "https://komiku.org/daftar-komik/?tipe=manga";

async function scrapeMangaList() {
    try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);
        const mangaList = [];

        $(".ls4").each((_, element) => {
            const title = $(element).find("h4 a").text().trim();
            const url = "https://komiku.org" + $(element).find("h4 a").attr("href");
            const image = $(element).find("img").attr("data-src");
            const genre = $(element).find(".ls4s").eq(0).text().replace("Manga ", "").trim();
            const status = $(element).find(".ls4s").eq(1).text().replace("Status ", "").trim();
            const lastUpdate = $(element).find(".ls4s").eq(2).text().replace("Update ", "").trim();

            mangaList.push({ title, url, image, genre, status, lastUpdate });
        });

        return mangaList;
    } catch (error) {
        console.error("Error fetching manga list:", error);
        return [];
    }
}

app.get("/manga", async (req, res) => {
    const mangaList = await scrapeMangaList();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const paginatedManga = mangaList.slice(offset, offset + limit);
    
    res.json({
        mangas: paginatedManga,
        page,
        totalPages: Math.ceil(mangaList.length / limit),
        totalManga: mangaList.length,
        hasNextPage: offset + limit < mangaList.length,
        hasPrevPage: page > 1,
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
