import {createChain} from '../meta/functional/chain-factory';
import {extractMeta, getMeta} from '../meta/meta-utils';
import {validate} from '../validation/validate';
import {transform} from '../transformation/transform';
import {ChainBundler} from '../meta/functional/chain';
import {resolveClassFieldMeta} from '../meta/class/field-meta';
import {resolveFunctionalFieldMeta} from '../meta/functional/field-meta';
import {FieldType} from '../meta/field-type';

const defaultOptions = {
    chain: createChain(),
    createHandler: target => function handler(req, res, next) {
        const meta = extractMeta(handler as any);
        const wrapped = {[target]: req[target]};

        // todo optimize/make async
        req.validationErrors = (req.validationErrors || []).concat(validate([meta], wrapped));

        // todo optimize/make async
        Object.assign(req, transform([meta], wrapped));

        next();
    }
};

type MiddlewareFactory = <T extends string>(target: T, options?: Partial<typeof defaultOptions>) => ChainBundler<{ [X in T]: any }>;

export const createMiddleware: MiddlewareFactory = (target, options = {}) => (...args: any[]) => {
    const {chain, createHandler} = {...defaultOptions, ...options};
    return Object.assign(
        createHandler(target),
        chain,
        {meta: {field: target, ...getMeta(args), type: FieldType.object}},
    ) as any
};
