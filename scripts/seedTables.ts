import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const FIXED_TABLES = [
  // Kunafa Section
  { number: 'Sm-2', zone: 'Sm', seats: 2 },
  { number: 'Sm-1', zone: 'Sm', seats: 2 },
  { number: 'J-9',  zone: 'J',  seats: 4 },
  { number: 'C-3',  zone: 'C',  seats: 4 },
  { number: 'C-4',  zone: 'C',  seats: 4 },
  { number: 'P-6',  seats: 4 },
  { number: 'P-5',  seats: 4 },
  { number: 'P-4',  seats: 4 },
  { number: 'P-3',  seats: 4 },
  { number: 'P-2',  seats: 4 },
  { number: 'P-1',  seats: 4 },
  { number: 'C-2',  zone: 'C',  seats: 4 },
  { number: 'C-1',  zone: 'C',  seats: 4 },
  { number: 'J-6',  zone: 'J',  seats: 4 },
  { number: 'J-5',  zone: 'J',  seats: 4 },

  // JB Cafe Floor - Garden: G-7 to G-1
  { number: 'G-7',  zone: 'G',  seats: 4 },
  { number: 'G-6',  zone: 'G',  seats: 4 },
  { number: 'G-5',  zone: 'G',  seats: 4 },
  { number: 'G-4',  zone: 'G',  seats: 4 },
  { number: 'G-3',  zone: 'G',  seats: 4 },
  { number: 'G-2',  zone: 'G',  seats: 4 },
  { number: 'G-1',  zone: 'G',  seats: 4 },

  // Jhula (Left): J-10, J-8, J-7
  { number: 'J-10', zone: 'J',  seats: 4 },
  { number: 'J-8',  zone: 'J',  seats: 4 },
  { number: 'J-7',  zone: 'J',  seats: 4 },

  // Col 4: 4-7 to 4-1
  { number: '4-7',  seats: 4 },
  { number: '4-6',  seats: 4 },
  { number: '4-5',  seats: 4 },
  { number: '4-4',  seats: 4 },
  { number: '4-3',  seats: 4 },
  { number: '4-2',  seats: 4 },
  { number: '4-1',  seats: 4 },

  // Col 3: 3-5 to 3-1
  { number: '3-5',  seats: 4 },
  { number: '3-4',  seats: 4 },
  { number: '3-3',  seats: 4 },
  { number: '3-2',  seats: 4 },
  { number: '3-1',  seats: 4 },

  // Col 2: 2-5 to 2-1
  { number: '2-5',  seats: 4 },
  { number: '2-4',  seats: 4 },
  { number: '2-3',  seats: 4 },
  { number: '2-2',  seats: 4 },
  { number: '2-1',  seats: 4 },

  // Col 1: 1-5 to 1-1
  { number: '1-5',  seats: 4 },
  { number: '1-4',  seats: 4 },
  { number: '1-3',  seats: 4 },
  { number: '1-2',  seats: 4 },
  { number: '1-1',  seats: 4 },

  // Entry Jhula: J-4 to J-1
  { number: 'J-4',  zone: 'J',  seats: 4 },
  { number: 'J-3',  zone: 'J',  seats: 4 },
  { number: 'J-2',  zone: 'J',  seats: 4 },
  { number: 'J-1',  zone: 'J',  seats: 4 },
];

async function seed() {
  console.log(`Starting to seed ${FIXED_TABLES.length} fixed tables to Firestore...`);

  // Remove old dummy tables (tbl-01 to tbl-10 or anything not matching)
  const existingSnap = await getDocs(collection(db, 'tables'));
  for (const docSnap of existingSnap.docs) {
    const data = docSnap.data();
    // If it's old format like "01", "02", "10"
    if (/^\d{2}$/.test(data.number) || docSnap.id.match(/^tbl-\d{2}$/)) {
      console.log(`Deleting old placeholder table: ${docSnap.id} (${data.name})`);
      await deleteDoc(docSnap.ref);
    }
  }

  // Insert all fixed tables
  for (const t of FIXED_TABLES) {
    const docId = `tbl-${t.number.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const tableData = {
      id: docId,
      number: t.number,
      name: `Table ${t.number}`,
      seats: t.seats || 4,
      status: 'available',
    };
    await setDoc(doc(db, 'tables', docId), tableData);
    console.log(`Seeded table: ${docId} -> ${tableData.name}`);
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding tables:', err);
  process.exit(1);
});
