import { Parser } from '../types';
import { Token } from '../token';
import { Context } from '../utilities';
/**
 * Scans regular expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanRegularExpression(parser: Parser, context: Context): Token;
