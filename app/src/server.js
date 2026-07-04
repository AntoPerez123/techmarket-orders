const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || "blue";
const FORCE_ERROR = process.env.FORCE_ERROR || "false";

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "TechMarket Orders",
    description: "Microservicio critico de pedidos",
    version: APP_VERSION,
    status: "running"
  });
});

app.get("/orders", (req, res) => {
  res.json([
    {
      id: 1,
      product: "Notebook Gamer",
      status: "created"
    },
    {
      id: 2,
      product: "Mouse RGB",
      status: "paid"
    }
  ]);
});

app.get("/health", (req, res) => {
  if (FORCE_ERROR === "true") {
    return res.status(500).json({
      status: "error",
      message: "Falla simulada para activar rollback automatico",
      version: APP_VERSION
    });
  }

  res.status(200).json({
    status: "ok",
    version: APP_VERSION
  });
});

app.listen(PORT, () => {
  console.log(`TechMarket Orders ejecutandose en puerto ${PORT}`);
});