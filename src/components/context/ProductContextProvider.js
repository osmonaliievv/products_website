import React, { createContext, useContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIONS } from "../../helpers/const";

export const productContext = createContext();
export const useProducts = () => useContext(productContext);

const INIT_STATE = {
  products: [],
  oneProduct: {},
  categories: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.GET_PRODUCTS:
      return { ...state, products: action.payload };
    case ACTIONS.GET_ONE_PRODUCT:
      return { ...state, oneProduct: action.payload };
    case ACTIONS.GET_CATEGORIES:
      return { ...state, categories: action.payload };
    default:
      return state;
  }
};

const ProductContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  // !GET PRODUCTS from public/db.json
  const getProducts = async () => {
    try {
      const res = await fetch("/db.json");
      const data = await res.json();
      dispatch({
        type: ACTIONS.GET_PRODUCTS,
        payload: data.products,
      });
    } catch (err) {
      console.error("Ошибка при получении товаров:", err);
    }
  };

  // !GET ONE PRODUCT (по id из db.json)
  const getOneProduct = async (id) => {
    try {
      const res = await fetch("/db.json");
      const data = await res.json();
      const product = data.products.find((p) => p.id == id);
      dispatch({
        type: ACTIONS.GET_ONE_PRODUCT,
        payload: product || {},
      });
    } catch (err) {
      console.error("Ошибка при получении одного товара:", err);
    }
  };

  // !GET CATEGORIES
  const getCategories = async () => {
    try {
      const res = await fetch("/db.json");
      const data = await res.json();
      dispatch({
        type: ACTIONS.GET_CATEGORIES,
        payload: data.categories || [],
      });
    } catch (err) {
      console.error("Ошибка при получении категорий:", err);
    }
  };

  // !Фильтрация по параметрам URL (без сервера)
  const fetchByParams = (query, value) => {
    const search = new URLSearchParams(window.location.search);
    if (value === "all") {
      search.delete(query);
    } else {
      search.set(query, value);
    }
    const url = `${window.location.pathname}?${search}`;
    navigate(url);
  };

  const values = {
    fetchByParams,
    getProducts,
    getOneProduct,
    getCategories,
    products: state.products,
    oneProduct: state.oneProduct,
    categories: state.categories,
  };

  return (
    <productContext.Provider value={values}>{children}</productContext.Provider>
  );
};

export default ProductContextProvider;
