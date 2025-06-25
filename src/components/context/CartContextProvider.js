import React, { createContext, useContext, useReducer } from "react";
import { ACTIONS } from "../../helpers/const";
import {
  calcSubPrice,
  calcTotalPrice,
  getLocalStorage, // Убедитесь, что эта функция корректна
  getProductsCountInCart, // Убедитесь, что эта функция корректна
} from "../../helpers/functions";

const cartContext = createContext();
export const useCart = () => useContext(cartContext);

const INIT_STATE = {
  // Инициализируем корзину из localStorage при первой загрузке
  cart: JSON.parse(localStorage.getItem("cart")),
  // Инициализируем количество товаров в корзине
  cartLength: getProductsCountInCart(),
};

const reducer = (state, action) => {
  // Убрал state = INIT_STATE, так как useReducer уже устанавливает начальное состояние
  switch (action.type) {
    case ACTIONS.GET_CART:
      // При получении корзины, обновляем и саму корзину, и её длину
      return {
        ...state,
        cart: action.payload,
        cartLength: getProductsCountInCart(),
      };
    default:
      return state;
  }
};

const CartContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INIT_STATE);

  // !GET CART DATA
  const getCart = () => {
    let cart = getLocalStorage();
    // Если корзины нет в localStorage, инициализируем её
    if (!cart) {
      cart = {
        products: [],
        totalPrice: 0,
      };
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    dispatch({
      type: ACTIONS.GET_CART,
      payload: cart,
    });
  };

  // ! ADD/REMOVE PRODUCT TO/FROM CART
  const addProductToCart = (product) => {
    let cart = getLocalStorage();
    if (!cart) {
      cart = {
        products: [],
        totalPrice: 0,
      };
    }

    const newProduct = {
      item: product,
      count: 1,
      subPrice: product.price, // Начальная подцена
    };

    // Проверяем, есть ли продукт уже в корзине
    // Используем `some` для более эффективной проверки наличия
    const isProductInCart = cart.products.some(
      (elem) => elem.item.id === product.id
    );

    if (!isProductInCart) {
      // Если продукта нет, добавляем его
      cart.products.push(newProduct);
    } else {
      // Если продукт уже есть, удаляем его (это логика переключения "добавить/удалить")
      cart.products = cart.products.filter(
        (elem) => elem.item.id !== product.id
      );
    }

    // Пересчитываем общую цену после изменения продуктов
    cart.totalPrice = calcTotalPrice(cart.products);
    localStorage.setItem("cart", JSON.stringify(cart));
    dispatch({
      type: ACTIONS.GET_CART,
      payload: cart,
    });
  };

  // ! CHECK PRODUCT IN CART
  const checkProductInCart = (id) => {
    let cart = getLocalStorage();
    // Добавлена проверка на cart и cart.products, чтобы избежать ошибок
    if (cart && cart.products) {
      // Используем `some` для проверки наличия
      return cart.products.some((elem) => elem.item.id === id);
    }
    return false; // Если корзины нет или она пуста, продукт не найден
  };

  // ! CHANGE PRODUCT COUNT (AND SUBPRICE/TOTALPRICE)
  const changeProductCount = (id, count) => {
    let cart = getLocalStorage();
    if (cart && cart.products) {
      cart.products = cart.products.map((elem) => {
        if (elem.item.id === id) {
          // Преобразуем count в число, чтобы избежать ошибок
          elem.count = parseInt(count, 10);
          // Проверяем, чтобы count не был меньше 1
          if (elem.count < 1) {
            elem.count = 1;
          }
          elem.subPrice = calcSubPrice(elem);
        }
        return elem;
      });
      cart.totalPrice = calcTotalPrice(cart.products);
      localStorage.setItem("cart", JSON.stringify(cart));
      dispatch({
        type: ACTIONS.GET_CART,
        payload: cart,
      });
    }
  };

  // !DELETE PRODUCT FROM CART (specific delete, not toggle)
  const deleteProductFromCart = (id) => {
    let cart = getLocalStorage();
    if (cart && cart.products) {
      cart.products = cart.products.filter((elem) => elem.item.id !== id);
      cart.totalPrice = calcTotalPrice(cart.products);
      localStorage.setItem("cart", JSON.stringify(cart));
      dispatch({
        type: ACTIONS.GET_CART,
        payload: cart,
      });
    }
  };

  // Вызываем getCart при первой загрузке компонента, чтобы синхронизировать состояние
  // Context с localStorage. Это лучше делать в useEffect в провайдере.
  React.useEffect(() => {
    getCart();
  }, []); // Пустой массив зависимостей означает, что useEffect выполнится один раз при монтировании

  const values = {
    getCart,
    addProductToCart,
    cart: state.cart,
    cartLength: state.cartLength, // Передаем cartLength из состояния
    getProductsCountInCart, // Эта функция может быть вызвана из компонента для получения актуальной длины
    checkProductInCart,
    changeProductCount,
    deleteProductFromCart,
  };

  return <cartContext.Provider value={values}>{children}</cartContext.Provider>;
};

export default CartContextProvider;
