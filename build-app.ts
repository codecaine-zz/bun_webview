import { existsSync, mkdirSync, rmSync, readFileSync } from "fs";
import { join, resolve, basename } from "path";
import { parseArgs } from "util";

// 1. Define command line options
const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    icon: { type: "string", short: "i" },
    name: { type: "string", short: "n" },
    identifier: { type: "string", short: "d" },
    version: { type: "string", short: "v" },
    out: { type: "string", short: "o" },
    help: { type: "boolean", short: "h" },
  },
  strict: false,
});

// Help menu
if (values.help) {
  console.log(`
📦 Bun Webview macOS App Packager

Usage:
  bun run build-app.ts [entry_file] [options]

Arguments:
  [entry_file]             Path to TypeScript/JavaScript entry file (default: index.ts)

Options:
  -i, --icon <path>        Path to input PNG icon (default: resources/icon.png, icon.png, or CLI template)
  -n, --name <name>        App display name (default: package.json name or folder name)
  -id, --identifier <id>   Bundle identifier (default: com.webview.<clean_name>)
  -v, --version <version>  App version (default: package.json version or 1.0.0)
  -o, --out <dir>          Output folder (default: dist)
  -h, --help               Show this help message
`);
  process.exit(0);
}

// Helper to run shell commands
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
  const cwd = process.cwd();

  // 2. Resolve entry file
  const entryFile = positionals[0] || "index.ts";
  const entryPath = resolve(cwd, entryFile);
  if (!existsSync(entryPath)) {
    console.error(`❌ Entry file not found: ${entryPath}`);
    process.exit(1);
  }

  // 3. Load project metadata from package.json if it exists
  let pkgName = "";
  let pkgVersion = "1.0.0";
  const pkgPath = resolve(cwd, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      pkgName = pkg.name || "";
      pkgVersion = pkg.version || "1.0.0";
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // 4. Resolve App Name and Executable
  const folderName = basename(cwd);
  const rawAppName = values.name || pkgName || folderName || "WebviewApp";
  // Clean app name for executable (no spaces/special chars)
  const appExe = rawAppName.replace(/[^a-zA-Z0-9]/g, "");
  // Formatting name for display (e.g. capitalized)
  const appDisplayName = rawAppName
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // 5. Resolve other metadata
  const cleanIdName = appExe.toLowerCase();
  const bundleId = values.identifier || `com.webview.${cleanIdName}`;
  const version = values.version || pkgVersion;
  const outFolder = resolve(cwd, values.out || "dist");

  // 6. Resolve Icon Source (with fallbacks)
  let iconSource = "";
  const potentialPaths = [
    values.icon ? resolve(cwd, values.icon) : null,
    resolve(cwd, "resources", "icon.png"),
    resolve(cwd, "icon.png"),
    // CLI template fallback
    resolve(import.meta.dir, "resources", "icon.png"),
  ].filter((p): p is string => !!p);

  for (const p of potentialPaths) {
    if (existsSync(p)) {
      iconSource = p;
      break;
    }
  }

  if (!iconSource) {
    console.error("❌ No icon source found! Please provide a PNG icon.");
    process.exit(1);
  }

  console.log("🚀 Starting macOS .app packaging...");
  console.log(`  Entry point:   ${entryPath}`);
  console.log(`  App Name:      ${appDisplayName}`);
  console.log(`  Executable:    ${appExe}`);
  console.log(`  Bundle ID:     ${bundleId}`);
  console.log(`  Version:       ${version}`);
  console.log(`  Icon Source:   ${iconSource}`);
  console.log(`  Output Path:   ${outFolder}`);

  // 7. Setup directory structure
  const appDir = join(outFolder, `${appDisplayName}.app`);
  const contentsDir = join(appDir, "Contents");
  const macosDir = join(contentsDir, "MacOS");
  const resourcesDir = join(contentsDir, "Resources");
  const iconsetDir = join(outFolder, `${appExe}_icon.iconset`);

  if (existsSync(appDir)) {
    console.log(`🧹 Cleaning old app bundle at ${appDisplayName}.app...`);
    rmSync(appDir, { recursive: true, force: true });
  }

  mkdirSync(macosDir, { recursive: true });
  mkdirSync(resourcesDir, { recursive: true });
  mkdirSync(iconsetDir, { recursive: true });

  // 8. Compile the entry file using Bun compile
  console.log("📦 Compiling project into a standalone binary...");
  const binaryPath = join(macosDir, appExe);
  await runCommand([
    "bun",
    "build",
    "--compile",
    entryPath,
    "--outfile",
    binaryPath,
  ]);

  // Ensure binary is executable
  await runCommand(["chmod", "+x", binaryPath]);

  // 9. Generate macOS .icns file
  console.log("🎨 Processing and packaging the app icon...");
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
    const outPath = join(iconsetDir, name);
    await runCommand([
      "sips",
      "-s",
      "format",
      "png",
      "-z",
      size.toString(),
      size.toString(),
      iconSource,
      "--out",
      outPath,
    ]);
  }

  const icnsPath = join(resourcesDir, "AppIcon.icns");
  await runCommand([
    "iconutil",
    "-c",
    "icns",
    iconsetDir,
    "-o",
    icnsPath,
  ]);

  console.log("🧹 Cleaning up temporary iconset...");
  rmSync(iconsetDir, { recursive: true, force: true });

  // 10. Generate Info.plist
  console.log("📝 Generating Info.plist...");
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.txt">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>English</string>
    <key>CFBundleExecutable</key>
    <string>${appExe}</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>${bundleId}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${appDisplayName}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${version}</string>
    <key>CFBundleSignature</key>
    <string>????</string>
    <key>CFBundleVersion</key>
    <string>${version}</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
`;

  const plistPath = join(contentsDir, "Info.plist");
  await Bun.write(plistPath, plistContent);

  console.log(`\n🎉 Success! macOS app bundle built at: ${appDir}`);
}

main().catch((err) => {
  console.error("❌ Packaging failed:", err);
  process.exit(1);
});
