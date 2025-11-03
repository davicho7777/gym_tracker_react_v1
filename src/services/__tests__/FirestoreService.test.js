// Unit tests for FirestoreService - mocks firebase/firestore functions
// Provide minimal TextEncoder/TextDecoder for environments that lack them
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// Mock the internal firebase export to avoid loading real firebase packages
jest.mock("../firebase", () => ({ db: {} }));

jest.mock("firebase/firestore", () => ({
  collection: jest.fn((db, a, b, c) => ({ db, path: [a, b, c] })),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn((db, a, b, c, d) => ({ db, path: [a, b, c, d] })),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
}));

const fsService = require("../FirestoreService");

describe("FirestoreService", () => {
  const fakeUser = { uid: "user123" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addWorkout calls addDoc with collection and data", async () => {
    await fsService.addWorkout(fakeUser, { day: "monday" });
    const { addDoc, collection } = require("firebase/firestore");
    expect(collection).toHaveBeenCalled();
    expect(addDoc).toHaveBeenCalled();
  });

  test("getWorkouts returns mapped docs", async () => {
    const { getDocs } = require("firebase/firestore");
    getDocs.mockResolvedValueOnce({
      docs: [{ id: "1", data: () => ({ a: 1 }) }],
    });
    const workouts = await fsService.getWorkouts(fakeUser);
    expect(getDocs).toHaveBeenCalled();
    expect(Array.isArray(workouts)).toBe(true);
    expect(workouts[0]).toEqual({ id: "1", a: 1 });
  });

  test("updateWorkout calls updateDoc with doc reference", async () => {
    const { updateDoc, doc } = require("firebase/firestore");
    await fsService.updateWorkout(fakeUser, "wid", { foo: "bar" });
    expect(doc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });

  test("getExerciseNames returns data when doc exists", async () => {
    const { getDoc, doc } = require("firebase/firestore");
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ ex1: "Bench" }),
    });
    const result = await fsService.getExerciseNames(fakeUser, 1);
    expect(doc).toHaveBeenCalled();
    expect(getDoc).toHaveBeenCalled();
    expect(result).toEqual({ ex1: "Bench" });
  });

  test("saveExerciseNames calls setDoc", async () => {
    const { setDoc } = require("firebase/firestore");
    await fsService.saveExerciseNames(fakeUser, 2, { ex1: "Squat" });
    expect(setDoc).toHaveBeenCalled();
  });
});
