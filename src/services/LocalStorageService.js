// Small wrapper to centralize localStorage key patterns and access
export function weightKey(week, day, index) {
  return `number-${week}-${day}-${index}`;
}

export function repsKey(week, day, index, set) {
  return `reps-${week}-${day}-${index}-set${set}`;
}

export function exerciseNameKey(week, day, index) {
  return `exercise-${week}-${day}-${index}`;
}

export function getWeight(week, day, index) {
  return localStorage.getItem(weightKey(week, day, index)) || "0";
}

export function setWeight(week, day, index, value) {
  localStorage.setItem(weightKey(week, day, index), value);
}

export function getRep(week, day, index, set) {
  return localStorage.getItem(repsKey(week, day, index, set)) || "0";
}

export function setRep(week, day, index, set, value) {
  localStorage.setItem(repsKey(week, day, index, set), value);
}

export function getExerciseName(week, day, index) {
  return localStorage.getItem(exerciseNameKey(week, day, index));
}

export function setExerciseNameLS(week, day, index, name) {
  localStorage.setItem(exerciseNameKey(week, day, index), name);
}

export function clearWeekLocal(week) {
  // optional: iterate keys and remove those that match the week prefix
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith(`${week}-`) || key.includes(`-${week}-`)) {
      localStorage.removeItem(key);
    }
  });
}

// UI mode persistence helpers
const MODE_KEY = "ui-mode";

export function getMode() {
  try {
    return localStorage.getItem(MODE_KEY) || null;
  } catch (e) {
    return null;
  }
}

export function setMode(mode) {
  try {
    if (mode) localStorage.setItem(MODE_KEY, mode);
    else localStorage.removeItem(MODE_KEY);
  } catch (e) {
    // ignore
  }
}

// Units persistence (kg | lb)
const UNITS_KEY = "settings-units";

export function getUnits() {
  try {
    return localStorage.getItem(UNITS_KEY) || "kg";
  } catch (e) {
    return "kg";
  }
}

export function setUnits(u) {
  try {
    if (u) localStorage.setItem(UNITS_KEY, u);
    else localStorage.removeItem(UNITS_KEY);
  } catch (e) {
    // ignore
  }
}

const LocalStorageService = {
  weightKey,
  repsKey,
  exerciseNameKey,
  getWeight,
  setWeight,
  getRep,
  setRep,
  getExerciseName,
  setExerciseNameLS,
  clearWeekLocal,
};

export default LocalStorageService;
