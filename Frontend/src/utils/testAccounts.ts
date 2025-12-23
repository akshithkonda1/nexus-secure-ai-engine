interface TestAccount {
  email: string;
  password: string;
  name: string;
  createdAt: number;
  expiresAt: number;
}

class TestAccountManager {
  private accounts: Map<string, TestAccount> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private TTL = parseInt(import.meta.env.VITE_TEST_ACCOUNT_TTL || '300000'); // 5min default

  constructor() {
    if (import.meta.env.VITE_ENABLE_TEST_MODE === 'true') {
      this.startCleanup();
      console.log('[TEST] Test account manager initialized (TTL: ' + this.TTL / 1000 + 's)');
    }
  }

  create(): TestAccount {
    const timestamp = Date.now();
    const account: TestAccount = {
      email: `test.${timestamp}@ryuzen.test`,
      password: `Test${timestamp}!`,
      name: `Test User ${timestamp}`,
      createdAt: timestamp,
      expiresAt: timestamp + this.TTL,
    };

    this.accounts.set(account.email, account);
    console.log(`[TEST] Created account: ${account.email} (expires in ${this.TTL / 1000}s)`);

    return account;
  }

  validate(email: string, password: string): boolean {
    const account = this.accounts.get(email);

    if (!account) {
      console.log(`[TEST] Account not found: ${email}`);
      return false;
    }

    if (Date.now() > account.expiresAt) {
      console.log(`[TEST] Account expired: ${email}`);
      this.delete(email);
      return false;
    }

    if (account.password !== password) {
      console.log(`[TEST] Invalid password for: ${email}`);
      return false;
    }

    console.log(`[TEST] Account validated: ${email}`);
    return true;
  }

  get(email: string): TestAccount | undefined {
    const account = this.accounts.get(email);

    if (!account) return undefined;

    if (Date.now() > account.expiresAt) {
      this.delete(email);
      return undefined;
    }

    return account;
  }

  delete(email: string): void {
    if (this.accounts.delete(email)) {
      console.log(`[TEST] Vaporized account: ${email}`);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let vaporized = 0;

      for (const [email, account] of this.accounts.entries()) {
        if (now > account.expiresAt) {
          this.delete(email);
          vaporized++;
        }
      }

      if (vaporized > 0) {
        console.log(`[TEST] Cleanup: vaporized ${vaporized} expired account(s)`);
      }
    }, 60000); // Check every minute
  }

  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      console.log('[TEST] Test account manager stopped');
    }
  }

  // Get all active accounts (for debugging)
  getAll(): TestAccount[] {
    const now = Date.now();
    const active: TestAccount[] = [];

    for (const [email, account] of this.accounts.entries()) {
      if (now <= account.expiresAt) {
        active.push(account);
      } else {
        this.delete(email);
      }
    }

    return active;
  }

  // Get count of active accounts
  count(): number {
    return this.getAll().length;
  }
}

export const testAccountManager = new TestAccountManager();

// Cleanup on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    testAccountManager.stop();
  });
}
