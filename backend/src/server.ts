import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import menuRoutes from "./routes/menuRoutes";
import orderRoutes from "./routes/orderRoutes";


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// init DB first, THEN start server
AppDataSource.initialize()
  .then(() => {
    console.log(" Data source initialized");

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(" Failed to initialize data source:", error);
    process.exit(1);
  });
