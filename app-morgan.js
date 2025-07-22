import express from "express";
import axios from "axios";
import cors from "cors"; 
import path from "path";
import morgan from "morgan"; // Tambahkan ini
import mangaRoutes from "./routes/mangaRoutes.js";
import proxyRouter from './routes/proxy.js';

const app = express();
const PORT = 3000;

// Konfigurasi CORS
const corsOptions = {
  origin: 'http://localhost:8000',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
};

app.use(cors(corsOptions));

// Tambahkan middleware logging di sini
app.use(morgan('dev')); // <-- Tambahkan ini

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
