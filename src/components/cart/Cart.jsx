import React, { useEffect } from "react";
import { useCart } from "../context/CartContextProvider";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const Cart = () => {
  const { cart, getCart, changeProductCount, deleteProductFromCart } =
    useCart();

  useEffect(() => {
    getCart();
  }, [getCart]);

  const cartCleaner = () => {
    localStorage.removeItem("cart");
    getCart();
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        minHeight: "400px",
        padding: "20px",
        width: "1150px",
        margin: "20px auto",
      }}
    >
      {cart?.products.length > 0 ? (
        <>
          <Table aria-label="simple table" sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell align="right">Товар</TableCell>
                <TableCell align="right">Название</TableCell>
                <TableCell align="right">Категория</TableCell>
                <TableCell align="right">Цена</TableCell>
                <TableCell align="right">Количество</TableCell>
                <TableCell align="right">Сумма</TableCell>
                <TableCell align="right">-</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.products.map((elem) => (
                <TableRow
                  key={elem.item.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right" scope="row" component="th">
                    <img
                      src={elem.item.image}
                      alt={elem.item.name}
                      width={100}
                    />
                  </TableCell>
                  <TableCell align="right">{elem.item.name}</TableCell>
                  <TableCell align="right">{elem.item.category}</TableCell>
                  <TableCell align="right">{elem.item.price}</TableCell>
                  <TableCell align="right">
                    <input
                      onChange={(e) =>
                        changeProductCount(elem.item.id, e.target.value)
                      }
                      min={1}
                      max={30}
                      type="number"
                      defaultValue={elem.count}
                    />
                  </TableCell>
                  <TableCell align="right">{elem.subPrice}</TableCell>
                  <TableCell align="right">
                    <DeleteIcon
                      sx={{ color: "red", cursor: "pointer" }}
                      onClick={() => deleteProductFromCart(elem.item.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={cartCleaner}>
            Оплатить покупку за {cart.totalPrice}
          </Button>
        </>
      ) : (
        <Typography
          variant="h5"
          color="textSecondary"
          align="center"
          sx={{ marginTop: "20px" }}
        >
          Корзина пуста
        </Typography>
      )}
    </TableContainer>
  );
};

export default Cart;
