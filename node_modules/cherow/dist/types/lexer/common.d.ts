import { Chars } from '../chars';
import { Parser } from '../types';
import { Token } from '../token';
import { Context, ScannerState } from '../utilities';
/**
 * Return the next unicodechar in the stream
 *
 * @param parser Parser object
 */
export declare function nextUnicodeChar(parser: Parser): number;
/**
 * Returns true if this is a valid identifier part
 *
 * @param code Codepoint
 */
export declare const isIdentifierPart: (code: number) => boolean;
export declare function escapeInvalidCharacters(code: number): string;
/**
 * Consume an token in the scanner on match. This is an equalent to
 * 'consume' used in the parser code itself.
 *
 * @param parser Parser object
 * @param context  Context masks
 */
export declare function consumeOpt(parser: Parser, code: number): boolean;
/**
 * Consumes line feed
 *
 * @param parser Parser object
 * @param state  Scanner state
 */
export declare function consumeLineFeed(parser: Parser, state: ScannerState): void;
/**
 * Scans private name. Stage 3 proposal related
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanPrivateName(parser: Parser, context: Context): Token;
/**
 * Advance to new line
 *
 * @param parser Parser object
 */
export declare function advanceNewline(parser: Parser): void;
export declare const fromCodePoint: (code: Chars) => string;
export declare function readNext(parser: Parser): number;
export declare function toHex(code: number): number;
export declare function advanceOnMaybeAstral(parser: Parser, ch: number): void;
