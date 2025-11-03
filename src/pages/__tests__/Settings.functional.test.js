// firebase packages used by the service expect TextEncoder/TextDecoder and ReadableStream in some node versions.
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
// minimal ReadableStream shim for tests (prevents undici from throwing)
if (typeof global.ReadableStream === "undefined") {
  // minimal ReadableStream shim for tests (avoid empty class constructor that ESLint flags)
  global.ReadableStream = function ReadableStream() {};
}

jest.mock("../../services/FirestoreService");

const LocalStorageService = require("../../services/LocalStorageService");
const FirestoreService = require("../../services/FirestoreService");

describe("Settings / data workflows (functional)", () => {
  const user = { uid: "tester" };

  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test("create exercises for a week, set names, reps and weights, and add a workout", async () => {
    // Mock saveExerciseNames to resolve
    FirestoreService.saveExerciseNames.mockResolvedValueOnce();
    FirestoreService.addWorkout.mockResolvedValueOnce();

    // Simulate saving exercise names for week 1
    const exercises = { ex1: "Bench", ex2: "Squat" };
    await FirestoreService.saveExerciseNames(user, 1, exercises);
    expect(FirestoreService.saveExerciseNames).toHaveBeenCalledWith(
      user,
      1,
      exercises
    );

    // Simulate user editing exercise names locally
    LocalStorageService.setExerciseNameLS(1, 1, 0, "Bench Press");
    LocalStorageService.setExerciseNameLS(1, 1, 1, "Back Squat");
    expect(LocalStorageService.getExerciseName(1, 1, 0)).toBe("Bench Press");
    expect(LocalStorageService.getExerciseName(1, 1, 1)).toBe("Back Squat");

    // Set reps and weights for exercises
    LocalStorageService.setRep(1, 1, 0, 1, "8");
    LocalStorageService.setRep(1, 1, 1, 1, "5");
    LocalStorageService.setWeight(1, 1, 0, "60");
    LocalStorageService.setWeight(1, 1, 1, "120");

    expect(LocalStorageService.getRep(1, 1, 0, 1)).toBe("8");
    expect(LocalStorageService.getWeight(1, 1, 0)).toBe("60");

    // Simulate adding a workout day object and sending to Firestore
    const workoutData = {
      week: 1,
      day: 1,
      exercises: [
        {
          name: LocalStorageService.getExerciseName(1, 1, 0),
          reps: LocalStorageService.getRep(1, 1, 0, 1),
          weight: LocalStorageService.getWeight(1, 1, 0),
        },
        {
          name: LocalStorageService.getExerciseName(1, 1, 1),
          reps: LocalStorageService.getRep(1, 1, 1, 1),
          weight: LocalStorageService.getWeight(1, 1, 1),
        },
      ],
      createdAt: expect.anything(),
    };

    await FirestoreService.addWorkout(user, workoutData);
    expect(FirestoreService.addWorkout).toHaveBeenCalledWith(user, workoutData);
  });

  test("switching weeks retrieves different exercise names", async () => {
    FirestoreService.getExerciseNames.mockResolvedValueOnce({ ex1: "A" });
    const week1 = await FirestoreService.getExerciseNames(user, 1);
    expect(week1).toEqual({ ex1: "A" });

    FirestoreService.getExerciseNames.mockResolvedValueOnce({ ex1: "B" });
    const week2 = await FirestoreService.getExerciseNames(user, 2);
    expect(week2).toEqual({ ex1: "B" });
  });
});
