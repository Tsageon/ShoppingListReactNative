import { ADD_ITEM, REMOVE_ITEM, UPDATE_ITEM, SET_SHOPPING_LIST, SET_LOADING } from './Action';

const initialState = {
  shoppingList: [],
  loading: false,
};

export const shoppingListReducer = (state = initialState || [] , action) => {
  switch (action.type) {
    case 'SET_SHOPPING_LIST':
      return {
        ...state,
        shoppingList: action.payload,
      };

    case 'SET_LOADING':
      return{
        ...state,
        loading: action.payload,
      }; 

    case 'ADD_ITEM':
      return {
        ...state,
        shoppingList: [...state.shoppingList, action.payload],
      };

      case 'REMOVE_ITEM':
        return {
          ...state,
          shoppingList: state.shoppingList.filter(
            item => item.id !== action.payload 
          ),
        };

    case 'UPDATE_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.map((item, i) =>
          i === action.payload.index ? action.payload.updatedItem : item
        ),
      };

    default:
      return state;
  }};