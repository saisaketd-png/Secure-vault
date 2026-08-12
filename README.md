# SecureVault

A high-end, zero-knowledge password manager built with modern web technologies, military-grade client-side encryption, and a bespoke, ultra-minimalist Fintech-style UI.

## Features

- **End-to-End Encryption:** Local AES-256 encryption. Plaintext passwords never leave the device.
- **Zero-Knowledge Architecture:** The master password is not stored anywhere. It's mathematically guaranteed privacy.
- **Bespoke Editorial UI:** Stripped away all generic UI templates for a strict, structural, monochromatic Apple/Fintech-inspired design language.
- **Password Strength Analysis:** Real-time feedback on your master password complexity.
- **Secure Password Generator:** Generates passwords using cryptographically secure random values.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Supabase (Auth, Database)
- Lucide React

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Configure your local `.env` with your Supabase keys (use `.env.example` as a template).
4. Run the development server: `npm run dev`

## Security

This project employs client-side encryption. If you lose your master password, your vault data is completely unrecoverable.
