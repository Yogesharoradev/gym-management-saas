import "server-only";
import { Types, type FilterQuery, type Model } from "mongoose";

/**
 * Tenant isolation layer. Every data access for gym-owned collections must go
 * through a TenantScope so that gymId is always injected into the query. The
 * gymId originates from the server-side session, never from client input.
 */
export class TenantScope {
  private readonly gymObjectId: Types.ObjectId;

  constructor(gymId: string) {
    this.gymObjectId = new Types.ObjectId(gymId);
  }

  get gymId(): Types.ObjectId {
    return this.gymObjectId;
  }

  /** Merge caller-supplied filter with the mandatory gymId constraint. */
  filter<T>(extra: FilterQuery<T> = {}): FilterQuery<T> {
    return { ...extra, gymId: this.gymObjectId } as FilterQuery<T>;
  }

  count<T>(model: Model<T>, extra: FilterQuery<T> = {}): Promise<number> {
    return model.countDocuments(this.filter(extra)).exec();
  }
}

export function tenant(gymId: string): TenantScope {
  return new TenantScope(gymId);
}
