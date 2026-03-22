# 📄 RESUME.io — React Resume Builder

A feature-rich, browser-based resume builder built with **React 19** and **Tailwind CSS v4**. Edit your resume content in real-time, customize every visual detail through a live styling sidebar, drag sections into any order, and download a pixel-perfect PDF in one click.

---

## ✨ Features

### 📝 Content Editing
- **Personal Information** — Name, phone, location, email, GitHub, LinkedIn, Portfolio
- **Professional Summary** — Optional paragraph shown below your name (toggle on/off)
- **Work Experience** — Multiple entries with role, company, duration, and bullet points
- **Projects** — Title, tech stack, GitHub & live links, and bullet points
- **Technical Skills** — Languages, Frameworks, Databases, Tools, Specializations
- **Education** — Degree, school, duration, and GPA/score
- **Achievements** — Freeform bullet list

### 🎨 Visual Style Controls
All style changes reflect **instantly** in the live preview — no page reload, no lag.

| Control | Options |
|---|---|
| Body Text Size | 10–16 px slider |
| Section Heading Size | 9–16 px slider |
| Name / Title Size | 20–48 px slider |
| Line Height | 1.0–2.0× slider |
| Section Spacing | 8–32 px slider |
| Font Family | Classic Serif · Elegant Lora · Modern Sans · Technical Mono |
| Heading Style | Underline · Overline · Sidebar · Minimal |
| Divider Thickness | 1px · 1.5px · 2px |
| Link & Accent Color | Color picker + 8 quick-pick swatches |
| Paper Color | Pure White · Warm White · Cream |
| Bold Section Headers | Toggle |
| Show Summary | Toggle |

### ⠿ Drag-to-Reorder Sections
Drag any section (Achievements, Work Experience, Projects, Skills, Education, Summary) into any position using the **grip handle**. The resume preview updates instantly.

### 📥 High-Fidelity PDF Download
- Uses **`react-to-print`** (browser-native print engine — not canvas rasterization)
- Vector output — fonts are crisp and text is selectable in the saved PDF
- Correct **A4 dimensions** (210mm × 297mm) enforced at print time
- UI chrome (sidebar, buttons) hidden automatically via `@media print`
- Page-break rules prevent sections from splitting awkwardly across pages

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| PDF Generation | react-to-print v3 |
| Routing | react-router-dom v7 |
| State | React Context API (ResumeContext + StyleContext) |
| Persistence | localStorage (resume data survives page refresh) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anshul2807/resume-builder.git
cd resume-builder

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # Build production bundle → dist/
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

---

## 🗂 Project Structure

```
resume-builder/
├── index.html                      # Entry HTML (Google Fonts loaded here)
├── vite.config.js
├── package.json
│
└── src/
    ├── main.jsx                    # React root mount
    ├── App.jsx                     # Router + context providers
    ├── index.css                   # Global CSS, print rules, slider styles
    │
    ├── context/
    │   ├── ResumeContext.jsx       # Resume data state + localStorage persistence
    │   └── StyleContext.jsx        # Style config, section order, show/hide state
    │
    ├── hooks/
    │   ├── useLocalStorage.js      # Generic localStorage hook
    │   └── usePdfDownload.js       # react-to-print wrapper with A4 + style injection
    │
    ├── pages/
    │   └── Builder.jsx             # Main page — tabbed sidebar + live preview
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── SectionTitle.jsx
    │   │   └── TextArea.jsx
    │   │
    │   ├── forms/                  # Content tab — one form per resume section
    │   │   ├── PersonalInfoForm.jsx
    │   │   ├── ProfessionalSummaryForm.jsx
    │   │   ├── SummaryForm.jsx      # Achievements form
    │   │   ├── ExperienceForm.jsx
    │   │   ├── ProjectForm.jsx
    │   │   ├── SkillsForm.jsx
    │   │   └── EducationForm.jsx
    │   │
    │   ├── preview/
    │   │   └── ResumeTemplate.jsx  # A4 resume card (forwardRef for PDF capture)
    │   │
    │   └── style/
    │       ├── StyleSidebar.jsx    # Style tab UI — sliders, pickers, toggles
    │       ├── StyleInjector.jsx   # Imperatively writes CSS vars → <style> tag
    │       └── SectionOrderPanel.jsx # @dnd-kit drag-to-reorder section list
    │
    └── utils/
        ├── initialResumeData.js    # Default resume content
        └── localStorage.js         # localStorage read/write helpers
```

---

## ⚙️ Architecture Highlights

### Zero Re-Render Live Styling

Style updates (sliders, color pickers) do **not** cause `ResumeTemplate` to re-render:

```
Slider onChange
     ↓
StyleContext.updateStyle()        ← state update
     ↓
StyleInjector re-renders          ← tiny component, renders null
     ↓
useLayoutEffect writes CSS to     ← imperative DOM update, before paint
  <style id="resume-dynamic-styles">
     ↓
Browser recalculates CSS          ← native engine, sub-millisecond
     ↓
ResumeTemplate ─── ✅ never touched by React reconciliation
```

### Section Order (Drag & Drop)

```
User drags grip handle
     ↓
@dnd-kit fires onDragEnd({ active, over })
     ↓
arrayMove(sectionOrder, oldIndex, newIndex)
     ↓
StyleContext.reorderSections(newOrder)
     ↓
ResumeTemplate.sectionOrder.map(id => renderSection(id))
     ↓  ← React reconciles only the list order (cheap key-based)
Resume preview reorders instantly
```

### PDF Generation (react-to-print v3)

1. `usePdfDownload` creates a `printRef` attached to `<ResumeTemplate>`
2. On button click, react-to-print clones the DOM node into a hidden `<iframe>`
3. Global stylesheets are copied into the iframe (`ignoreGlobalStyles: false`)
4. A `pageStyle` string injects `@page { size: A4; margin: 0 }` rules
5. `iframe.contentWindow.print()` opens the browser's native Save as PDF dialog

---

## 📸 Screenshot

> **Left:** Tabbed sidebar with Content / Style tabs  
> **Right:** Live A4 preview that matches the downloaded PDF exactly

---

## 🧩 Extending the App

### Adding a New Resume Section

1. Add the section data to `initialResumeData.js`
2. Add a new entry to `ALL_SECTIONS` in `StyleContext.jsx`
3. Create a `<NameSection />` renderer in `ResumeTemplate.jsx`
4. Add a `case 'name':` in `renderSection()`
5. Create a form component in `src/components/forms/`
6. Import and render it in the Content tab inside `Builder.jsx`

### Changing the Default Style

Edit `defaultStyleConfig` in `src/context/StyleContext.jsx`.

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [react-to-print](https://github.com/MatthewHerbst/react-to-print) — browser-native PDF printing
- [@dnd-kit](https://dndkit.com/) — accessible drag-and-drop
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Google Fonts](https://fonts.google.com/) — Inter & Lora typefaces