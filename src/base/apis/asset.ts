import {
  ApiSource,
  ArrayMaxSize,
  ExactProps,
  IsOptional,
  Max,
  Min,
  TransformArray,
  TransformJson,
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
  attributes: Record<string, any>;
}

export interface AttributeFilterItem {
  name: string;
  value: any;
  operator?:
    | 'LessThan'
    | 'LessThanOrEqual'
    | 'MoreThan'
    | 'MoreThanOrEqual'
    | 'In';
}

const assetSource = new ApiSource<AssetResponse>([scopes.Asset], baseModule);

class GetAssetsRequest extends ExactProps<GetAssetsRequest> {
  @ArrayMaxSize(10)
  @TransformArray()
  @IsOptional()
  public readonly storeIds?: Array<string>;

  @ArrayMaxSize(10)
  @TransformJson()
  public readonly attributeFilters: Array<AttributeFilterItem>;

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
