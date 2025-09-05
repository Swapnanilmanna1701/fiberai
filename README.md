# Fiber AI 🚀

Welcome to Fiber AI, a powerful and intuitive platform for searching, filtering, and analyzing company data. Leveraging a modern tech stack, Fiber AI provides a seamless user experience with advanced AI-powered search capabilities.

## ✨ Features

- **Advanced Search:** Filter companies by a wide range of criteria including industry, technologies, headquarters location, employee count, and revenue.
- **Natural Language Search:** Use everyday language to perform complex queries (e.g., "tech companies in the USA using React"). Our Genkit-powered AI translates your query into structured filters.
- **AI-Powered Suggestions:** Get intelligent filter suggestions based on your initial search terms to help you narrow down results effectively.
- **Responsive Design:** A clean, mobile-first interface ensures a great experience on any device.
- **Data Export:** Easily export your filtered search results to CSV or JSON for offline analysis.
- **Firebase Integration:** Built on a scalable and reliable Firestore database backend.

## 💻 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative:** [Genkit](https://firebase.google.com/docs/genkit) (with Google's Gemini models)
- **Database:** [Google Firestore](https://firebase.google.com/docs/firestore)
- **UI Components:** Built with Radix UI primitives.

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Access to a [Firebase Project](https://firebase.google.com/)

### 1. Set Up Environment Variables

First, you need to configure your Firebase project credentials.

1.  Copy the `.env.example` file to a new file named `.env`.
2.  Log in to your [Firebase Console](https://console.firebase.google.com/).
3.  Navigate to **Project Settings** > **General**.
4.  Under "Your apps", find your web app and click the **</>** icon to view its configuration.
5.  Copy the values from the `firebaseConfig` object and paste them into your `.env` file.

Your `.env` file should look like this:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=REPLACE_WITH_YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=REPLACE_WITH_YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=REPLACE_WITH_YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=REPLACE_WITH_YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=REPLACE_WITH_YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=REPLACE_WITH_YOUR_APP_ID
```

You will also need to provide a Google AI API key for the generative features.

```bash
# Obtain your key from Google AI Studio: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Populate the Database

To use the application, you need to seed your Firestore database with the provided company data. Run the following command:

```bash
npm run db:seed
```

This will connect to your Firebase project and upload all the company data from `src/lib/data.ts`.

### 4. Run the Development Servers

This project requires two development servers running concurrently:

1.  **Next.js App Server:** Open a terminal and run:
    ```bash
    npm run dev
    ```
    This will start the main web application, typically on `http://localhost:9002`.

2.  **Genkit AI Server:** Open a second terminal and run:
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit server that powers the AI features.

Once both servers are running, you can access the application in your browser.

## 📂 Project Structure

Here is a high-level overview of the project's file structure:

```
/
├── src/
│   ├── app/                # Next.js App Router: pages, layouts, and components
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   ├── layout.tsx      # Root layout component
│   │   └── page.tsx        # Main application page
│   │
│   ├── ai/                 # Genkit AI configuration and flows
│   │   ├── flows/          # AI logic for search and suggestions
│   │   └── genkit.ts       # Genkit initialization
│   │
│   ├── components/         # Reusable React components
│   │   ├── ui/             # ShadCN UI components
│   │   └── ...             # Custom application components
│   │
│   ├── hooks/              # Custom React hooks (e.g., for search logic)
│   │
│   ├── lib/                # Core libraries, utilities, and data
│   │   ├── data.ts         # Mock company dataset
│   │   ├── firebase.ts     # Firebase initialization
│   │   ├── seed-db.ts      # Script to populate the database
│   │   └── utils.ts        # Utility functions
│   │
├── .env                    # Environment variables (Firebase keys)
├── next.config.ts          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 📜 Available Scripts

In the project directory, you can run:

-   `npm run dev`: Starts the Next.js development server with Turbopack.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the project files using ESLint.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run db:seed`: Seeds the Firestore database with initial data.
