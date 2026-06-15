import { eventBus } from "./eventBus.js";
import { sendEmail } from "../utils/email.js";

eventBus.on("paymentSuccess", async (data) => {
    try {
        console.log("Email Service started")
        await sendEmail(
            data.email,
            data.paymentId
        );
        console.log("Email Sent")
    } catch (err) {
        console.log(err);
    }
})