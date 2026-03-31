import { createContext, useContext } from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

const CategoryContext = createContext();

export function CategoryProvider({ children }) {
  // Hardcoded Categories Architecture completely bypassing legacy persistent custom states
  const expenseCategories = [...EXPENSE_CATEGORIES];
  const incomeCategories = [...INCOME_CATEGORIES];
  const categories = [...expenseCategories, ...incomeCategories];

  const getCategoryByKey = (key) => {
    return categories.find(c => c.key === key);
  };

  const getCategoryByLabel = (label) => {
    return categories.find(c => c.label === label);
  };

  const value = {
    categories,
    expenseCategories,
    incomeCategories,
    customCategories: [], // Permanently set to blank array to halt loops from crashing inside older components
    loading: false, // Localized arrays are instantly available
    getCategoryByKey,
    getCategoryByLabel,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => {
  return useContext(CategoryContext);
};
