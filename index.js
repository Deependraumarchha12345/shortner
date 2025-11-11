const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { nanoid } = require("nanoid");
const URL = require("./models/url");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Mount API routes defined in routes/url.js under /url
const urlRoutes = require("./routes/url");
app.use("/url", urlRoutes);

// Use MongoDB from environment or default to local
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bitly";
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err && err.message ? err.message : err);
  });

app.post("/short", async (req, res) => {
  const { url } = req.body;
  const shortId = nanoid(8);

  await URL.create({
    shortId,
    redirectURL: url,
  });

  return res.json({ shortId });
});

// Redirect handler (placed after static and API routes so static files and APIs take precedence)
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  
  try {
    // Using findOneAndUpdate to atomically update visit history
    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );

    if (!entry) {
      return res.status(404).send("URL Not Found");
    }

    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error('Error handling redirect:', err);
    return res.status(500).send("Internal Server Error");
  }
});

// Safe redirect path used when frontend is hosted on Netlify: /r/:shortId
app.get('/r/:shortId', async (req, res) => {
  const { shortId } = req.params;
  
  try {
    // Using findOneAndUpdate to atomically update visit history
    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    );

    if (!entry) {
      return res.status(404).send('URL Not Found');
    }

    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error('Error handling redirect:', err);
    return res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
