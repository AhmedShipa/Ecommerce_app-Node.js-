import mongoose from "mongoose";

export const dbConnection = mongoose
  .connect("mongodb://127.0.0.1:27017/E_commerce_App")
  .then(() => {
    console.log("database connected successfully");
  })
  .catch(() => {
    console.log("database failed to connect");
  });