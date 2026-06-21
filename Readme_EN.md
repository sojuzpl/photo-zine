
# PhotoZineForge // A4 ✂️📸

**PhotoZineForge** is a lightweight, minimalist web tool designed for the automatic layout and imposition (arrangement of signatures on a sheet) of micro photo zines. The application allows users to quickly prepare an 8-page original photographic publication from a single sheet of A4 paper, printed on one side.

The application operates 100% in the user's browser (client-side) – photos are not sent to any external server, guaranteeing full privacy and lightning-fast performance.

---

## 🚀 Key Features

* **Automatic Print Imposition:** The tool automatically rotates and arranges pages (including pages flipped "upside down" on the sheet) according to the technical layout for folding a zine from a single sheet of paper.
* **Real-Time Preview:** A dynamic preview of the entire layout sheet while uploading photos and editing the cover.
* **Advanced Cropping (Integrated Slider):** Automatic detection of uploaded file aspect ratios and smart adjustment of the crop scroll axis (vertical or horizontal) depending on the photo's orientation.
* **Cover Personalization:** Option to enter multi-line text, choose typefaces (Sans-Serif, Serif, Monospace), and quickly switch between color themes (light/dark).
* **DTP Standard Export (PDF):** Generation of a print-ready PDF file in vector space with high quality using the `jsPDF` library.

---

## 📁 Project Structure

The project has been organized according to the best practices of Separation of Concerns:

```text
photo-zine-forge/
├── index.html          # User interface structure (DOM)
├── style.css           # Visual layer and responsiveness (CSS Variables)
├── app.js              # Business logic, state management, Canvas, and PDF export
└── instrukcja.jpg      # Graphical technical diagram for folding the zine
