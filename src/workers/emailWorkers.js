const { emailQueue } = require('../config/queue');
const nodemailer = require('nodemailer');

// Configure email transport (example using Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Email templates
const templates = {
    welcome: (data) => ({
        subject: 'Welcome to Our Platform!',
        html: `Welcome!Thanks for joining us.`
    }),
    newsletter: (data) => ({
        subject: 'Monthly Newsletter',
        html: `Hi ${data.firstName}!Here's what's new this month...`
    }),
    reminder: (data) => ({
        subject: 'Don\'t Forget!',
        html: `This is your friendly reminder...`
    })
};

// Process function with error handling
emailQueue.process('*', 5, async (job) => {
    const { email, template, ...data } = job.data;

    console.log(`Processing ${job.name} job ${job.id} for ${email}`);

    try {
        // Update job progress
        await job.progress(20);

        // Get template content
        const emailContent = templates[template](data);

        await job.progress(50);

        // Send email
        const result = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: emailContent.subject,
            html: emailContent.html
        });

        await job.progress(100);

        console.log(`Email sent successfully: ${result.messageId}`);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error.message);

        // Throw error to trigger retry mechanism
        throw new Error(`Email delivery failed: ${error.message}`);
    }
});

// Event listeners for monitoring
emailQueue.on('completed', (job, result) => {
    console.log(`Job ${job.id} completed with result:`, result);
});

emailQueue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed:`, error.message);
    // Here you could log to an error tracking service
});

emailQueue.on('stalled', (job) => {
    console.warn(`Job ${job.id} has stalled`);
});

console.log('Email worker started, waiting for jobs...');