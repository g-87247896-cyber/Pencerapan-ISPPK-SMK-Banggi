# Implementation Plan - ISPPK SMK Banggi 2027 & Fix GitHub REST API Connection

Upgrade the Pencerapan ISPPK SMK Banggi application for Year 2027, remove obsolete features, and fix the static GitHub Pages REST API connection error (`Unexpected token '<'`).

> [!IMPORTANT]
> All updates for **Tahun 2027** and removal of the **Peti Mesej Guru** tab have been implemented across components. The GitHub REST API client-side fallback is now configured to handle static GitHub Pages hosting without throwing JSON parsing errors on HTML responses.

### Confirmed Decisions (Phase 1 Clarifications)
- **Environment**: GitHub REST API Connection Settings on static GitHub Pages.
- **Error Handled**: `Unexpected token '<', "<html> <he"... is not valid JSON` occurring when Express backend routes (`/api/*`) return `index.html` on static hosts.
- **PAT Permissions**: GitHub Personal Access Token has `repo` / `public_repo` scope enabled.

---

### 1. Overview & Core Concept
- **What It Does**: System Pencerapan Pengajaran dan Pembelajaran (PdP) Guru SMK Banggi, Kudat, Sabah (Kod Sekolah: `XEA6062` / Katalaluan Pentadbir: `XEA5021`), updated for **Tahun 2027**.
- **Key Capability**: Complete teacher evaluation instrument, rubric preview, digital signature uploads, PDF generation, official reporting dashboards, statistics, and direct GitHub repository synchronization.

---

### 2. User Experience & Visual Design
- **Header & Navigation**: Updated all titles to **ISPPK 2027** ("Pencerapan ISPPK SMK Banggi 2027"). Removed the **Peti Mesej Guru** tab from the main header navigation menu.
- **Branding & Footer**: Preserved official SMK Banggi identity, emblem, slogan ("Berilmu dan Berakhlak"), Kudat, Sabah context, and gated login password (`XEA5021`).
- **GitHub Connection Modal**: Enhanced the GitHub REST API modal to show clear connection status indicators (Checking, Direct API Connected, Error fallback) without breaking on static hosting.

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Direct Browser-to-GitHub REST API Connection (Client-Side Fallback)
- **Chosen Approach**: Implemented `directGitHubTest`, `directGitHubPushFile`, and `directGitHubPullFile` in `src/services/api.ts` using direct browser `fetch()` calls to `https://api.github.com/repos/{owner}/{repo}` with Bearer/Token authorization headers.
- **Why**: GitHub Pages is static and cannot process backend Node.js `/api/github/*` routes. By falling back to direct GitHub REST API calls, admins can test connection and push files directly from GitHub Pages.

#### Decision 2: HTML vs JSON Content Validation (`safeFetchJson` & `safeParseJson`)
- **Chosen Approach**: Before calling `res.json()`, check Content-Type headers and inspect the response string for opening HTML tags (`<` or `<!doctype`).
- **Why**: Prevents uncaught `SyntaxError: Unexpected token '<'` when static servers return HTML 404/index pages for missing API endpoints.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────┐
│              Browser Client (GitHub Pages)              │
│                                                         │
│  ┌────────────────────┐      ┌───────────────────────┐  │
│  │ App.tsx / Views    │ ───> │ GitHubBackendConfig   │  │
│  │ (ISPPK 2027 UI)    │      │ (Token / Repo Config) │  │
│  └────────────────────┘      └───────────────────────┘  │
│            │                             │              │
│            ▼                             ▼              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  src/services/api.ts                              │  │
│  │  - safeFetchJson / safeParseJson                  │  │
│  │  - Fallback: Direct GitHub REST API Fetch         │  │
│  └───────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │ Direct REST API (PAT Auth)
                           ▼
            ┌─────────────────────────────┐
            │   GitHub REST API           │
            │   api.github.com/repos/...  │
            └─────────────────────────────┘
```

#### Data Stores & Verification
1. **Local Storage**: Auto-saves instruments, rubrics, and offline evaluations.
2. **GitHub Repository Sync**: Pushes evaluation data JSON and lockfiles directly to the user's GitHub repo.
3. **Build & Lint Verification**: `tsc --noEmit` and `vite build` confirm 0 errors and populated `dist/` and `docs/` folders for static publishing.
