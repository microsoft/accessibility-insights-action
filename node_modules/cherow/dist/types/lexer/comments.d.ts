import * as ESTree from '../estree';
import { Parser, CommentType } from '../types';
import { Context, ScannerState } from '../utilities';
/**
 * Skips single HTML comments. Same behavior as in V8.
 *
 * @param parser Parser Object
 * @param context Context masks.
 * @param state  Scanner state
 * @param type   Comment type
 */
export declare function skipSingleHTMLComment(parser: Parser, context: Context, state: ScannerState, type: CommentType): ScannerState;
/**
 * Skips SingleLineComment, SingleLineHTMLCloseComment and SingleLineHTMLOpenComment
 *
 *  @see [Link](https://tc39.github.io/ecma262/#prod-SingleLineComment)
 *  @see [Link](https://tc39.github.io/ecma262/#prod-annexB-SingleLineHTMLOpenComment)
 *  @see [Link](https://tc39.github.io/ecma262/#prod-annexB-SingleLineHTMLCloseComment)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param state  Scanner state
 * @param type  Comment type
 */
export declare function skipSingleLineComment(parser: Parser, context: Context, state: ScannerState, type: CommentType): ScannerState;
/**
 * Skips multiline comment
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-annexB-MultiLineComment)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param state Scanner state
 */
export declare function skipMultiLineComment(parser: Parser, context: Context, state: ScannerState): any;
/**
 * Add comments
 *
 * @param parser Parser object
 * @param context Context masks
 * @param type  Comment type
 * @param commentStart Start position of comment
 */
export declare function addComment(parser: Parser, context: Context, type: ESTree.CommentType, commentStart: number): void;
