import mongoose from "mongoose";
import { User } from "./User.js";
const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            productName: {
                type: String,
                required: true
            }
            , productQuantity: {
                type: String,
                required: true
            }
        }
    ],
    orderStatus: {
        type: String,
        default: "Pending",
        required: true
    }
    , amount: {
        type: Number,
        required: true

    },
    paymentId: {
        type: String,
    },
    paymentStatus: {
        type: String, default: "Pending", required: true

    },
    orderId: {
        type: String,
        required: true
    }

});

export const Order = mongoose.model("Order", OrderSchema)