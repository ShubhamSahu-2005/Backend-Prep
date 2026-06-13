import Razorpay from "razorpay";

import crypto from 'crypto'
import { Order } from "../../models/order.js";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
})

export const createOrder = async (req, res) => {
    try {
        const options = ({
            amount: req.body.amount * 100,
            currency: "INR",
            receipt: 'receipt' + Math.random().toString(36).substring(7),


        });
        const order = await razorpay.orders.create(options);
        await Order.create({
            userId: req.userId || req.user?._id,
            products: req.body.products,
            orderStatus: req.body.orderStatus,
            amount: req.body.amount,
            orderId: order.id,
            paymentStatus: "Pending",
            paymentId: ""
        })
        res.status(200).json({
            ...order,
            key_id: process.env.RAZORPAY_KEY
        });


    } catch (error) {
        res.status(500).json(
            {
                error: error.message,
            }
        )

    }
}

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const generatedSignature = crypto.createHmac("sha256",
            process.env.RAZORPAY_SECRET
        ).update(
            razorpay_order_id + "|" + razorpay_payment_id
        ).digest("hex");
        const isValid = generatedSignature === razorpay_signature;
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Payment Verification failed"
            })
        };
        await Order.findOneAndUpdate({ orderId: razorpay_order_id }, {
            paymentStatus: "Done",
            orderStatus: "confirmed",
            paymentId: razorpay_payment_id,
        })
        res.status(200).json({
            success: true,
            message: "Payment Verified SuccessFully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}
export const razorpayWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const generatedSignature = crypto.createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
    ).update(JSON.stringify(req.body)).digest("hex");
    if (generatedSignature !== signature) {
        return res.status(400).json(
            {
                success: false,
                message: "Invalid webhook"
            }
        )
    }
    const event = req.body.event;
    if (event == "payment.captured") {
        const payment = req.body.payload.entity;
        await Order.findOneAndUpdate({ orderId: payment.order_id }, {
            paymentStatus: "Done",
            orderStatus: "confirmed",
            paymentId: payment.id,
        })
    }
    res.status(200).json({
        success: true,
        message: "Success"
    })
}