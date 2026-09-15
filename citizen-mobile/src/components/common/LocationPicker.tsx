import React, { useState } from 'react';
import { MapPin, Globe, ChevronDown } from 'lucide-react';
import {
  getStates,
  getDistricts,
  getWards,
  findLocationFromWard,
} from '../../data/locationData';

interface LocationPickerProps {
  value?: string;
  onChange: (wardValue: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value = '',
  onChange,
  required = false,
  disabled = false,
  className = '',
}) => {
  const initial = findLocationFromWard(value);
  const [selectedStateId, setSelectedStateId] = useState<string>(initial.stateId || 'tamil-nadu');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initial.districtId || 'chennai');
  const [selectedWard, setSelectedWard] = useState<string>(value || initial.wardValue || '');

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const parsed = findLocationFromWard(value);
    setSelectedStateId(parsed.stateId || 'tamil-nadu');
    setSelectedDistrictId(parsed.districtId || 'chennai');
    setSelectedWard(value || parsed.wardValue || '');
  }

  const states = getStates();
  const districts = getDistricts(selectedStateId);
  const wards = getWards(selectedStateId, selectedDistrictId);

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    const newDistricts = getDistricts(stateId);
    const firstDistrict = newDistricts[0]?.id || '';
    setSelectedDistrictId(firstDistrict);
    const newWards = getWards(stateId, firstDistrict);
    const firstWard = newWards[0]?.name || '';
    setSelectedWard(firstWard);
    onChange(firstWard);
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    const newWards = getWards(selectedStateId, districtId);
    const firstWard = newWards[0]?.name || '';
    setSelectedWard(firstWard);
    onChange(firstWard);
  };

  const handleWardChange = (wardName: string) => {
    setSelectedWard(wardName);
    onChange(wardName);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Country (India Fixed) & State in 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block mb-1">
            Country
          </label>
          <div className="relative">
            <div className="w-full px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#1A2C23]/60 border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] flex items-center justify-between shadow-xs cursor-not-allowed select-none">
              <span className="flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 text-[#168A5B] dark:text-[#39B77A] flex-shrink-0" />
                <span>India 🇮🇳</span>
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block mb-1">
            State {required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <select
              value={selectedStateId}
              disabled={disabled}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs cursor-pointer truncate"
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64736A] dark:text-[#A9BBB1] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* District Dropdown */}
      <div>
        <label className="text-[11px] font-bold text-[#64736A] dark:text-[#A9BBB1] uppercase tracking-wider block mb-1">
          District / Corporation {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            value={selectedDistrictId}
            disabled={disabled}
            onChange={(e) => handleDistrictChange(e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-semibold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs cursor-pointer truncate"
          >
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1] pointer-events-none" />
        </div>
      </div>

      {/* Ward / Locality Dropdown in 'Ward N – Area' format */}
      <div>
        <label className="text-[11px] font-bold text-[#17211B] dark:text-[#F2F7F4] uppercase tracking-wider block mb-1">
          Ward / Locality {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#168A5B] dark:text-[#39B77A] pointer-events-none" />
          <select
            value={selectedWard}
            disabled={disabled}
            required={required}
            onChange={(e) => handleWardChange(e.target.value)}
            className="w-full appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white dark:bg-[#14221B] border border-[#DCE7E1] dark:border-[#294037] text-xs font-bold text-[#17211B] dark:text-[#F2F7F4] focus:outline-none focus:ring-2 focus:ring-[#168A5B]/40 dark:focus:ring-[#39B77A]/40 focus:border-[#168A5B] shadow-xs cursor-pointer truncate"
          >
            <option value="">Select your Ward / Area...</option>
            {wards.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name} {w.zone ? `(${w.zone})` : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64736A] dark:text-[#A9BBB1] pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
