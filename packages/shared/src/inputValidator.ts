import { TaskConfig } from './task-config';
import { inject, injectable } from 'inversify';
import { iocTypes } from './ioc/ioc-types';

@injectable()
export class InputValidator {
    constructor(@inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig) {}
}
