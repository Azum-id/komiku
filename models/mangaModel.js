import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://komiku.org";

export const fetchSearchResults = async query => {
    try {
        const { data } = await axios.get(
            `https://api.komiku.org/?post_type=manga&s=${encodeURIComponent(
                query
            )}`
        );
        const $ = cheerio.load(data);

        const results = [];
        $(".bge").each((_, el) => {
            const title = $(el).find(".kan h3").text().trim();
            const altTitle = $(el).find(".kan .judul2").text().trim();
            let description = $(el).find(".kan p").text().trim();
            const coverImage = $(el).find(".bgei img").attr("src");
            const mangaUrl = $(el).find(".bgei a").attr("href");

            // Remove everything from "Update" to "lalu." in the description
            description = description.replace(/Update.*lalu\./, "").trim();

            // Start chapter info
            let startChapterUrl = $(el)
                .find(".new1")
                .eq(0)
                .find("a")
                .attr("href");
            let startChapterText = $(el)
                .find(".new1")
                .eq(0)
                .find("span")
                .last()
                .text()
                .trim();

            // Latest chapter info
            let latestChapterUrl = $(el)
                .find(".new1")
                .eq(1)
                .find("a")
                .attr("href");
            let latestChapterText = $(el)
                .find(".new1")
                .eq(1)
                .find("span")
                .last()
                .text()
                .trim();

            // Ensure chapter URLs have full domain
            if (startChapterUrl && !startChapterUrl.startsWith("http")) {
                startChapterUrl = `https://komiku.org${startChapterUrl}`;
            }
            if (latestChapterUrl && !latestChapterUrl.startsWith("http")) {
                latestChapterUrl = `https://komiku.org${latestChapterUrl}`;
            }

            results.push({
                title,
                altTitle,
                description,
                coverImage,
                mangaUrl: mangaUrl ? `https://komiku.org${mangaUrl}` : null,
                startChapter: {
                    url: startChapterUrl,
                    text: startChapterText
                },
                latestChapter: {
                    url: latestChapterUrl,
                    text: latestChapterText
                }
            });
        });
console.log(results)
        return results;
    } catch (error) {
        throw new Error("Gagal mengambil hasil pencarian.");
    }
};

export const fetchMangaDetails = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Manga Cover Image (Remove URL parameters for HD quality)
        let coverImage = $("#Informasi .ims img").attr("src");
        if (coverImage) {
            coverImage = coverImage.split("?")[0]; // Remove query parameters
        }

        // Manga Information
        const mangaInfo = {};
        $("#Informasi .inftable tr").each((_, el) => {
            const key = $(el).find("td").first().text().trim();
            const value = $(el).find("td").last().text().trim();
            mangaInfo[key] = value;
        });

        // Genres
        const genres = [];
        $("#Informasi .genre span[itemprop='genre']").each((_, el) => {
            genres.push($(el).text().trim());
        });

        // Chapters
        const chapters = [];
        $("#Daftar_Chapter tbody tr").not(":first-child").each((_, el) => {
            const title = $(el).find("a span").text().trim();
            let url = $(el).find("a").attr("href");
            const views = $(el).find(".pembaca i").text().trim();
            const releaseDate = $(el).find(".tanggalseries").text().trim();

            if (url && !url.startsWith("http")) {
                url = `https://komiku.org${url}`;
            }

            chapters.push({ title, url, views, releaseDate });
        });

        // New and Last Chapter with URLs
        const newChapterElement = $("div.new1.sd.rd").first();
        const lastChapterElement = $("div.new1.sd.rd").last();

        const newChapter = {
            title: newChapterElement.find("span:last-child").text().trim(),
            url: newChapterElement.find("a").attr("href")
        };

        const lastChapter = {
            title: lastChapterElement.find("span:last-child").text().trim(),
            url: lastChapterElement.find("a").attr("href")
        };

        // If URLs are relative, prepend base URL
        if (newChapter.url && !newChapter.url.startsWith("http")) {
            newChapter.url = `https://komiku.org${newChapter.url}`;
        }
        if (lastChapter.url && !lastChapter.url.startsWith("http")) {
            lastChapter.url = `https://komiku.org${lastChapter.url}`;
        }

        return {
            coverImage,
            mangaInfo,
            genres,
            chapters,
            newChapter,  // Chapter pertama dengan URL
            lastChapter  // Chapter terakhir dengan URL
        };
    } catch (error) {
        throw new Error("Gagal mengambil detail manga.");
    }
};

export const fetchChapterData = async url => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const chapterInfo = {};
        $("tbody[data-test='informasi'] tr").each((_, el) => {
            const label = $(el).find("td").first().text().trim();
            const value = $(el).find("td").last().text().trim();
            chapterInfo[label] = value;
        });

        let images = [];
        let nextChapter = $(".nxpr a[title*='Chapter'] .fa-caret-right")
            .parent()
            .attr("href");
        let prevChapter = $(".nxpr a[title*='Chapter'] .fa-caret-left")
            .parent()
            .attr("href");

        if (nextChapter && !nextChapter.startsWith("http"))
            nextChapter = BASE_URL + nextChapter;
        if (prevChapter && !prevChapter.startsWith("http"))
            prevChapter = BASE_URL + prevChapter;

        $("#Baca_Komik img").each((_, el) => {
            let imgSrc = $(el).attr("src");
            if (imgSrc) images.push(imgSrc);
        });

        return { chapterInfo, images, nextChapter, prevChapter };
    } catch (error) {
        throw new Error(
            error.response?.status === 404
                ? "Halaman tidak ditemukan"
                : "Terjadi kesalahan saat memuat data."
        );
    }
};
