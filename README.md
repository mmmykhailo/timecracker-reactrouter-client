# Timecracker

A stupidly simple timetracker.

| Tracking page | Stats page |
| ------------- | ------------- |
| ![image](https://github.com/user-attachments/assets/d9b8e7e1-4967-42f3-9fe8-0a486fd6ec0d)  | ![image](https://github.com/user-attachments/assets/3edfa5aa-0797-48a0-a460-35578bb83122)  |


## Features

- 🚀 Works fully offline after page load
- 🔒 Secure, your data doesn't go through network
- 📖 File-based, keep your record even if you decide to stop using the app
- 🎉 Both dark and light theme
- 📦 No need to install, just use it in your browser

## Getting Started

### Installation

Install the dependencies:

```bash
bun install
```

### Development

Start the development server with HMR:

```bash
bun dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

This application can be deployed to any hosting as it only needs to serve static files.

You can find Github Pages deploy script in `.github/workflows/deploy.yml`


## Tech stack

- TypeScript
- React Router 7 (in SPA mode)
- Tailwind
- Valibot
- Biome
- idb-keyval (as persistent storage for directory handle)

A lot of [shadcn/ui](https://ui.shadcn.com/) components were used and design is generally inspired by shadcn/ui style.

---

Built with ❤️ in 🇺🇦

If you have any questions, feel free to contact me by [telegram](https://t.me/mrdr_scn) (higher chance of quick answer) or [email](mailto:mmmykhailo@proton.me).
