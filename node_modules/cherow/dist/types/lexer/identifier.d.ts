import { Parser } from '../types';
import { Token } from '../token';
import { Context } from '../utilities';
/**
 * Scan identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
 *
 * @param Parser instance
 * @param Context masks
 */
export declare function scanIdentifier(parser: Parser, context: Context, first?: number): Token;
/**
 * Scanning chars in the range 0...127, and treat them as an possible
 * identifier. This allows subsequent checking to be faster.
 *
 * @param parser Parser instance
 * @param context Context masks
 * @param first Code point
 */
export declare function scanMaybeIdentifier(parser: Parser, context: Context, first: number): Token;
