import { Parser } from '../types';
import { Token } from '../token';
import { Context, NumericState } from '../utilities';
/**
 * Scans hex integer literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-HexIntegerLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanHexIntegerLiteral(parser: Parser, context: Context): Token;
/**
 * Scans binary and octal integer literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-OctalIntegerLiteral)
 * @see [Link](https://tc39.github.io/ecma262/#prod-BinaryIntegerLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanOctalOrBinary(parser: Parser, context: Context, base: number): Token;
/**
 * Scans implicit octal digits
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-OctalDigits)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanImplicitOctalDigits(parser: Parser, context: Context): Token;
/**
 * Scans signed integer
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-SignedInteger)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanSignedInteger(parser: Parser, end: number): string;
/**
 * Scans numeric literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanNumericLiteral(parser: Parser, context: Context, state?: NumericState): Token;
/**
 * Internal helper function for scanning numeric separators.
 *
 * @param parser Parser object
 * @param context Context masks
 * @param state NumericState state
 */
export declare function scanNumericSeparator(parser: Parser, state: NumericState): NumericState;
/**
 * Internal helper function that scans numeric values
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanDecimalDigitsOrSeparator(parser: Parser): string;
/**
 * Internal helper function that scans numeric values
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanDecimalAsSmi(parser: Parser, context: Context): number;
