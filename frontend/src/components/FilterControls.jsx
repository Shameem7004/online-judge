import React from 'react';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import Button from './ui/Button';

const FilterControls = ({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  onClear,
  filterOptions, 
  placeholder = "Search..." 
}) => {
  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v !== '');

  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
      
      {/* Search Input */}
      <div className="relative w-full md:flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="text-slate-400" />
        </div>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-white rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          placeholder={placeholder}
        />
      </div>

      {/* Filter Dropdowns */}
      {filterOptions.map(option => (
        <div key={option.key} className="relative w-full md:w-auto md:min-w-[180px]">
          <select
            id={option.key}
            name={option.key}
            value={filters[option.key]}
            onChange={(e) => onFilterChange(option.key, e.target.value)}
            className="appearance-none block w-full pl-4 pr-10 py-2.5 border border-slate-200 bg-white rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          >
            <option value="">{option.label}</option>
            {option.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <FaChevronDown className="text-slate-400 h-4 w-4" />
          </div>
        </div>
      ))}

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="w-full md:w-auto text-slate-600"
        >
          <FaTimes className="mr-1.5" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default FilterControls;