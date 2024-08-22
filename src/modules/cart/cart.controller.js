import { catchError } from "../../middleware/catchError.js";
import { AppError } from "../../utilities/appError.js";
import { User } from "../../model/user.model.js";
import { Cart } from "../../model/cart.model.js";
import { Product } from "../../model/product.model.js";

// calculate total cart price
function calcTotalPrice(isCartExist) {
  isCartExist.totalCartPrice = isCartExist.cartItems.reduce(
    (prev, item) => (prev += item.quantity * item.price),
    0
  );
}

// add to cart
const addToCart = catchError(async (req, res, next) => {
  // check if user has cart
  let isCartExist = await Cart.findOne({ user: req.user._id });
  // check the stock of product
  let product = await Product.findById(req.body.product);
  if (!product) return next(new AppError(`product not found`, 404));
  req.body.price = product.price;
  if (req.body.quantity > product.stock)
    return next(new AppError(`sold out`, 404));

  if (!isCartExist) {
    // create cart for user
    let cart = new Cart({
      user: req.user._id,
      cartItems: [req.body],
    });
    calcTotalPrice(cart);
    await cart.save();
    res.json({ message: " success", cart });
  } else {
    // find ====> array method not mongDb
    let item = isCartExist.cartItems.find(
      (item) => item.product == req.body.product
    );

    if (item) {
      item.quantity += req.body.quantity || 1;
      await isCartExist.save();
      if (item.quantity > product.stock)
        return next(new AppError(`sold out`, 404));
    }
    if (!item) isCartExist.cartItems.push(req.body);
    calcTotalPrice(isCartExist);
    await isCartExist.save();
    res.json({ message: " success", isCartExist });
  }
});

// update quantity
const updateQuantity = catchError(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });
  let item = cart.cartItems.find((item) => item.product == req.params.id);
  if (!item) return next(new AppError("Product Not Fount", 401));

  item.quantity = req.body.quantity;
  calcTotalPrice(cart);
  await cart.save();

  res.status(201).json({ message: "Success", cart });
});

// remove product from cart
let removeProduct = catchError(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.id } } },
    { new: true }
  );
  calcTotalPrice(cart);
  await cart.save();
  cart || next(new AppError("product not found", 401));
  !cart || res.status(201).json({ message: "Success Deleted", cart });
});

export { addToCart, updateQuantity, removeProduct };

// let getloogedusercart = catchError(async (req, res, next) => {
//   const cart = await Cart.findOne({ user: req.user._id });
//   cart || next(new appError("product not found", 401));
//   !cart || res.status(201).json({ message: "Success Deleted", cart });
// });
// let clearCart = catchError(async (req, res, next) => {
//   const cart = await Cart.findOneAndDelete({ user: req.user._id });
//   cart || next(new appError("product not found", 401));
//   !cart || res.status(201).json({ message: "Success Deleted", cart });
// });

// const applyCopon = catchError(async(req,res,next)=>{
//     const copon = await Copoun.findOne({code:req.body.code , expire : {$gte : Date.now()}})
//     if(!copon) return next(new appError('Opps Copoun Inalid',401));
//     const cart = await Cart.findOne({user:req.user._id});

//     cart.disCount = copon.disCount

//     await cart.save();
//     res.status(201).json({message:"Success" , cart})
// })
// export {
//     addToCart,
//     updateQuantity,
//     removeProduct,
//     getloogedusercart,
//     clearCart,
//     applyCopon
// }
