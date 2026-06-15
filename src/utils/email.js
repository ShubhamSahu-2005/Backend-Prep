import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_pass,
    }
})

export const sendEmail = async ({ email, paymentId }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Prep->"<${process.env.EMAIL_USER}`,
            to: email,
            subject: "Payment Successfull",
            html: `<h2>Payment Successfull</h2>
            <p> Payment id:${paymentId}</p>`

        })
        console.log(`EMAIL sent to ${to}--${info.messageId}`);
        return info;

    } catch (error) {
        console.error(`EMAIL sending failed for ${to}::Error::${error.message}`);
        throw error;

    }
}