# Boards

<div align="center">

### AI-Powered Storyboard Generation for Filmmakers & Creators

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation) • [Contributing](#contributing)

</div>
<div align="center">
   <img width="487" height="718" alt="Screenshot 2026-01-26 001656" src="https://github.com/user-attachments/assets/a63f3208-57de-4562-a006-234a1b84d062" />

</div>
---

## 📖 Overview

**Boards** is a professional storyboarding tool that transforms scripts and story ideas into visual storyboards using Google's Gemini AI. Built for filmmakers, content creators, and visual storytellers, it automates scene breakdown, character identification, and frame generation—allowing you to focus on your creative vision rather than manual sketching.

The application leverages Large Language Models to extract visual structure from cinematic text, generating technical shot lists, tracking recurring characters, and producing AI-assisted visual frames for every narrative moment.

### Key Highlights

- 🎬 **Smart Script Parsing** - Supports PDF, DOCX, TXT, and Fountain screenplay formats
- 🤖 **AI-Driven Visualization** - Powered by Google Gemini 2.0/2.5 Flash models
- 📊 **Professional Exports** - Production-ready PDFs, shot lists, and industry-standard formats
- 🎨 **Modern Interface** - Dark-themed UI built with React, TypeScript, and Tailwind CSS

---

## ✨ Features

### Core Capabilities

- **Intelligent Scene Breakdown**: Automatically parses screenplays into logical scenes and shots with precise timing and descriptions
- **Character Tracking**: Identifies and maintains consistency of key characters throughout your project
- **AI Frame Generation**: Creates high-quality visual drafts for every shot using Gemini Vision models
- **Real-time Preview**: Interactive storyboard editor with drag-and-drop reordering

### Export Formats

Boards supports multiple production-ready export formats:

| Format | Description |
|--------|-------------|
| **PDF Layouts** | Vertical, Horizontal, and Large Image layouts with customizable branding |
| **Shot Lists** | Detailed technical data exported to Excel (.xlsx) and PDF |
| **Frame Archives** | Bulk export of raw PNG frames in ZIP format |
| **Screenplay PDF** | Properly formatted Fountain screenplay documents |
| **EDL (XML)** | Industry-standard Edit Decision Lists for post-production |

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/thesohamdatta/Boards.git
   cd Boards
   ```

2. **Install dependencies**

   Using npm:
   ```bash
   npm install
   ```

   Or using yarn:
   ```bash
   yarn install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   > **Security Note**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 📖 Usage

### Basic Workflow

1. **Import Your Script**: Upload a screenplay file (PDF, DOCX, TXT, or Fountain format)
2. **AI Processing**: Boards automatically breaks down scenes, identifies characters, and generates shot descriptions
3. **Generate Frames**: Review and regenerate AI-generated visual frames as needed
4. **Export**: Choose from multiple export formats for your production workflow

### Supported File Formats

- **PDF**: Standard screenplay PDFs
- **DOCX**: Microsoft Word documents
- **TXT**: Plain text screenplays
- **Fountain**: Industry-standard plain text markup for screenplays

---

## 🏗️ Project Structure

```
Boards/
├── src/
│   ├── components/       # Reusable UI components (Radix + Tailwind)
│   │   ├── ui/          # Base UI primitives
│   │   └── ...          # Feature-specific components
│   ├── lib/             # Core business logic
│   │   ├── ai/          # Gemini AI orchestration
│   │   ├── parsers/     # Script parsing utilities
│   │   └── exporters/   # Export format generators
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main application component
├── public/              # Static assets
├── .env                 # Environment variables (create this)
└── package.json         # Project dependencies
```

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework

### UI Components
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library

### AI & Processing
- **Google Gemini API** - 2.0/2.5 Flash models for vision and text generation
- **PDF-Lib** - Client-side PDF generation
- **ExcelJS** - Excel file generation

### State Management
- **Zustand** - Lightweight state management with persistence middleware

---

## 🤝 Contributing

Contributions are what make the open source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Add tests for new features when applicable
- Update documentation for significant changes
- Ensure all existing tests pass before submitting PR

### Reporting Issues

If you encounter any bugs or have feature requests, please [open an issue](https://github.com/thesohamdatta/Boards/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Soham Datta**

- GitHub: [@thesohamdatta](https://github.com/thesohamdatta)
- Project Link: [https://github.com/thesohamdatta/Boards](https://github.com/thesohamdatta/Boards)

---

## 🙏 Acknowledgments

- [Google Gemini](https://deepmind.google/technologies/gemini/) for powering the AI capabilities
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- The open source community for inspiration and tools

---

## 📊 Project Status

This project is under active development. Check the [Issues](https://github.com/thesohamdatta/Boards/issues) page for planned features and known bugs.

---

<div align="center">

**If you find this project useful, please consider giving it a ⭐️!**

Made with ❤️ by the Boards team

</div>
