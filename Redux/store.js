import { configureStore } from '@reduxjs/toolkit';
import { shoppingListReducer } from './reducers';

export const store = configureStore({
  reducer: {
    shoppingList: shoppingListReducer,
  },
});