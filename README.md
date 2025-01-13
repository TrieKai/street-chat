# Street Chat <img src="public/street-chat.png" alt="Street Chat Icon" width="32" height="32" />

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4)](https://tailwindcss.com/)

A real-time 3D street communication platform that allows users to chat and interact in a virtual street environment.

## Features

- Real-time 3D street visualization
- Interactive chat system
- User authentication
- Chatroom creation and management
- PWA support for mobile devices
- Responsive design for all screen sizes
- Google Maps integration
- Three.js powered 3D rendering

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js
- **Maps**: Mapillary
- **Database**: Firestore
- **Authentication**: Firebase
- **Deployment**: Vercel

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Copy the `.env.example` file to `.env.local` and update the variables:

```env
NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN=
NEXT_PUBLIC_FIREBASE_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_BASE_URL=
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue in the GitHub repository.