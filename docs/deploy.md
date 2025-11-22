# Deployment Guide

## Prerequisites

- Node.js 23.0+ 
- pnpm (latest version)
- Rust (latest stable)
- Tauri CLI 2.0+

## Installation and Setup

### 1. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Tauri CLI (if not already installed)
pnpm add -D @tauri-apps/cli@next
```

### 2. Environment Setup

Ensure you have the following tools installed:

- [Node.js 23.0+](https://nodejs.org/)
- [Rust](https://rustup.rs/)
- [pnpm](https://pnpm.io/installation)

## Development

### Start Development Server

```bash
# Start Tauri development mode (opens desktop app)
pnpm tauri dev

# Or start only Next.js dev server (web browser)
pnpm dev
```

The development server will:
- Start Next.js frontend on http://localhost:3000
- Launch Tauri desktop application
- Enable hot reload for both frontend and Rust code

## Testing

### Frontend Testing

```bash
# Build Next.js application
pnpm build

# Start production server
pnpm start
```

### Tauri Testing

```bash
# Build Tauri application for testing
pnpm tauri build --debug

# Run Rust tests
cd src-tauri
cargo test
```

## Building for Production

### Development Build

```bash
# Build for development (faster, includes debug symbols)
pnpm tauri build --debug
```

### Release Build

```bash
# Build optimized release version
pnpm tauri build
```

This will create:
- **macOS**: `.app` bundle and `.dmg` installer in `src-tauri/target/release/bundle/`
- **Windows**: `.exe` and `.msi` installer
- **Linux**: `.AppImage` and `.deb` packages

## Distribution

### macOS

The build generates:
- `COS72-tauri.app` - Application bundle
- `COS72-tauri_[version]_aarch64.dmg` - Disk image for distribution

### Code Signing (macOS)

For distribution outside the App Store:

```bash
# Sign the application
codesign --force --deep --sign "Developer ID Application: Your Name" "src-tauri/target/release/bundle/macos/COS72-tauri.app"

# Create signed DMG
hdiutil create -srcfolder "src-tauri/target/release/bundle/macos/COS72-tauri.app" -volname "COS72" -fs HFS+ -fsargs "-c c=64,a=16,e=16" -format UDZO -size 200m "COS72-signed.dmg"
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Clear cache and rebuild
   ```bash
   rm -rf .next node_modules src-tauri/target
   pnpm install
   pnpm tauri build
   ```

2. **Rust Compilation Issues**: Update Rust
   ```bash
   rustup update
   ```

3. **Node.js Issues**: Clear node_modules
   ```bash
   rm -rf node_modules
   pnpm install
   ```

4. **"asset not found: index.html" Error in DMG**: This occurs when Next.js static export fails
   ```bash
   # Check if dist directory exists and contains index.html
   ls -la dist/
   
   # If missing, ensure Next.js config is correct
   # Remove conflicting config files
   rm next.config.js  # Keep only next.config.ts
   
   # Rebuild frontend
   rm -rf dist
   pnpm build
   
   # Verify static export worked
   ls -la dist/index.html
   
   # Then rebuild Tauri
   pnpm tauri build
   ```

5. **Next.js Configuration Conflicts**: Only use one config file
   - Keep `next.config.ts` for static export configuration
   - Remove `next.config.js` to avoid conflicts
   - Ensure `output: "export"` and `distDir: "dist"` are set

### Version Verification

```bash
# Check versions
node --version    # Should be 23.0+
pnpm --version   # Latest version
rustc --version  # Latest stable
pnpm tauri --version  # Should be 2.0+
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build and Release

on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '23'
        
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: latest
        
    - name: Setup Rust
      uses: dtolnay/rust-toolchain@stable
      
    - name: Install dependencies
      run: pnpm install
      
    - name: Build Tauri app
      run: pnpm tauri build
```

## Manual Testing Checklist

Before deployment, test these features:

- [ ] Application launches successfully
- [ ] All navigation links work
- [ ] Demo page communication functions work
- [ ] Hardware info detection works
- [ ] Calculator functionality operates correctly
- [ ] Event system sends and receives messages
- [ ] All pages render without errors
- [ ] UI is responsive on different screen sizes

## Project Structure

```
tauri-nextjs-template/
├── src/                 # Next.js frontend source
│   ├── app/            # Next.js app router pages
│   └── components/     # React components
├── src-tauri/          # Tauri Rust backend
│   ├── src/            # Rust source code
│   └── Cargo.toml      # Rust dependencies
├── docs/               # Project documentation
└── package.json        # Node.js dependencies
```

## Release Process

1. Update version in `package.json`
2. Update `CHANGES.md` with new features
3. Test all functionality
4. Build release version: `pnpm tauri build`
5. Test built application
6. Create GitHub release with artifacts
7. Update documentation as needed 