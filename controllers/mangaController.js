import { fetchChapterData, fetchSearchResults, fetchMangaDetails } from "../models/mangaModel.js";

export const getIndex = (req, res) => {
    res.render("index", { title: "Scraper Manga Komiku" });
};

export const getRead = async (req, res) => {
    const mangaUrl = req.query.url;

    if (!mangaUrl) {
        return res.redirect("/");
    }

    try {
        const { chapterInfo, images, nextChapter, prevChapter } = await fetchChapterData(mangaUrl);
        res.render("read", { chapterInfo, images, nextChapter, prevChapter });
    } catch (error) {
        console.error("Error fetching chapter:", error);
        res.status(404).render("error", { error: { message: error.message || "Terjadi kesalahan saat mengambil data." } });
    }
};

export const getDetails = async (req, res) => {
    const mangaUrl = req.query.url;

    if (!mangaUrl) {
        return res.redirect("/");
    }

    try {
        const manga = await fetchMangaDetails(mangaUrl);
        res.render("details", { manga });
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(404).render("error", { error: { message: error.message || "Gagal mengambil detail manga." } });
    }
};

export const getMangaDetails = async (req, res) => {
    const mangaUrl = req.query.url;

    if (!mangaUrl) {
        return res.status(400).json({ error: "Parameter 'url' wajib diisi." });
    }

    try {
        const mangaDetails = await fetchMangaDetails(mangaUrl);
        res.json(mangaDetails);
    } catch (error) {
        console.error("Error fetching manga details:", error);
        res.status(500).json({ error: error.message || "Terjadi kesalahan pada server." });
    }
};

export const searchManga = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Parameter 'query' wajib diisi." });
    }

    try {
        const results = await fetchSearchResults(query);
        res.json({ query, results });
    } catch (error) {
        console.error("Error searching manga:", error);
        res.status(500).json({ error: error.message || "Terjadi kesalahan pada server." });
    }
};
