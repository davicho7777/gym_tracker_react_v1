// src/services/FirestoreService.js
import { db , auth } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function addWorkout(user, workoutData) {
  const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
  await addDoc(workoutsCollection, workoutData);
}

export async function getWorkouts(user) {
  const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
  const querySnapshot = await getDocs(workoutsCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateWorkout(user, workoutId, updatedData) {
  const workoutRef = doc(db, 'users', user.uid, 'workouts', workoutId);
  await updateDoc(workoutRef, updatedData);
}