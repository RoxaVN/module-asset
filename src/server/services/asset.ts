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
} from '@roxavn/core/server';
import { In } from 'typeorm';

import { serverModule } from '../module.js';
import { NotFoundAttributeException, assetApi } from '../../base/index.js';
import { Asset } from '../entities/asset.entity.js';
import { GetAttributesService } from './attribute.js';
import { CloneAssetAttributesService } from './asset.attribute.js';

@serverModule.injectable()
export class CreateAssetService extends InjectDatabaseService {
  async handle(request: {
    storeId: string;
    unitId?: string;
    unitcount?: number;
  }) {
    const asset = new Asset();
    Object.assign(asset, request);

    await this.entityManager.save(asset);
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
  }) {
    await this.entityManager.getRepository(Asset).update(
      { id: request.assetId },
      {
        storeId: request.storeId,
        unitCount: request.unitcount,
        metadata: request.metadata,
      }
    );
    return {};
  }
}

@serverModule.injectable()
export class SplitAssetService extends BaseService {
  constructor(
    @inject(DatabaseService) private databaseService: DatabaseService,
    @inject(CloneAssetAttributesService)
    private cloneAssetAttributesService: CloneAssetAttributesService
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
    await this.databaseService.manager.save(asset);

    const newAsset = new Asset();
    newAsset.storeId = asset.storeId;
    newAsset.unitId = asset.unitId;
    newAsset.unitCount = request.splitAmount;
    await this.databaseService.manager.save(newAsset);

    await this.cloneAssetAttributesService.handle({
      fromAssetId: asset.id,
      toAssetId: newAsset.id,
    });
  }
}

@serverModule.useApi(assetApi.getMany)
export class GetAssetsApiService extends BaseService {
  constructor(
    @inject(DatabaseService) private databaseService: DatabaseService,
    @inject(GetAttributesService)
    private getAttributesService: GetAttributesService
  ) {
    super();
  }

  async handle(request: InferApiRequest<typeof assetApi.getMany>) {
    const page = request.page || 1;
    const pageSize = request.pageSize || 10;

    const attributeNames = request.attributes.map((item) => item.name);
    const attributes = await this.getAttributesService.handle({
      names: attributeNames,
    });

    const [items, totalItems] = await this.databaseService.manager
      .getRepository(Asset)
      .findAndCount({
        relations: ['assetAttributes'],
        where: request.attributes.map((item) => {
          const attribute = attributes.find((attr) => attr.name === item.name);
          if (!attribute) {
            throw new NotFoundAttributeException(item.name);
          }
          return {
            storeId: request.storeIds && In(request.storeIds),
            assetAttributes: {
              attributeId: attribute.id,
              [`value${attribute.type}`]: item.value,
            },
          };
        }),
        take: pageSize,
        skip: (page - 1) * pageSize,
      });

    return {
      items: items.map((item) => ({
        ...item,
        assetAttributes: item.assetAttributes.map((assetAttribute) => {
          const attribute = attributes.find((item) => item.id);
          if (attribute) {
            return {
              id: assetAttribute.id,
              name: attribute.name,
              value: assetAttribute[`value${attribute.type}`],
            };
          }
          throw new NotFoundException();
        }),
      })),
      pagination: { page, pageSize, totalItems },
    };
  }
}
