import React, { useState, useEffect, useCallback } from "react";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Edit2, Check, X, Plus, Minus } from "lucide-react";
import {
  addWorkout,
  getExerciseNames,
  getWorkouts,
  updateWorkout,
} from "../services/FirestoreService";
import { auth } from "../services/firebase";
import * as LocalStorageService from "../services/LocalStorageService";
import { useSettings } from "../context/SettingsContext";
import { kgToLb, lbToKg, formatWeight } from "../lib/units";
import trippyGif from "../assets/images/trippygif.gif";
import SidebarMenu from "../components/ui/Sidebar";
import { useNavigate } from "react-router-dom";

const getWeekDates = (week, year = new Date().getFullYear()) => {
  const startDate = new Date(year, 0, 1);
  startDate.setDate(startDate.getDate() + (week - 1) * 7 - startDate.getDay());
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `Del ${startDate.toLocaleDateString(
    "es-ES",
    options
  )} al ${endDate.toLocaleDateString("es-ES", options)}`;
};

function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now - start + ((start.getDay() + 6) % 7) * 86400000) / 86400000;
  return Math.ceil(diff / 7);
}

// Add a new function to get the week number for a specific date
const getWeekNumber = (date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff =
    (date - start + ((start.getDay() + 6) % 7) * 86400000) / 86400000;
  return Math.ceil(diff / 7);
};

const initialExercises = {
  [getCurrentWeek()]: {
    day1: ["Press de Banca", "Press inclinada", "Fondo", "Press frances"],
    day2: ["Dominadas", "Remo", "Curl bicep", "Curl inclinado"],
    day3: ["Sentadillas", "Peso muerto", "Press militar", "Elevación lateral"],
  },
};

const defaultExercises = [
  "Press de Banca",
  "Fondos en Paralelas",
  "Elevaciones Laterales",
  "Extensiones de Tríceps",
];

const RepCounter = ({ id, initialValue = 0 }) => {
  const [count, setCount] = useState("0");

  useEffect(() => {
    const savedValue = localStorage.getItem(id);
    if (savedValue) {
      setCount(savedValue);
    } else {
      setCount(initialValue.toString());
      localStorage.setItem(id, initialValue.toString());
    }
  }, [id, initialValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setCount(newValue);
    localStorage.setItem(id, newValue);
  };

  return (
    <Input
      type="text"
      value={count}
      onChange={handleChange}
      className="w-20 text-center"
      placeholder="0"
    />
  );
};

export default function WorkoutTracker() {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [exercises, setExercises] = useState(initialExercises);
  const [editingExercise, setEditingExercise] = useState({
    day: "",
    index: -1,
  });
  const [newExerciseName, setNewExerciseName] = useState("");
  const [weights, setWeights] = useState({});
  // use theme and units from SettingsContext
  const { theme, setTheme, units } = useSettings();
  const navigate = useNavigate();
  // responsive width detection to switch to stacked mobile layout
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const restoreInputs = useCallback(async () => {
    // No direct DOM access: reps are handled by RepCounter (reads localStorage).
    // For weights, initialize from localStorage into state if present.
    const restored = {};
    const weekData = exercises[currentWeek] || {};
    Object.keys(weekData).forEach((day) => {
      weekData[day].forEach((_, index) => {
        const key = LocalStorageService.weightKey(currentWeek, day, index);
        restored[key] =
          LocalStorageService.getWeight(currentWeek, day, index) || "0";
      });
    });
    setWeights((prev) => ({ ...restored, ...prev }));

    // Si no hay usuario autenticado, no podemos buscar en Firebase
    if (!auth.currentUser) return;

    try {
      // Obtenemos los workouts del usuario
      const workouts = await getWorkouts(auth.currentUser);
      const currentWeekWorkout = workouts.find((w) => w.week === currentWeek);

      if (!currentWeekWorkout) return;

      // For each exercise in the workout from Firestore, fill localStorage and state where missing
      Object.entries(currentWeekWorkout.days).forEach(([day, exercisesArr]) => {
        exercisesArr.forEach((exercise, index) => {
          // sets
          exercise.sets.forEach((setData, setIndex) => {
            const repVal = setData[`set${setIndex + 1}`];
            LocalStorageService.setRep(
              currentWeek,
              day,
              index,
              setIndex + 1,
              repVal
            );
          });

          // weight
          LocalStorageService.setWeight(
            currentWeek,
            day,
            index,
            exercise.weight
          );
        });
      });
      // update weights state after restoring from cloud
      const afterRestore = {};
      const weekData2 = exercises[currentWeek] || {};
      Object.keys(weekData2).forEach((day) => {
        weekData2[day].forEach((_, index) => {
          const key = LocalStorageService.weightKey(currentWeek, day, index);
          afterRestore[key] =
            LocalStorageService.getWeight(currentWeek, day, index) || "0";
        });
      });
      setWeights((prev) => ({ ...afterRestore, ...prev }));
    } catch (error) {
      console.error("Error restoring data from Firebase:", error);
    }
  }, [currentWeek, exercises]);

  useEffect(() => {
    if (!exercises[currentWeek]) {
      setExercises((prev) => ({
        ...prev,
        [currentWeek]: {
          day1: [
            "Press de Banca",
            "Fondos en Paralelas",
            "Elevaciones Laterales",
            "Extensiones de Tríceps",
          ],
          day2: [
            "Sentadilla",
            "Prensa",
            "Extensión cuadricep",
            "Elevación de Talones",
          ],
          day3: ["Dominadas", "Remo con Barra", "Pull-over", "Curl con Barra"],
        },
      }));
    }
    // initialize weights state from localStorage for the current week (convert to display units will be handled below)
    const initWeights = {};
    const weekData = exercises[currentWeek] || {};
    Object.keys(weekData).forEach((day) => {
      weekData[day].forEach((_, index) => {
        const key = LocalStorageService.weightKey(currentWeek, day, index);
        const storedKg =
          LocalStorageService.getWeight(currentWeek, day, index) || "0";
        // default displayed value matches stored (kg); if units is lb, convert when SettingsProvider is global
        initWeights[key] = storedKg;
      });
    });
    setWeights(initWeights);
    // restore other inputs (reps) from localStorage or cloud
    restoreInputs();
  }, [currentWeek, currentYear, exercises, restoreInputs]);

  // When units change, update displayed weights from storage (convert if needed)
  useEffect(() => {
    const weekData = exercises[currentWeek] || {};
    const updated = {};
    Object.keys(weekData).forEach((day) => {
      weekData[day].forEach((_, index) => {
        const key = LocalStorageService.weightKey(currentWeek, day, index);
        const storedKg =
          LocalStorageService.getWeight(currentWeek, day, index) || "0";
        if (units === "kg") {
          updated[key] = String(storedKg);
        } else {
          // convert to lb for display
          const lb = kgToLb(storedKg);
          updated[key] = formatWeight(lb, 1);
        }
      });
    });
    setWeights((prev) => ({ ...prev, ...updated }));
  }, [units, currentWeek, exercises]);

  // cycle theme using context
  const cycleMode = () => {
    setTheme((prev) => {
      if (prev === "default") return "dark";
      if (prev === "dark") return "tripi";
      if (prev === "tripi") return "vivid";
      return "default";
    });
  };

  const loadFromCloud = async () => {
    if (!auth.currentUser) {
      alert("Debes iniciar sesión para cargar datos de la nube.");
      return;
    }

    try {
      // Obtener todos los workouts del usuario
      const workouts = await getWorkouts(auth.currentUser);

      // Buscar el workout de la semana y año actual
      const currentWeekWorkout = workouts.find(
        (w) => w.week === currentWeek && w.year === new Date().getFullYear()
      );

      if (!currentWeekWorkout) {
        alert("No hay datos guardados para esta semana en la nube.");
        return;
      }

      // Cargar los datos en localStorage y en el estado de weights
      const newWeights = { ...weights };
      Object.entries(currentWeekWorkout.days).forEach(([day, exercisesArr]) => {
        exercisesArr.forEach((exercise, index) => {
          // Guardar el peso
          LocalStorageService.setWeight(
            currentWeek,
            day,
            index,
            exercise.weight.toString()
          );
          newWeights[LocalStorageService.weightKey(currentWeek, day, index)] =
            exercise.weight.toString();

          // Guardar las repeticiones de cada set
          exercise.sets.forEach((setData, setIndex) => {
            const repValue = setData[`set${setIndex + 1}`].toString();
            LocalStorageService.setRep(
              currentWeek,
              day,
              index,
              setIndex + 1,
              repValue
            );
          });

          // Guardar el nombre del ejercicio
          LocalStorageService.setExerciseNameLS(
            currentWeek,
            day,
            index,
            exercise.name
          );
        });
      });
      setWeights(newWeights);

      // Obtener y cargar los nombres de ejercicios
      const exerciseNames = await getExerciseNames(
        auth.currentUser,
        currentWeek
      );
      if (exerciseNames) {
        setExercises((prev) => ({
          ...prev,
          [currentWeek]: exerciseNames,
        }));
      }

      // Restaurar los inputs con los nuevos datos
      restoreInputs();

      alert("Datos cargados con éxito desde la nube.");
    } catch (error) {
      console.error("Error loading data from cloud:", error);
      alert("Error al cargar datos de la nube.");
    }
  };

  const addDay = () => {
    const currentDays = Object.keys(exercises[currentWeek] || {});
    if (currentDays.length >= 7) {
      alert("No se pueden añadir más de 7 días en una semana");
      return;
    }

    const newDayNumber = currentDays.length + 1;
    const newDayKey = `day${newDayNumber}`;

    setExercises((prev) => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [newDayKey]: [...defaultExercises],
      },
    }));
  };

  const removeDay = () => {
    const currentDays = Object.keys(exercises[currentWeek] || {});
    if (currentDays.length <= 1) {
      alert("Debe mantener al menos un día de ejercicios");
      return;
    }

    const lastDay = currentDays[currentDays.length - 1];
    const { [lastDay]: lastExercise, ...rest } = exercises[currentWeek];
    setExercises((prev) => ({
      ...prev,
      [currentWeek]: rest,
    }));
  };

  const saveInputs = () => {
    // Persist current weights state to localStorage (RepCounter already persists reps)
    Object.keys(weights).forEach((k) => {
      const value = weights[k];
      if (value !== undefined) {
        localStorage.setItem(k, value);
      }
    });
  };

  const getExerciseName = (day, index) => {
    return (
      LocalStorageService.getExerciseName(currentWeek, day, index) ||
      exercises[currentWeek][day][index]
    );
  };

  const setExerciseName = (day, index, name) => {
    LocalStorageService.setExerciseNameLS(currentWeek, day, index, name);
    setExercises((prev) => ({
      ...prev,
      [currentWeek]: {
        ...prev[currentWeek],
        [day]: prev[currentWeek][day].map((exercise, i) =>
          i === index ? name : exercise
        ),
      },
    }));
  };

  const handleSave = async () => {
    saveInputs();
    const workoutData = {
      week: currentWeek,
      year: new Date().getFullYear(),
      days: {},
    };

    Object.keys(exercises[currentWeek] || {}).forEach((day) => {
      const dayData = exercises[currentWeek][day].map((exercise, index) => {
        const reps = [1, 2, 3].map((set) => {
          const repValue =
            LocalStorageService.getRep(currentWeek, day, index, set) || "0";
          return { [`set${set}`]: repValue || 0 };
        });
        const weight =
          LocalStorageService.getWeight(currentWeek, day, index) || "0";
        return {
          name: getExerciseName(day, index),
          sets: reps,
          weight: weight || 0,
        };
      });
      workoutData.days[day] = dayData;
    });

    if (auth.currentUser) {
      try {
        // Obtener los datos del workout actual
        const workouts = await getWorkouts(auth.currentUser);
        const currentWeekWorkout = workouts.find(
          (w) => w.week === currentWeek && w.year === new Date().getFullYear()
        );

        if (currentWeekWorkout) {
          // Actualizar el workout existente
          await updateWorkout(
            auth.currentUser,
            currentWeekWorkout.id,
            workoutData
          );
        } else {
          // Crear un nuevo workout
          await addWorkout(auth.currentUser, workoutData);
        }

        alert("Progreso guardado con éxito!");
      } catch (error) {
        console.error("Error saving workout:", error);
        alert("Error al guardar el progreso.");
      }
    } else {
      alert("Debes iniciar sesión para guardar el progreso.");
      navigate("/login");
    }
  };

  const handlePrint = () => {
    let printContent =
      "<html><head><title>Datos Guardados</title></head><body>";
    printContent += `<h1>Datos Guardados</h1>`;

    const savedWeeks = [];

    for (let week = 1; week <= getCurrentWeek(); week++) {
      let weekHasData = false;
      let weekContent = `<h2>Semana ${week} (${getWeekDates(week)})</h2>`;

      if (exercises[week]) {
        Object.keys(exercises[week] || {}).forEach((day) => {
          let dayHasData = false;
          let dayContent = `<h3>${day}</h3>`;

          exercises[week][day].forEach((exercise, index) => {
            const reps = [1, 2, 3].map(
              (set) =>
                localStorage.getItem(
                  `reps-${week}-${day}-${index}-set${set}`
                ) || "0"
            );
            const kilos =
              localStorage.getItem(`number-${week}-${day}-${index}`) || "0";

            if (reps.some((rep) => rep !== "0") || kilos !== "0") {
              dayHasData = true;
              dayContent += `<p>${getExerciseName(day, index)}:<br> 
                Repeticiones: Set 1: ${reps[0]}, Set 2: ${reps[1]}, Set 3: ${
                reps[2]
              } <br> 
                Kilos: ${kilos}</p>`;
            }
          });

          if (dayHasData) {
            weekHasData = true;
            weekContent += dayContent;
          }
        });
      }

      if (weekHasData) {
        savedWeeks.push(week);
        printContent += weekContent;
      }
    }

    if (savedWeeks.length > 0) {
      printContent += "</body></html>";
      const printWindow = window.open("", "", "width=800,height=600");
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert("No hay datos guardados para imprimir.");
    }
  };

  const startEditing = (day, index) => {
    setEditingExercise({ day, index });
    setNewExerciseName(getExerciseName(day, index));
  };

  const cancelEditing = () => {
    setEditingExercise({ day: "", index: -1 });
    setNewExerciseName("");
  };

  const saveNewExerciseName = () => {
    if (newExerciseName.trim() !== "") {
      setExerciseName(
        editingExercise.day,
        editingExercise.index,
        newExerciseName
      );
    }
    cancelEditing();
  };

  const handleExerciseCountChange = (day, newCount) => {
    const currentCount = exercises[currentWeek][day].length;
    if (newCount > currentCount) {
      const newExercises = [
        ...exercises[currentWeek][day],
        ...Array(newCount - currentCount).fill("Nuevo Ejercicio"),
      ];
      setExercises((prev) => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: newExercises,
        },
      }));
    } else if (newCount < currentCount) {
      const newExercises = exercises[currentWeek][day].slice(0, newCount);
      setExercises((prev) => ({
        ...prev,
        [currentWeek]: {
          ...prev[currentWeek],
          [day]: newExercises,
        },
      }));
    }
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => {
      if (prev === getWeekNumber(new Date(currentYear, 11, 31))) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => {
      if (prev === 1) {
        setCurrentYear((prevYear) => prevYear - 1);
        return getWeekNumber(new Date(currentYear - 1, 11, 31));
      }
      return prev - 1;
    });
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar fijo a la izquierda */}
      <SidebarMenu />
      <main className="main-with-sidebar container mx-auto p-4" role="main">
        <div className="center-all w-full">
          <h1 className="text-2xl font-bold text-center mb-4">
            Registro de Ejercicios Semanales
          </h1>

          <div className="align-buttons mb-4">
            <Button onClick={handlePreviousWeek} className="week-nav week-prev">
              Semana Anterior
            </Button>
            <div className="text-center">
              <div className="font-bold">Semana {currentWeek}</div>
              <div className="text-sm text-gray-600">
                {getWeekDates(currentWeek, currentYear)}
              </div>
            </div>
            <Button onClick={handleNextWeek} className="week-nav week-next">
              Semana Siguiente
            </Button>
          </div>

          {/* Mode toggle: always below week header and above add/remove day buttons */}
          <div className="mode-toggle-container mb-4">
            <Button onClick={cycleMode} className="btn--sm">
              {theme === "default" && "Modo: Predeterminado"}
              {theme === "dark" && "🌙 Modo Oscuro"}
              {theme === "tripi" && "✨ Modo Tripi"}
              {theme === "vivid" && "Neo Brutalismo"}
            </Button>
          </div>

          <div className="compact">
            <div className="align-buttons mb-4">
              <Button onClick={removeDay} className="day-btn remove-day">
                <Minus className="h-4 w-4 mr-2" />
                Quitar Día
              </Button>
              <Button onClick={addDay} className="day-btn add-day">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Día
              </Button>
            </div>
            {/* Responsive: if very narrow, render stacked day cards instead of a wide table */}
            {windowWidth <= 420 ? (
              <div className="stacked-days w-full">
                {Object.keys(exercises[currentWeek] || {}).map((day) => (
                  <div key={day} className="day-stack mb-4">
                    <div className="day-header mb-2 font-bold">{day}</div>
                    <div className="day-controls flex items-center justify-between mb-2">
                      <span>
                        Ejercicios: {exercises[currentWeek][day].length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleExerciseCountChange(
                              day,
                              exercises[currentWeek][day].length - 1
                            )
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            handleExerciseCountChange(
                              day,
                              exercises[currentWeek][day].length + 1
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="day-exercises">
                      {exercises[currentWeek][day].map((exercise, index) => (
                        <div
                          key={`${day}-${index}`}
                          className="exercise-card p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            {editingExercise.day === day &&
                            editingExercise.index === index ? (
                              <>
                                <Input
                                  value={newExerciseName}
                                  onChange={(e) =>
                                    setNewExerciseName(e.target.value)
                                  }
                                  className="flex-grow"
                                />
                                <div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={saveNewExerciseName}
                                    className="mr-1"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={cancelEditing}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="font-medium">
                                  {getExerciseName(day, index)}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEditing(day, index)}
                                  className="edit-name-btn"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((set) => (
                              <div
                                key={`${day}-${index}-set${set}`}
                                className="flex items-center justify-between"
                              >
                                <span className="w-16">Set {set}:</span>
                                <RepCounter
                                  id={`reps-${currentWeek}-${day}-${index}-set${set}`}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <label
                              className="mr-2"
                              htmlFor={`number-${currentWeek}-${day}-${index}`}
                            >
                              {units === "kg" ? "Kilos:" : "Libras:"}
                            </label>
                            <Input
                              type="text"
                              id={`number-${currentWeek}-${day}-${index}`}
                              className="w-20"
                              value={
                                weights[
                                  LocalStorageService.weightKey(
                                    currentWeek,
                                    day,
                                    index
                                  )
                                ] ?? ""
                              }
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                const key = LocalStorageService.weightKey(
                                  currentWeek,
                                  day,
                                  index
                                );
                                let valueToStoreKg = inputValue;
                                if (units === "lb") {
                                  const asLb =
                                    parseFloat(inputValue.replace(",", ".")) ||
                                    0;
                                  valueToStoreKg = String(
                                    lbToKg(asLb).toFixed(2)
                                  );
                                }
                                if (units === "kg") {
                                  valueToStoreKg = String(
                                    parseFloat(inputValue.replace(",", ".")) ||
                                      0
                                  );
                                }
                                LocalStorageService.setWeight(
                                  currentWeek,
                                  day,
                                  index,
                                  valueToStoreKg
                                );
                                setWeights((prev) => ({
                                  ...prev,
                                  [key]: inputValue,
                                }));
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table w-full">
                  <TableHeader className="table-header">
                    <TableRow>
                      {Object.keys(exercises[currentWeek] || {}).map((day) => (
                        <TableHead key={day} className="table-header-th">
                          {day}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="table-body">
                    <TableRow>
                      {Object.keys(exercises[currentWeek] || {}).map((day) => (
                        <TableCell key={day} className="table-body-td">
                          <div className="flex justify-between items-center mb-2">
                            <span className="mr-2">
                              Ejercicios: {exercises[currentWeek][day].length}
                            </span>
                            <div className="flex items-center">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  handleExerciseCountChange(
                                    day,
                                    exercises[currentWeek][day].length - 1
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() =>
                                  handleExerciseCountChange(
                                    day,
                                    exercises[currentWeek][day].length + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <Table className="table w-full">
                              <TableBody className="table-body">
                                {exercises[currentWeek][day].map(
                                  (exercise, index) => (
                                    <TableRow
                                      key={`${day}-${index}`}
                                      className="table-body-tr"
                                    >
                                      <TableCell className="table-body-td">
                                        <div className="exercise-card p-3">
                                          <div className="flex flex-wrap items-center mb-2 gap-2">
                                            {editingExercise.day === day &&
                                            editingExercise.index === index ? (
                                              <>
                                                <Input
                                                  value={newExerciseName}
                                                  onChange={(e) =>
                                                    setNewExerciseName(
                                                      e.target.value
                                                    )
                                                  }
                                                  className="flex-grow"
                                                />
                                                <div>
                                                  <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={
                                                      saveNewExerciseName
                                                    }
                                                    className="mr-1"
                                                  >
                                                    <Check className="h-4 w-4" />
                                                  </Button>
                                                  <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={cancelEditing}
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </>
                                            ) : (
                                              <>
                                                <span className="font-medium">
                                                  {getExerciseName(day, index)}
                                                </span>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  onClick={() =>
                                                    startEditing(day, index)
                                                  }
                                                  className="edit-name-btn"
                                                >
                                                  <Edit2 className="h-4 w-4" />
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            {[1, 2, 3].map((set) => (
                                              <div
                                                key={`${day}-${index}-set${set}`}
                                                className="flex items-center justify-between"
                                              >
                                                <span className="w-16">
                                                  Set {set}:
                                                </span>
                                                <RepCounter
                                                  id={`reps-${currentWeek}-${day}-${index}-set${set}`}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                          <div className="mt-2 flex items-center justify-between">
                                            <label
                                              className="mr-2"
                                              htmlFor={`number-${currentWeek}-${day}-${index}`}
                                            >
                                              {units === "kg"
                                                ? "Kilos:"
                                                : "Libras:"}
                                            </label>
                                            <Input
                                              type="text"
                                              id={`number-${currentWeek}-${day}-${index}`}
                                              className="w-20"
                                              value={
                                                weights[
                                                  LocalStorageService.weightKey(
                                                    currentWeek,
                                                    day,
                                                    index
                                                  )
                                                ] ?? ""
                                              }
                                              onChange={(e) => {
                                                const inputValue =
                                                  e.target.value;
                                                const key =
                                                  LocalStorageService.weightKey(
                                                    currentWeek,
                                                    day,
                                                    index
                                                  );
                                                // Save to localStorage always in kg
                                                let valueToStoreKg = inputValue;
                                                if (units === "lb") {
                                                  const asLb =
                                                    parseFloat(
                                                      inputValue.replace(
                                                        ",",
                                                        "."
                                                      )
                                                    ) || 0;
                                                  valueToStoreKg = String(
                                                    lbToKg(asLb).toFixed(2)
                                                  );
                                                }
                                                if (units === "kg") {
                                                  // normalize decimal comma
                                                  valueToStoreKg = String(
                                                    parseFloat(
                                                      inputValue.replace(
                                                        ",",
                                                        "."
                                                      )
                                                    ) || 0
                                                  );
                                                }
                                                LocalStorageService.setWeight(
                                                  currentWeek,
                                                  day,
                                                  index,
                                                  valueToStoreKg
                                                );
                                                // Store displayed value in state (respecting units)
                                                setWeights((prev) => ({
                                                  ...prev,
                                                  [key]: inputValue,
                                                }));
                                              }}
                                            />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="align-buttons mt-4">
              <Button className="hero-action" onClick={handleSave}>
                Guardar Progreso
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                Imprimir Datos
              </Button>
              <Button variant="neutral" onClick={loadFromCloud}>
                Cargar datos de la nube
              </Button>
            </div>
            {theme === "tripi" && (
              <img src={trippyGif} alt="Tripi Mode" className="trippy-gif" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
