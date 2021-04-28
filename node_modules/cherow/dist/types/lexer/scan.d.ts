import { Parser } from '../types';
import { Token } from '../token';
import { Context } from '../utilities';
/**
 * Scan
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-punctuatorss)
 * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scan(parser: Parser, context: Context): Token;
