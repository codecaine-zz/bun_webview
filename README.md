# Bun Webview macOS Packaging Template

This is a template demonstrating how to build and package standalone macOS `.app` applications with custom icons using [webview-bun](https://github.com/tr1ckydev/webview-bun).

To install dependencies:

```bash
bun install
```

To run locally for development:

```bash
bun run index.ts
```

## Compiling and Building `index.ts`

There are three ways to compile or build `index.ts` depending on the desired output format:

### 1. Simple Binary Compilation
If you only need a standalone, single-file CLI executable (without a macOS app structure or app icon), run Bun's native compiler:

```bash
bun build --compile index.ts
```
This compiles the code into a binary named `index`.

### 2. Package as a macOS App (Default)
To build the code as a standard macOS application bundle (`FluidGalaxy.app`) containing the default custom app icon and plist metadata:

```bash
bun run build
```
This generates the app at `dist/FluidGalaxy.app`.

### 3. Package as a Custom macOS App (CLI Tool)
To compile the app with a custom name, custom icon, or custom identifier:

```bash
bun run build-app [entry_file] --name "Your App Name" --icon /path/to/icon.png --identifier "com.example.yourid"
```

**Options:**
- `-i, --icon <path>`: Path to a PNG icon. Defaults to `resources/icon.png`, `icon.png`, or a beautiful default wave icon template.
- `-n, --name <name>`: Custom display name for the `.app` bundle.
- `-d, --identifier <id>`: CFBundleIdentifier (e.g. `com.example.id`).
- `-v, --version <version>`: App version (defaults to `package.json` version or `1.0.0`).
- `-o, --out <dir>`: Output folder (defaults to `dist`).

## Running the Compiled macOS Apps
You can run any compiled `.app` bundle by:
1. Double-clicking the app bundle in macOS Finder (found in the `dist/` directory).
2. Launching it from the terminal using the `open` command:
   ```bash
   open "dist/Fluid Galaxy.app"
   ```

---

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
