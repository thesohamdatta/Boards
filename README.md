# Boards

### AI-Powered Storyboard Generation for Filmmakers & Creators

Boards is a professional storyboarding tool that transforms scripts and story ideas into visual storyboards using Google's Gemini AI. It automates scene breakdown, character identification, and frame generation, allowing creators to focus on vision rather than manual sketching.

## 🎯 Core Concept
The application takes cinematic text (screenplays, treatments, or outlines) and utilizes Large Language Models to extract visual structure. It generates technical shot lists, identifies recurring characters, and produces AI-assisted visual frames for every moment of your narrative.

## ✨ Features
*   **Smart Scene Breakdown**: Automatically parses scripts (PDF, DOCX, TXT, Fountain) into logical scenes and shots.
*   **Character Recognition**: Tracks key characters across the entire project for narrative consistency.
*   **AI-Generated Frames**: Produces high-quality visual drafts for every shot using Gemini Vision models.
*   **Multi-Format Export**: Production-ready exports including:
    *   **High-Fidelity PDFs**: Multiple layouts (Vertical, Horizontal, Large Image).
    *   **Shot Lists**: Technical data extraction to Excel (.xlsx) and PDF.
    *   **ZIP Archives**: Bulk export of raw PNG frames.
    *   **Industry Standards**: Screenplay PDF (Fountain) and XML Edit Decision Lists (EDL).

## 🚀 Quick Start

### Prerequisites
*   Node.js 18+
*   Google Gemini API key

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/thesohamdatta/Boards.git
    cd Boards
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup environment**:
    Create a `.env` file in the root and add your key:
    ```bash
    VITE_GEMINI_API_KEY=your_api_key_here
    ```
4.  **Launch**:
    ```bash
    npm run dev
    ```

## 📖 Project Structure
*   `src/components/`: Modular UI system built with Radix and Tailwind.
*   `src/lib/`: Core logic for AI orchestration, script parsing, and export utilities.
*   `src/stores/`: Global state management via Zustand with local persistence.
*   `src/types/`: Centralized TypeScript definitions for cinematic data structures.

## 🛠️ Technical Stack
*   **Frontend**: React 18, TypeScript, Vite
*   **Styling**: Tailwind CSS (Custom "Elevated Charcoal" Dark Theme)
*   **AI Orchestration**: Google Gemini 2.0/2.5 Flash
*   **Persistence**: Zustand Middleware (LocalStorage)

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact
Developed by **Soham Datta**  
GitHub: [@thesohamdatta](https://github.com/thesohamdatta)
