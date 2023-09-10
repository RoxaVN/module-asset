import { InferApiRequest } from '@roxavn/core';
import { InjectDatabaseService } from '@roxavn/core/server';

import { serverModule } from '../module.js';
import { Store } from '../entities/index.js';
import { storeApi } from '../../base/index.js';

@serverModule.injectable()
export class CreateStoreService extends InjectDatabaseService {
  async handle(request: { userId?: string; name: string; type: string }) {
    const store = new Store();
    store.userId = request.userId;
    store.name = request.name;
    store.type = request.type;
    await this.entityManager.save(store);

    return { id: store.id };
  }
}

@serverModule.useApi(storeApi.getMany)
export class GetStoresApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof storeApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const [items, totalItems] = await this.entityManager
      .getRepository(Store)
      .findAndCount({
        where: { userId: request.userId },
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: items,
      pagination: { page, pageSize, totalItems },
    };
  }
}
