import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getWorkouts } from '../services/FirestoreService';
import { auth } from '../services/firebase';
import Sidebar from '../components/ui/Sidebar';

// Registrar los componentes de chart.js
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Estadisticas = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        return;
      }

      try {
        const workouts = await getWorkouts(auth.currentUser);
        const exerciseData = {};

        workouts.forEach(workout => {
          Object.keys(workout.days).forEach(day => {
            workout.days[day].forEach(exercise => {
              if (!exerciseData[exercise.name]) {
                exerciseData[exercise.name] = [];
              }
              exerciseData[exercise.name].push({
                week: workout.week,
                weight: exercise.weight
              });
            });
          });
        });

        const labels = Array.from(new Set(workouts.map(workout => workout.week))).sort((a, b) => a - b);
        const datasets = Object.keys(exerciseData).map(exerciseName => {
          const data = labels.map(week => {
            const weekData = exerciseData[exerciseName].find(e => e.week === week);
            return weekData ? weekData.weight : 0;
          });
          return {
            label: exerciseName,
            data,
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`
          };
        });

        setChartData({
          labels,
          datasets
        });
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-64 flex-shrink-0 border-r">
        <Sidebar />
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Estadísticas</h1>
        {chartData ? (
          <Bar data={chartData} />
        ) : (
          <p>Cargando datos...</p>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;