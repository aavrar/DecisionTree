import { Decision } from '../models/Decision';

export class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;

  start() {
    console.log('Starting cleanup service...');

    // Run cleanup immediately on start
    this.cleanupArchivedDecisions();

    // Run cleanup every hour
    this.intervalId = setInterval(() => {
      this.cleanupArchivedDecisions();
    }, 60 * 60 * 1000); // 1 hour
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Cleanup service stopped');
    }
  }

  async cleanupArchivedDecisions() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await Decision.deleteMany({
        status: 'archived',
        archivedAt: { $lte: sevenDaysAgo }
      });

      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} archived decision(s) older than 7 days`);
      }
    } catch (error) {
      console.error('Error in cleanup service:', error);
    }
  }
}

export const cleanupService = new CleanupService();
