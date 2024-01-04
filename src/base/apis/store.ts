import {
  ApiSource,
  IsOptional,
  MinLength,
  PaginationRequest,
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

class GetStoresRequest extends PaginationRequest<GetStoresRequest> {
  @MinLength(1)
  @IsOptional()
  public readonly userId?: string;
}

export const storeApi = {
  getMany: storeSource.getMany({
    validator: GetStoresRequest,
    permission: permissions.ReadStores,
  }),
};
