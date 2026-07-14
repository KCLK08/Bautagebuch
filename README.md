# Alltag

Personal monorepo for all KCLK08 projects — one repository so a single Cursor Cloud Agent can access everything.

## Projects

| App | Path | Description | Stack |
|-----|------|-------------|-------|
| **Bautagebuch** | `apps/bautagebuch` | Mobile eBTB construction diary | Expo / React Native |
| **Buew Toolbox** | `apps/buew-toolbox` | Web tools for construction supervisors | SvelteKit hub + sub-apps |
| **DS-Datenbank** | `apps/ds-datenbank` | DS attack planner / data tool | React / Vite |
| **Elifba** | `apps/elifba` | Learn to read the Quran (Elifba trainer) | Static HTML PWA |

## Quick start

Each app is independent. From the repo root:

```bash
# Install dependencies for a specific app
npm install --prefix apps/bautagebuch
npm install --prefix apps/ds-datenbank
npm install --prefix apps/buew-toolbox/bautagebuch-v2
npm install --prefix apps/buew-toolbox/sitereport

# Run development servers
npm run dev --prefix apps/bautagebuch          # Expo
npm run dev --prefix apps/ds-datenbank          # Vite
npm run dev --prefix apps/buew-toolbox/bautagebuch-v2
```

**Elifba** has no build step — open `apps/elifba/index.html` in a browser or serve the folder statically.

## Repository layout

```
Alltag/
├── apps/
│   ├── bautagebuch/       ← github.com/KCLK08/Bautagebuch
│   ├── buew-toolbox/      ← github.com/KCLK08/buew-toolbox
│   ├── ds-datenbank/      ← github.com/KCLK08/DS-Datenbank
│   └── elifba/            ← github.com/KCLK08/elifba
├── package.json           ← npm workspaces root
└── README.md
```

## Cursor Cloud Agent

Point your Cloud Environment at **`github.com/KCLK08/Alltag`**. The agent will see all apps under `apps/`.

### Publish this monorepo to Alltag

The combined code lives on branch `cursor/alltag-monorepo-b736` in Bautagebuch until it is pushed to Alltag.

**Easiest (one-time):**

1. Open [Bautagebuch → Actions → Publish monorepo to Alltag](https://github.com/KCLK08/Bautagebuch/actions/workflows/publish-to-alltag.yml)
2. Add repository secret `ALLTAG_PAT` (fine-grained PAT with **Contents: Read and write** on `KCLK08/Alltag`)
3. Click **Run workflow**

**Or from your machine:**

```bash
git clone https://github.com/KCLK08/Bautagebuch
cd Bautagebuch
git checkout cursor/alltag-monorepo-b736
git remote add alltag https://github.com/KCLK08/Alltag.git
git push alltag HEAD:main --force
```

Then grant the **Cursor** GitHub App access to `KCLK08/Alltag` and set your Cloud Environment to that repo.

## Original repositories

These standalone repos still exist on GitHub for history and Pages deploys. Active development can move here:

- https://github.com/KCLK08/Bautagebuch
- https://github.com/KCLK08/buew-toolbox
- https://github.com/KCLK08/DS-Datenbank
- https://github.com/KCLK08/elifba
