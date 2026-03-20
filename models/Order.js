// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     userName: {
//       type: String,
//       required: true,
//     },

//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Price",
//       required: true,
//     },

//     productName: {
//       type: String,
//       required: true,
//     },

//     price: {
//       type: Number,
//       required: true,
//     },

//     quantity: {
//       type: Number,
//       default: 1,
//     },

//     address: {
//       name: String,
//       phone: String,
//       street: String,
//       city: String,
//       state: String,
//       pincode: String,
//     },

//     status: {
//       type: String,
//       enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
//       default: "placed",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Order", OrderSchema);

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    userName: {
      type: String,
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Price",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    unitPrice: {
      type: Number,
      required: true, // product.salePrice
    },

    quantity: {
      type: Number,
      default: 1,
    },

    price: {
      type: Number,
      required: true, // unitPrice * quantity (TOTAL)
    },

    address: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },

    status: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "delivered", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
