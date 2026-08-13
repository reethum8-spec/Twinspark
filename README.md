# TwinSpark  — AI-Assisted Electronics Product Digital Twin

**TwinSpark** is an interactive, AI-assisted electronics digital twin application for students, makers, and hardware developers. It helps model, calculate power consumption, estimate battery runtime, and visualize 3D physical layouts of battery-powered electronic devices.

---

##  Features

- **Two Starting Options**:
  - **Start Blank**: Begin with a clean slate to model custom devices from scratch.
  - **Try Sample (Portable Smart Device)**: Load default ESP32, DHT22, OLED 0.96", LED, Li-Ion battery, usage schedule, calculation values, and 3D layout.
- **Deterministic Power Calculation Engine**:
  - Calculates Average Current ($I_{\text{avg}}$), Peak Current ($I_{\text{peak}}$), Usable Battery Capacity (mAh), and Battery Life (Hours & Days).
  - Adjustable DC-DC Converter Efficiency (%) and Usable Battery Capacity (%) sliders.
- **Datasheet Provenance & Confidence Badges**:
  - Displays provenance confidence level (`Starter Estimate`, `Verified Datasheet`, `Lab Measured`, `Custom Spec`) and datasheet notes for all component values.
- **Operating-State Timeline Diagram**:
  - Sequence flow visualization (`Sleep → Wake → Read Sensor → Display / Output → Transmit → Sleep`).
- **Interactive 3D Block Product Layout (Three.js)**:
  - Renders 3D blocks for Enclosure, PCB, Battery, MCU, Sensors, Display, and LEDs.
  - Supports 3D orbit controls, zoom, exploded view slider (0%–100%), X-ray glass toggle, and screen-projected component labels.
- **"Explain This Result" AI Power Insights**:
  - Identifies top power consumers and provides actionable power-reduction advice.
- **Save Project Versions**:
  - Local state manager to save, load, and manage multiple named project versions.

---

##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/reethum8-spec/Twinspark.git
   cd Twinspark
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```

4. Open your browser at **`http://localhost:5173/`**.

---

##  Building for Production

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **3D Graphics**: Three.js + OrbitControls
- **Styling**: Tailwind CSS v4
- **Math & Icons**: KaTeX, Lucide React

---

## 📄 License

MIT License. Free for open-source, educational, and personal use.
