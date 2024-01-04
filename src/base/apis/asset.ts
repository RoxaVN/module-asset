import {
  ApiSource,
  ArrayMaxSize,
  type AttributeFilters,
  IsOptional,
  TransformArray,
  TransformJson,
  PaginationRequest,
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

export interface OrderByItem {
  attribute: string;
  direction: 'ASC' | 'DESC';
}

const assetSource = new ApiSource<AssetResponse>([scopes.Asset], baseModule);

class GetAssetsRequest extends PaginationRequest<GetAssetsRequest> {
  @ArrayMaxSize(10)
  @TransformArray()
  @IsOptional()
  public readonly storeIds?: Array<string>;

  @ArrayMaxSize(10)
  @TransformJson()
  @IsOptional()
  public readonly attributeFilters?: AttributeFilters;

  @TransformJson()
  @IsOptional()
  public readonly orderBy?: Array<OrderByItem>;
}

export const assetApi = {
  getMany: assetSource.getMany({
    validator: GetAssetsRequest,
    permission: permissions.ReadAssets,
  }),
};
