// utils/performanceCount.ts

interface QueryPerformance {
  operation: string;
  duration: number;
  query: unknown;
  resultCount?: number;
}

export class PerformanceCount {
  private static logs: QueryPerformance[] = [];
  private static warningThreshold = 100; // ms

  static async measure<T>(
    operation: string,
    query: unknown,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - start;

      const perfLog: QueryPerformance = {
        operation,
        duration,
        query,
        resultCount: Array.isArray(result) ? result.length : undefined,
      };

      this.logs.push(perfLog);

      if (duration > this.warningThreshold) {
        console.warn(
          `⚠️  SLOW QUERY [${duration}ms]: ${operation}`,
          JSON.stringify(query, null, 2)
        );
      } else {
        console.log(`✅ [${duration}ms]: ${operation}`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`❌ ERROR [${duration}ms]: ${operation}`, error);
      throw error;
    }
  }

  static getStats() {
    if (this.logs.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        slowQueries: 0,
      };
    }

    const durations = this.logs.map(log => log.duration);
    const slowQueries = this.logs.filter(log => log.duration > this.warningThreshold);

    return {
      count: this.logs.length,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      slowQueries: slowQueries.length,
      slowQueriesDetails: slowQueries,
    };
  }

  static clearLogs() {
    this.logs = [];
  }

  static setWarningThreshold(ms: number) {
    this.warningThreshold = ms;
  }
}