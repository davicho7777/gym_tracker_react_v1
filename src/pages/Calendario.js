import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { getWorkouts } from '../services/FirestoreService';
import Sidebar from '../components/ui/Sidebar';

const getWeekDates = (week) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(currentYear, 0, 1);
  startDate.setDate(startDate.getDate() + (week - 1) * 7 - startDate.getDay());
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return `Del ${startDate.toLocaleDateString('es-ES', options)} al ${endDate.toLocaleDateString('es-ES', options)}`;
};

const getMonthName = (month) => {
  const date = new Date();
  date.setMonth(month);
  return date.toLocaleString('es-ES', { month: 'long' });
};

const Calendario = () => {
  const [savedWeeks, setSavedWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSavedWeeks = async () => {
      if (!auth.currentUser) {
        navigate('/login');
        return;
      }

      try {
        const workouts = await getWorkouts(auth.currentUser);
        const weeksMap = {};

        workouts.forEach(workout => {
          const week = workout.week;
          if (!weeksMap[week]) {
            weeksMap[week] = {
              week,
              dates: getWeekDates(week),
              month: new Date(new Date().getFullYear(), 0, 1 + (week - 1) * 7).getMonth(),
              totalExercises: 0
            };
          }
          weeksMap[week].totalExercises += Object.values(workout.days).reduce((total, day) => total + day.length, 0);
        });

        const weeks = Object.values(weeksMap);
        weeks.sort((a, b) => b.week - a.week);
        setSavedWeeks(weeks);
      } catch (error) {
        console.error('Error al cargar las semanas:', error);
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
      <div className="container mx-auto p-4 pt-16">
        <h1 className="text-2xl font-bold mb-6 text-center">Historial de Entrenamientos</h1>
        
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(groupedByMonth).length > 0 ? (
          <div className="grid gap-4">
            {Object.keys(groupedByMonth).map(month => (
              <div key={month}>
                <h2 className="text-xl font-bold mb-4">{getMonthName(month)}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedByMonth[month].map((weekData) => (
                    <div
                      key={weekData.week}
                      onClick={() => handleWeekClick(weekData.week)}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                    >
                      <div className="font-bold text-lg mb-2">Semana {weekData.week}</div>
                      <div className="text-sm text-gray-600">{weekData.dates}</div>
                      <div className="mt-2 text-gray-700">
                        Total ejercicios: {weekData.totalExercises}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No hay entrenamientos guardados todavía.</p>
            <button
              onClick={() => navigate('/workout-tracker')}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Empezar a entrenar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendario;