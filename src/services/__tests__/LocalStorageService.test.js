import {
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
} from "../LocalStorageService";

describe("LocalStorageService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("key helpers produce consistent keys", () => {
    expect(weightKey(1, 2, 3)).toBe("number-1-2-3");
    expect(repsKey(1, 2, 3, 1)).toBe("reps-1-2-3-set1");
    expect(exerciseNameKey(1, 2, 3)).toBe("exercise-1-2-3");
  });

  test("set/get weight and reps", () => {
    expect(getWeight(1, 1, 0)).toBe("0");
    setWeight(1, 1, 0, "45");
    expect(getWeight(1, 1, 0)).toBe("45");

    expect(getRep(1, 1, 0, 1)).toBe("0");
    setRep(1, 1, 0, 1, "8");
    expect(getRep(1, 1, 0, 1)).toBe("8");
  });

  test("exercise name set/get and clearWeekLocal removes keys for the week", () => {
    expect(getExerciseName(2, 3, 1)).toBeNull();
    setExerciseNameLS(2, 3, 1, "Bench Press");
    expect(getExerciseName(2, 3, 1)).toBe("Bench Press");

    // add some other keys for week 2
    setWeight(2, 1, 0, "10");
    setRep(2, 1, 0, 1, "5");

    // clear week 2
    clearWeekLocal(2);

    expect(getExerciseName(2, 3, 1)).toBeNull();
    expect(getWeight(2, 1, 0)).toBe("0");
    expect(getRep(2, 1, 0, 1)).toBe("0");
  });
});
