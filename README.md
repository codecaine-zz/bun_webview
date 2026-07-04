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

## 🎨 Futuristic Apple-Style Icon Templates

This repository includes a suite of **88 premium, futuristic Apple-style glassmorphism icons** located in the [resources/](file:///Users/codecaine/bun_webview-1/resources) directory. 

These templates feature a sleek chamfered titanium rim, dark obsidian frosted glass tile, and a neon radial background glow—ideal for matching the design language of Apple Vision Pro or macOS Sequoia.

### How to Use the Templates
Pass the path of your chosen icon to the `build-app.ts` CLI tool using the `--icon` (`-i`) flag:

```bash
# Build a customized app using the Developer icon template
bun run build-app --name "Code Edit" --icon resources/developer.png

# Build a customized app using the Kanban Board icon template
bun run build-app --name "Task Board" --icon resources/kanban_board.png

# Build a customized app using the AI Chat icon template
bun run build-app --name "AI Assistant" --icon resources/ai_chat.png
```

### Available Icon Templates
The [resources/](file:///Users/codecaine/bun_webview-1/resources) folder includes the following premium designs:

*   **App Categories**: `developer.png` (IDE), `design.png` (Creative), `browser.png` (Web), `communication.png` (Chat), `game.png` (Gaming), `media.png` (Player), `productivity.png` (Office), `utility.png` (Settings).
*   **Office & Productivity**: `calendar.png`, `calculator.png`, `notes.png`, `todo_list.png`, `kanban_board.png`, `time_tracker.png`, `slides.png`, `spreadsheet.png`, `whiteboard.png`, `mind_mapper.png`.
*   **Developer & System Utilities**: `database.png`, `git_gui.png`, `terminal.png`, `terminal_multiplexer.png`, `ssh_client.png`, `api_client.png`, `api_doc_viewer.png`, `server_manager.png`, `virtual_machine.png`, `docker_monitor.png`, `git_client.png`, `database_admin.png`, `rest_client.png`, `log_viewer.png`, `regex_tester.png`, `profiler.png`, `package_manager.png`, `k8s_manager.png`, `pipeline_monitor.png`, `dom_explorer.png`.
*   **Security & Files**: `vault.png`, `password_manager.png`, `password_generator.png`, `security.png`, `file_manager.png`, `cloud_storage.png`, `backup_utility.png`, `secret_manager.png`.
*   **And 60+ more...** (check the [resources](file:///Users/codecaine/bun_webview-1/resources) folder for the full catalog).

## 🌐 Useful Online Icon Resources

If you need additional custom icons, here are some excellent online directories:

- [IconArchive](https://www.iconarchive.com/) - Large searchable archive of standard application icons.
- [Google Fonts Icons](https://fonts.google.com/icons) - Highly customizable, modern Material symbol sets.
- [Simple Icons](https://simpleicons.org/) - Clean, brand-focused SVG icons for popular tech tools.
- [Boxicons](https://boxicons.com/icons?free=true) - Premium web-friendly vector icon packs.
- [Feather Icons](https://feathericons.com/) - Super-minimalist, lightweight open-source icons.

---

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
