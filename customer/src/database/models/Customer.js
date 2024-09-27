const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    email: String,
    password: String,
    phone: String,
    address: [{ type: Schema.Types.ObjectId, ref: "address", required: true }],
    cart: [
      {
        product: {
          _id: { type: mongoose.Schema.ObjectId, required: true },
          name: { type: String, required: true },
          banner: { type: String, required: true },
          price: { type: String, required: true },
        },
        unit: { type: Number, require: true },
      },
    ],
    wishlist: [
      {
        _id: { type: mongoose.Schema.ObjectId, required: true },
        name: { type: String },
        banner: { type: String },
        description: { type: String },
        available: { type: Boolean },
        price: { type: String },
      },
    ],
    orders: [
      {
        _id: { type: mongoose.Schema.ObjectId, required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now(), required: true },
      },
    ],
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
    timestamps: true,
  }
);

module.exports = mongoose.model("customer", CustomerSchema);
