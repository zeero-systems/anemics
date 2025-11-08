import type { NewableType } from '@zeero/commons';
import type { CursorInterface, CursorOptionsType, RepositoryInterface } from '~/persister/interfaces.ts';
import type { FilterType } from '~/persister/types.ts';

export class Cursor<T extends NewableType<T>> implements CursorInterface<T> {
  batchSize: number;
  hasMore: boolean = true;
  
  private currentBatch: Array<InstanceType<T>> = [];
  private currentIndex: number = 0;
  private fetchedCount: number = 0;
  private readonly baseOffset: number;
  private readonly maxLimit: number | undefined;

  constructor(
    private repository: RepositoryInterface<T>,
    private baseSearch: FilterType,
    private options: CursorOptionsType = {},
  ) {
    this.batchSize = options.batchSize || 100;
    
    this.baseOffset = baseSearch.offset || 0;
    this.maxLimit = baseSearch.limit;
  }

  async next(): Promise<InstanceType<T> | null> {
    if (this.currentIndex >= this.currentBatch.length) {
      await this.fetchNextBatch();
      
      if (this.currentBatch.length === 0) {
        this.hasMore = false;
        return null;
      }
    }

    const item = this.currentBatch[this.currentIndex];
    this.currentIndex++;
    
    return item;
  }

  async nextBatch(): Promise<Array<InstanceType<T>>> {
    await this.fetchNextBatch();
    return [...this.currentBatch];
  }

  private async fetchNextBatch(): Promise<void> {
    let currentBatchSize = this.batchSize;
    
    if (this.maxLimit !== undefined) {
      const remainingLimit = this.maxLimit - this.fetchedCount;
      
      if (remainingLimit <= 0) {
        this.currentBatch = [];
        this.hasMore = false;
        return;
      }
      
      currentBatchSize = Math.min(this.batchSize, remainingLimit);
    }
    
    const search: FilterType = {
      ...this.baseSearch,
      limit: currentBatchSize,
      offset: this.baseOffset + this.fetchedCount,
    };
    
    if (this.options.orderBy) {
      const orderColumns = Array.isArray(this.options.orderBy) 
        ? this.options.orderBy 
        : [this.options.orderBy];
      
      search.order = {};
      for (const column of orderColumns) {
        search.order[column] = this.options.direction || 'asc';
      }
    }
    
    const results = await this.repository.query.search(search);
    
    this.currentBatch = results;
    this.currentIndex = 0;
    this.fetchedCount += this.currentBatch.length;
    
    if (this.currentBatch.length < currentBatchSize) {
      this.hasMore = false;
    } else if (this.maxLimit !== undefined && this.fetchedCount >= this.maxLimit) {
      this.hasMore = false;
    }
  }

  close(): void {
    this.currentBatch = [];
    this.currentIndex = 0;
    this.fetchedCount = 0;
    this.hasMore = false;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<InstanceType<T>> {
    while (this.hasMore) {
      const item = await this.next();
      if (item === null) break;
      yield item;
    }
  }
}

export default Cursor;
