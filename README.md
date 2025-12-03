# FleetLink 🚛

**FleetLink** is a platform moderna e eficiente for fleet management, designed to connect drivers, trucks, and loads in an intuitive and responsive interface.

The system allows for complete management of the entire logistics cycle, from resource registration to real-time monitoring of deliveries with route visualization on the map.

---

## 🚀 Main Features

*   **Dashboard in Real Time:** Overview of the fleet with instant updates (via Firestore) of load status and resource availability.
*   **Load Management:** Load creation, editing, and tracking. Automatic route calculation (distance and duration) and visualization on the map.
*   **Driver Management:** Complete registration with CNH validation and historical links.
*   **Truck Management:** Fleet control, maintenance status, and load capacity.
*   **Intelligent Routing:** Integration with **Mapbox** to trace optimized routes and simulate the journey.
*   **Robust Business Rules:**
    *   Block trucks in maintenance.
    *   Weight capacity validation.
    *   Referential integrity between Driver and Truck.

---

## 🛠️ Stack Technology

The project was built with focus on performance, DX (Developer Experience) and maintainability:

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS v4, Shadcn UI (Radix Primitives)
*   **State & Data Fetching:** React Query (TanStack Query)
*   **Maps:** Mapbox GL JS, Turf.js
*   **Backend (BaaS):** Firebase (Auth, Firestore, Storage)
*   **Forms:** React Hook Form, Yup

> For details about architectural choices, trade-offs and optimizations, read the [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) file.

---

## ⚙️ Prerequisites

*   **Node.js:** Version **v20.19++ or 22.12+** or higher.
    *   *Tip: The project has an `.nvmrc` file. If using NVM, just run `nvm use`.*

---

## 📦 How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DanielF12/fleetLink.git
    cd fleetLink
    ```

2.  **Configure the environment variables:**
    Create a `.env` file in the root of the project and fill it with your keys (see `.env.example` or use the template below):

    ```env
    # Firebase
    VITE_FIREBASE_API_KEY=your-api-key
    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your-project-id
    VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
    VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
    VITE_FIREBASE_APP_ID=your-app-id

    # Mapbox
    VITE_MAPBOX_TOKEN=your-mapbox-token
    ```

    > **Important:** If the server is already running, you must restart it (`Ctrl+C` then `npm run dev`) for the `.env` changes to take effect.

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

---

## 🧪 Tests

The project uses **Vitest** for unit tests.

```bash
npm run test
```