import { useState } from 'react';
import { Car, Plus, Pencil, Trash2 } from 'lucide-react';
import { useVehicles } from '../context/VehiclesContext';
import { Vehicle } from '../types';
import { Modal } from '../components/Modal';
import { cn } from '../utils/cn';

const defaultForm = {
  name: '',
  fuelConsumptionPer100: '',
  fuelPricePerLiter: '',
  depreciationPer1000: '',
  foodParkingPer1000: '2000',
};

export function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useVehicles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState(defaultForm);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      name: v.name,
      fuelConsumptionPer100: String(v.fuelConsumptionPer100),
      fuelPricePerLiter: String(v.fuelPricePerLiter),
      depreciationPer1000: String(v.depreciationPer1000),
      foodParkingPer1000: String(v.foodParkingPer1000),
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const name = form.name.trim() || 'Авто';
    const fuelConsumptionPer100 = Number(form.fuelConsumptionPer100) || 32;
    const fuelPricePerLiter = Number(form.fuelPricePerLiter) || 55;
    const depreciationPer1000 = Number(form.depreciationPer1000) || 5000;
    const foodParkingPer1000 = Number(form.foodParkingPer1000) ?? 2000;

    if (editing) {
      updateVehicle({
        ...editing,
        name,
        fuelConsumptionPer100,
        fuelPricePerLiter,
        depreciationPer1000,
        foodParkingPer1000,
      });
    } else {
      addVehicle({
        name,
        fuelConsumptionPer100,
        fuelPricePerLiter,
        depreciationPer1000,
        foodParkingPer1000,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Мои авто
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Профили машин для калькулятора «Стоит ли брать груз?»
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Добавить авто
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Добавьте хотя бы одно авто: расход, цену топлива и амортизацию. Так калькулятор сможет посчитать, выгоден ли груз.
          </p>
          <button
            onClick={openCreate}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Добавить авто
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className={cn(
                "flex flex-wrap items-center gap-4 p-4 rounded-xl border",
                "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{v.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {v.fuelConsumptionPer100} л/100 км · {v.fuelPricePerLiter} ₽/л
                    {' · '}аморт. {v.depreciationPer1000.toLocaleString('ru-RU')} ₽/1000 км
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(v)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteVehicle(v.id)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editing ? 'Редактировать авто' : 'Новое авто'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300">
              Отмена
            </button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Сохранить
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Название (например, MAN TGX)"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="sm:col-span-2 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Расход, л/100 км</label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={form.fuelConsumptionPer100}
              onChange={(e) => setForm((p) => ({ ...p, fuelConsumptionPer100: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Цена топлива, ₽/л</label>
            <input
              type="number"
              min="1"
              value={form.fuelPricePerLiter}
              onChange={(e) => setForm((p) => ({ ...p, fuelPricePerLiter: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Амортизация за 1000 км, ₽</label>
            <input
              type="number"
              min="0"
              value={form.depreciationPer1000}
              onChange={(e) => setForm((p) => ({ ...p, depreciationPer1000: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Еда/стоянки за 1000 км, ₽</label>
            <input
              type="number"
              min="0"
              value={form.foodParkingPer1000}
              onChange={(e) => setForm((p) => ({ ...p, foodParkingPer1000: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
