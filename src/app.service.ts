import { Injectable } from '@nestjs/common';
import { Account } from './entities/account.dto';
import { AccountEvent } from './entities/event.dto';

@Injectable()
export class AppService {
  private accounts: Account[] = [];

  async reset() {
    this.accounts = [];
  }

  async findAccountById(id: string) {
    const account = this.accounts.find((account) => account.id === id);
    if (!account) {
      return false;
    }
    return account;
  }

  private async createOrUpdateAccount(id: string, amount: number) {
    let account = await this.findAccountById(id);
    if (!account) {
      account = { id, balance: amount };
      this.accounts.push(account);
    } else {
      account.balance += amount;
    }
    return account;
  }

  private async withdrawFromAccount(id: string, amount: number) {
    let account = await this.findAccountById(id);
    if (!account || account.balance < amount) {
      return false;
    }
    account.balance -= amount;
    return account;
  }

  async sendEvent(body: AccountEvent) {
    const { type, amount, destination, origin } = body;
    if (amount <= 0) {
      return false;
    }

    switch (type) {
      case 'deposit':
        return {
          destination: await this.createOrUpdateAccount(destination, amount),
        };
      case 'withdraw':
        const withdrawResult = await this.withdrawFromAccount(origin, amount);
        return withdrawResult ? { origin: withdrawResult } : false;
      case 'transfer':
        const withdrawTransfer = await this.withdrawFromAccount(origin, amount);
        if (!withdrawTransfer) {
          return false;
        }
        return {
          origin: withdrawTransfer,
          destination: await this.createOrUpdateAccount(destination, amount),
        };
      default:
        return false;
    }
  }
}
