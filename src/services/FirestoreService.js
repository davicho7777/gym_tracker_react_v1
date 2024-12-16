import { db, auth } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, getDoc, setDoc } from 'firebase/firestore';

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

export async function getExerciseNames(user, week) {
  try {
    const exerciseNamesRef = doc(db, 'users', user.uid, 'exerciseNames', `week${week}`);
    const docSnap = await getDoc(exerciseNamesRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching exercise names:', error);
    return null;
  }
}

export async function saveExerciseNames(user, week, exercises) {
  try {
    const exerciseNamesRef = doc(db, 'users', user.uid, 'exerciseNames', `week${week}`);
    await setDoc(exerciseNamesRef, exercises);
  } catch (error) {
    console.error('Error saving exercise names:', error);
  }
}
