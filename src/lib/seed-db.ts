import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import { companies } from './data';
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Firestore allows a maximum of 500 operations in a single batch.
const BATCH_SIZE = 499;

async function seedDatabase() {
  const companiesCollection = collection(db, 'companies');
  
  console.log(`Starting to seed ${companies.length} companies...`);

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = companies.slice(i, i + BATCH_SIZE);
    
    console.log(`Processing chunk ${Math.floor(i / BATCH_SIZE) + 1}...`);

    chunk.forEach((company) => {
      const { id, ...companyData } = company;
      if (id !== undefined) {
        const docRef = doc(companiesCollection, String(id));
        batch.set(docRef, {
            ...companyData,
            totalTechnologies: company.technologies.length,
        });
      }
    });

    try {
      await batch.commit();
      console.log(`Successfully committed a batch of ${chunk.length} companies.`);
    } catch (error) {
      console.error('Error committing batch:', error);
      // If one batch fails, we stop the whole process.
      return;
    }
  }

  console.log('Successfully seeded the database with all mock company data!');
}

seedDatabase();
