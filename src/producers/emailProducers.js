const { emailQueue } = require('../config/queue');

class EmailProducer {
    async sendWelcomeEmail(userId, email) {
        const job = await emailQueue.add('welcome-email', {
            userId,
            email,
            template: 'welcome',
            timestamp: new Date().toISOString()
        }, {
            priority: 1, // Higher priority for welcome emails
            delay: 0
        });

        console.log(`Welcome email job ${job.id} queued for ${email}`);
        return job.id;
    }

    async sendBulkNewsletter(recipients) {
        const jobs = recipients.map(recipient => ({
            name: 'newsletter',
            data: {
                email: recipient.email,
                firstName: recipient.firstName,
                template: 'monthly-newsletter'
            },
            opts: {
                priority: 5 // Lower priority for bulk operations
            }
        }));

        const addedJobs = await emailQueue.addBulk(jobs);
        console.log(`${addedJobs.length} newsletter jobs queued`);
        return addedJobs.map(job => job.id);
    }

    async sendDelayedReminder(userId, email, delayMinutes) {
        const job = await emailQueue.add('reminder', {
            userId,
            email,
            template: 'reminder'
        }, {
            delay: delayMinutes * 60 * 1000 // Convert minutes to milliseconds
        });

        console.log(`Reminder email scheduled for ${email} in ${delayMinutes} minutes`);
        return job.id;
    }
}

module.exports = new EmailProducer();