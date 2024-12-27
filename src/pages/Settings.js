import React from 'react';
import Sidebar from '../components/ui/Sidebar';

const Settings = () => {
  return (
    <div className="flex h-screen">
      <div className="w-64 flex-shrink-0 border-r">
        <Sidebar />
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Configuración</h1>
        <p>Aquí las config 👄</p>
      </div>
    </div>
  );
};

export default Settings;