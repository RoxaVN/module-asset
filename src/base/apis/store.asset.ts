import {
  ApiSource,
  ArrayMaxSize,
  ExactProps,
  IsOptional,
  Max,
  Min,
  MinLength,
  TransformJson,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';
import { AssetResponse } from './asset.js';

const storeAssetSource = new ApiSource<AssetResponse>(
  [scopes.Store, scopes.Asset],
  baseModule
);

class GetStoreAssetsRequest extends ExactProps<GetStoreAssetsRequest> {
  @MinLength(1)
  public readonly storeId!: string;

  @ArrayMaxSize(100)
  @TransformJson()
  public readonly attributes: Array<{ name: string; value?: any }>;

  @Min(1)
  @TransformNumber()
  @IsOptional()
  public readonly page?: number;

  @Min(1)
  @Max(100)
  @TransformNumber()
  @IsOptional()
  public readonly pageSize?: number;
}

export const storeAssetApi = {
  getMany: storeAssetSource.getMany({
    validator: GetStoreAssetsRequest,
    permission: permissions.ReadStoreAssets,
  }),
};
