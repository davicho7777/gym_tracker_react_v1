import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './button'; // Asegúrate de importar el componente Button

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed top-0 left-0 h-full ${isOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white transition-all duration-300`}>
      <button
        className="absolute top-4 right-[-20px] bg-gray-600 text-white p-2 rounded-full shadow-lg focus:outline-none"
        onClick={toggleMenu}
      >
        {isOpen ? '←' : '→'}
      </button>
      <div className="flex flex-col items-center mt-16">
        <h2 className={`text-lg font-bold mb-4 ${isOpen ? 'block' : 'hidden'}`} style={{ color: 'black' }}>Menú</h2>
        <ul>
          <li className="mb-4">
            <Link to="/workout-tracker" className="hover:text-gray-300">
              <Button variant="outline">Ejercicios</Button>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/calendar" className="hover:text-gray-300">
              <Button variant="outline">Calendario 📅</Button>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/Estadisticas" className="hover:text-gray-300">
              <Button variant="outline">Estadísticas</Button>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/Settings" className="hover:text-gray-300">
              <Button variant="outline">Configuración</Button>
            </Link>
          </li>
          <li className="mb-4">
            <Link to="/login" className="hover:text-gray-300">
              <Button variant="outline">Log Out</Button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarMenu;