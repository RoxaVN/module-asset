import {
  ApiSource,
  ExactProps,
  IsOptional,
  Max,
  Min,
  TransformArray,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

export interface AssetResponse {
  id: string;
  metadata?: any;
  createdDate: Date;
  updatedDate: Date;
  storeId: string;
  assetAttributes: Array<{
    id: string;
    name: string;
    value: any;
  }>;
}

const assetSource = new ApiSource<AssetResponse>([scopes.Asset], baseModule);

class GetAssetsRequest extends ExactProps<GetAssetsRequest> {
  @TransformArray()
  @IsOptional()
  public readonly storeIds?: Array<string>;

  @TransformArray()
  @IsOptional()
  public readonly attributeIds?: string[];

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

export const assetApi = {
  getMany: assetSource.getMany({
    validator: GetAssetsRequest,
    permission: permissions.ReadAssets,
  }),
};
