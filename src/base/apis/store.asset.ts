import {
  ApiSource,
  ArrayMaxSize,
  type AttributeFilters,
  IsOptional,
  MinLength,
  TransformJson,
  PaginationRequest,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';
import { AssetResponse } from './asset.js';

const storeAssetSource = new ApiSource<AssetResponse>(
  [scopes.Store, scopes.Asset],
  baseModule
);

class GetStoreAssetsRequest extends PaginationRequest<GetStoreAssetsRequest> {
  @MinLength(1)
  public readonly storeId!: string;

  @ArrayMaxSize(10)
  @TransformJson()
  @IsOptional()
  public readonly attributeFilters?: AttributeFilters;
}

export const storeAssetApi = {
  getMany: storeAssetSource.getMany({
    validator: GetStoreAssetsRequest,
    permission: permissions.ReadStoreAssets,
  }),
};
