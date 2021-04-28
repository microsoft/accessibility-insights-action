import * as ESTree from '../estree';
import { Location, Parser } from '../types';
import { Context } from '../utilities';
/**
 * Parses either a binding identifier or binding pattern
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseBindingIdentifierOrPattern(parser: Parser, context: Context, args?: string[]): ESTree.PatternTop;
/**
 * Parse binding identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseBindingIdentifier(parser: Parser, context: Context): ESTree.Identifier;
/**
 * Parse assignment rest element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseAssignmentRestElement(parser: Parser, context: Context, args: string[]): ESTree.RestElement;
/** Parse assignment pattern
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param left LHS of assignment pattern
 * @param pos Location
 */
export declare function parseAssignmentPattern(parser: Parser, context: Context, left: ESTree.PatternTop, pos: Location): ESTree.AssignmentPattern;
/**
 * Parse binding initializer
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseBindingInitializer(parser: Parser, context: Context): ESTree.Identifier | ESTree.ObjectPattern | ESTree.ArrayPattern | ESTree.MemberExpression | ESTree.AssignmentPattern;
