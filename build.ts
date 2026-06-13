import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const APP_NAME = "Fluid Galaxy";
const APP_EXE = "FluidGalaxy";
const BUNDLE_ID = "com.codecaine.fluidgalaxy";
const VERSION = "1.0.0";

const WORKSPACE_DIR = import.meta.dir;
const DIST_DIR = join(WORKSPACE_DIR, "dist");
const APP_DIR = join(DIST_DIR, `${APP_EXE}.app`);
const CONTENTS_DIR = join(APP_DIR, "Contents");
const MACOS_DIR = join(CONTENTS_DIR, "MacOS");
const RESOURCES_DIR = join(CONTENTS_DIR, "Resources");
const ICONSET_DIR = join(DIST_DIR, "icon.iconset");

const ICON_SOURCE = join(WORKSPACE_DIR, "resources", "icon.png");

async function runCommand(args: string[]) {
  const proc = Bun.spawn(args, {
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}: ${args.join(" ")}`);
  }
}

async function main() {
  console.log("🚀 Starting macOS .app compilation...");

  // 1. Verify resources
  if (!existsSync(ICON_SOURCE)) {
    console.error(`❌ Source icon not found at ${ICON_SOURCE}`);
    process.exit(1);
  }

  // 2. Clean and setup directories
  if (existsSync(DIST_DIR)) {
    console.log("🧹 Cleaning old dist directory...");
    rmSync(DIST_DIR, { recursive: true, force: true });
  }

  mkdirSync(DIST_DIR, { recursive: true });
  mkdirSync(MACOS_DIR, { recursive: true });
  mkdirSync(RESOURCES_DIR, { recursive: true });
  mkdirSync(ICONSET_DIR, { recursive: true });

  // 3. Compile Bun app
  console.log("📦 Compiling index.ts to executable...");
  const binaryPath = join(MACOS_DIR, APP_EXE);
  await runCommand([
    "bun",
    "build",
    "--compile",
    "index.ts",
    "--outfile",
    binaryPath,
  ]);

  // Ensure it is executable
  await runCommand(["chmod", "+x", binaryPath]);

  // 4. Generate AppIcon.icns using sips and iconutil
  console.log("🎨 Generating macOS .icns from source icon...");
  const iconSizes = [
    { name: "icon_16x16.png", size: 16 },
    { name: "icon_16x16@2x.png", size: 32 },
    { name: "icon_32x32.png", size: 32 },
    { name: "icon_32x32@2x.png", size: 64 },
    { name: "icon_128x128.png", size: 128 },
    { name: "icon_128x128@2x.png", size: 256 },
    { name: "icon_256x256.png", size: 256 },
    { name: "icon_256x256@2x.png", size: 512 },
    { name: "icon_512x512.png", size: 512 },
    { name: "icon_512x512@2x.png", size: 1024 },
  ];

  for (const { name, size } of iconSizes) {
    const outPath = join(ICONSET_DIR, name);
    await runCommand([
      "sips",
      "-s",
      "format",
      "png",
      "-z",
      size.toString(),
      size.toString(),
      ICON_SOURCE,
      "--out",
      outPath,
    ]);
  }

  const icnsPath = join(RESOURCES_DIR, "AppIcon.icns");
  await runCommand([
    "iconutil",
    "-c",
    "icns",
    ICONSET_DIR,
    "-o",
    icnsPath,
  ]);

  console.log("🧹 Cleaning up temporary iconset directory...");
  rmSync(ICONSET_DIR, { recursive: true, force: true });

  // 5. Generate Info.plist
  console.log("📝 Generating Info.plist...");
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.txt">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>English</string>
    <key>CFBundleExecutable</key>
    <string>${APP_EXE}</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
`;

  const plistPath = join(CONTENTS_DIR, "Info.plist");
  await Bun.write(plistPath, plistContent);

  console.log(`\n🎉 Success! macOS app built at: ${APP_DIR}`);
}

main().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
