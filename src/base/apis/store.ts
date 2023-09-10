import {
  ApiSource,
  ExactProps,
  IsOptional,
  Max,
  Min,
  MinLength,
  TransformNumber,
} from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { permissions, scopes } from '../access.js';

const storeSource = new ApiSource<{
  id: string;
  userId?: string;
  name: string;
  type: string;
  metadata?: any;
  createdDate: Date;
  updatedDate: Date;
}>([scopes.Store], baseModule);

class GetStoresRequest extends ExactProps<GetStoresRequest> {
  @MinLength(1)
  @IsOptional()
  public readonly userId?: string;

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

export const storeApi = {
  getMany: storeSource.getMany({
    validator: GetStoresRequest,
    permission: permissions.ReadStores,
  }),
};
