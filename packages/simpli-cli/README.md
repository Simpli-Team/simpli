# Simpli CLI

CLI tool for Simpli Docs.

## Installation

```bash
npm install -g simpli-cli
```

Or use with npx:

```bash
npx simpli-cli <command>
```

## Commands

### `simpli dev`

Start development server.

```bash
simpli dev
simpli dev --port 3000
simpli dev --host --open
```

### `simpli build`

Build for production.

```bash
simpli build
simpli build --outDir build
```

### `simpli serve`

Serve production build.

```bash
simpli serve
simpli serve --port 8080
```

### `simpli clear`

Clear cache and build files.

```bash
simpli clear
```

### `simpli create <name>`

Create a new Simpli project.

```bash
simpli create my-docs
```

### `simpli doctor`

Check project health and configuration.

```bash
simpli doctor
```

## License

MIT
