import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Vehicle } from '../types';
import { useAuth } from './AuthContext';

interface VehiclesContextType {
  vehicles: Vehicle[];
  addVehicle: (v: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (v: Vehicle) => void;
  deleteVehicle: (id: string) => void;
  refetch: () => void;
}

const VehiclesContext = createContext<VehiclesContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export function VehiclesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const refetch = () => {
    const token = localStorage.getItem('fa_token');
    if (!token || !user) return;
    fetch(`${API_BASE}/vehicles`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setVehicles(Array.isArray(data?.vehicles) ? data.vehicles : []);
      });
  };

  useEffect(() => {
    refetch();
  }, [user]);

  const addVehicle = (v: Omit<Vehicle, 'id'>) => {
    const token = localStorage.getItem('fa_token');
    if (!token) return;
    fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(v),
    })
      .then(res => res.json())
      .then(data => {
        if (data.vehicle) setVehicles(prev => [...prev, data.vehicle]);
        refetch();
      })
      .catch(() => refetch());
  };

  const updateVehicle = (v: Vehicle) => {
    const token = localStorage.getItem('fa_token');
    if (!token) return;
    fetch(`${API_BASE}/vehicles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(v),
    })
      .then(res => res.json())
      .then(data => {
        if (data.vehicle) {
          setVehicles(prev => prev.map(x => (x.id === data.vehicle.id ? data.vehicle : x)));
        }
        refetch();
      })
      .catch(() => refetch());
  };

  const deleteVehicle = (id: string) => {
    const token = localStorage.getItem('fa_token');
    if (!token) return;
    fetch(`${API_BASE}/vehicles`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    }).then(() => {
      setVehicles(prev => prev.filter(x => x.id !== id));
      refetch();
    }).catch(() => refetch());
  };

  return (
    <VehiclesContext.Provider
      value={{ vehicles, addVehicle, updateVehicle, deleteVehicle, refetch }}
    >
      {children}
    </VehiclesContext.Provider>
  );
}

export function useVehicles() {
  const ctx = useContext(VehiclesContext);
  if (!ctx) throw new Error('useVehicles must be used within VehiclesProvider');
  return ctx;
}
