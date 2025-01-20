export const ADD_ITEM = 'ADD_ITEM';
export const REMOVE_ITEM = 'REMOVE_ITEM';
export const UPDATE_ITEM = 'UPDATE_ITEM';
export const SET_SHOPPING_LIST = 'SET_SHOPPING_LIST';
export const SET_LOADING = 'SET_LOADING';

export const addItem = (item) => ({
  type: ADD_ITEM,
  payload: item,
});

export const removeItem = (id) => ({
  type: REMOVE_ITEM,
  payload: id, 
});


export const updateItem = (index, updatedItem) => ({
  type: UPDATE_ITEM,
  payload: { index, updatedItem },
});

export const setShoppingList = (items) => ({
  type: SET_SHOPPING_LIST,
  payload: items,
});

export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
})