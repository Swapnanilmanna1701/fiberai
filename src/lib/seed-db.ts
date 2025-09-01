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

async function seedDatabase() {
  const companiesCollection = collection(db, 'companies');
  const batch = writeBatch(db);

  companies.forEach((company) => {
    const { id, ...companyData } = company;
    const docRef = doc(companiesCollection, String(id));
    batch.set(docRef, companyData);
  });

  try {
    await batch.commit();
    console.log('Successfully seeded the database with mock company data!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
