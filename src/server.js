/**
 * HoneyCraft Remotion Render Server
 * Runs on VPS port 3001 — n8n calls POST /render
 *
 * Deploy: node src/server.js
 * Or with PM2: pm2 start src/server.js --name honeycraft-render
 */

const express = require("express");
const { bundle } = require("@remotion/bundler");
const { renderMedia, selectComposition } = require("@remotion/renderer");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(express.json({ limit: "10mb" }));

// Cache the bundle path to avoid re-bundling on every request
let bundlePath = null;

async function getBundle() {
  if (bundlePath && fs.existsSync(bundlePath)) return bundlePath;
  console.log("Bundling Remotion project...");
  bundlePath = await bundle({
    entryPoint: path.resolve(__dirname, "index.ts"),
    webpackOverride: (config) => config,
  });
  console.log("Bundle ready:", bundlePath);
  return bundlePath;
}

// ── Platform → composition ID ──────────────────────────────────────────────
const COMPOSITION_MAP = {
  TikTok:             "HoneycraftAd-TikTok",
  Instagram:          "HoneycraftAd-Instagram",
  "Instagram Reels":  "HoneycraftAd-Instagram-Reels",
  "Instagram Stories":"HoneycraftAd-Instagram-Stories",
  Facebook:           "HoneycraftAd-Facebook",
  Pinterest:          "HoneycraftAd-Pinterest",
  YouTube:            "HoneycraftAd-YouTube",
  "Twitter/X":        "HoneycraftAd-Twitter-X",
};

// ── POST /render ───────────────────────────────────────────────────────────
// Body: { videoUrl, audioUrl, hookText, platform, hookType, ctaText, durationSeconds }
app.post("/render", async (req, res) => {
  const startTime = Date.now();
  const {
    videoUrl,
    audioUrl = "",
    hookText,
    platform = "TikTok",
    hookType = "curiosity",
    ctaText = "Shop Now — HoneyCraft.co.uk",
    showCaptions = true,
    showCta = true,
    durationSeconds = 10,
    hook_id,
    campaign_id,
  } = req.body;

  if (!videoUrl || !hookText) {
    return res.status(400).json({ error: "videoUrl and hookText are required" });
  }

  const fps = 30;
  const durationInFrames = Math.round(durationSeconds * fps);
  const outputPath = path.join(os.tmpdir(), `hc_ad_${Date.now()}_${platform.replace(/[\s/]/g, "_")}.mp4`);
  const compositionId = COMPOSITION_MAP[platform] || "HoneycraftAd_TikTok";

  console.log(`Rendering: ${compositionId} | Hook: "${hookText.substring(0, 50)}" | Duration: ${durationSeconds}s`);

  try {
    const bundleLocation = await getBundle();

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compositionId,
      inputProps: {
        videoUrl, audioUrl, hookText, platform, hookType,
        ctaText, showCaptions, showCta, durationInFrames,
      },
    });

    await renderMedia({
      composition: { ...composition, durationInFrames },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: {
        videoUrl, audioUrl, hookText, platform, hookType,
        ctaText, showCaptions, showCta, durationInFrames,
      },
      chromiumOptions: { disableWebSecurity: true },
      timeoutInMilliseconds: 120000,
      onProgress: ({ progress }) => {
        if (Math.round(progress * 10) % 2 === 0) {
          process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
        }
      },
    });

    const stats = fs.statSync(outputPath);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n  Done in ${elapsed}s — ${(stats.size / 1024 / 1024).toFixed(1)}MB`);

    // Stream the file back
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="honeycraft_ad.mp4"`);
    res.setHeader("X-Hook-Id", hook_id || "");
    res.setHeader("X-Campaign-Id", campaign_id || "");
    res.setHeader("X-Render-Time", elapsed + "s");
    res.setHeader("X-File-Size", stats.size);

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);
    stream.on("end", () => {
      fs.unlink(outputPath, () => {});
    });

  } catch (err) {
    console.error("Render failed:", err.message);
    // Clean up on error
    if (fs.existsSync(outputPath)) fs.unlink(outputPath, () => {});
    res.status(500).json({ error: err.message });
  }
});

// ── GET /health ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    bundled: !!bundlePath,
    uptime: process.uptime(),
    compositions: Object.keys(COMPOSITION_MAP),
  });
});

// ── Warm up bundle on start ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`HoneyCraft Render Server running on port ${PORT}`);
  try {
    await getBundle(); // pre-warm
  } catch (e) {
    console.error("Bundle warm-up failed:", e.message);
  }
});
