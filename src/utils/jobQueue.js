class JobQueue {
    constructor() {
        // Stores pending jobs
        this.queue = [];

        // Prevents multiple processors from running simultaneously
        this.isProcessing = false;
    }

    addJob(jobFn) {
        // Add job to queue
        this.queue.push(jobFn);

        // Start processing if not already running
        this.processJobs();
    }

    async processJobs() {
        // Prevent parallel processors
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift();

            let attempts = 0;
            let success = false;

            while (attempts < 3 && !success) {
                try {
                    attempts++;

                    console.log(`Running job (Attempt ${attempts})`);

                    await job();

                    console.log("Job completed successfully");

                    success = true;
                } catch (error) {
                    console.log(
                        `Job failed on attempt ${attempts}: ${error.message}`
                    );

                    // Retry if attempts remain
                    if (attempts < 3) {
                        console.log("Retrying in 2 seconds...");

                        await this.delay(2000);
                    } else {
                        console.error(
                            "Job permanently failed after 3 attempts:",
                            error.message
                        );
                    }
                }
            }
        }

        this.isProcessing = false;
    }

    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}