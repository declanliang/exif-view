# EXIF Viewer

A modern web application for viewing EXIF metadata from uploaded images.

## Features

- Drag and drop or select images to upload
- View detailed EXIF metadata categorized into sections
- Client-side processing for privacy (no server uploads)
- Responsive design that works on all devices
- SEO-friendly content

## Technology Stack

- **Framework**: Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **EXIF Parsing**: exifr library

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How It Works

The application allows users to upload images through a simple drag-and-drop interface or file selector. Once an image is uploaded, the app extracts its EXIF metadata using the exifr library and displays it in a user-friendly format.

All processing happens client-side in the browser, ensuring user privacy as images are never sent to any server.

## EXIF Data Categories

The application displays EXIF data organized into the following categories:

- **EXIF**: Basic image information and camera settings
- **JFIF**: JPEG file interchange format data
- **Composite**: Calculated or derived values
- **ICC Profile**: Color profile information
- **File**: Information about the file itself

## License

This project is licensed under the MIT License - see the LICENSE file for details.
