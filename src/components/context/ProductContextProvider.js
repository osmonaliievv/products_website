import React, { createContext, useContext, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { ACTIONS, API, API_CATEGORIES } from "../../helpers/const";
import axios from "axios";

export const productContext = createContext();
export const useProducts = () => useContext(productContext);

const INIT_STATE = {
  products: [],
  oneProduct: {},
  categories: [],
  loading: false, // Добавляем состояние загрузки
  error: null, // Добавляем состояние ошибки
  // cart: null, // Если вы хотите управлять корзиной здесь, добавьте это
  // like: null, // Если вы хотите управлять лайками здесь, добавьте это
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.GET_PRODUCTS:
      return {
        ...state,
        products: action.payload,
        loading: false,
        error: null,
      };
    case ACTIONS.GET_ONE_PRODUCT:
      return {
        ...state,
        oneProduct: action.payload,
        loading: false,
        error: null,
      };
    case ACTIONS.GET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
        loading: false,
        error: null,
      };
    case ACTIONS.SET_LOADING: // Новый экшен для установки состояния загрузки
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR: // Новый экшен для установки состояния ошибки
      return { ...state, error: action.payload, loading: false };
    // case ACTIONS.GET_CART:
    //   return { ...state, cart: action.payload };
    // case ACTIONS.GET_LIKE:
    //   return { ...state, like: action.payload };
    default:
      return state;
  }
};

const ProductContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  // Вспомогательные функции для управления состоянием загрузки и ошибок
  const setLoading = (isLoading) =>
    dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading });
  const setError = (errMessage) =>
    dispatch({ type: ACTIONS.SET_ERROR, payload: errMessage });
  const clearError = () => dispatch({ type: ACTIONS.SET_ERROR, payload: null });

  // !CREATE
  const addProduct = async (newProduct) => {
    setLoading(true);
    clearError();
    try {
      await axios.post(API, newProduct);
      navigate("/");
    } catch (error) {
      console.error("Ошибка при добавлении продукта:", error);
      setError(error.message || "Не удалось добавить продукт.");
    } finally {
      setLoading(false);
    }
  };

  // !GET
  const getProducts = async () => {
    setLoading(true);
    clearError();
    try {
      // Используем axios для запроса к API
      // Если window.location.search пуст, это будет просто /api/products
      // Если есть параметры, например ?category=electronics, это будет /api/products?category=electronics
      const { data } = await axios(`${API}${window.location.search}`);
      dispatch({
        type: ACTIONS.GET_PRODUCTS,
        payload: data,
      });
    } catch (error) {
      console.error("Ошибка при получении продуктов:", error);
      setError(error.message || "Не удалось получить список продуктов.");
    } finally {
      setLoading(false); // Завершаем загрузку даже при ошибке
    }
  };

  // !DELETE
  const deleteProduct = async (id) => {
    setLoading(true);
    clearError();
    try {
      await axios.delete(`${API}/${id}`);
      getProducts(); // Обновляем список продуктов после удаления
    } catch (error) {
      console.error("Ошибка при удалении продукта:", error);
      setError(error.message || "Не удалось удалить продукт.");
    } finally {
      setLoading(false);
    }
  };

  // !GET_ONE_PRODUCT
  const getOneProduct = async (id) => {
    setLoading(true);
    clearError();
    try {
      const { data } = await axios(`${API}/${id}`);
      dispatch({
        type: ACTIONS.GET_ONE_PRODUCT,
        payload: data,
      });
    } catch (error) {
      console.error("Ошибка при получении одного продукта:", error);
      setError(error.message || "Не удалось получить данные продукта.");
    } finally {
      setLoading(false);
    }
  };

  // !EDIT
  const editProduct = async (id, editedProduct) => {
    setLoading(true);
    clearError();
    try {
      await axios.patch(`${API}/${id}`, editedProduct);
      navigate("/");
    } catch (error) {
      console.error("Ошибка при редактировании продукта:", error);
      setError(error.message || "Не удалось отредактировать продукт.");
    } finally {
      setLoading(false);
    }
  };

  // !GET_CATEGORIES
  const getCategories = async () => {
    setLoading(true);
    clearError();
    try {
      const { data } = await axios(API_CATEGORIES);
      dispatch({
        type: ACTIONS.GET_CATEGORIES,
        payload: data,
      });
    } catch (error) {
      console.error("Ошибка при получении категорий:", error);
      setError(error.message || "Не удалось получить список категорий.");
    } finally {
      setLoading(false);
    }
  };

  // !CREATE CATEGORIES
  const createCategory = async (newCategory) => {
    setLoading(true);
    clearError();
    try {
      await axios.post(API_CATEGORIES, newCategory);
      getCategories(); // Обновляем список категорий после создания
    } catch (error) {
      console.error("Ошибка при создании категории:", error);
      setError(error.message || "Не удалось создать категорию.");
    } finally {
      setLoading(false);
    }
  };

  // ! FILTER
  const fetchByParams = (query, value) => {
    const search = new URLSearchParams(window.location.search);
    if (value === "all") {
      search.delete(query);
    } else {
      search.set(query, value);
    }
    const url = `${window.location.pathname}?${search}`;
    navigate(url);
    // После изменения URL, если вам нужно немедленно обновить список,
    // вы можете вызвать getProducts() здесь.
    // getProducts(); // Раскомментируйте, если нужно немедленное обновление после фильтрации/поиска
  };

  const values = {
    fetchByParams,
    addProduct,
    getProducts,
    deleteProduct,
    products: state.products, // Передаем продукты из состояния
    getOneProduct,
    oneProduct: state.oneProduct, // Передаем один продукт из состояния
    editProduct,
    getCategories,
    categories: state.categories, // Передаем категории из состояния
    createCategory,
    loading: state.loading, // Передаем состояние загрузки
    error: state.error, // Передаем состояние ошибки
    // Возможно, вам также нужны функции для корзины и лайков
    // getCart: () => {},
    // getLike: () => {},
  };

  return (
    <productContext.Provider value={values}>{children}</productContext.Provider>
  );
};

export default ProductContextProvider;
