import express from "express";
import axios from "axios";
import path from "path";
import mangaRoutes from "./routes/mangaRoutes.js";
import proxyRouter from './routes/proxy.js';

const app = express();
const PORT = 3000;

// Set EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(path.resolve(), "views"));

// Serve static files
app.use(express.static(path.join(path.resolve(), "public")));

// Use routes
app.use("/", mangaRoutes);
app.use("/proxy", proxyRouter);

app.listen(PORT, () =>
    console.log(`Server berjalan di http://localhost:${PORT}`)
);
