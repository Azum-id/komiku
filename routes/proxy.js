import express from 'express';
import axios from 'axios';

const router = express.Router();

// Route untuk proxy gambar
router.get("/", async (req, res) => {
    const imgUrl = req.query.img;
    if (!imgUrl) return res.status(400).send("No image URL provided");

    try {
        const response = await axios.get(imgUrl, { responseType: "stream" });
        res.setHeader("Content-Type", response.headers["content-type"]);
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send("Gagal mengambil gambar.");
    }
});

export default router;
