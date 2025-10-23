import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { getCurrentUser } from './auth.js';

// Export db for use in other modules
export { db };

/**
 * Get reference to user's farms collection
 * @returns {CollectionReference} Firestore collection reference
 */
export const getUserFarmsCollection = () => {
  const user = getCurrentUser();
  console.log('🔍 Current user in getUserFarmsCollection:', user);
  if (!user) {
    throw new Error('User must be authenticated to access farms');
  }
  console.log('🔍 User UID:', user.uid);
  const farmsCollection = collection(db, 'users', user.uid, 'farms');
  console.log('🔍 Farms collection path:', `users/${user.uid}/farms`);
  return farmsCollection;
};

/**
 * Get reference to user's calculations collection
 * @returns {CollectionReference} Firestore collection reference
 */
export const getUserCalculationsCollection = () => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to access calculations');
  }
  return collection(db, 'users', user.uid, 'calculations');
};

/**
 * Get reference to a specific farm document
 * @param {string} farmId - Farm document ID
 * @returns {DocumentReference} Firestore document reference
 */
export const getFarmDoc = (farmId) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to access farm');
  }
  return doc(db, 'users', user.uid, 'farms', farmId);
};

/**
 * Get reference to a specific calculation document
 * @param {string} calculationId - Calculation document ID
 * @returns {DocumentReference} Firestore document reference
 */
export const getCalculationDoc = (calculationId) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to access calculation');
  }
  return doc(db, 'users', user.uid, 'calculations', calculationId);
};

/**
 * Add server timestamp to document data
 * @param {Object} data - Document data
 * @returns {Object} Data with server timestamp
 */
export const addTimestamp = (data) => {
  return {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

/**
 * Update document with server timestamp
 * @param {Object} data - Document data
 * @returns {Object} Data with updated timestamp
 */
export const addUpdateTimestamp = (data) => {
  return {
    ...data,
    updatedAt: serverTimestamp()
  };
};

/**
 * Get reference to calculations collection for a specific farm
 * @param {string} farmId - Farm document ID
 * @returns {CollectionReference} Firestore collection reference
 */
export const getFarmCalculationsCollection = (farmId) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to access calculations');
  }
  return collection(db, 'users', user.uid, 'farms', farmId, 'calculations');
};

/**
 * Get reference to a specific calculation document within a farm
 * @param {string} farmId - Farm document ID
 * @param {string} calculationId - Calculation document ID
 * @returns {DocumentReference} Firestore document reference
 */
export const getFarmCalculationDoc = (farmId, calculationId) => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('User must be authenticated to access calculation');
  }
  return doc(db, 'users', user.uid, 'farms', farmId, 'calculations', calculationId);
};