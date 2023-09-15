import { I18nErrorField, NotFoundException } from '@roxavn/core';
import { baseModule } from './module.js';

export class NotFoundAttributeException extends NotFoundException {
  i18n = {
    default: {
      key: 'Error.NotFoundAttributeException',
      ns: baseModule.escapedName,
    } as I18nErrorField,
  };

  constructor(name: string) {
    super();
    this.i18n.default.params = { name };
  }
}
