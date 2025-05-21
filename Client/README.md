# Client Application (Accessible Study Platform for People with Disabilities)

This is the front-end application for the Accessible Study Platform for People with Disabilities. It is built using React and Vite.

## Overview

The client application provides the user interface and handles all user interactions. Its primary goal is to offer an accessible learning experience, heavily relying on voice commands for navigation and control.

## Features

*   **Voice Command Interface:** Allows users to navigate through courses, control video playback, utilize text-to-speech, and access other platform features using their voice.
*   **Course Display:** Renders course content, including text-based materials and video lectures.
*   **Text-to-Speech (TTS):** Integrates TTS functionality for text-based course sections.
*   **Video Player:** Includes a media player for video content.
*   **Accessibility Tools:** Provides features like text resizing and theme toggling.
*   **Admin Dashboard:** Separate interface for administrators to manage courses (requires authentication).

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn) installed.

### Installation

1.  Navigate to the `Client` directory:
    ```bash
    cd Client
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the Development Server

1.  Start the Vite development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
2.  Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173` or similar).

## Key Technologies

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool and development server for modern web projects.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
