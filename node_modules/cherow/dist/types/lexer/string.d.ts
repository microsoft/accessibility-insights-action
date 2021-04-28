import { Parser } from '../types';
import { Token } from '../token';
import { Context, Escape } from '../utilities';
/**
 * Scan escape sequence
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanEscapeSequence(parser: Parser, context: Context, first: number): number;
/**
 * Throws a string error for either string or template literal
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function throwStringError(parser: Parser, context: Context, code: Escape): void;
/**
 * Scan a string literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param quote codepoint
 */
export declare function scanString(parser: Parser, context: Context, quote: number): Token;
