import express from "express";
import { getIndex, getRead, searchManga } from "../controllers/mangaController.js";
import { getMangaDetails } from "../controllers/mangaController.js";
import { getDetails } from "../controllers/mangaController.js";

const router= express.Router();
// Route untuk mengambil detail manga
router.get("/manga/details", getMangaDetails);

// Route utama
router.get("/", getIndex);

// Route untuk membaca manga
router.get("/read", getRead);

// Route untuk pencarian manga
router.get("/search", searchManga);

// Route untuk frontend details
router.get("/details", getDetails);

export default router;
