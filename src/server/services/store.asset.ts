import { InferApiRequest } from '@roxavn/core/base';
import { BaseService, inject } from '@roxavn/core/server';

import { storeAssetApi } from '../../base/index.js';
import { serverModule } from '../module.js';
import { GetAssetsApiService } from './asset.js';

@serverModule.useApi(storeAssetApi.getMany)
export class GetStoreAssetsApiService extends BaseService {
  constructor(
    @inject(GetAssetsApiService)
    private getAssetsApiService: GetAssetsApiService
  ) {
    super();
  }

  async handle(request: InferApiRequest<typeof storeAssetApi.getMany>) {
    return this.getAssetsApiService.handle({
      page: request.page,
      pageSize: request.pageSize,
      attributes: request.attributes,
      storeIds: [request.storeId],
    });
  }
}
