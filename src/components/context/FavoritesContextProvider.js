import React, { createContext, useContext, useReducer } from "react";
import { ACTIONS } from "../../helpers/const";
import { getLocalStorageFavorites } from "../../helpers/functions"; // Убедитесь, что эта функция корректна

export const favorites = createContext();
export const useLike = () => useContext(favorites);

const INIT_STATE = {
  // Инициализируем like из localStorage при первой загрузке
  // Если localStorage.getItem("like") вернет null, JSON.parse(null) будет null
  // Затем, если like будет null в reducer, он будет инициализирован как { products: [] }
  like: JSON.parse(localStorage.getItem("like")),
};

const reducer = (state, action) => {
  // Убрал state = INIT_STATE, так как useReducer уже устанавливает начальное состояние
  switch (action.type) {
    case ACTIONS.GET_LIKE:
      return { ...state, like: action.payload };
    default:
      return state;
  }
};

const FavoritesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  // ! GET LIKES
  const getLike = () => {
    let like = getLocalStorageFavorites(); // Получаем избранное из localStorage
    if (!like) {
      // Если избранного нет, инициализируем его
      like = { products: [] };
      localStorage.setItem("like", JSON.stringify(like));
    }
    dispatch({
      type: ACTIONS.GET_LIKE,
      payload: like,
    });
  };

  // ! ADD/REMOVE PRODUCT TO/FROM LIKES
  const addProductsToLike = (product) => {
    let like = getLocalStorageFavorites();
    if (!like) {
      like = { products: [] };
    }

    // Проверяем, есть ли продукт уже в избранном
    // Использование some() более эффективно, чем filter() для проверки наличия
    const isProductInLike = like.products.some(
      (elem) => elem.item.id === product.id
    );

    if (!isProductInLike) {
      // Если продукта нет, добавляем его
      like.products.push({ item: product });
    } else {
      // Если продукт уже есть, удаляем его (это логика переключения "добавить/удалить")
      like.products = like.products.filter(
        (elem) => elem.item.id !== product.id
      );
    }

    localStorage.setItem("like", JSON.stringify(like));
    dispatch({
      type: ACTIONS.GET_LIKE,
      payload: like,
    });
  };

  // ! CHECK PRODUCT IN LIKES
  const checkProductInLike = (id) => {
    let like = getLocalStorageFavorites();
    if (like && like.products) {
      // Добавлена проверка на like.products, чтобы избежать ошибок
      // Используем some() для проверки наличия
      return like.products.some((elem) => elem.item.id === id);
    }
    return false; // Если избранного нет или оно пустое, продукт не найден
  };

  // ! DELETE PRODUCT FROM LIKES (specific delete, not toggle)
  const deleteProductFromLike = (id) => {
    let like = getLocalStorageFavorites();
    if (like && like.products) {
      like.products = like.products.filter((elem) => elem.item.id !== id);
      localStorage.setItem("like", JSON.stringify(like));
      dispatch({
        type: ACTIONS.GET_LIKE,
        payload: like,
      });
    }
  };

  // Вызываем getLike при первой загрузке компонента, чтобы синхронизировать состояние
  // Context с localStorage. Это лучше делать в useEffect в провайдере.
  React.useEffect(() => {
    getLike();
  }, []); // Пустой массив зависимостей означает, что useEffect выполнится один раз при монтировании

  const values = {
    like: state.like,
    deleteProductFromLike,
    checkProductInLike,
    addProductsToLike,
    getLike,
  };

  return <favorites.Provider value={values}>{children}</favorites.Provider>;
};

export default FavoritesContextProvider;
