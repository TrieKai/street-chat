const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [192, 512];
const inputFile = path.join(__dirname, "../public/street-chat.png");
const outputDir = path.join(__dirname, "../public/icons");

async function generateIcons() {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const size of sizes) {
      await sharp(inputFile)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
      console.log(`Generated ${size}x${size} icon`);
    }
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
