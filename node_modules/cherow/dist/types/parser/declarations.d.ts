import * as ESTree from '../estree';
import { Parser } from '../types';
import { Context } from '../utilities';
/**
 * Parses class declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseClassDeclaration(parser: Parser, context: Context): ESTree.ClassDeclaration;
/**
 * Parses function declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseFunctionDeclaration(parser: Parser, context: Context): ESTree.FunctionDeclaration;
/**
 * Parses async function or async generator declaration
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
 * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseAsyncFunctionOrAsyncGeneratorDeclaration(parser: Parser, context: Context): ESTree.FunctionDeclaration;
/**
 * Parses variable declaration list
 *
 * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclarationList)
 *
 * @param parser  Parser object
 * @param context Context masks
 */
export declare function parseVariableDeclarationList(parser: Parser, context: Context, isConst: boolean): ESTree.VariableDeclarator[];
