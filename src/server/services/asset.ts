import {
  BadRequestException,
  InferApiRequest,
  NotFoundException,
} from '@roxavn/core';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  inject,
  databaseUtils,
} from '@roxavn/core/server';

import { serverModule } from '../module.js';
import { assetApi } from '../../base/index.js';
import { Asset } from '../entities/asset.entity.js';

@serverModule.injectable()
export class CreateAssetService extends InjectDatabaseService {
  async handle(request: {
    storeId: string;
    attributes: Record<string, any>;
    unitId?: string;
    unitcount?: number;
  }) {
    const asset = new Asset();
    Object.assign(asset, request);

    await this.entityManager.getRepository(Asset).insert(asset);
    return { id: asset.id };
  }
}

@serverModule.injectable()
export class UpdateAssetService extends InjectDatabaseService {
  async handle(request: {
    assetId: string;
    storeId?: string;
    unitcount?: number;
    metadata?: Record<string, any>;
    attributes?: Record<string, any>;
  }) {
    await this.entityManager.getRepository(Asset).update(
      { id: request.assetId },
      {
        storeId: request.storeId,
        unitCount: request.unitcount,
        metadata: request.metadata,
        attributes: request.attributes,
      }
    );
    return {};
  }
}

@serverModule.injectable()
export class SplitAssetService extends BaseService {
  constructor(
    @inject(DatabaseService) private databaseService: DatabaseService
  ) {
    super();
  }

  async handle(request: { assetId: string; splitAmount: number }) {
    const asset = await this.databaseService.manager
      .getRepository(Asset)
      .findOne({
        lock: { mode: 'pessimistic_write' },
        where: { id: request.assetId },
      });
    if (!asset) {
      throw new NotFoundException();
    }
    if (asset.unitCount <= request.splitAmount) {
      throw new BadRequestException();
    }
    asset.unitCount -= request.splitAmount;
    await this.databaseService.manager.getRepository(Asset).save(asset);

    const newAsset = new Asset();
    newAsset.storeId = asset.storeId;
    newAsset.attributes = asset.attributes;
    newAsset.unitId = asset.unitId;
    newAsset.unitCount = request.splitAmount;
    await this.databaseService.manager.getRepository(Asset).insert(newAsset);

    return { id: newAsset.id };
  }
}

@serverModule.useApi(assetApi.getMany)
export class GetAssetsApiService extends InjectDatabaseService {
  async handle(request: InferApiRequest<typeof assetApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    let query = this.databaseService.manager.createQueryBuilder(Asset, 'asset');
    if (request.storeIds) {
      query = query.where('asset.storeId IN (:...storeIds)', {
        storeIds: request.storeIds,
      });
    }
    if (request.attributeFilters) {
      query = query.andWhere(
        databaseUtils.makeWhere(
          request.attributeFilters,
          (field) => `asset.attributes->>'${field}'`
        )
      );
    }

    const totalItems = await query.getCount();

    if (request.orderBy) {
      query = query.orderBy(
        Object.fromEntries(
          request.orderBy.map((item) => [
            `asset.attributes->>'${item.attribute}'`,
            item.direction,
          ])
        )
      );
    }
    const items = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return {
      items: items,
      pagination: { page, pageSize, totalItems },
    };
  }
}
