// ============================================================
// SCoT ERP — Base Mock Repository
// ============================================================
import { v4 as uuidv4 } from 'uuid';
import { getStore, persistStore, type DataStore } from './dataStore.js';

export interface IBaseRepository<T> {
  findAll(filters?: Record<string, any>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filters?: Record<string, any>): Promise<number>;
}

export class MockBaseRepository<T extends { id: string; createdAt: string; updatedAt: string }>
  implements IBaseRepository<T>
{
  protected collectionName: keyof DataStore;

  constructor(collectionName: keyof DataStore) {
    this.collectionName = collectionName;
  }

  protected getCollection(): Record<string, T> {
    return getStore()[this.collectionName] as Record<string, T>;
  }

  async findAll(filters?: Record<string, any>): Promise<T[]> {
    const collection = this.getCollection();
    let items = Object.values(collection);

    if (filters) {
      items = items.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null) return true;
          const itemValue = (item as any)[key];
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          if (typeof value === 'string' && typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          return itemValue === value;
        });
      });
    }

    return items;
  }

  async findById(id: string): Promise<T | null> {
    return this.getCollection()[id] || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const id = (data as any).id || uuidv4();
    const entity = {
      ...data,
      id,
      createdAt: (data as any).createdAt || now,
      updatedAt: now,
    } as T;

    this.getCollection()[id] = entity;
    persistStore();
    return entity;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const existing = this.getCollection()[id];
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      id, // Prevent id change
      updatedAt: new Date().toISOString(),
    };

    this.getCollection()[id] = updated;
    persistStore();
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const collection = this.getCollection();
    if (!collection[id]) return false;
    delete collection[id];
    persistStore();
    return true;
  }

  async count(filters?: Record<string, any>): Promise<number> {
    const items = await this.findAll(filters);
    return items.length;
  }

  async findByField(field: string, value: any): Promise<T[]> {
    const collection = this.getCollection();
    return Object.values(collection).filter((item) => (item as any)[field] === value);
  }

  async findOneByField(field: string, value: any): Promise<T | null> {
    const items = await this.findByField(field, value);
    return items[0] || null;
  }

  async paginate(
    filters?: Record<string, any>,
    page: number = 1,
    pageSize: number = 20,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
    search?: string,
    searchFields?: string[]
  ) {
    let items = await this.findAll(filters);

    // Search
    if (search && searchFields?.length) {
      const lower = search.toLowerCase();
      items = items.filter((item) =>
        searchFields.some((field) => {
          const val = (item as any)[field];
          return val && String(val).toLowerCase().includes(lower);
        })
      );
    }

    // Sort
    if (sortBy) {
      items.sort((a, b) => {
        const aVal = (a as any)[sortBy];
        const bVal = (b as any)[sortBy];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal));
        return sortOrder === 'desc' ? -cmp : cmp;
      });
    }

    const total = items.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = items.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages };
  }
}
