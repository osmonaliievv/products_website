import React, { createContext, useContext, useReducer } from "react";
import { ACTIONS } from "../../helpers/const";
import { getLocalStorageFavorites } from "../../helpers/functions";

// Контекст и хук
const favoritesContext = createContext();
export const useLike = () => useContext(favoritesContext);

// Начальное состояние
const INIT_STATE = {
  like: JSON.parse(localStorage.getItem("like")) || { products: [] },
};

// Редьюсер
const reducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case ACTIONS.GET_LIKE:
      return { ...state, like: action.payload };
    default:
      return state;
  }
};

// Провайдер
const FavoritesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  // Получить избранное из localStorage
  const getLike = () => {
    let like = getLocalStorageFavorites();
    if (!like) {
      like = { products: [] };
      localStorage.setItem("like", JSON.stringify(like));
    }
    dispatch({ type: ACTIONS.GET_LIKE, payload: like });
  };

  // Добавить или удалить товар из избранного
  const addProductsToLike = (product) => {
    let like = getLocalStorageFavorites() || { products: [] };

    const isLiked = like.products.some((elem) => elem.item.id === product.id);

    if (isLiked) {
      like.products = like.products.filter(
        (elem) => elem.item.id !== product.id
      );
    } else {
      like.products.push({ item: product });
    }

    localStorage.setItem("like", JSON.stringify(like));
    dispatch({ type: ACTIONS.GET_LIKE, payload: like });
  };

  // Проверить, есть ли товар в избранном
  const checkProductInLike = (id) => {
    const like = getLocalStorageFavorites();
    if (like) {
      return like.products.some((elem) => elem.item.id === id);
    }
    return false;
  };

  // Удалить товар из избранного
  const deleteProductFromLike = (id) => {
    let like = getLocalStorageFavorites();
    if (!like) return;

    like.products = like.products.filter((elem) => elem.item.id !== id);
    localStorage.setItem("like", JSON.stringify(like));
    dispatch({ type: ACTIONS.GET_LIKE, payload: like });
  };

  // Значения, доступные через контекст
  const values = {
    like: state.like,
    getLike,
    addProductsToLike,
    deleteProductFromLike,
    checkProductInLike,
  };

  return (
    <favoritesContext.Provider value={values}>
      {children}
    </favoritesContext.Provider>
  );
};

export default FavoritesContextProvider;
