import * as ESTree from '../estree';
import { Token } from '../token';
import { Location, Parser } from '../types';
import { Context, ObjectState } from '../utilities';
/**
 * Expression :
 *   AssignmentExpression
 *   Expression , AssignmentExpression
 *
 * ExpressionNoIn :
 *   AssignmentExpressionNoIn
 *   ExpressionNoIn , AssignmentExpressionNoIn
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Expression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseExpression(parser: Parser, context: Context): ESTree.Expression;
/**
 * Parse secuence expression
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseSequenceExpression(parser: Parser, context: Context, left: ESTree.Expression, pos: Location): ESTree.SequenceExpression;
/**
 * AssignmentExpression :
 *   ConditionalExpression
 *   YieldExpression
 *   ArrowFunction
 *   AsyncArrowFunction
 *   LeftHandSideExpression = AssignmentExpression
 *   LeftHandSideExpression AssignmentOperator AssignmentExpression
 *
 * AssignmentExpressionNoIn :
 *   ConditionalExpressionNoIn
 *   YieldExpression
 *   ArrowFunction
 *   AsyncArrowFunction
 *   LeftHandSideExpression = AssignmentExpressionNoIn
 *   LeftHandSideExpression AssignmentOperator AssignmentExpressionNoIn
 *
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentExpression)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseAssignmentExpression(parser: Parser, context: Context): ESTree.Expression;
/**
 * Parse assignment rest element
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseRestElement(parser: Parser, context: Context, args?: string[]): ESTree.RestElement;
/**
 * Parse left hand side expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-LeftHandSideExpression)
 *
 * @param Parser Parer instance
 * @param Context Contextmasks
 * @param pos Location info
 */
export declare function parseLeftHandSideExpression(parser: Parser, context: Context, pos: Location): ESTree.Expression;
/**
 * Parse primary expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PrimaryExpression)
 *
 * @param Parser Parser object
 * @param Context Context masks
 */
export declare function parsePrimaryExpression(parser: Parser, context: Context): any;
/**
 * Parses identifier
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseIdentifier(parser: Parser, context: Context): ESTree.Identifier;
/**
 * Parses string and number literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
 * @see [Link](https://tc39.github.io/ecma262/#prod-StringLiteral)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseLiteral(parser: Parser, context: Context): ESTree.Literal;
/**
 * Parses BigInt literal (stage 3 proposal)
 *
 * @see [Link](https://tc39.github.io/proposal-bigint/)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseBigIntLiteral(parser: Parser, context: Context): ESTree.Literal;
/**
 * Parse identifier name
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-IdentifierName)
 *
 * @param parser Parser object
 * @param context Context masks
 * @param t token
 */
export declare function parseIdentifierName(parser: Parser, context: Context, t: Token): ESTree.Identifier;
/**
 * Parses function expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionExpression)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseFunctionExpression(parser: Parser, context: Context): ESTree.FunctionExpression;
/**
 * Parses async function or async generator expression
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseAsyncFunctionOrAsyncGeneratorExpression(parser: Parser, context: Context): ESTree.FunctionExpression;
/**
 * Parse property name
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyName)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parsePropertyName(parser: Parser, context: Context): ESTree.Expression;
/**
 * Parses object literal
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ObjectLiteral)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseObjectLiteral(parser: Parser, context: Context): ESTree.ObjectExpression;
/**
 * Parses formal parameters and function body.
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseFormalListAndBody(parser: Parser, context: Context, state: ObjectState): {
    params: (ESTree.Identifier | ESTree.ObjectPattern | ESTree.ArrayPattern | ESTree.RestElement)[];
    body: ESTree.BlockStatement;
};
/**
 * Parse funciton body
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseFunctionBody(parser: Parser, context: Context, params: any): ESTree.BlockStatement;
/**
 * Parse formal parameters
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
 *
 * @param Parser object
 * @param Context masks
 * @param Optional objectstate. Default to none
 */
export declare function parseFormalParameters(parser: Parser, context: Context, state: ObjectState): {
    params: (ESTree.ArrayPattern | ESTree.RestElement | ESTree.ObjectPattern | ESTree.Identifier)[];
    args: string[];
};
/**
 * Parse formal parameter list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameterList)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseFormalParameterList(parser: Parser, context: Context, args: string[]): ESTree.Identifier | ESTree.ObjectPattern | ESTree.ArrayPattern | ESTree.RestElement;
/**
 * Parse class body and element list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassBody)
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElementList)
 *
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseClassBodyAndElementList(parser: Parser, context: Context, state: ObjectState): ESTree.ClassBody;
/**
 * Parse class element and class public instance fields & private instance fields
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElement)
 * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseClassElement(parser: Parser, context: Context, state: ObjectState, decorators: ESTree.Decorator[]): ESTree.MethodDefinition | ESTree.FieldDefinition;
/**
 * Parses a list of decorators
 *
 * @param parser Parser object
 * @param context Context masks
 */
export declare function parseDecorators(parser: Parser, context: Context): ESTree.Decorator[];
