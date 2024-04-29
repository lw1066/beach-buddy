const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/allBeaches", async (req, res) => {
  try {
    const response = await axios.get(
      "https://environment.data.gov.uk/doc/bathing-water.json?_view=basic&_properties=samplingPoint.lat,samplingPoint.long,latestRiskPrediction.expiresAt.name.*,latestRiskPrediction.riskLevel.name.*&_pageSize=1000"
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error proxying API request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/beach", async (req, res) => {
  try {
    const { url } = req.query;
    console.log(url);
    if (!url) {
      throw new Error("URL is required");
    }
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Error proxying API request: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
