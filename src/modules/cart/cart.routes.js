import { Router } from "express";

import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import { addToCart, removeProduct, updateQuantity } from "./cart.controller.js";

const cartRouter = Router();

cartRouter.route("/").post(protectedRoutes, allowedTo("user"), addToCart);

// import { Router } from "express";
// import { allowTo, protectedRoutes } from "../auth/auth.controller.js";
// import { addToCart, applyCopon, clearCart, getloogedusercart, removeProduct, updateQuantity } from "./cart.controller.js";

// const cartRouter = Router();
// cartRouter.use(protectedRoutes , allowTo('user'))
// cartRouter.route('/')
//         .post(addToCart)
//         .get(getloogedusercart)
//         .delete(clearCart)

cartRouter
  .route("/:id")
  .put(protectedRoutes, allowedTo("user"), updateQuantity)
  .delete(protectedRoutes, allowedTo("user"), removeProduct);

// cartRouter.post('/apply-copon', applyCopon)
// export{cartRouter}

export default cartRouter;
