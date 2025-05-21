# Project Title: Accessible Study Platform for People with Disabilities

## Description

This project is an accessible study platform designed specifically for people with disabilities. The core focus of the platform is to provide an accessible learning environment through voice-based automation, allowing users to navigate and interact with course materials using voice commands.

## Key Features

*   **Voice-Powered Navigation:** Control all aspects of the platform using voice commands.
*   **Course Management:** Courses are dynamically fetched from a MongoDB database.
*   **Admin Panel:** A secure admin login (using JWT authentication) allows administrators to upload and manage course content.
*   **Rich Course Content:** Each course can include sub-courses with:
    *   Text-based sections with Text-to-Speech (TTS) support.
    *   Video-based sections with an integrated media player.
*   **Accessibility Features:** Includes standard web accessibility options like text resizing and theme toggling.

## Project Structure

The project is divided into two main components:

*   **Client:** A React-based front-end application responsible for the user interface and user experience.
*   **Server:** A Node.js back-end application that handles business logic, API endpoints, database interactions (MongoDB), and user authentication.

Further details about each component can be found in their respective README files:

*   [Client/README.md](Client/README.md)
*   [Server/README.md](Server/README.md)
