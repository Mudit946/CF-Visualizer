# Codeforces Visualizer Pro

Codeforces Visualizer Pro is a modern, vibrant, and fully-featured React web application designed to be the ultimate all-in-one analytics platform for Codeforces users. It combines the core features of popular Codeforces Chrome extensions into a single, seamless web experience.

## ✨ Features

This platform provides an in-depth look at your competitive programming performance through intuitive charts and advanced custom tools.

### 📊 Core Analytics
*   **Dynamic User Profiles:** Instantly search for any Codeforces handle to view their current rank, max rating, contribution, and followers.
*   **Rating Progression Chart:** An interactive line chart displaying rating history over time, styled with Codeforces rank color backgrounds.
*   **Submission Activity Heatmap:** An annual calendar heatmap (GitHub-style) to track daily submission consistency and activity.
*   **Problem Difficulty Distribution:** A pie chart breaking down accepted problems by difficulty ranges (e.g., 800-1100, 1200-1500).
*   **Top Tags Radar:** A radar chart visualizing the most prominent topic tags in a user's solved problem set.

### 🛠️ Advanced Tools (Extension Replacements)
*   **Contest History & Delta Tracker:** A detailed log of all participated contests, showing the rank, final rating, and color-coded rating delta (+15, -20). Similar to the *CF Predictor* and *Carrot* extensions.
*   **Upsolving Helper:** Automatically cross-references your participated contests with the problemset to find problems you attempted but missed. Suggests the best next targets for upsolving.
*   **Compare Profiles:** Enter a rival's handle to do a side-by-side comparison of statistics such as Rating, Max Rating, Contribution, and Friends/Followers directly on the dashboard. Similar to *CF Enhancer*.
*   **Practice Recommendation Engine:** An algorithm that analyzes your weak topics based on submission success rates and suggests fresh, unsolved problems at an appropriate difficulty level.
*   **Virtual Mashup Generator:** Create a custom practice contest instantly by specifying a minimum rating, maximum rating, and the number of problems. The generator will randomly select unsolved problems within your parameters.

### 🎨 Vibrant UI
*   **Modern Aesthetics:** Built entirely with a sleek Dark Mode palette featuring vibrant neon accents, glassmorphic card overlays, and subtle gradients. 
*   **Responsive Layout:** Fully responsive grid layout optimized for both desktop and mobile viewing.

---

## 💻 Tech Stack

*   **Frontend Framework:** React 18, Vite
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS (Utility classes and custom CSS variables)
*   **Data Visualization:** Recharts, React Calendar Heatmap
*   **Icons:** Lucide React
*   **Utilities:** date-fns, clsx, tailwind-merge
*   **API:** Official Codeforces API

---

## 🚀 Getting Started

To run Codeforces Visualizer Pro locally:

1.  **Clone the Repository** and navigate to the project directory:
    ```bash
    cd cf-visualizer
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

4.  **View the Application:**
    Open `http://localhost:5173` in your browser. Enter a Codeforces handle in the landing page search bar to dive into the dashboard!

---

*Built by the Google DeepMind Antigravity Team to elevate the competitive programming experience.*
