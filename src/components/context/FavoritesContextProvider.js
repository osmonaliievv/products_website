import React, { createContext, useContext, useReducer } from "react";
import { ACTIONS } from "../../helpers/const";
import { getLocalStorageFavorites } from "../../helpers/functions";

export const favorites = createContext();
export const useLike = () => useContext(favorites);

const INIT_STATE = {
  like: JSON.parse(localStorage.getItem("like")),
};

const reducer = (state, action) => {
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
    let like = getLocalStorageFavorites();
    if (!like) {
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

    const isProductInLike = like.products.some(
      (elem) => elem.item.id === product.id
    );

    if (!isProductInLike) {
      like.products.push({ item: product });
    } else {
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
      return like.products.some((elem) => elem.item.id === id);
    }
    return false;
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

  React.useEffect(() => {
    getLike();
  }, []);

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
