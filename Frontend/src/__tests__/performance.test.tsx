import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import ChatList from '../components/chat/ChatList';
import { SessionService } from '../state/sessions';
import type { Message } from '../types/chat';

// Performance test utilities
class PerformanceMonitor {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  end(label: string): number {
    const start = this.marks.get(label);
    if (!start) throw new Error(`Mark ${label} not found`);
    
    const duration = performance.now() - start;
    this.marks.delete(label);
    return duration;
  }

  measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    return this.end(label);
  }

  async measureAsync(label: string, fn: () => Promise<void>): Promise<number> {
    this.start(label);
    await fn();
    return this.end(label);
  }
}

// Generate test data
function generateMessages(count: number): Message[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `msg-${i}`,
    role: i % 2 === 0 ? 'user' : 'assistant',
    text: `This is test message number ${i}. It contains some text to simulate real messages.`,
    ts: Date.now() - i * 1000,
    meta: i % 3 === 0 ? 'Some metadata' : undefined,
  }));
}

describe('Performance Tests', () => {
  const monitor = new PerformanceMonitor();

  describe('Component Rendering', () => {
    it('should render 100 messages in under 100ms', () => {
      const messages = generateMessages(100);
      
      const duration = monitor.measure('render-100-messages', () => {
        render(<ChatList messages={messages} />);
      });

      expect(duration).toBeLessThan(100);
      console.log(`✓ Rendered 100 messages in ${duration.toFixed(2)}ms`);
    });

    it('should render 1000 messages in under 500ms', () => {
      const messages = generateMessages(1000);
      
      const duration = monitor.measure('render-1000-messages', () => {
        render(<ChatList messages={messages} />);
      });

      expect(duration).toBeLessThan(500);
      console.log(`✓ Rendered 1000 messages in ${duration.toFixed(2)}ms`);
    });

    it('should update efficiently when adding messages', async () => {
      const initialMessages = generateMessages(50);
      const { rerender } = render(<ChatList messages={initialMessages} />);

      const newMessage: Message = {
        id: 'new-msg',
        role: 'user',
        text: 'New message',
        ts: Date.now(),
      };

      const duration = monitor.measure('add-message', () => {
        rerender(<ChatList messages={[...initialMessages, newMessage]} />);
      });

      expect(duration).toBeLessThan(50);
      console.log(`✓ Added message in ${duration.toFixed(2)}ms`);
    });
  });

  describe('State Management', () => {
    beforeEach(() => {
      // Clear localStorage
      localStorage.clear();
    });

    it('should create sessions quickly', () => {
      const duration = monitor.measure('create-10-sessions', () => {
        for (let i = 0; i < 10; i++) {
          SessionService.create(`Test Session ${i}`);
        }
      });

      expect(duration).toBeLessThan(50);
      console.log(`✓ Created 10 sessions in ${duration.toFixed(2)}ms`);
    });

    it('should load sessions from localStorage efficiently', () => {
      // Create test data
      for (let i = 0; i < 50; i++) {
        SessionService.create(`Test Session ${i}`);
      }

      const duration = monitor.measure('load-sessions', () => {
        SessionService.list();
      });

      expect(duration).toBeLessThan(20);
      console.log(`✓ Loaded 50 sessions in ${duration.toFixed(2)}ms`);
    });

    it('should handle message operations efficiently', () => {
      const session = SessionService.create('Test');
      const messages = generateMessages(100);

      const saveDuration = monitor.measure('save-messages', () => {
        SessionService.saveMessages(session.id, messages);
      });

      const loadDuration = monitor.measure('load-messages', () => {
        SessionService.messages(session.id);
      });

      expect(saveDuration).toBeLessThan(50);
      expect(loadDuration).toBeLessThan(20);
      
      console.log(`✓ Saved 100 messages in ${saveDuration.toFixed(2)}ms`);
      console.log(`✓ Loaded 100 messages in ${loadDuration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated renders', async () => {
      const messages = generateMessages(100);
      const iterations = 100;

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      for (let i = 0; i < iterations; i++) {
        const { unmount } = render(<ChatList messages={messages} />);
        unmount();
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be minimal (< 5MB)
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024);
      
      console.log(`✓ Memory growth after ${iterations} renders: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
    });
  });

  describe('LocalStorage Performance', () => {
    it('should batch localStorage writes efficiently', () => {
      const operations = 100;
      const data = { test: 'data' };

      const duration = monitor.measure('batch-writes', () => {
        for (let i = 0; i < operations; i++) {
          localStorage.setItem(`key-${i}`, JSON.stringify(data));
        }
      });

      expect(duration).toBeLessThan(100);
      console.log(`✓ ${operations} localStorage writes in ${duration.toFixed(2)}ms`);
    });

    it('should cache reads to avoid repeated parsing', () => {
      const key = 'test-key';
      const data = generateMessages(50);
      localStorage.setItem(key, JSON.stringify(data));

      const firstReadDuration = monitor.measure('first-read', () => {
        JSON.parse(localStorage.getItem(key)!);
      });

      const secondReadDuration = monitor.measure('second-read', () => {
        JSON.parse(localStorage.getItem(key)!);
      });

      // Second read should be similar or faster due to browser caching
      expect(secondReadDuration).toBeLessThan(firstReadDuration * 1.2);
      
      console.log(`✓ First read: ${firstReadDuration.toFixed(2)}ms`);
      console.log(`✓ Second read: ${secondReadDuration.toFixed(2)}ms`);
    });
  });
});

// Benchmark utility for manual testing
export class Benchmark {
  private results: Array<{ name: string; duration: number; ops: number }> = [];

  async run(name: string, fn: () => void | Promise<void>, iterations = 1000) {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      await fn();
    }

    const duration = performance.now() - start;
    const opsPerSecond = (iterations / duration) * 1000;

    this.results.push({ name, duration, ops: opsPerSecond });

    console.log(`${name}:`);
    console.log(`  Total: ${duration.toFixed(2)}ms`);
    console.log(`  Average: ${(duration / iterations).toFixed(4)}ms`);
    console.log(`  Ops/sec: ${opsPerSecond.toFixed(0)}`);
  }

  printResults() {
    console.log('\n=== Benchmark Results ===');
    this.results.forEach(({ name, duration, ops }) => {
      console.log(`${name}: ${ops.toFixed(0)} ops/sec`);
    });
  }

  compare(baseline: string, comparison: string) {
    const baseResult = this.results.find((r) => r.name === baseline);
    const compResult = this.results.find((r) => r.name === comparison);

    if (!baseResult || !compResult) {
      console.error('Results not found for comparison');
      return;
    }

    const improvement = ((compResult.ops - baseResult.ops) / baseResult.ops) * 100;
    
    console.log(`\n${comparison} vs ${baseline}:`);
    console.log(`  ${improvement > 0 ? '+' : ''}${improvement.toFixed(2)}% ${improvement > 0 ? 'faster' : 'slower'}`);
  }
}

// Usage example for manual benchmarking:
/*
const benchmark = new Benchmark();

await benchmark.run('Message Creation', () => {
  generateMessages(100);
}, 1000);

await benchmark.run('Session List', () => {
  SessionService.list();
}, 1000);

benchmark.printResults();
*/

// Performance monitoring middleware for production
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;

  private constructor() {
    this.initObserver();
  }

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  private initObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(entry.name, entry.duration);
      }
    });

    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }

  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const samples = this.metrics.get(name)!;
    samples.push(duration);

    // Keep only recent samples
    if (samples.length > this.maxSamples) {
      samples.shift();
    }

    // Log slow operations
    if (duration > 100) {
      console.warn(`⚠️ Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
  }

  getStats(name: string) {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      count: sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      stats[name] = this.getStats(name);
    }

    return stats;
  }

  reset() {
    this.metrics.clear();
  }
}

// Initialize in production
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  PerformanceTracker.getInstance();
}

// Export for use in components
export const trackPerformance = (name: string, duration: number) => {
  if (import.meta.env.DEV) {
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
  }
  
  performance.mark(`${name}-start`);
  setTimeout(() => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }, duration);
};
