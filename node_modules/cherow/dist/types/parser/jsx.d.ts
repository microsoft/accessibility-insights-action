import * as ESTree from '../estree';
import { Parser, Location } from '../types';
import { Token } from '../token';
import { Context } from '../utilities';
/**
 * Parses JSX element or JSX fragment
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXRootElement(parser: Parser, context: Context): ESTree.JSXElement | ESTree.JSXFragment;
/**
 * Parses JSX opening element
 *
 * @param parser Parser object
 * @param context Context masks
 * @param name Element name
 * @param attributes Element attributes
 * @param selfClosing True if this is a selfclosing JSX Element
 * @param pos Line / Column tracking
 */
export declare function parseJSXOpeningElement(parser: Parser, context: Context, name: ESTree.JSXIdentifier | ESTree.JSXMemberExpression | ESTree.JSXNamespacedName, attributes: (ESTree.JSXAttribute | ESTree.JSXSpreadAttribute)[], selfClosing: boolean, pos: Location): ESTree.JSXOpeningElement;
/**
 * Prime the scanner and advance to the next JSX token in the stream
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function nextJSXToken(parser: Parser): Token;
/**
 * Mini scanner
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanJSXToken(parser: Parser): Token;
/**
 * Parses JSX Text
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXText(parser: Parser, context: Context): ESTree.JSXText;
/**
 * Parses JSX attributes
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXAttributes(parser: Parser, context: Context): ReturnType<typeof parseJSXAttribute>[];
/**
 * Parses JSX spread attribute
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXSpreadAttribute(parser: Parser, context: Context): ESTree.JSXSpreadAttribute;
/**
 * Parses JSX namespace name
 *
 * @param parser Parser object
 * @param context Context masks
 * @param namespace Identifier
 * @param pos Line / Column location
 */
export declare function parseJSXNamespacedName(parser: Parser, context: Context, namespace: ESTree.JSXIdentifier, pos: Location): ESTree.JSXNamespacedName;
/**
 * Parses JSX attribute name
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXAttributeName(parser: Parser, context: Context): ESTree.JSXIdentifier | ESTree.JSXNamespacedName;
/**
 * Parses JSX Attribute
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXAttribute(parser: Parser, context: Context): ESTree.JSXAttribute | ESTree.JSXSpreadAttribute;
/**
 * Parses JJSX Empty Expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXEmptyExpression(parser: Parser, context: Context): ESTree.JSXEmptyExpression;
/**
 * Parses JSX Spread child
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXSpreadChild(parser: Parser, context: Context): ESTree.JSXSpreadChild;
/**
 * Parses JSX Expression container
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXExpressionContainer(parser: Parser, context: Context): ESTree.JSXExpressionContainer;
/**
 * Parses JSX Expression
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
export declare function parseJSXExpression(parser: Parser, context: Context): ESTree.JSXExpressionContainer | ESTree.JSXSpreadChild;
/**
 * Parses JSX Closing fragment
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXClosingFragment(parser: Parser, context: Context): ESTree.JSXClosingFragment;
/**
 * Parses JSX Closing Element
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
export declare function parseJSXClosingElement(parser: Parser, context: Context): ESTree.JSXClosingElement;
/**
 * Parses JSX Identifier
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXIdentifier(parser: Parser, context: Context): ESTree.JSXIdentifier;
/**
 * Parses JSX Member expression
 *
 * @param parser Parser object
 * @param context Context masks
 * @param pos Line / Column location
 */
export declare function parseJSXMemberExpression(parser: Parser, context: Context, expr: ESTree.JSXIdentifier | ESTree.JSXMemberExpression, pos: Location): ESTree.JSXMemberExpression;
/**
 * Parses JSX Element name
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseJSXElementName(parser: Parser, context: Context): any;
/**
 * Scans JSX Identifier
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function scanJSXIdentifier(parser: Parser): Token;
