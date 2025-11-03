import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { getWorkouts } from "../services/FirestoreService";
import Sidebar from "../components/ui/Sidebar";
import Button from "../components/ui/button";

const getWeekDates = (week) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  startDate.setDate(startDate.getDate() + (week - 1) * 7 - startDate.getDay());
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return `Del ${startDate.toLocaleDateString(
    "es-ES",
    options
  )} al ${endDate.toLocaleDateString("es-ES", options)}`;
};

const getMonthName = (month) => {
  const date = new Date();
  date.setMonth(month);
  return date.toLocaleString("es-ES", { month: "long" });
};

const Calendario = () => {
  const [savedWeeks, setSavedWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSavedWeeks = async () => {
      if (!auth.currentUser) {
        navigate("/login");
        return;
      }

      try {
        const workouts = await getWorkouts(auth.currentUser);
        const weeksMap = {};

        workouts.forEach((workout) => {
          const week = workout.week;
          if (!weeksMap[week]) {
            weeksMap[week] = {
              week,
              dates: getWeekDates(week),
              month: new Date(
                new Date().getFullYear(),
                0,
                1 + (week - 1) * 7
              ).getMonth(),
              totalExercises: 0,
            };
          }
          weeksMap[week].totalExercises += Object.values(workout.days).reduce(
            (total, day) => total + day.length,
            0
          );
        });

        const weeks = Object.values(weeksMap);
        weeks.sort((a, b) => b.week - a.week);
        setSavedWeeks(weeks);
      } catch (error) {
        console.error("Error al cargar las semanas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedWeeks();
  }, [navigate]);

  const handleWeekClick = (week) => {
    navigate(`/workout-tracker?week=${week}`);
  };

  const groupedByMonth = savedWeeks.reduce((acc, week) => {
    const month = week.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(week);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main
        className="main-with-sidebar container mx-auto p-4 pt-16"
        role="main"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">
          Historial de Entrenamientos
        </h1>

        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : Object.keys(groupedByMonth).length > 0 ? (
          <div className="grid gap-4">
            {Object.keys(groupedByMonth).map((month) => (
              <section key={month} aria-labelledby={`month-${month}`}>
                <h2 id={`month-${month}`} className="text-xl font-bold mb-4">
                  {getMonthName(month)}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedByMonth[month].map((weekData) => (
                    <button
                      key={weekData.week}
                      type="button"
                      onClick={() => handleWeekClick(weekData.week)}
                      className="card"
                      aria-label={`Ver detalles de la semana ${weekData.week}`}
                    >
                      <div className="card-title">Semana {weekData.week}</div>
                      <div className="card-sub">{weekData.dates}</div>
                      <div className="card-meta">
                        Total ejercicios: {weekData.totalExercises}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No hay entrenamientos guardados todavía.</p>
            <div className="align-buttons mt-4">
              <Button
                className="hero-action"
                onClick={() => navigate("/workout-tracker")}
              >
                Empezar a entrenar
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Calendario;
