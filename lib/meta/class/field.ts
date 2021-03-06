import {setFieldMeta} from './field-meta';
import {getClassTransformer} from './utils';

export function Field(typeFn): PropertyDecorator;
export function Field(target, key): void;
export function Field(...args: any[]) {
    const decorate = (targetOrTypeFunction) => (target, field) => {
        const designType = Reflect.getMetadata('design:type', target, field);
        const typeFn = targetOrTypeFunction || (() => designType);
        getClassTransformer().Type(typeFn)(target, field);
        const isArrayMeta = Array === designType ? {isArray: true} : {};
        setFieldMeta(target, field, {field, typeFn, ...isArrayMeta});
    };
    if (args.length === 1) {
        const [typeFn] = args;
        return decorate(typeFn);
    }
    const [target, key] = args;
    decorate(undefined)(target, key);
}