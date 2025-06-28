import React, { createContext, useContext, useReducer } from "react";
import { ACTIONS } from "../../helpers/const";
import {
  calcSubPrice,
  calcTotalPrice,
  getLocalStorage,
  getProductsCountInCart,
} from "../../helpers/functions";

const cartContext = createContext();
export const useCart = () => useContext(cartContext);

const INIT_STATE = {
  cart: JSON.parse(localStorage.getItem("cart")),
  cartLength: getProductsCountInCart(),
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.GET_CART:
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
      subPrice: product.price,
    };

    const isProductInCart = cart.products.some(
      (elem) => elem.item.id === product.id
    );

    if (!isProductInCart) {
      cart.products.push(newProduct);
    } else {
      cart.products = cart.products.filter(
        (elem) => elem.item.id !== product.id
      );
    }

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
    if (cart && cart.products) {
      return cart.products.some((elem) => elem.item.id === id);
    }
    return false;
  };

  // ! CHANGE PRODUCT COUNT (AND SUBPRICE/TOTALPRICE)
  const changeProductCount = (id, count) => {
    let cart = getLocalStorage();
    if (cart && cart.products) {
      cart.products = cart.products.map((elem) => {
        if (elem.item.id === id) {
          elem.count = parseInt(count, 10);
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

  React.useEffect(() => {
    getCart();
  }, []);

  const values = {
    getCart,
    addProductToCart,
    cart: state.cart,
    cartLength: state.cartLength,
    getProductsCountInCart,
    checkProductInCart,
    changeProductCount,
    deleteProductFromCart,
  };

  return <cartContext.Provider value={values}>{children}</cartContext.Provider>;
};

export default CartContextProvider;
