import React from 'react';
import { motion } from 'framer-motion';
import { CategoryId, MenuCategoryData } from '../types';

interface MenuNavigationProps {
  categories: MenuCategoryData[];
  selectedCategory: CategoryId;
  onSelect: (id: CategoryId) => void;
  isNight: boolean;
}

export const MenuNavigation: React.FC<MenuNavigationProps> = ({ categories, selectedCategory, onSelect, isNight }) => {
  return (
    <div className={`sticky top-0 z-40 backdrop-blur-sm shadow-sm py-4 overflow-x-auto no-scrollbar transition-colors duration-500 ${isNight ? 'bg-[#1a103c]/90' : 'bg-orange-50/95'}`}>
      <div className="flex px-4 gap-4 min-w-max">
        {categories.map((cat, index) => {
          const isSelected = selectedCategory === cat.id;
          
          let textColor = isNight ? 'text-indigo-300' : 'text-gray-500';
          if (isSelected) textColor = isNight ? 'text-amber-400' : 'text-orange-900';
          
          const circleBg = isSelected 
             ? (isNight ? 'bg-indigo-800 border-amber-500' : 'bg-orange-200 border-orange-600')
             : (isNight ? 'bg-[#2d1b69] border-indigo-800' : 'bg-white border-gray-300');

          return (
            <motion.button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-300 ${textColor}`}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                {/* Paratha icon representation */}
                <motion.div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-1 overflow-hidden transition-colors duration-300 ${circleBg} ${isSelected ? 'shadow-md' : ''}`}
                  animate={{ 
                    rotate: isSelected ? 360 : 0,
                    scale: isSelected ? 1.1 : 1
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                    {/* Inner texture */}
                    <div className={`w-8 h-8 rounded-full border border-dashed ${isSelected ? (isNight ? 'border-amber-400' : 'border-orange-500') : (isNight ? 'border-indigo-600' : 'border-gray-300')}`} />
                </motion.div>
                
                {/* Active Indicator */}
                {isSelected && (
                    <motion.div
                        layoutId="active-indicator"
                        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isNight ? 'bg-amber-400' : 'bg-orange-600'}`}
                    />
                )}
              </div>
              <span className={`text-xs uppercase tracking-wider ${isSelected ? 'font-bold' : 'font-medium'}`}>
                {cat.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};