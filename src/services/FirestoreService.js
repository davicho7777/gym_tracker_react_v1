// src/services/FirestoreService.js
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function addWorkout(user, workoutData) {
  if (!user || !user.uid) {
    throw new Error('Usuario no autenticado');
  }

  try {
    const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
    
    // Check if a workout for this week already exists
    const querySnapshot = await getDocs(workoutsCollection);
    const existingWorkout = querySnapshot.docs.find(
      doc => doc.data().week === workoutData.week
    );

    if (existingWorkout) {
      // Update existing workout
      await updateDoc(doc(db, 'users', user.uid, 'workouts', existingWorkout.id), workoutData);
    } else {
      // Create new workout
      await addDoc(workoutsCollection, workoutData);
    }
  } catch (error) {
    console.error('Error al agregar/actualizar workout:', error);
    throw error;
  }
}

export async function getExerciseNames(user) {
  if (!user || !user.uid) {
    throw new Error('Usuario no autenticado');
  }
  
  const workoutsCollection = collection(db, 'users', user.uid, 'workouts');
  const querySnapshot = await getDocs(workoutsCollection);

  // Extracting only the exercise names from each workout document
  return querySnapshot.docs.map(doc => doc.data().exerciseName).filter(name => !!name);
}



export async function updateWorkout(user, workoutId, updatedData) {
  const workoutRef = doc(db, 'users', user.uid, 'workouts', workoutId);
  await updateDoc(workoutRef, updatedData);
}
