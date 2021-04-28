(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.cherow = {})));
}(this, (function (exports) { 'use strict';

  // Note: this *must* be kept in sync with the enum's order.
  //
  // It exploits the enum value ordering, and it's necessarily a complete and
  // utter hack.
  //
  // All to lower it to a single monomorphic array access.
  const keywordDescTable = [
      'end of source',
      /* Constants/Bindings */
      'identifier', 'number', 'string', 'regular expression',
      'false', 'true', 'null',
      /* Template nodes */
      'template continuation', 'template end',
      /* Punctuators */
      '=>', '(', '{', '.', '...', '}', ')', ';', ',', '[', ']', ':', '?', '\'', '"', '</', '/>',
      /* Update operators */
      '++', '--',
      /* Assign operators */
      '=', '<<=', '>>=', '>>>=', '**=', '+=', '-=', '*=', '/=', '%=', '^=', '|=',
      '&=',
      /* Unary/binary operators */
      'typeof', 'delete', 'void', '!', '~', '+', '-', 'in', 'instanceof', '*', '%', '/', '**', '&&',
      '||', '===', '!==', '==', '!=', '<=', '>=', '<', '>', '<<', '>>', '>>>', '&', '|', '^',
      /* Variable declaration kinds */
      'var', 'let', 'const',
      /* Other reserved words */
      'break', 'case', 'catch', 'class', 'continue', 'debugger', 'default', 'do', 'else', 'export',
      'extends', 'finally', 'for', 'function', 'if', 'import', 'new', 'return', 'super', 'switch',
      'this', 'throw', 'try', 'while', 'with',
      /* Strict mode reserved words */
      'implements', 'interface', 'package', 'private', 'protected', 'public', 'static', 'yield',
      /* Contextual keywords */
      'as', 'async', 'await', 'constructor', 'get', 'set', 'from', 'of',
      '#',
      'eval', 'arguments', 'enum', 'BigInt', '@', 'JSXText',
      /** TS */
      'KeyOf', 'ReadOnly', 'is', 'unique', 'declare', 'type', 'namespace', 'abstract', 'module',
      'global', 'require', 'target'
  ];
  /**
   * The conversion function between token and its string description/representation.
   */
  function tokenDesc(token) {
      return keywordDescTable[token & 255 /* Type */];
  }
  // Used `Object.create(null)` to avoid potential `Object.prototype`
  // interference.
  const descKeywordTable = Object.create(null, {
      this: { value: 33566815 /* ThisKeyword */ },
      function: { value: 33566808 /* FunctionKeyword */ },
      if: { value: 12377 /* IfKeyword */ },
      return: { value: 12380 /* ReturnKeyword */ },
      var: { value: 33566791 /* VarKeyword */ },
      else: { value: 12370 /* ElseKeyword */ },
      for: { value: 12374 /* ForKeyword */ },
      new: { value: 33566811 /* NewKeyword */ },
      in: { value: 167786289 /* InKeyword */ },
      typeof: { value: 302002218 /* TypeofKeyword */ },
      while: { value: 12386 /* WhileKeyword */ },
      case: { value: 12363 /* CaseKeyword */ },
      break: { value: 12362 /* BreakKeyword */ },
      try: { value: 12385 /* TryKeyword */ },
      catch: { value: 12364 /* CatchKeyword */ },
      delete: { value: 302002219 /* DeleteKeyword */ },
      throw: { value: 302002272 /* ThrowKeyword */ },
      switch: { value: 33566814 /* SwitchKeyword */ },
      continue: { value: 12366 /* ContinueKeyword */ },
      default: { value: 12368 /* DefaultKeyword */ },
      instanceof: { value: 167786290 /* InstanceofKeyword */ },
      do: { value: 12369 /* DoKeyword */ },
      void: { value: 302002220 /* VoidKeyword */ },
      finally: { value: 12373 /* FinallyKeyword */ },
      arguments: { value: 37879925 /* Arguments */ },
      keyof: { value: 131194 /* KeyOfKeyword */ },
      readonly: { value: 131195 /* ReadOnlyKeyword */ },
      unique: { value: 131197 /* UniqueKeyword */ },
      declare: { value: 131198 /* DeclareKeyword */ },
      async: { value: 594028 /* AsyncKeyword */ },
      await: { value: 34017389 /* AwaitKeyword */ },
      class: { value: 33566797 /* ClassKeyword */ },
      const: { value: 33566793 /* ConstKeyword */ },
      constructor: { value: 69742 /* ConstructorKeyword */ },
      debugger: { value: 12367 /* DebuggerKeyword */ },
      enum: { value: 12406 /* EnumKeyword */ },
      eval: { value: 37879924 /* Eval */ },
      export: { value: 12371 /* ExportKeyword */ },
      extends: { value: 12372 /* ExtendsKeyword */ },
      false: { value: 33566725 /* FalseKeyword */ },
      from: { value: 69745 /* FromKeyword */ },
      get: { value: 69743 /* GetKeyword */ },
      implements: { value: 20579 /* ImplementsKeyword */ },
      import: { value: 33566810 /* ImportKeyword */ },
      interface: { value: 20580 /* InterfaceKeyword */ },
      let: { value: 33574984 /* LetKeyword */ },
      null: { value: 33566727 /* NullKeyword */ },
      of: { value: 69746 /* OfKeyword */ },
      package: { value: 20581 /* PackageKeyword */ },
      private: { value: 20582 /* PrivateKeyword */ },
      protected: { value: 20583 /* ProtectedKeyword */ },
      public: { value: 20584 /* PublicKeyword */ },
      set: { value: 69744 /* SetKeyword */ },
      static: { value: 20585 /* StaticKeyword */ },
      super: { value: 33566813 /* SuperKeyword */ },
      true: { value: 33566726 /* TrueKeyword */ },
      with: { value: 12387 /* WithKeyword */ },
      yield: { value: 1107316842 /* YieldKeyword */ },
      is: { value: 131196 /* IsKeyword */ },
      type: { value: 131199 /* TypeKeyword */ },
      namespace: { value: 131200 /* NameSpaceKeyword */ },
      abstract: { value: 131201 /* AbstractKeyword */ },
      as: { value: 167843947 /* AsKeyword */ },
      module: { value: 131202 /* ModuleKeyword */ },
      global: { value: 131203 /* GlobalKeyword */ },
      require: { value: 131204 /* RequireKeyword */ },
      target: { value: 131205 /* TargetKeyword */ },
  });
  function descKeyword(value) {
      return (descKeywordTable[value] | 0);
  }

  /*@internal*/
  const characterType = [
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      16 /* Space */,
      48 /* Whitespace */,
      16 /* Space */,
      16 /* Space */,
      48 /* Whitespace */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      16 /* Space */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      3 /* Letters */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      9 /* Decimals */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      3 /* Letters */,
      0 /* Unknown */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      7 /* Hexadecimal */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      3 /* Letters */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
      0 /* Unknown */,
  ];

  // Unicode v. 11 support
  // tslint:disable
  function isValidIdentifierPart(code) {
      return (convert[(code >>> 5) + 0] >>> code & 31 & 1) !== 0;
  }
  function isValidIdentifierStart(code) {
      return (convert[(code >>> 5) + 34816] >>> code & 31 & 1) !== 0;
  }
  function mustEscape(code) {
      return (convert[(code >>> 5) + 69632] >>> code & 31 & 1) !== 0;
  }
  const convert = ((compressed, lookup) => {
      const result = new Uint32Array(104448);
      let index = 0;
      let subIndex = 0;
      while (index < 3392) {
          const inst = compressed[index++];
          if (inst < 0) {
              subIndex -= inst;
          }
          else {
              let code = compressed[index++];
              if (inst & 2)
                  code = lookup[code];
              if (inst & 1) {
                  result.fill(code, subIndex, subIndex += compressed[index++]);
              }
              else {
                  result[subIndex++] = code;
              }
          }
      }
      return result;
  })([-1, 2, 28, 2, 29, 2, 5, -1, 0, 77595648, 3, 46, 2, 3, 0, 14, 2, 57, 2, 58, 3, 0, 3, 0, 3168796671, 0, 4294956992, 2, 1, 2, 0, 2, 59, 3, 0, 4, 0, 4294966523, 3, 0, 4, 2, 15, 2, 60, 2, 0, 0, 4294836735, 0, 3221225471, 0, 4294901942, 2, 61, 0, 134152192, 3, 0, 2, 0, 4294951935, 3, 0, 2, 0, 2683305983, 0, 2684354047, 2, 17, 2, 0, 0, 4294961151, 3, 0, 2, 2, 20, 2, 0, 0, 608174079, 2, 0, 2, 127, 2, 6, 2, 62, -1, 2, 64, 2, 26, 2, 1, 3, 0, 3, 0, 4294901711, 2, 40, 0, 4089839103, 0, 2961209759, 0, 1342439375, 0, 4294543342, 0, 3547201023, 0, 1577204103, 0, 4194240, 0, 4294688750, 2, 2, 0, 80831, 0, 4261478351, 0, 4294549486, 2, 2, 0, 2965387679, 0, 196559, 0, 3594373100, 0, 3288319768, 0, 8469959, 2, 171, 0, 4294828031, 0, 3825204735, 0, 123747807, 0, 65487, 2, 3, 0, 4092591615, 0, 1080049119, 0, 458703, 2, 3, 2, 0, 0, 2163244511, 0, 4227923919, 0, 4236247020, 2, 68, 0, 4284449919, 0, 851904, 2, 4, 2, 16, 0, 67076095, -1, 2, 69, 0, 1006628014, 0, 4093591391, -1, 0, 50331649, 0, 3265266687, 2, 34, 0, 4294844415, 0, 4278190047, 2, 23, 2, 125, -1, 3, 0, 2, 2, 33, 2, 0, 2, 9, 2, 0, 2, 13, 2, 14, 3, 0, 10, 2, 71, 2, 0, 2, 72, 2, 73, 2, 74, 2, 0, 2, 75, 2, 0, 2, 10, 0, 261632, 2, 19, 3, 0, 2, 2, 11, 2, 4, 3, 0, 18, 2, 76, 2, 5, 3, 0, 2, 2, 77, 0, 2088959, 2, 31, 2, 8, 0, 909311, 3, 0, 2, 0, 814743551, 2, 42, 0, 67057664, 3, 0, 2, 2, 45, 2, 0, 2, 32, 2, 0, 2, 18, 2, 7, 0, 268374015, 2, 30, 2, 51, 2, 0, 2, 78, 0, 134153215, -1, 2, 6, 2, 0, 2, 7, 0, 2684354559, 0, 67044351, 0, 1073676416, -2, 3, 0, 2, 2, 43, 0, 1046528, 3, 0, 3, 2, 8, 2, 0, 2, 41, 0, 4294960127, 2, 9, 2, 39, 2, 10, 0, 4294377472, 2, 21, 3, 0, 7, 0, 4227858431, 3, 0, 8, 2, 11, 2, 0, 2, 80, 2, 9, 2, 0, 2, 81, 2, 82, 2, 83, -1, 2, 122, 0, 1048577, 2, 84, 2, 12, -1, 2, 12, 0, 131042, 2, 85, 2, 86, 2, 87, 2, 0, 2, 35, -83, 2, 0, 2, 53, 2, 7, 3, 0, 4, 0, 1046559, 2, 0, 2, 13, 2, 0, 0, 2147516671, 2, 24, 3, 88, 2, 2, 0, -16, 2, 89, 0, 524222462, 2, 4, 2, 0, 0, 4269801471, 2, 4, 2, 0, 2, 14, 2, 79, 2, 15, 3, 0, 2, 2, 49, 2, 16, -1, 2, 17, -16, 3, 0, 205, 2, 18, -2, 3, 0, 655, 2, 19, 3, 0, 36, 2, 70, -1, 2, 17, 2, 9, 3, 0, 8, 2, 91, 2, 119, 2, 0, 0, 3220242431, 3, 0, 3, 2, 20, 2, 22, 2, 92, 3, 0, 2, 2, 93, 2, 21, -1, 2, 22, 2, 0, 2, 27, 2, 0, 2, 8, 3, 0, 2, 0, 67043391, 0, 3909091327, 2, 0, 2, 25, 2, 8, 2, 23, 3, 0, 2, 0, 67076097, 2, 7, 2, 0, 2, 24, 0, 67059711, 0, 4236247039, 3, 0, 2, 0, 939524103, 0, 8191999, 2, 97, 2, 98, 2, 14, 2, 95, 3, 0, 3, 0, 67057663, 3, 0, 349, 2, 99, 2, 100, 2, 6, -264, 3, 0, 11, 2, 25, 3, 0, 2, 2, 21, -1, 0, 3774349439, 2, 101, 2, 102, 3, 0, 2, 2, 20, 2, 26, 3, 0, 10, 2, 9, 2, 17, 2, 0, 2, 47, 2, 0, 2, 27, 2, 103, 2, 19, 0, 1638399, 2, 169, 2, 104, 3, 0, 3, 2, 23, 2, 28, 2, 29, 2, 5, 2, 30, 2, 0, 2, 7, 2, 105, -1, 2, 106, 2, 107, 2, 108, -1, 3, 0, 3, 2, 16, -2, 2, 0, 2, 31, -3, 2, 146, -4, 2, 23, 2, 0, 2, 37, 0, 1, 2, 0, 2, 63, 2, 32, 2, 16, 2, 9, 2, 0, 2, 109, -1, 3, 0, 4, 2, 9, 2, 33, 2, 110, 2, 6, 2, 0, 2, 111, 2, 0, 2, 50, -4, 3, 0, 9, 2, 24, 2, 18, 2, 27, -4, 2, 112, 2, 113, 2, 18, 2, 24, 2, 7, -2, 2, 114, 2, 18, 2, 21, -2, 2, 0, 2, 115, -2, 0, 4277137519, 0, 2269118463, -1, 3, 23, 2, -1, 2, 34, 2, 38, 2, 0, 3, 18, 2, 2, 36, 2, 20, -3, 3, 0, 2, 2, 35, -1, 2, 0, 2, 36, 2, 0, 2, 36, 2, 0, 2, 48, -14, 2, 23, 2, 44, 2, 37, -5, 3, 0, 2, 2, 38, 0, 2147549120, 2, 0, 2, 16, 2, 17, 2, 130, 2, 0, 2, 52, 0, 4294901872, 0, 5242879, 3, 0, 2, 0, 402595359, -1, 2, 118, 0, 1090519039, -2, 2, 120, 2, 39, 2, 0, 2, 55, 2, 40, 0, 4226678271, 0, 3766565279, 0, 2039759, -4, 3, 0, 2, 0, 1140787199, -1, 3, 0, 2, 0, 67043519, -5, 2, 0, 0, 4282384383, 0, 1056964609, -1, 3, 0, 2, 0, 67043345, -1, 2, 0, 2, 41, 2, 42, -1, 2, 10, 2, 43, -6, 2, 0, 2, 16, -3, 3, 0, 2, 0, 2147484671, -8, 2, 0, 2, 7, 2, 44, 2, 0, 0, 603979727, -1, 2, 0, 2, 45, -8, 2, 54, 2, 46, 0, 67043329, 2, 123, 2, 47, 0, 8388351, -2, 2, 124, 0, 3028287487, 2, 48, 2, 126, 0, 33259519, 2, 42, -9, 2, 24, -8, 3, 0, 28, 2, 21, -3, 3, 0, 3, 2, 49, 3, 0, 6, 2, 50, -85, 3, 0, 33, 2, 49, -126, 3, 0, 18, 2, 38, -269, 3, 0, 17, 2, 45, 2, 7, 2, 42, -2, 2, 17, 2, 51, 2, 0, 2, 24, 0, 67043343, 2, 128, 2, 19, -21, 3, 0, 2, -4, 3, 0, 2, 0, 4294901791, 2, 7, 2, 164, -2, 0, 3, 3, 0, 191, 2, 20, 3, 0, 23, 2, 36, -296, 3, 0, 8, 2, 7, -2, 2, 17, 3, 0, 11, 2, 6, -72, 3, 0, 3, 2, 129, 0, 1677656575, -166, 0, 4161266656, 0, 4071, 0, 15360, -4, 0, 28, -13, 3, 0, 2, 2, 52, 2, 0, 2, 131, 2, 132, 2, 56, 2, 0, 2, 133, 2, 134, 2, 135, 3, 0, 10, 2, 136, 2, 137, 2, 14, 3, 52, 2, 3, 53, 2, 3, 54, 2, 0, 4294954999, 2, 0, -16, 2, 0, 2, 90, 2, 0, 0, 2105343, 0, 4160749584, 0, 65534, -42, 0, 4194303871, 0, 2011, -62, 3, 0, 6, 0, 8323103, -1, 3, 0, 2, 2, 55, -37, 2, 56, 2, 140, 2, 141, 2, 142, 2, 143, 2, 144, -138, 3, 0, 1334, 2, 24, -1, 3, 0, 129, 2, 31, 3, 0, 6, 2, 9, 3, 0, 180, 2, 145, 3, 0, 233, 0, 1, -96, 3, 0, 16, 2, 9, -22583, 3, 0, 7, 2, 19, -6130, 3, 5, 2, -1, 0, 69207040, 3, 46, 2, 3, 0, 14, 2, 57, 2, 58, -3, 0, 3168731136, 0, 4294956864, 2, 1, 2, 0, 2, 59, 3, 0, 4, 0, 4294966275, 3, 0, 4, 2, 15, 2, 60, 2, 0, 2, 35, -1, 2, 17, 2, 61, -1, 2, 0, 2, 62, 0, 4294885376, 3, 0, 2, 0, 3145727, 0, 2617294944, 0, 4294770688, 2, 19, 2, 63, 3, 0, 2, 0, 131135, 2, 94, 0, 70256639, 0, 71303167, 0, 272, 2, 45, 2, 62, -1, 2, 64, -2, 2, 96, 0, 603979775, 0, 4278255616, 0, 4294836227, 0, 4294549473, 0, 600178175, 0, 2952806400, 0, 268632067, 0, 4294543328, 0, 57540095, 0, 1577058304, 0, 1835008, 0, 4294688736, 2, 65, 2, 66, 0, 33554435, 2, 121, 2, 65, 2, 147, 0, 131075, 0, 3594373096, 0, 67094296, 2, 66, -1, 2, 67, 0, 603979263, 2, 156, 0, 3, 0, 4294828001, 0, 602930687, 2, 180, 0, 393219, 2, 67, 0, 671088639, 0, 2154840064, 0, 4227858435, 0, 4236247008, 2, 68, 2, 38, -1, 2, 4, 0, 917503, 2, 38, -1, 2, 69, 0, 537783470, 0, 4026531935, -1, 0, 1, -1, 2, 34, 2, 70, 0, 7936, -3, 2, 0, 0, 2147485695, 0, 1010761728, 0, 4292984930, 0, 16387, 2, 0, 2, 13, 2, 14, 3, 0, 10, 2, 71, 2, 0, 2, 72, 2, 73, 2, 74, 2, 0, 2, 75, 2, 0, 2, 16, -1, 2, 19, 3, 0, 2, 2, 11, 2, 4, 3, 0, 18, 2, 76, 2, 5, 3, 0, 2, 2, 77, 0, 253951, 3, 20, 2, 0, 122879, 2, 0, 2, 8, 0, 276824064, -2, 3, 0, 2, 2, 45, 2, 0, 0, 4294903295, 2, 0, 2, 18, 2, 7, -1, 2, 17, 2, 51, 2, 0, 2, 78, 2, 42, -1, 2, 24, 2, 0, 2, 31, -2, 0, 128, -2, 2, 79, 2, 8, 0, 4064, -1, 2, 117, 0, 4227907585, 2, 0, 2, 116, 2, 0, 2, 50, 2, 196, 2, 9, 2, 39, 2, 10, -1, 0, 6544896, 3, 0, 6, -2, 3, 0, 8, 2, 11, 2, 0, 2, 80, 2, 9, 2, 0, 2, 81, 2, 82, 2, 83, -3, 2, 84, 2, 12, -3, 2, 85, 2, 86, 2, 87, 2, 0, 2, 35, -83, 2, 0, 2, 53, 2, 7, 3, 0, 4, 0, 817183, 2, 0, 2, 13, 2, 0, 0, 33023, 2, 24, 3, 88, 2, -17, 2, 89, 0, 524157950, 2, 4, 2, 0, 2, 90, 2, 4, 2, 0, 2, 14, 2, 79, 2, 15, 3, 0, 2, 2, 49, 2, 16, -1, 2, 17, -16, 3, 0, 205, 2, 18, -2, 3, 0, 655, 2, 19, 3, 0, 36, 2, 70, -1, 2, 17, 2, 9, 3, 0, 8, 2, 91, 0, 3072, 2, 0, 0, 2147516415, 2, 9, 3, 0, 2, 2, 19, 2, 22, 2, 92, 3, 0, 2, 2, 93, 2, 21, -1, 2, 22, 0, 4294965179, 0, 7, 2, 0, 2, 8, 2, 92, 2, 8, -1, 0, 1761345536, 2, 94, 2, 95, 2, 38, 2, 23, 2, 96, 2, 36, 2, 162, 0, 2080440287, 2, 0, 2, 35, 2, 138, 0, 3296722943, 2, 0, 0, 1046675455, 0, 939524101, 0, 1837055, 2, 97, 2, 98, 2, 14, 2, 95, 3, 0, 3, 0, 7, 3, 0, 349, 2, 99, 2, 100, 2, 6, -264, 3, 0, 11, 2, 25, 3, 0, 2, 2, 21, -1, 0, 2700607615, 2, 101, 2, 102, 3, 0, 2, 2, 20, 2, 26, 3, 0, 10, 2, 9, 2, 17, 2, 0, 2, 47, 2, 0, 2, 27, 2, 103, -3, 2, 104, 3, 0, 3, 2, 23, -1, 3, 5, 2, 2, 30, 2, 0, 2, 7, 2, 105, -1, 2, 106, 2, 107, 2, 108, -1, 3, 0, 3, 2, 16, -2, 2, 0, 2, 31, -8, 2, 23, 2, 0, 2, 37, -1, 2, 0, 2, 63, 2, 32, 2, 18, 2, 9, 2, 0, 2, 109, -1, 3, 0, 4, 2, 9, 2, 17, 2, 110, 2, 6, 2, 0, 2, 111, 2, 0, 2, 50, -4, 3, 0, 9, 2, 24, 2, 18, 2, 27, -4, 2, 112, 2, 113, 2, 18, 2, 24, 2, 7, -2, 2, 114, 2, 18, 2, 21, -2, 2, 0, 2, 115, -2, 0, 4277075969, 2, 18, -1, 3, 23, 2, -1, 2, 34, 2, 139, 2, 0, 3, 18, 2, 2, 36, 2, 20, -3, 3, 0, 2, 2, 35, -1, 2, 0, 2, 36, 2, 0, 2, 36, 2, 0, 2, 50, -14, 2, 23, 2, 44, 2, 116, -5, 2, 117, 2, 41, -2, 2, 117, 2, 19, 2, 17, 2, 35, 2, 117, 2, 38, 0, 4294901776, 0, 4718591, 2, 117, 2, 36, 0, 335544350, -1, 2, 118, 2, 119, -2, 2, 120, 2, 39, 2, 7, -1, 2, 121, 2, 65, 0, 3758161920, 0, 3, -4, 2, 0, 2, 31, 2, 174, -1, 2, 0, 2, 19, 0, 176, -5, 2, 0, 2, 49, 2, 182, -1, 2, 0, 2, 19, 2, 194, -1, 2, 0, 2, 62, -2, 2, 16, -7, 2, 0, 2, 119, -3, 3, 0, 2, 2, 122, -8, 0, 4294965249, 0, 67633151, 0, 4026597376, 2, 0, 0, 536871887, -1, 2, 0, 2, 45, -8, 2, 54, 2, 49, 0, 1, 2, 123, 2, 19, -3, 2, 124, 2, 37, 2, 125, 2, 126, 0, 16778239, -10, 2, 36, -8, 3, 0, 28, 2, 21, -3, 3, 0, 3, 2, 49, 3, 0, 6, 2, 50, -85, 3, 0, 33, 2, 49, -126, 3, 0, 18, 2, 38, -269, 3, 0, 17, 2, 45, 2, 7, -3, 2, 17, 2, 127, 2, 0, 2, 19, 2, 50, 2, 128, 2, 19, -21, 3, 0, 2, -4, 3, 0, 2, 0, 65567, -1, 2, 26, -2, 0, 3, 3, 0, 191, 2, 20, 3, 0, 23, 2, 36, -296, 3, 0, 8, 2, 7, -2, 2, 17, 3, 0, 11, 2, 6, -72, 3, 0, 3, 2, 129, 2, 130, -187, 3, 0, 2, 2, 52, 2, 0, 2, 131, 2, 132, 2, 56, 2, 0, 2, 133, 2, 134, 2, 135, 3, 0, 10, 2, 136, 2, 137, 2, 14, 3, 52, 2, 3, 53, 2, 3, 54, 2, 2, 138, -129, 3, 0, 6, 2, 139, -1, 3, 0, 2, 2, 50, -37, 2, 56, 2, 140, 2, 141, 2, 142, 2, 143, 2, 144, -138, 3, 0, 1334, 2, 24, -1, 3, 0, 129, 2, 31, 3, 0, 6, 2, 9, 3, 0, 180, 2, 145, 3, 0, 233, 0, 1, -96, 3, 0, 16, 2, 9, -28719, 2, 0, 0, 1, -1, 2, 122, 2, 0, 0, 8193, -21, 0, 50331648, 0, 10255, 0, 4, -11, 2, 66, 2, 168, -1, 0, 71680, -1, 2, 157, 0, 4292900864, 0, 805306431, -5, 2, 146, -1, 2, 176, -1, 0, 6144, -2, 2, 123, -1, 2, 150, -1, 2, 153, 2, 147, 2, 161, 2, 0, 0, 3223322624, 2, 36, 0, 4, -4, 2, 188, 0, 205128192, 0, 1333757536, 0, 2147483696, 0, 423953, 0, 747766272, 0, 2717763192, 0, 4286578751, 0, 278545, 2, 148, 0, 4294886464, 0, 33292336, 0, 417809, 2, 148, 0, 1329579616, 0, 4278190128, 0, 700594195, 0, 1006647527, 0, 4286497336, 0, 4160749631, 2, 149, 0, 469762560, 0, 4171219488, 0, 16711728, 2, 149, 0, 202375680, 0, 3214918176, 0, 4294508592, 0, 139280, -1, 0, 983584, 2, 190, 0, 58720275, 0, 3489923072, 0, 10517376, 0, 4293066815, 0, 1, 0, 2013265920, 2, 175, 2, 0, 0, 17816169, 0, 3288339281, 0, 201375904, 2, 0, -2, 0, 256, 0, 122880, 0, 16777216, 2, 146, 0, 4160757760, 2, 0, -6, 2, 163, -11, 0, 3263218176, -1, 0, 49664, 0, 2160197632, 0, 8388802, -1, 0, 12713984, -1, 2, 150, 2, 155, 2, 158, -2, 2, 159, -20, 0, 3758096385, -2, 2, 151, 0, 4292878336, 2, 22, 2, 166, 0, 4294057984, -2, 2, 160, 2, 152, 2, 172, -2, 2, 151, -1, 2, 179, -1, 2, 167, 2, 122, 0, 4026593280, 0, 14, 0, 4292919296, -1, 2, 154, 0, 939588608, -1, 0, 805306368, -1, 2, 122, 0, 1610612736, 2, 152, 2, 153, 3, 0, 2, -2, 2, 154, 2, 155, -3, 0, 267386880, -1, 2, 156, 0, 7168, -1, 0, 65024, 2, 150, 2, 157, 2, 158, -7, 2, 165, -8, 2, 159, -1, 0, 1426112704, 2, 160, -1, 2, 185, 0, 271581216, 0, 2149777408, 2, 19, 2, 157, 2, 122, 0, 851967, 0, 3758129152, -1, 2, 19, 2, 178, -4, 2, 154, -20, 2, 192, 2, 161, -56, 0, 3145728, 2, 184, -1, 2, 191, 2, 122, -1, 2, 162, 2, 122, -4, 0, 32505856, -1, 2, 163, -1, 0, 2147385088, 2, 22, 1, 2155905152, 2, -3, 2, 164, 2, 0, 2, 165, -2, 2, 166, -6, 2, 167, 0, 4026597375, 0, 1, -1, 0, 1, -1, 2, 168, -3, 2, 139, 2, 66, -2, 2, 162, 2, 177, -1, 2, 173, 2, 122, -6, 2, 122, -213, 2, 167, -657, 2, 17, -36, 2, 169, -1, 2, 186, -10, 0, 4294963200, -5, 2, 170, -5, 2, 158, 2, 0, 2, 24, -1, 0, 4227919872, -1, 2, 170, -2, 0, 4227874752, -3, 0, 2146435072, 2, 155, -2, 0, 1006649344, 2, 122, -1, 2, 22, 0, 201375744, -3, 0, 134217720, 2, 22, 0, 4286677377, 0, 32896, -1, 2, 171, -3, 2, 172, -349, 2, 173, 2, 174, 2, 175, 3, 0, 264, -11, 2, 176, -2, 2, 158, 2, 0, 0, 520617856, 0, 2692743168, 0, 36, -3, 0, 524284, -11, 2, 19, -1, 2, 183, -1, 2, 181, 0, 3221291007, 2, 158, -1, 0, 524288, 0, 2158720, -3, 2, 155, 0, 1, -4, 2, 122, 0, 3808625411, 0, 3489628288, 0, 4096, 0, 1207959680, 0, 3221274624, 2, 0, -3, 2, 177, 0, 120, 0, 7340032, -2, 0, 4026564608, 2, 4, 2, 19, 2, 160, 3, 0, 4, 2, 155, -1, 2, 178, 2, 175, -1, 0, 8176, 2, 179, 2, 177, 2, 180, -1, 0, 4290773232, 2, 0, -4, 2, 160, 2, 187, 0, 15728640, 2, 175, -1, 2, 157, -1, 0, 4294934512, 3, 0, 4, -9, 2, 22, 2, 167, 2, 181, 3, 0, 4, 0, 704, 0, 1849688064, 0, 4194304, -1, 2, 122, 0, 4294901887, 2, 0, 0, 130547712, 0, 1879048192, 0, 2080374784, 3, 0, 2, -1, 2, 182, 2, 183, -1, 0, 17829776, 0, 2025848832, 0, 4261477888, -2, 2, 0, -1, 0, 4286580608, -1, 0, 29360128, 2, 184, 0, 16252928, 0, 3791388672, 2, 39, 3, 0, 2, -2, 2, 193, 2, 0, -1, 2, 26, -1, 0, 66584576, -1, 2, 189, 3, 0, 9, 2, 122, 3, 0, 4, -1, 2, 157, 2, 158, 3, 0, 5, -2, 0, 245760, 0, 2147418112, -1, 2, 146, 2, 199, 0, 4227923456, -1, 2, 185, 2, 186, 2, 22, -2, 2, 176, 0, 4292870145, 0, 262144, 2, 122, 3, 0, 2, 0, 1073758848, 2, 187, -1, 0, 4227921920, 2, 188, 0, 68289024, 0, 528402016, 0, 4292927536, 3, 0, 4, -2, 0, 2483027968, 2, 0, -2, 2, 189, 3, 0, 5, -1, 2, 184, 2, 160, 2, 0, -2, 0, 4227923936, 2, 63, -1, 2, 170, 2, 94, 2, 0, 2, 150, 2, 154, 3, 0, 6, -1, 2, 175, 3, 0, 3, -2, 0, 2146959360, 3, 0, 8, -2, 2, 157, -1, 2, 190, 2, 117, -1, 2, 151, 3, 0, 8, 2, 191, 0, 8388608, 2, 171, 2, 169, 2, 183, 0, 4286578944, 3, 0, 2, 0, 1152, 0, 1266679808, 2, 189, 0, 576, 0, 4261707776, 2, 94, 3, 0, 9, 2, 151, 3, 0, 8, -28, 2, 158, 3, 0, 3, -3, 0, 4292902912, -6, 2, 96, 3, 0, 85, -33, 2, 164, 3, 0, 126, -18, 2, 192, 3, 0, 269, -17, 2, 151, 2, 122, 0, 4294917120, 3, 0, 2, 2, 19, 0, 4290822144, -2, 0, 67174336, 0, 520093700, 2, 17, 3, 0, 21, -2, 2, 177, 3, 0, 3, -2, 0, 65504, 2, 122, 2, 49, 3, 0, 2, 2, 92, -191, 2, 123, -23, 2, 26, 3, 0, 296, -8, 2, 122, 3, 0, 2, 2, 19, -11, 2, 175, 3, 0, 72, -3, 0, 3758159872, 0, 201391616, 3, 0, 155, -7, 2, 167, -1, 0, 384, -1, 0, 133693440, -3, 2, 193, -2, 2, 30, 3, 0, 4, 2, 166, -2, 2, 22, 2, 151, 3, 0, 4, -2, 2, 185, -1, 2, 146, 0, 335552923, 2, 194, -1, 0, 538974272, 0, 2214592512, 0, 132000, -10, 0, 192, -8, 0, 12288, -21, 0, 134213632, 0, 4294901761, 3, 0, 42, 0, 100663424, 0, 4294965284, 3, 0, 62, -6, 0, 4286578784, 2, 0, -2, 0, 1006696448, 3, 0, 24, 2, 37, -1, 2, 195, 3, 0, 10, 2, 194, 0, 4110942569, 0, 1432950139, 0, 2701658217, 0, 4026532864, 0, 4026532881, 2, 0, 2, 47, 3, 0, 8, -1, 2, 154, -2, 2, 166, 0, 98304, 0, 65537, 2, 167, 2, 169, -2, 2, 154, -1, 2, 63, 2, 0, 2, 116, 2, 197, 2, 175, 0, 4294770176, 2, 30, 3, 0, 4, -30, 2, 195, 2, 196, -3, 2, 166, -2, 2, 151, 2, 0, 2, 154, -1, 2, 189, -1, 2, 157, 2, 198, 3, 0, 2, 2, 154, 2, 122, -1, 0, 193331200, -1, 0, 4227923960, 2, 197, -1, 3, 0, 3, 2, 198, 3, 0, 44, -1334, 2, 22, 2, 0, -129, 2, 195, -6, 2, 160, -180, 2, 199, -233, 2, 4, 3, 0, 96, -16, 2, 160, 3, 0, 22583, -7, 2, 17, 3, 0, 6128], [4294967295, 4294967291, 4092460543, 4294828015, 4294967294, 134217726, 268435455, 2147483647, 1048575, 1073741823, 3892314111, 1061158911, 536805376, 4294910143, 4160749567, 4294901759, 134217727, 4294901760, 4194303, 65535, 262143, 67108863, 4286578688, 536870911, 8388607, 4294918143, 4294443008, 255, 67043328, 2281701374, 4294967232, 2097151, 4294903807, 4294902783, 4294967039, 511, 524287, 131071, 127, 4294902271, 4294549487, 16777215, 1023, 67047423, 4294901888, 33554431, 4286578687, 4294770687, 67043583, 32767, 15, 2047999, 4292870143, 4294934527, 4294966783, 67045375, 4294967279, 262083, 20511, 4290772991, 41943039, 493567, 2047, 4294959104, 1071644671, 602799615, 65536, 4294828000, 805044223, 4277151126, 8191, 1031749119, 4294917631, 2134769663, 4286578493, 4282253311, 4294942719, 33540095, 4294905855, 4294967264, 2868854591, 1608515583, 265232348, 534519807, 2147614720, 1060109444, 4093640016, 17376, 2139062143, 224, 4169138175, 4294909951, 4294967292, 4294965759, 4294966272, 4294901823, 4294967280, 8289918, 4294934399, 4294901775, 4294965375, 1602223615, 4294967259, 268369920, 4292804608, 486341884, 4294963199, 3087007615, 1073692671, 4128527, 4279238655, 4294902015, 4294966591, 2445279231, 3670015, 3238002687, 63, 4294967288, 4294705151, 4095, 3221208447, 4294549472, 2147483648, 4294705152, 4294966143, 64, 4294966719, 16383, 3774873592, 536807423, 67043839, 3758096383, 3959414372, 3755993023, 2080374783, 4294835295, 4294967103, 4160749565, 4087, 31, 184024726, 2862017156, 1593309078, 268434431, 268434414, 4294901763, 536870912, 2952790016, 202506752, 139264, 402653184, 4261412864, 4227922944, 2147532800, 61440, 3758096384, 117440512, 65280, 4227858432, 3233808384, 3221225472, 4294965248, 32768, 57152, 4294934528, 67108864, 4293918720, 4290772992, 25165824, 57344, 4278190080, 65472, 4227907584, 65520, 1920, 4026531840, 49152, 4160749568, 4294836224, 63488, 1073741824, 4294967040, 251658240, 196608, 12582912, 2097152, 65408, 64512, 417808, 4227923712, 48, 512, 4294967168, 4294966784, 16, 4292870144, 4227915776, 65528, 4294950912, 65532]);

  /**
   * Return the next unicodechar in the stream
   *
   * @param parser Parser object
   */
  function nextUnicodeChar(parser) {
      const { index } = parser;
      const hi = parser.source.charCodeAt(index);
      if (hi < 55296 /* LeadSurrogateMin */ || hi > 56319 /* LeadSurrogateMax */)
          return hi;
      const lo = parser.source.charCodeAt(index + 1);
      if (lo < 56320 /* TrailSurrogateMin */ || lo > 57343 /* TrailSurrogateMax */)
          return hi;
      return 65536 /* NonBMPMin */ + ((hi & 0x3FF) << 10) | lo & 0x3FF;
  }
  /**
   * Returns true if this is a valid identifier part
   *
   * @param code Codepoint
   */
  const isIdentifierPart = (code) => (characterType[code] & 1 /* IdentifierStart */) !== 0 || isValidIdentifierPart(code);
  function escapeInvalidCharacters(code) {
      switch (code) {
          case 0 /* Null */:
              return '\\0';
          case 8 /* Backspace */:
              return '\\b';
          case 9 /* Tab */:
              return '\\t';
          case 10 /* LineFeed */:
              return '\\n';
          case 11 /* VerticalTab */:
              return '\\v';
          case 12 /* FormFeed */:
              return '\\f';
          case 13 /* CarriageReturn */:
              return '\\r';
          default:
              if (!mustEscape(code))
                  return fromCodePoint(code);
              if (code < 0x10)
                  return `\\x0${code.toString(16)}`;
              if (code < 0x100)
                  return `\\x${code.toString(16)}`;
              if (code < 0x1000)
                  return `\\u0${code.toString(16)}`;
              if (code < 0x10000)
                  return `\\u${code.toString(16)}`;
              return `\\u{${code.toString(16)}}`;
      }
  }
  /**
   * Consume an token in the scanner on match. This is an equalent to
   * 'consume' used in the parser code itself.
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function consumeOpt(parser, code) {
      if (parser.source.charCodeAt(parser.index) !== code)
          return false;
      parser.index++;
      parser.column++;
      return true;
  }
  /**
   * Consumes line feed
   *
   * @param parser Parser object
   * @param state  Scanner state
   */
  function consumeLineFeed(parser, state) {
      parser.flags |= exports.Flags.NewLine;
      parser.index++;
      if ((state & exports.ScannerState.LastIsCR) === 0) {
          parser.column = 0;
          parser.line++;
      }
  }
  /**
   * Scans private name. Stage 3 proposal related
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanPrivateName(parser, context) {
      if (!(context & exports.Context.InClass) || !isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
          report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      }
      return 115 /* Hash */;
  }
  /**
   * Advance to new line
   *
   * @param parser Parser object
   */
  function advanceNewline(parser) {
      parser.flags |= exports.Flags.NewLine;
      parser.index++;
      parser.column = 0;
      parser.line++;
  }
  const fromCodePoint = (code) => {
      return code <= 0xFFFF ?
          String.fromCharCode(code) :
          String.fromCharCode(((code - 65536 /* NonBMPMin */) >> 10) + 55296 /* LeadSurrogateMin */, ((code - 65536 /* NonBMPMin */) & (1024 - 1)) + 56320 /* TrailSurrogateMin */);
  };
  function readNext(parser) {
      parser.index++;
      parser.column++;
      if (parser.index >= parser.source.length)
          report(parser, 14 /* UnicodeOutOfRange */);
      return nextUnicodeChar(parser);
  }
  function toHex(code) {
      if (code < 48 /* Zero */)
          return -1;
      if (code <= 57 /* Nine */)
          return code - 48 /* Zero */;
      if (code < 65 /* UpperA */)
          return -1;
      if (code <= 70 /* UpperF */)
          return code - 65 /* UpperA */ + 10;
      if (code < 97 /* LowerA */)
          return -1;
      if (code <= 102 /* LowerF */)
          return code - 97 /* LowerA */ + 10;
      return -1;
  }
  function advanceOnMaybeAstral(parser, ch) {
      parser.index++;
      parser.column++;
      if (ch > 0xFFFF)
          parser.index++;
  }

  /**
   * Scan escape sequence
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanEscapeSequence(parser, context, first) {
      switch (first) {
          case 98 /* LowerB */:
              return 8 /* Backspace */;
          case 102 /* LowerF */:
              return 12 /* FormFeed */;
          case 114 /* LowerR */:
              return 13 /* CarriageReturn */;
          case 110 /* LowerN */:
              return 10 /* LineFeed */;
          case 116 /* LowerT */:
              return 9 /* Tab */;
          case 118 /* LowerV */:
              return 11 /* VerticalTab */;
          case 13 /* CarriageReturn */:
          case 10 /* LineFeed */:
          case 8232 /* LineSeparator */:
          case 8233 /* ParagraphSeparator */:
              parser.column = -1;
              parser.line++;
              return exports.Escape.Empty;
          case 48 /* Zero */:
          case 49 /* One */:
          case 50 /* Two */:
          case 51 /* Three */:
              {
                  // 1 to 3 octal digits
                  let code = first - 48 /* Zero */;
                  let index = parser.index + 1;
                  let column = parser.column + 1;
                  let next = parser.source.charCodeAt(index);
                  if (next < 48 /* Zero */ || next > 55 /* Seven */) {
                      // Strict mode code allows only \0, then a non-digit.
                      if (code !== 0 || next === 56 /* Eight */ || next === 57 /* Nine */) {
                          if (context & exports.Context.Strict)
                              return exports.Escape.StrictOctal;
                          parser.flags |= exports.Flags.HasOctal;
                      }
                  }
                  else if (context & exports.Context.Strict) {
                      return exports.Escape.StrictOctal;
                  }
                  else {
                      parser.flags |= exports.Flags.HasOctal;
                      parser.lastValue = next;
                      code = code * 8 + (next - 48 /* Zero */);
                      index++;
                      column++;
                      next = parser.source.charCodeAt(index);
                      if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                          parser.lastValue = next;
                          code = code * 8 + (next - 48 /* Zero */);
                          index++;
                          column++;
                      }
                      parser.index = index - 1;
                      parser.column = column - 1;
                  }
                  return code;
              }
          case 52 /* Four */:
          case 53 /* Five */:
          case 54 /* Six */:
          case 55 /* Seven */:
              {
                  // 1 to 2 octal digits
                  if (context & exports.Context.Strict)
                      return exports.Escape.StrictOctal;
                  let code = first - 48 /* Zero */;
                  const index = parser.index + 1;
                  const column = parser.column + 1;
                  const next = parser.source.charCodeAt(index);
                  if (next >= 48 /* Zero */ && next <= 55 /* Seven */) {
                      code = code * 8 + (next - 48 /* Zero */);
                      parser.lastValue = next;
                      parser.index = index;
                      parser.column = column;
                  }
                  return code;
              }
          // `8`, `9` (invalid escapes)
          case 56 /* Eight */:
          case 57 /* Nine */:
              return exports.Escape.EightOrNine;
          // ASCII escapes
          case 120 /* LowerX */:
              {
                  const ch1 = parser.lastValue = readNext(parser);
                  const hi = toHex(ch1);
                  if (hi < 0)
                      return exports.Escape.InvalidHex;
                  const ch2 = parser.lastValue = readNext(parser);
                  const lo = toHex(ch2);
                  if (lo < 0)
                      return exports.Escape.InvalidHex;
                  return hi << 4 | lo;
              }
          // UCS-2/Unicode escapes
          case 117 /* LowerU */:
              {
                  let ch = parser.lastValue = readNext(parser);
                  if (ch === 123 /* LeftBrace */) {
                      ch = parser.lastValue = readNext(parser);
                      let code = toHex(ch);
                      if (code < 0)
                          return exports.Escape.InvalidHex;
                      ch = parser.lastValue = readNext(parser);
                      while (ch !== 125 /* RightBrace */) {
                          const digit = toHex(ch);
                          if (digit < 0)
                              return exports.Escape.InvalidHex;
                          code = code * 16 + digit;
                          // Code point out of bounds
                          if (code > 1114111 /* NonBMPMax */)
                              return exports.Escape.OutOfRange;
                          ch = parser.lastValue = readNext(parser);
                      }
                      return code;
                  }
                  else {
                      // \uNNNN
                      let codePoint = toHex(ch);
                      if (codePoint < 0)
                          return exports.Escape.InvalidHex;
                      for (let i = 0; i < 3; i++) {
                          ch = parser.lastValue = readNext(parser);
                          const digit = toHex(ch);
                          if (digit < 0)
                              return exports.Escape.InvalidHex;
                          codePoint = codePoint * 16 + digit;
                      }
                      return codePoint;
                  }
              }
          default:
              return parser.source.charCodeAt(parser.index);
      }
  }
  /**
   * Throws a string error for either string or template literal
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function throwStringError(parser, context, code) {
      switch (code) {
          case exports.Escape.Empty:
              return;
          case exports.Escape.StrictOctal:
              report(parser, context & exports.Context.TaggedTemplate ?
                  76 /* TemplateOctalLiteral */ :
                  11 /* StrictOctalEscape */);
          case exports.Escape.EightOrNine:
              report(parser, 13 /* InvalidEightAndNine */);
          case exports.Escape.InvalidHex:
              report(parser, 75 /* MalformedEscape */, 'hexadecimal');
          case exports.Escape.OutOfRange:
              report(parser, 14 /* UnicodeOutOfRange */);
          /* istanbul ignore next */
          default:
          // ignore
      }
  }
  /**
   * Scan a string literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param quote codepoint
   */
  function scanString(parser, context, quote) {
      const { index: start, lastValue } = parser;
      let ret = '';
      parser.index++;
      parser.column++; // consume quote
      let ch = parser.source.charCodeAt(parser.index);
      while (ch !== quote) {
          switch (ch) {
              case 13 /* CarriageReturn */:
              case 10 /* LineFeed */:
                  report(parser, 6 /* UnterminatedString */);
              case 92 /* Backslash */:
                  ch = readNext(parser);
                  if (ch > 128 /* MaxAsciiCharacter */) {
                      ret += fromCodePoint(ch);
                  }
                  else {
                      parser.lastValue = ch;
                      const code = scanEscapeSequence(parser, context, ch);
                      if (code >= 0)
                          ret += fromCodePoint(code);
                      else
                          throwStringError(parser, context, code);
                      ch = parser.lastValue;
                  }
                  break;
              default:
                  ret += fromCodePoint(ch);
          }
          ch = readNext(parser);
      }
      parser.index++;
      parser.column++; // consume quote
      parser.tokenRaw = parser.source.slice(start, parser.index);
      parser.tokenValue = ret;
      parser.lastValue = lastValue;
      return 33554435 /* StringLiteral */;
  }

  /**
   * Consumes template brace
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function consumeTemplateBrace(parser, context) {
      if (parser.index >= parser.length)
          report(parser, 9 /* UnterminatedTemplate */);
      // Upon reaching a '}', consume it and rewind the scanner state
      parser.index--;
      parser.column--;
      return scanTemplate(parser, context);
  }
  /**
   * Scan template
   *
   * @param parser Parser object
   * @param context Context masks
   * @param first Codepoint
   */
  function scanTemplate(parser, context) {
      const { index: start, lastValue } = parser;
      let tail = true;
      let ret = '';
      let ch = readNext(parser);
      loop: while (ch !== 96 /* Backtick */) {
          switch (ch) {
              // Break after a literal `${` (thus the dedicated code path).
              case 36 /* Dollar */:
                  {
                      const index = parser.index + 1;
                      if (index < parser.length &&
                          parser.source.charCodeAt(index) === 123 /* LeftBrace */) {
                          parser.index = index;
                          parser.column++;
                          tail = false;
                          break loop;
                      }
                      ret += '$';
                      break;
                  }
              case 92 /* Backslash */:
                  ch = readNext(parser);
                  if (ch >= 128) {
                      ret += fromCodePoint(ch);
                  }
                  else {
                      parser.lastValue = ch;
                      // Because octals are forbidden in escaped template sequences and the fact that
                      // both string and template scanning uses the same method - 'scanEscapeSequence',
                      // we set the strict context mask.
                      const code = scanEscapeSequence(parser, context | exports.Context.Strict, ch);
                      if (code >= 0) {
                          ret += fromCodePoint(code);
                      }
                      else if (code !== exports.Escape.Empty && context & exports.Context.TaggedTemplate) {
                          ret = undefined;
                          ch = scanLooserTemplateSegment(parser, parser.lastValue);
                          if (ch < 0) {
                              tail = false;
                          }
                          break loop;
                      }
                      else {
                          throwStringError(parser, context | exports.Context.TaggedTemplate, code);
                      }
                      ch = parser.lastValue;
                  }
                  break;
              case 13 /* CarriageReturn */:
              case 10 /* LineFeed */:
              case 8232 /* LineSeparator */:
              case 8233 /* ParagraphSeparator */:
                  parser.column = -1;
                  parser.line++;
              // falls through
              default:
                  if (ret != null)
                      ret += fromCodePoint(ch);
          }
          ch = readNext(parser);
      }
      parser.index++;
      parser.column++;
      parser.tokenValue = ret;
      parser.lastValue = lastValue;
      if (tail) {
          parser.tokenRaw = parser.source.slice(start + 1, parser.index - 1);
          return 33554441 /* TemplateTail */;
      }
      else {
          parser.tokenRaw = parser.source.slice(start + 1, parser.index - 2);
          return 33554440 /* TemplateCont */;
      }
  }
  /**
   * Scan looser template segment
   *
   * @param parser Parser object
   * @param ch codepoint
   */
  function scanLooserTemplateSegment(parser, ch) {
      while (ch !== 96 /* Backtick */) {
          if (ch === 36 /* Dollar */ && parser.source.charCodeAt(parser.index + 1) === 123 /* LeftBrace */) {
              parser.index++;
              parser.column++;
              return -ch;
          }
          // Skip '\' and continue to scan the template token to search
          // for the end, without validating any escape sequences
          ch = readNext(parser);
      }
      return ch;
  }

  // 11.8.3 Numeric Literals
  /**
   * Scans hex integer literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-HexIntegerLiteral)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanHexIntegerLiteral(parser, context) {
      parser.index++;
      parser.column++;
      let state = exports.NumericState.None;
      let value = toHex(parser.source.charCodeAt(parser.index));
      if (value < 0)
          report(parser, 0 /* Unexpected */);
      parser.index++;
      parser.column++;
      while (parser.index < parser.length) {
          const next = parser.source.charCodeAt(parser.index);
          if (context & exports.Context.OptionsNext && next === 95 /* Underscore */) {
              state = scanNumericSeparator(parser, state);
              continue;
          }
          state &= ~exports.NumericState.SeenSeparator;
          const digit = toHex(next);
          if (digit < 0)
              break;
          value = value * 16 + digit;
          parser.index++;
          parser.column++;
      }
      if (state & exports.NumericState.SeenSeparator)
          report(parser, 59 /* TrailingNumericSeparator */);
      return assembleNumericLiteral(parser, context, value, consumeOpt(parser, 110 /* LowerN */));
  }
  /**
   * Scans binary and octal integer literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-OctalIntegerLiteral)
   * @see [Link](https://tc39.github.io/ecma262/#prod-BinaryIntegerLiteral)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanOctalOrBinary(parser, context, base) {
      parser.index++;
      parser.column++;
      let digits = 0;
      let ch;
      let value = 0;
      let state = exports.NumericState.None;
      while (parser.index < parser.length) {
          ch = parser.source.charCodeAt(parser.index);
          if (context & exports.Context.OptionsNext && ch === 95 /* Underscore */) {
              state = scanNumericSeparator(parser, state);
              continue;
          }
          state &= ~exports.NumericState.SeenSeparator;
          const converted = ch - 48 /* Zero */;
          if (!(ch >= 48 /* Zero */ && ch <= 57 /* Nine */) || converted >= base)
              break;
          value = value * base + converted;
          parser.index++;
          parser.column++;
          digits++;
      }
      if (digits === 0)
          report(parser, 0 /* Unexpected */);
      if (state & exports.NumericState.SeenSeparator)
          report(parser, 59 /* TrailingNumericSeparator */);
      return assembleNumericLiteral(parser, context, value, consumeOpt(parser, 110 /* LowerN */));
  }
  /**
   * Scans implicit octal digits
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-OctalDigits)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanImplicitOctalDigits(parser, context) {
      switch (parser.source.charCodeAt(parser.index)) {
          case 48 /* Zero */:
          case 49 /* One */:
          case 50 /* Two */:
          case 51 /* Three */:
          case 52 /* Four */:
          case 53 /* Five */:
          case 54 /* Six */:
          case 55 /* Seven */:
              {
                  if (context & exports.Context.Strict)
                      report(parser, 0 /* Unexpected */);
                  let index = parser.index;
                  let column = parser.column;
                  let code = 0;
                  parser.flags |= exports.Flags.HasOctal;
                  // Implicit octal, unless there is a non-octal digit.
                  // (Annex B.1.1 on Numeric Literals)
                  while (index < parser.length) {
                      const next = parser.source.charCodeAt(index);
                      if (next === 95 /* Underscore */) {
                          report(parser, 60 /* ZeroDigitNumericSeparator */);
                      }
                      else if (next < 48 /* Zero */ || next > 55 /* Seven */) {
                          return scanNumericLiteral(parser, context);
                      }
                      else {
                          code = code * 8 + (next - 48 /* Zero */);
                          index++;
                          column++;
                      }
                  }
                  parser.index = index;
                  parser.column = column;
                  return assembleNumericLiteral(parser, context, code, consumeOpt(parser, 110 /* LowerN */));
              }
          case 56 /* Eight */:
          case 57 /* Nine */:
              parser.flags |= exports.Flags.HasOctal;
          default:
              if (context & exports.Context.OptionsNext && parser.source.charCodeAt(parser.index) === 95 /* Underscore */) {
                  report(parser, 60 /* ZeroDigitNumericSeparator */);
              }
              return scanNumericLiteral(parser, context);
      }
  }
  /**
   * Scans signed integer
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-SignedInteger)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanSignedInteger(parser, end) {
      let next = parser.source.charCodeAt(parser.index);
      if (next === 43 /* Plus */ || next === 45 /* Hyphen */) {
          parser.index++;
          parser.column++;
          next = parser.source.charCodeAt(parser.index);
      }
      if (!(next >= 48 /* Zero */ && next <= 57 /* Nine */)) {
          report(parser, 0 /* Unexpected */);
      }
      const preNumericPart = parser.index;
      const finalFragment = scanDecimalDigitsOrSeparator(parser);
      return parser.source.substring(end, preNumericPart) + finalFragment;
  }
  /**
   * Scans numeric literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanNumericLiteral(parser, context, state = exports.NumericState.None) {
      let value = state & exports.NumericState.Float ?
          0 :
          scanDecimalAsSmi(parser, context);
      const next = parser.source.charCodeAt(parser.index);
      // I know I'm causing a bug here. The question is - will anyone figure this out?
      if (next !== 46 /* Period */ && next !== 95 /* Underscore */ && !isValidIdentifierStart(next)) {
          return assembleNumericLiteral(parser, context, value);
      }
      if (consumeOpt(parser, 46 /* Period */)) {
          if (context & exports.Context.OptionsNext && parser.source.charCodeAt(parser.index) === 95 /* Underscore */) {
              report(parser, 60 /* ZeroDigitNumericSeparator */);
          }
          state |= exports.NumericState.Float;
          value = `${value}.${scanDecimalDigitsOrSeparator(parser)}`;
      }
      const end = parser.index;
      if (consumeOpt(parser, 110 /* LowerN */)) {
          if (state & exports.NumericState.Float)
              report(parser, 0 /* Unexpected */);
          state |= exports.NumericState.BigInt;
      }
      if (consumeOpt(parser, 101 /* LowerE */) || consumeOpt(parser, 69 /* UpperE */)) {
          state |= exports.NumericState.Float;
          value += scanSignedInteger(parser, end);
      }
      if (isValidIdentifierStart(parser.source.charCodeAt(parser.index))) {
          report(parser, 0 /* Unexpected */);
      }
      return assembleNumericLiteral(parser, context, state & exports.NumericState.Float ? parseFloat(value) : parseInt(value, 10), !!(state & exports.NumericState.BigInt));
  }
  /**
   * Internal helper function for scanning numeric separators.
   *
   * @param parser Parser object
   * @param context Context masks
   * @param state NumericState state
   */
  function scanNumericSeparator(parser, state) {
      parser.index++;
      parser.column++;
      if (state & exports.NumericState.SeenSeparator)
          report(parser, 59 /* TrailingNumericSeparator */);
      state |= exports.NumericState.SeenSeparator;
      return state;
  }
  /**
   * Internal helper function that scans numeric values
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanDecimalDigitsOrSeparator(parser) {
      let start = parser.index;
      let state = exports.NumericState.None;
      let ret = '';
      loop: while (parser.index < parser.length) {
          switch (parser.source.charCodeAt(parser.index)) {
              case 95 /* Underscore */:
                  const preUnderscoreIndex = parser.index;
                  state = scanNumericSeparator(parser, state);
                  ret += parser.source.substring(start, preUnderscoreIndex);
                  start = parser.index;
                  continue;
              case 48 /* Zero */:
              case 49 /* One */:
              case 50 /* Two */:
              case 51 /* Three */:
              case 52 /* Four */:
              case 53 /* Five */:
              case 54 /* Six */:
              case 55 /* Seven */:
              case 56 /* Eight */:
              case 57 /* Nine */:
                  state = state & ~exports.NumericState.SeenSeparator;
                  parser.index++;
                  parser.column++;
                  break;
              default:
                  break loop;
          }
      }
      if (state & exports.NumericState.SeenSeparator)
          report(parser, 59 /* TrailingNumericSeparator */);
      return ret + parser.source.substring(start, parser.index);
  }
  /**
   * Internal helper function that scans numeric values
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanDecimalAsSmi(parser, context) {
      let state = exports.NumericState.None;
      let value = 0;
      let next = parser.source.charCodeAt(parser.index);
      while (next >= 48 /* Zero */ && next <= 57 /* Nine */ || next === 95 /* Underscore */) {
          if (context & exports.Context.OptionsNext && next === 95 /* Underscore */) {
              state = scanNumericSeparator(parser, state);
              next = parser.source.charCodeAt(parser.index);
              continue;
          }
          state &= ~exports.NumericState.SeenSeparator;
          value = value * 10 + (next - 48 /* Zero */);
          parser.index++;
          parser.column++;
          next = parser.source.charCodeAt(parser.index);
      }
      if (state & exports.NumericState.SeenSeparator)
          report(parser, 59 /* TrailingNumericSeparator */);
      return value;
  }
  /**
   * Internal helper function that assamble the number scanning parts and return
   *
   * @param parser Parser object
   * @param context Context masks
   * @param value The numeric value
   */
  function assembleNumericLiteral(parser, context, value, isBigInt = false) {
      parser.tokenValue = value;
      if (context & exports.Context.OptionsRaw)
          parser.tokenRaw = parser.source.slice(parser.startIndex, parser.index);
      return isBigInt ? 33554551 /* BigIntLiteral */ : 33554434 /* NumericLiteral */;
  }

  /**
   * Scan identifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
   * @see [Link](https://tc39.github.io/ecma262/#sec-literals-string-literals)
   *
   * @param Parser instance
   * @param Context masks
   */
  function scanIdentifier(parser, context, first) {
      let start = parser.index;
      let ret = '';
      let isEscaped = false;
      if (first)
          advanceOnMaybeAstral(parser, first);
      loop: while (parser.index < parser.length) {
          const index = parser.index;
          let ch = parser.source.charCodeAt(index);
          switch (ch) {
              case 92 /* Backslash */:
                  ret += parser.source.slice(start, index);
                  ret += scanUnicodeCodePointEscape(parser);
                  start = parser.index;
                  isEscaped = true;
                  break;
              default:
                  if (ch >= 0xD800 && ch <= 0xDBFF) {
                      const lo = parser.source.charCodeAt(index + 1);
                      ch = (ch & 0x3FF) << 10 | lo & 0x3FF | 0x10000;
                  }
                  if (!isIdentifierPart(ch))
                      break loop;
                  advanceOnMaybeAstral(parser, ch);
          }
      }
      if (start < parser.index)
          ret += parser.source.slice(start, parser.index);
      parser.tokenValue = ret;
      const len = ret.length;
      // Keywords are between 2 and 11 characters long and start with a lowercase letter
      // https://tc39.github.io/ecma262/#sec-keywords
      if (len >= 2 && len <= 11) {
          const token = descKeyword(ret);
          if (token > 0) {
              if (isEscaped) {
                  if (context & exports.Context.DisallowEscapedKeyword) {
                      tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
                  }
                  // Here we fall back to a mutual parser flag if the escaped keyword isn't disallowed through
                  // context masks. This is similiar to how V8 does it - they are using an
                  // 'escaped_keyword' token.
                  // - J.K. Thomas
                  parser.flags |= exports.Flags.EscapedKeyword;
              }
              return token;
          }
      }
      if (context & exports.Context.OptionsRawidentifiers)
          parser.tokenRaw = parser.source.slice(start, parser.index);
      return 33685505 /* Identifier */;
  }
  /**
   * Scanning chars in the range 0...127, and treat them as an possible
   * identifier. This allows subsequent checking to be faster.
   *
   * @param parser Parser instance
   * @param context Context masks
   * @param first Code point
   */
  function scanMaybeIdentifier(parser, context, first) {
      first = nextUnicodeChar(parser);
      if (!isValidIdentifierStart(first)) {
          report(parser, 10 /* UnexpectedChar */, escapeInvalidCharacters(first));
      }
      return scanIdentifier(parser, context, first);
  }
  /**
   * Scan unicode codepoint escape
   *
   * @param Parser instance
   * @param Context masks
   */
  function scanUnicodeCodePointEscape(parser) {
      const { index } = parser;
      if (index + 5 < parser.length) {
          if (parser.source.charCodeAt(index + 1) !== 117 /* LowerU */) {
              report(parser, 0 /* Unexpected */);
          }
          parser.index += 2;
          parser.column += 2;
          const code = scanIdentifierUnicodeEscape(parser);
          if (code >= 55296 /* LeadSurrogateMin */ && code <= 56319 /* LeadSurrogateMax */) {
              report(parser, 74 /* UnexpectedSurrogate */);
          }
          if (!isIdentifierPart(code)) {
              report(parser, 75 /* MalformedEscape */, 'unicode');
          }
          return fromCodePoint(code);
      }
      report(parser, 0 /* Unexpected */);
  }
  /**
   * Scan identifier unicode escape
   *
   * @param Parser instance
   * @param Context masks
   */
  function scanIdentifierUnicodeEscape(parser) {
      // Accept both \uxxxx and \u{xxxxxx}. In the latter case, the number of
      // hex digits between { } is arbitrary. \ and u have already been read.
      let ch = parser.source.charCodeAt(parser.index);
      let codePoint = 0;
      // '\u{DDDDDDDD}'
      if (ch === 123 /* LeftBrace */) { // {
          ch = readNext(parser);
          let digit = toHex(ch);
          while (digit >= 0) {
              codePoint = (codePoint << 4) | digit;
              if (codePoint > 1114111 /* NonBMPMax */) {
                  report(parser, 89 /* UndefinedUnicodeCodePoint */);
              }
              parser.index++;
              parser.column++;
              digit = toHex(parser.source.charCodeAt(parser.index));
          }
          if (parser.source.charCodeAt(parser.index) !== 125 /* RightBrace */) {
              report(parser, 75 /* MalformedEscape */, 'unicode');
          }
          consumeOpt(parser, 125 /* RightBrace */);
          // '\uDDDD'
      }
      else {
          for (let i = 0; i < 4; i++) {
              ch = parser.source.charCodeAt(parser.index);
              const digit = toHex(ch);
              if (digit < 0)
                  report(parser, 75 /* MalformedEscape */, 'unicode');
              codePoint = (codePoint << 4) | digit;
              parser.index++;
              parser.column++;
          }
      }
      return codePoint;
  }

  // 11.4 Comments
  /**
   * Skips single HTML comments. Same behavior as in V8.
   *
   * @param parser Parser Object
   * @param context Context masks.
   * @param state  Scanner state
   * @param type   Comment type
   */
  function skipSingleHTMLComment(parser, context, state, type) {
      if (context & exports.Context.Module)
          report(parser, 90 /* HtmlCommentInModule */);
      return skipSingleLineComment(parser, context, state, type);
  }
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
  function skipSingleLineComment(parser, context, state, type) {
      const start = parser.index;
      const collectable = !!(context & exports.Context.OptionsComments);
      while (parser.index < parser.length) {
          switch (parser.source.charCodeAt(parser.index)) {
              case 13 /* CarriageReturn */:
                  advanceNewline(parser);
                  if ((parser.index < parser.length) && parser.source.charCodeAt(parser.index) === 10 /* LineFeed */)
                      parser.index++;
                  return state | exports.ScannerState.NewLine;
              case 10 /* LineFeed */:
              case 8232 /* LineSeparator */:
              case 8233 /* ParagraphSeparator */:
                  advanceNewline(parser);
                  if (collectable)
                      addComment(parser, context, type, start);
                  return state | exports.ScannerState.NewLine;
              default:
                  parser.index++;
                  parser.column++;
          }
      }
      if (collectable)
          addComment(parser, context, type, start);
      return state;
  }
  /**
   * Skips multiline comment
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-annexB-MultiLineComment)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param state Scanner state
   */
  function skipMultiLineComment(parser, context, state) {
      const start = parser.index;
      const collectable = !!(context & exports.Context.OptionsComments);
      while (parser.index < parser.length) {
          switch (parser.source.charCodeAt(parser.index)) {
              case 42 /* Asterisk */:
                  parser.index++;
                  parser.column++;
                  state &= ~exports.ScannerState.LastIsCR;
                  if (consumeOpt(parser, 47 /* Slash */)) {
                      if (collectable)
                          addComment(parser, context, 'MultiLine', start);
                      return state;
                  }
                  break;
              // Mark multiline comments containing linebreaks as new lines
              // so we can perfectly handle edge cases like: '1/*\n*/--> a comment'
              case 13 /* CarriageReturn */:
                  state |= exports.ScannerState.NewLine | exports.ScannerState.LastIsCR;
                  advanceNewline(parser);
                  break;
              case 10 /* LineFeed */:
                  consumeLineFeed(parser, state);
                  state = state & ~exports.ScannerState.LastIsCR | exports.ScannerState.NewLine;
                  break;
              case 8232 /* LineSeparator */:
              case 8233 /* ParagraphSeparator */:
                  state = state & ~exports.ScannerState.LastIsCR | exports.ScannerState.NewLine;
                  advanceNewline(parser);
                  break;
              default:
                  state &= ~exports.ScannerState.LastIsCR;
                  parser.index++;
                  parser.column++;
          }
      }
      // Unterminated multi-line comment.
      tolerant(parser, context, 8 /* UnterminatedComment */);
  }
  /**
   * Add comments
   *
   * @param parser Parser object
   * @param context Context masks
   * @param type  Comment type
   * @param commentStart Start position of comment
   */
  function addComment(parser, context, type, commentStart) {
      const { index, startIndex: start, startLine, startColumn, lastLine, lastColumn } = parser;
      const comment = {
          type,
          value: parser.source.slice(commentStart, type === 'MultiLine' ? index - 2 : index),
          start,
          end: index,
      };
      if (context & exports.Context.OptionsLoc) {
          comment.loc = {
              start: { line: startLine, column: startColumn },
              end: { line: lastLine, column: lastColumn },
          };
      }
      parser.comments.push(comment);
  }

  /**
   * Scan
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-punctuatorss)
   * @see [Link](https://tc39.github.io/ecma262/#sec-names-and-keywords)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scan(parser, context) {
      parser.flags &= ~exports.Flags.NewLine | exports.Flags.EscapedKeyword;
      const lineStart = parser.index === 0;
      let state = exports.ScannerState.None;
      while (parser.index < parser.length) {
          if (!lineStart) {
              parser.startIndex = parser.index;
              parser.startColumn = parser.column;
              parser.startLine = parser.line;
          }
          const first = parser.source.charCodeAt(parser.index);
          if (first > 128 /* MaxAsciiCharacter */) {
              switch (first) {
                  case 8232 /* LineSeparator */:
                  case 8233 /* ParagraphSeparator */:
                      state = state & ~exports.ScannerState.LastIsCR | exports.ScannerState.NewLine;
                      advanceNewline(parser);
                      break;
                  case 65519 /* ByteOrderMark */:
                  case 160 /* NonBreakingSpace */:
                  case 5760 /* Ogham */:
                  case 8192 /* EnQuad */:
                  case 8193 /* EmQuad */:
                  case 8194 /* EnSpace */:
                  case 8195 /* EmSpace */:
                  case 8196 /* ThreePerEmSpace */:
                  case 8197 /* FourPerEmSpace */:
                  case 8198 /* SixPerEmSpace */:
                  case 8199 /* FigureSpace */:
                  case 8200 /* PunctuationSpace */:
                  case 8201 /* ThinSpace */:
                  case 8202 /* HairSpace */:
                  case 8239 /* NarrowNoBreakSpace */:
                  case 8287 /* MathematicalSpace */:
                  case 12288 /* IdeographicSpace */:
                  case 65279 /* Zwnbs */:
                  case 8205 /* Zwj */:
                      parser.index++;
                      parser.column++;
                      break;
                  default:
                      return scanMaybeIdentifier(parser, context, first);
              }
          }
          else {
              // Note: Here we first get rid of LT and  WS, then we make sure that the lookup time
              // for the single punctuator char is short as possible. A single punctuator
              // char is a valid token that cannot also be a prefix of a combination
              // of long tokens - e.g. '(', ')' and '=' is valid. '==' is not.
              switch (first) {
                  case 13 /* CarriageReturn */:
                      state |= exports.ScannerState.NewLine | exports.ScannerState.LastIsCR;
                      advanceNewline(parser);
                      break;
                  case 10 /* LineFeed */:
                      consumeLineFeed(parser, state);
                      state = state & ~exports.ScannerState.LastIsCR | exports.ScannerState.NewLine;
                      break;
                  case 9 /* Tab */:
                  case 11 /* VerticalTab */:
                  case 12 /* FormFeed */:
                  case 32 /* Space */:
                      parser.index++;
                      parser.column++;
                      break;
                  // `(`
                  case 40 /* LeftParen */:
                      parser.index++;
                      parser.column++;
                      return 50331659 /* LeftParen */;
                  // `)`
                  case 41 /* RightParen */:
                      parser.index++;
                      parser.column++;
                      return 16 /* RightParen */;
                  // `,`
                  case 44 /* Comma */:
                      parser.index++;
                      parser.column++;
                      return 16777234 /* Comma */;
                  // `:`
                  case 58 /* Colon */:
                      parser.index++;
                      parser.column++;
                      return 16777237 /* Colon */;
                  // `;`
                  case 59 /* Semicolon */:
                      parser.index++;
                      parser.column++;
                      return 17825809 /* Semicolon */;
                  // `?`
                  case 63 /* QuestionMark */:
                      parser.index++;
                      parser.column++;
                      return 22 /* QuestionMark */;
                  // `]`
                  case 93 /* RightBracket */:
                      parser.index++;
                      parser.column++;
                      return 20 /* RightBracket */;
                  // `{`
                  case 123 /* LeftBrace */:
                      parser.index++;
                      parser.column++;
                      return 41943052 /* LeftBrace */;
                  // `}`
                  case 125 /* RightBrace */:
                      parser.index++;
                      parser.column++;
                      return 17825807 /* RightBrace */;
                  // `~`
                  case 126 /* Tilde */:
                      parser.index++;
                      parser.column++;
                      return 301989934 /* Complement */;
                  // `[`
                  case 91 /* LeftBracket */:
                      parser.index++;
                      parser.column++;
                      return 41943059 /* LeftBracket */;
                  // `@`
                  case 64 /* At */:
                      parser.index++;
                      parser.column++;
                      return 120 /* At */;
                  // `/`, `/=`, `/>`
                  case 47 /* Slash */:
                      {
                          parser.index++;
                          parser.column++;
                          if (parser.index >= parser.length)
                              return 167774773 /* Divide */;
                          switch (parser.source.charCodeAt(parser.index)) {
                              case 47 /* Slash */:
                                  {
                                      parser.index++;
                                      parser.column++;
                                      state = skipSingleLineComment(parser, context, state, 'SingleLine');
                                      continue;
                                  }
                              case 42 /* Asterisk */:
                                  {
                                      parser.index++;
                                      parser.column++;
                                      state = skipMultiLineComment(parser, context, state);
                                      continue;
                                  }
                              case 61 /* EqualSign */:
                                  {
                                      parser.index++;
                                      parser.column++;
                                      return 100663333 /* DivideAssign */;
                                  }
                              default:
                                  return 167774773 /* Divide */;
                          }
                      }
                  // `-`, `--`, `-=`
                  case 45 /* Hyphen */:
                      {
                          parser.index++;
                          parser.column++; // skip `-`
                          const next = parser.source.charCodeAt(parser.index);
                          switch (next) {
                              case 45 /* Hyphen */:
                                  {
                                      parser.index++;
                                      parser.column++;
                                      if ((state & exports.ScannerState.NewLine || lineStart) &&
                                          consumeOpt(parser, 62 /* GreaterThan */)) {
                                          state = skipSingleHTMLComment(parser, context, state, 'HTMLClose');
                                          continue;
                                      }
                                      return 570425372 /* Decrement */;
                                  }
                              case 61 /* EqualSign */:
                                  {
                                      parser.index++;
                                      parser.column++;
                                      return 67108899 /* SubtractAssign */;
                                  }
                              default:
                                  return 436209968 /* Subtract */;
                          }
                      }
                  // `<`, `<=`, `<<`, `<<=`, `</`,  <!--
                  case 60 /* LessThan */:
                      parser.index++;
                      parser.column++; // skip `<`
                      if (consumeOpt(parser, 33 /* Exclamation */) &&
                          consumeOpt(parser, 45 /* Hyphen */) &&
                          consumeOpt(parser, 45 /* Hyphen */)) {
                          state = skipSingleHTMLComment(parser, context, state, 'HTMLOpen');
                          continue;
                      }
                      switch (parser.source.charCodeAt(parser.index)) {
                          case 60 /* LessThan */:
                              parser.index++;
                              parser.column++;
                              return consumeOpt(parser, 61 /* EqualSign */) ?
                                  67108894 /* ShiftLeftAssign */ :
                                  167774273 /* ShiftLeft */;
                          case 61 /* EqualSign */:
                              parser.index++;
                              parser.column++;
                              return 167774013 /* LessThanOrEqual */;
                          case 47 /* Slash */:
                              {
                                  if (!(context & exports.Context.OptionsJSX))
                                      break;
                                  const index = parser.index + 1;
                                  // Check that it's not a comment start.
                                  if (index < parser.length) {
                                      const next = parser.source.charCodeAt(index);
                                      if (next === 42 /* Asterisk */ || next === 47 /* Slash */)
                                          break;
                                  }
                                  parser.index++;
                                  parser.column++;
                                  return 25 /* JSXClose */;
                              }
                          default: // ignore
                              return 167774015 /* LessThan */;
                      }
                  // `!`, `!=`, `!==`
                  case 33 /* Exclamation */:
                      parser.index++;
                      parser.column++;
                      if (!consumeOpt(parser, 61 /* EqualSign */))
                          return 301989933 /* Negate */;
                      if (!consumeOpt(parser, 61 /* EqualSign */))
                          return 167773756 /* LooseNotEqual */;
                      return 167773754 /* StrictNotEqual */;
                  // `'string'`, `"string"`
                  case 39 /* SingleQuote */:
                  case 34 /* DoubleQuote */:
                      return scanString(parser, context, first);
                  // `%`, `%=`
                  case 37 /* Percent */:
                      parser.index++;
                      parser.column++;
                      if (!consumeOpt(parser, 61 /* EqualSign */))
                          return 167774772 /* Modulo */;
                      return 67108902 /* ModuloAssign */;
                  // `&`, `&&`, `&=`
                  case 38 /* Ampersand */:
                      {
                          parser.index++;
                          parser.column++;
                          const next = parser.source.charCodeAt(parser.index);
                          if (next === 38 /* Ampersand */) {
                              parser.index++;
                              parser.column++;
                              return 169869879 /* LogicalAnd */;
                          }
                          if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              return 67108905 /* BitwiseAndAssign */;
                          }
                          return 167773508 /* BitwiseAnd */;
                      }
                  // `*`, `**`, `*=`, `**=`
                  case 42 /* Asterisk */:
                      {
                          parser.index++;
                          parser.column++;
                          if (parser.index >= parser.length)
                              return 167774771 /* Multiply */;
                          const next = parser.source.charCodeAt(parser.index);
                          if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              return 67108900 /* MultiplyAssign */;
                          }
                          if (next !== 42 /* Asterisk */)
                              return 167774771 /* Multiply */;
                          parser.index++;
                          parser.column++;
                          if (!consumeOpt(parser, 61 /* EqualSign */))
                              return 167775030 /* Exponentiate */;
                          return 67108897 /* ExponentiateAssign */;
                      }
                  // `+`, `++`, `+=`
                  case 43 /* Plus */:
                      {
                          parser.index++;
                          parser.column++;
                          if (parser.index >= parser.length)
                              return 436209967 /* Add */;
                          const next = parser.source.charCodeAt(parser.index);
                          if (next === 43 /* Plus */) {
                              parser.index++;
                              parser.column++;
                              return 570425371 /* Increment */;
                          }
                          if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              return 67108898 /* AddAssign */;
                          }
                          return 436209967 /* Add */;
                      }
                  // `\\u{N}var`
                  case 92 /* Backslash */:
                      return scanIdentifier(parser, context);
                  // `=`, `==`, `===`, `=>`
                  case 61 /* EqualSign */:
                      {
                          parser.index++;
                          parser.column++;
                          const next = parser.source.charCodeAt(parser.index);
                          if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              if (consumeOpt(parser, 61 /* EqualSign */)) {
                                  return 167773753 /* StrictEqual */;
                              }
                              else {
                                  return 167773755 /* LooseEqual */;
                              }
                          }
                          else if (next === 62 /* GreaterThan */) {
                              parser.index++;
                              parser.column++;
                              return 10 /* Arrow */;
                          }
                          return 83886109 /* Assign */;
                      }
                  // `>`, `>=`, `>>`, `>>>`, `>>=`, `>>>=`
                  case 62 /* GreaterThan */:
                      {
                          parser.index++;
                          parser.column++;
                          if (parser.index >= parser.length)
                              return 167774016 /* GreaterThan */;
                          if (context & exports.Context.InJSXChild)
                              return 167774016 /* GreaterThan */;
                          let next = parser.source.charCodeAt(parser.index);
                          if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              return 167774014 /* GreaterThanOrEqual */;
                          }
                          if (next !== 62 /* GreaterThan */)
                              return 167774016 /* GreaterThan */;
                          parser.index++;
                          parser.column++;
                          next = parser.source.charCodeAt(parser.index);
                          if (next === 62 /* GreaterThan */) {
                              parser.index++;
                              parser.column++;
                              if (consumeOpt(parser, 61 /* EqualSign */)) {
                                  return 67108896 /* LogicalShiftRightAssign */;
                              }
                              else {
                                  return 167774275 /* LogicalShiftRight */;
                              }
                          }
                          else if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              return 67108895 /* ShiftRightAssign */;
                          }
                          return 167774274 /* ShiftRight */;
                      }
                  // `^`, `^=`
                  case 94 /* Caret */:
                      parser.index++;
                      parser.column++;
                      if (!consumeOpt(parser, 61 /* EqualSign */))
                          return 167773254 /* BitwiseXor */;
                      return 67108903 /* BitwiseXorAssign */;
                  // ``string``
                  case 96 /* Backtick */:
                      return scanTemplate(parser, context);
                  // `|`, `||`, `|=`
                  case 124 /* VerticalBar */:
                      {
                          parser.index++;
                          parser.column++;
                          const next = parser.source.charCodeAt(parser.index);
                          if (next === 124 /* VerticalBar */) {
                              parser.index++;
                              parser.column++;
                              return 169869624 /* LogicalOr */;
                          }
                          else if (next === 61 /* EqualSign */) {
                              parser.index++;
                              parser.column++;
                              return 67108904 /* BitwiseOrAssign */;
                          }
                          return 167772997 /* BitwiseOr */;
                      }
                  // `.`, `...`, `.123` (numeric literal)
                  case 46 /* Period */:
                      {
                          let index = parser.index + 1;
                          const next = parser.source.charCodeAt(index);
                          if (next >= 48 /* Zero */ && next <= 57 /* Nine */) {
                              scanNumericLiteral(parser, context, exports.NumericState.Float);
                              return 33554434 /* NumericLiteral */;
                          }
                          else if (next === 46 /* Period */) {
                              index++;
                              if (index < parser.length &&
                                  parser.source.charCodeAt(index) === 46 /* Period */) {
                                  parser.index = index + 1;
                                  parser.column += 3;
                                  return 14 /* Ellipsis */;
                              }
                          }
                          parser.index++;
                          parser.column++;
                          return 16777229 /* Period */;
                      }
                  // `#`
                  case 35 /* Hash */:
                      {
                          parser.index++;
                          parser.column++;
                          const index = parser.index;
                          const next = parser.source.charCodeAt(index);
                          if (context & exports.Context.OptionsShebang &&
                              lineStart &&
                              next === 33 /* Exclamation */) {
                              parser.index = index + 1;
                              skipSingleLineComment(parser, context, exports.ScannerState.None, 'SheBang');
                              continue;
                          }
                          return scanPrivateName(parser, context);
                      }
                  // `0`...`9`
                  case 48 /* Zero */:
                      {
                          parser.index++;
                          parser.column++;
                          switch (parser.source.charCodeAt(parser.index)) {
                              // Hex number - '0x', '0X'
                              case 88 /* UpperX */:
                              case 120 /* LowerX */:
                                  return scanHexIntegerLiteral(parser, context);
                              // Binary number - '0b', '0B'
                              case 66 /* UpperB */:
                              case 98 /* LowerB */:
                                  return scanOctalOrBinary(parser, context, 2);
                              // Octal number - '0o', '0O'
                              case 79 /* UpperO */:
                              case 111 /* LowerO */:
                                  return scanOctalOrBinary(parser, context, 8);
                              default:
                                  // Implicit octal digits startign with '0'
                                  return scanImplicitOctalDigits(parser, context);
                          }
                      }
                  case 49 /* One */:
                  case 50 /* Two */:
                  case 51 /* Three */:
                  case 52 /* Four */:
                  case 53 /* Five */:
                  case 54 /* Six */:
                  case 55 /* Seven */:
                  case 56 /* Eight */:
                  case 57 /* Nine */:
                      return scanNumericLiteral(parser, context);
                  // `a`...`z`, `A`...`Z`, `_var`, `$var`
                  case 65 /* UpperA */:
                  case 66 /* UpperB */:
                  case 67 /* UpperC */:
                  case 68 /* UpperD */:
                  case 69 /* UpperE */:
                  case 70 /* UpperF */:
                  case 71 /* UpperG */:
                  case 72 /* UpperH */:
                  case 73 /* UpperI */:
                  case 74 /* UpperJ */:
                  case 75 /* UpperK */:
                  case 76 /* UpperL */:
                  case 77 /* UpperM */:
                  case 78 /* UpperN */:
                  case 79 /* UpperO */:
                  case 80 /* UpperP */:
                  case 81 /* UpperQ */:
                  case 82 /* UpperR */:
                  case 83 /* UpperS */:
                  case 84 /* UpperT */:
                  case 85 /* UpperU */:
                  case 86 /* UpperV */:
                  case 87 /* UpperW */:
                  case 88 /* UpperX */:
                  case 89 /* UpperY */:
                  case 90 /* UpperZ */:
                  case 36 /* Dollar */:
                  case 95 /* Underscore */:
                  case 97 /* LowerA */:
                  case 98 /* LowerB */:
                  case 99 /* LowerC */:
                  case 100 /* LowerD */:
                  case 101 /* LowerE */:
                  case 102 /* LowerF */:
                  case 103 /* LowerG */:
                  case 104 /* LowerH */:
                  case 105 /* LowerI */:
                  case 106 /* LowerJ */:
                  case 107 /* LowerK */:
                  case 108 /* LowerL */:
                  case 109 /* LowerM */:
                  case 110 /* LowerN */:
                  case 111 /* LowerO */:
                  case 112 /* LowerP */:
                  case 113 /* LowerQ */:
                  case 114 /* LowerR */:
                  case 115 /* LowerS */:
                  case 116 /* LowerT */:
                  case 117 /* LowerU */:
                  case 118 /* LowerV */:
                  case 119 /* LowerW */:
                  case 120 /* LowerX */:
                  case 121 /* LowerY */:
                  case 122 /* LowerZ */:
                  default:
                      return scanIdentifier(parser, context, first);
              }
          }
      }
      return 1048576 /* EndOfSource */;
  }

  /**
   * Scans regular expression
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanRegularExpression(parser, context) {
      const bodyStart = parser.index;
      let preparseState = exports.RegexState.Empty;
      loop: while (true) {
          const ch = parser.source.charCodeAt(parser.index);
          parser.index++;
          parser.column++;
          if (preparseState & exports.RegexState.Escape) {
              preparseState &= ~exports.RegexState.Escape;
          }
          else {
              switch (ch) {
                  case 47 /* Slash */:
                      if (!preparseState)
                          break loop;
                      else
                          break;
                  case 92 /* Backslash */:
                      preparseState |= exports.RegexState.Escape;
                      break;
                  case 91 /* LeftBracket */:
                      preparseState |= exports.RegexState.Class;
                      break;
                  case 93 /* RightBracket */:
                      preparseState &= exports.RegexState.Escape;
                      break;
                  case 13 /* CarriageReturn */:
                  case 10 /* LineFeed */:
                  case 8232 /* LineSeparator */:
                  case 8233 /* ParagraphSeparator */:
                      report(parser, 7 /* UnterminatedRegExp */);
                  default: // ignore
              }
          }
          if (parser.index >= parser.source.length) {
              report(parser, 7 /* UnterminatedRegExp */);
          }
      }
      const bodyEnd = parser.index - 1;
      let mask = exports.RegexFlags.Empty;
      const { index: flagStart } = parser;
      loop: while (parser.index < parser.source.length) {
          const code = parser.source.charCodeAt(parser.index);
          switch (code) {
              case 103 /* LowerG */:
                  if (mask & exports.RegexFlags.Global)
                      tolerant(parser, context, 15 /* DuplicateRegExpFlag */, 'g');
                  mask |= exports.RegexFlags.Global;
                  break;
              case 105 /* LowerI */:
                  if (mask & exports.RegexFlags.IgnoreCase)
                      tolerant(parser, context, 15 /* DuplicateRegExpFlag */, 'i');
                  mask |= exports.RegexFlags.IgnoreCase;
                  break;
              case 109 /* LowerM */:
                  if (mask & exports.RegexFlags.Multiline)
                      tolerant(parser, context, 15 /* DuplicateRegExpFlag */, 'm');
                  mask |= exports.RegexFlags.Multiline;
                  break;
              case 117 /* LowerU */:
                  if (mask & exports.RegexFlags.Unicode)
                      tolerant(parser, context, 15 /* DuplicateRegExpFlag */, 'u');
                  mask |= exports.RegexFlags.Unicode;
                  break;
              case 121 /* LowerY */:
                  if (mask & exports.RegexFlags.Sticky)
                      tolerant(parser, context, 15 /* DuplicateRegExpFlag */, 'y');
                  mask |= exports.RegexFlags.Sticky;
                  break;
              case 115 /* LowerS */:
                  if (mask & exports.RegexFlags.DotAll)
                      tolerant(parser, context, 15 /* DuplicateRegExpFlag */, 's');
                  mask |= exports.RegexFlags.DotAll;
                  break;
              default:
                  if (!isIdentifierPart(code))
                      break loop;
                  report(parser, 16 /* UnexpectedTokenRegExpFlag */, fromCodePoint(code));
          }
          parser.index++;
          parser.column++;
      }
      const flags = parser.source.slice(flagStart, parser.index);
      const pattern = parser.source.slice(bodyStart, bodyEnd);
      parser.tokenRegExp = { pattern, flags };
      if (context & exports.Context.OptionsRaw)
          parser.tokenRaw = parser.source.slice(parser.startIndex, parser.index);
      parser.tokenValue = validate(parser, context, pattern, flags);
      return 33554436 /* RegularExpression */;
  }
  /**
   * Validates regular expressions
   *
   *
   * @param parser Parser instance
   * @param context Context masks
   * @param pattern Regexp body
   * @param flags Regexp flags
   */
  function validate(parser, context, pattern, flags) {
      if (!(context & exports.Context.OptionsNode)) {
          try {
          }
          catch (e) {
              report(parser, 7 /* UnterminatedRegExp */);
          }
      }
      try {
          return new RegExp(pattern, flags);
      }
      catch (e) {
          return null;
      }
  }

  // 12.15.5 Destructuring Assignment
  /**
   * Parses either a binding identifier or binding pattern
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseBindingIdentifierOrPattern(parser, context, args = []) {
      const { token } = parser;
      if (token & 8388608 /* IsBindingPattern */) {
          return token === 41943052 /* LeftBrace */ ?
              parserObjectAssignmentPattern(parser, context) :
              parseArrayAssignmentPattern(parser, context, args);
      }
      else if (token & (262144 /* IsAwait */ | 1073741824 /* IsYield */)) {
          if (token & 262144 /* IsAwait */ && (context & (exports.Context.Async | exports.Context.Module))) {
              tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
          }
          else if (token & 1073741824 /* IsYield */ && (context & (exports.Context.Yield | exports.Context.Strict))) {
              tolerant(parser, context, 49 /* YieldBindingIdentifier */);
          }
      }
      args.push(parser.tokenValue);
      return parseBindingIdentifier(parser, context);
  }
  /**
   * Parse binding identifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-BindingIdentifier)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseBindingIdentifier(parser, context) {
      const { token } = parser;
      if (token & 4194304 /* IsEvalOrArguments */) {
          if (context & exports.Context.Strict)
              tolerant(parser, context, 17 /* StrictLHSAssignment */);
          parser.flags |= exports.Flags.StrictEvalArguments;
      }
      else if (context & exports.Context.BlockScope && token === 33574984 /* LetKeyword */) {
          // let is disallowed as a lexically bound name
          tolerant(parser, context, 27 /* LetInLexicalBinding */);
      }
      else if (hasBit(token, 20480 /* FutureReserved */)) {
          if (context & exports.Context.Strict)
              tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
          parser.flags |= exports.Flags.StrictFunctionName;
      }
      else if (!isValidIdentifier(context, token)) {
          tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
      }
      const pos = getLocation(parser);
      const name = parser.tokenValue;
      nextToken(parser, context);
      return finishNode(context, parser, pos, {
          type: 'Identifier',
          name,
      });
  }
  /**
   * Parse assignment rest element
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseAssignmentRestElement(parser, context, args) {
      const pos = getLocation(parser);
      expect(parser, context, 14 /* Ellipsis */);
      const argument = parseBindingIdentifierOrPattern(parser, context, args);
      if (parser.token === 16777234 /* Comma */)
          tolerant(parser, context, 88 /* RestWithComma */);
      return finishNode(context, parser, pos, {
          type: 'RestElement',
          argument,
      });
  }
  /**
   * Parse rest property
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestProperty)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  // tslint:disable-next-line:function-name
  function AssignmentRestProperty(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 14 /* Ellipsis */);
      const { token } = parser;
      const argument = parseBindingIdentifierOrPattern(parser, context);
      if (hasBit(token, 8388608 /* IsBindingPattern */))
          tolerant(parser, context, 94 /* InvalidRestBindingPattern */);
      if (parser.token === 16777234 /* Comma */)
          tolerant(parser, context, 88 /* RestWithComma */);
      return finishNode(context, parser, pos, {
          type: 'RestElement',
          argument,
      });
  }
  /**
   * ArrayAssignmentPattern[Yield] :
   *   [ Elisionopt AssignmentRestElement[?Yield]opt ]
   *   [ AssignmentElementList[?Yield] ]
   *   [ AssignmentElementList[?Yield] , Elisionopt AssignmentRestElement[?Yield]opt ]
   *
   * AssignmentRestElement[Yield] :
   *   ... DestructuringAssignmentTarget[?Yield]
   *
   * AssignmentElementList[Yield] :
   *   AssignmentElisionElement[?Yield]
   *   AssignmentElementList[?Yield] , AssignmentElisionElement[?Yield]
   *
   * AssignmentElisionElement[Yield] :
   *   Elisionopt AssignmentElement[?Yield]
   *
   * AssignmentElement[Yield] :
   *   DestructuringAssignmentTarget[?Yield] Initializer[In,?Yield]opt
   *
   * DestructuringAssignmentTarget[Yield] :
   *   LeftHandSideExpression[?Yield]
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
   *
   * @param Parser object
   * @param Context masks
   */
  function parseArrayAssignmentPattern(parser, context, args) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      const elements = [];
      while (parser.token !== 20 /* RightBracket */) {
          if (consume(parser, context, 16777234 /* Comma */)) {
              elements.push(null);
          }
          else {
              if (parser.token === 14 /* Ellipsis */) {
                  elements.push(parseAssignmentRestElement(parser, context, args));
                  break;
              }
              else {
                  elements.push(parseExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseBindingInitializer));
              }
              if (parser.token !== 20 /* RightBracket */)
                  expect(parser, context, 16777234 /* Comma */);
          }
      }
      expect(parser, context, 20 /* RightBracket */);
      // tslint:disable-next-line:no-object-literal-type-assertion
      return finishNode(context, parser, pos, {
          type: 'ArrayPattern',
          elements,
      });
  }
  /**
   * Parse object assignment pattern
   *
   * @param Parser Parser object
   * @param Context Context masks
   */
  function parserObjectAssignmentPattern(parser, context) {
      const pos = getLocation(parser);
      const properties = [];
      expect(parser, context, 41943052 /* LeftBrace */);
      while (parser.token !== 17825807 /* RightBrace */) {
          if (parser.token === 14 /* Ellipsis */) {
              properties.push(AssignmentRestProperty(parser, context));
              break;
          }
          properties.push(parseAssignmentProperty(parser, context));
          if (parser.token !== 17825807 /* RightBrace */)
              expect(parser, context, 16777234 /* Comma */);
      }
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'ObjectPattern',
          properties,
      });
  }
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
  function parseAssignmentPattern(parser, context, left, pos) {
      return finishNode(context, parser, pos, {
          type: 'AssignmentPattern',
          left,
          right: parseExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression),
      });
  }
  /**
   * Parse binding initializer
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentPattern)
   * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayAssignmentPattern)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseBindingInitializer(parser, context) {
      const pos = getLocation(parser);
      const left = parseBindingIdentifierOrPattern(parser, context);
      return !consume(parser, context, 83886109 /* Assign */) ?
          left :
          finishNode(context, parser, pos, {
              type: 'AssignmentPattern',
              left,
              right: parseAssignmentExpression(parser, context | exports.Context.AllowIn),
          });
  }
  /**
   * Parse assignment property
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentProperty)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseAssignmentProperty(parser, context) {
      const pos = getLocation(parser);
      const { token } = parser;
      let key;
      let value;
      let computed = false;
      let shorthand = false;
      // single name binding
      if (token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          key = parseIdentifier(parser, context);
          shorthand = !consume(parser, context, 16777237 /* Colon */);
          if (shorthand) {
              const hasInitializer = consume(parser, context, 83886109 /* Assign */);
              if (context & exports.Context.Yield && token & 1073741824 /* IsYield */)
                  tolerant(parser, context, 49 /* YieldBindingIdentifier */);
              if (!isValidIdentifier(context, token))
                  tolerant(parser, context, 46 /* UnexpectedReserved */);
              value = hasInitializer ? parseAssignmentPattern(parser, context, key, pos) : key;
          }
          else
              value = parseBindingInitializer(parser, context);
      }
      else {
          computed = token === 41943059 /* LeftBracket */;
          key = parsePropertyName(parser, context);
          expect(parser, context, 16777237 /* Colon */);
          value = parseExpressionCoverGrammar(parser, context, parseBindingInitializer);
      }
      // Note! The specs specifically state that this is "assignment property", but
      // nothing in ESTree specs explains the difference between this "property" and the "property" for object literals.
      return finishNode(context, parser, pos, {
          type: 'Property',
          kind: 'init',
          key,
          computed,
          value,
          method: false,
          shorthand,
      });
  }

  // JSX Specification
  // https://facebook.github.io/jsx/
  /**
   * Parses JSX element or JSX fragment
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXRootElement(parser, context) {
      const pos = getLocation(parser);
      let children = [];
      let closingElement = null;
      let selfClosing = false;
      let openingElement;
      expect(parser, context, 167774015 /* LessThan */);
      const isFragment = parser.token === 167774016 /* GreaterThan */;
      if (isFragment) {
          openingElement = parseJSXOpeningFragment(parser, context, pos);
      }
      else {
          const name = parseJSXElementName(parser, context);
          const attributes = parseJSXAttributes(parser, context);
          selfClosing = consume(parser, context, 167774773 /* Divide */);
          openingElement = parseJSXOpeningElement(parser, context, name, attributes, selfClosing, pos);
      }
      if (isFragment)
          return parseJSXFragment(parser, context, openingElement, pos);
      if (!selfClosing) {
          children = parseJSXChildren(parser, context);
          closingElement = parseJSXClosingElement(parser, context);
          const open = isEqualTagNames(openingElement.name);
          const close = isEqualTagNames(closingElement.name);
          if (open !== close)
              report(parser, 85 /* ExpectedJSXClosingTag */, close);
      }
      return finishNode(context, parser, pos, {
          type: 'JSXElement',
          children,
          openingElement,
          closingElement,
      });
  }
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
  function parseJSXOpeningElement(parser, context, name, attributes, selfClosing, pos) {
      if (context & exports.Context.InJSXChild && selfClosing)
          expect(parser, context, 167774016 /* GreaterThan */);
      else
          nextJSXToken(parser);
      return finishNode(context, parser, pos, {
          type: 'JSXOpeningElement',
          name,
          attributes,
          selfClosing,
      });
  }
  /**
   * Parse JSX fragment
   *
   * @param parser Parser object
   * @param context Context masks
   * @param openingElement Opening fragment
   * @param pos Line / Column location
   */
  function parseJSXFragment(parser, context, openingElement, pos) {
      const children = parseJSXChildren(parser, context);
      const closingFragment = parseJSXClosingFragment(parser, context);
      return finishNode(context, parser, pos, {
          type: 'JSXFragment',
          children,
          openingElement,
          closingFragment,
      });
  }
  /**
   * Parse JSX opening fragmentD
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Line / Column location
   */
  function parseJSXOpeningFragment(parser, context, pos) {
      nextJSXToken(parser);
      return finishNode(context, parser, pos, {
          type: 'JSXOpeningFragment',
      });
  }
  /**
   * Prime the scanner and advance to the next JSX token in the stream
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function nextJSXToken(parser) {
      return parser.token = scanJSXToken(parser);
  }
  /**
   * Mini scanner
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanJSXToken(parser) {
      if (parser.index >= parser.source.length)
          return 1048576 /* EndOfSource */;
      parser.lastIndex = parser.startIndex = parser.index;
      const char = parser.source.charCodeAt(parser.index);
      if (char === 60 /* LessThan */) {
          parser.index++;
          parser.column++;
          return consumeOpt(parser, 47 /* Slash */) ? 25 /* JSXClose */ : 167774015 /* LessThan */;
      }
      else if (char === 123 /* LeftBrace */) {
          parser.index++;
          parser.column++;
          return 41943052 /* LeftBrace */;
      }
      while (parser.index < parser.source.length) {
          parser.index++;
          parser.column++;
          const next = parser.source.charCodeAt(parser.index);
          if (next === 123 /* LeftBrace */ || next === 60 /* LessThan */)
              break;
      }
      return 121 /* JSXText */;
  }
  /**
   * Parses JSX children
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXChildren(parser, context) {
      const children = [];
      while (parser.token !== 25 /* JSXClose */) {
          children.push(parseJSXChild(parser, context));
      }
      return children;
  }
  /**
   * Parses JSX Text
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXText(parser, context) {
      const pos = getLocation(parser);
      const value = parser.source.slice(parser.startIndex, parser.index);
      parser.token = scanJSXToken(parser);
      const node = finishNode(context, parser, pos, {
          type: 'JSXText',
          value,
      });
      if (context & exports.Context.OptionsRaw)
          node.raw = value;
      return node;
  }
  /**
   * Parses JSX Child
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXChild(parser, context) {
      switch (parser.token) {
          case 33685505 /* Identifier */:
          case 121 /* JSXText */:
              return parseJSXText(parser, context);
          case 41943052 /* LeftBrace */:
              return parseJSXExpression(parser, context & ~exports.Context.InJSXChild);
          case 167774015 /* LessThan */:
              return parseJSXRootElement(parser, context & ~exports.Context.InJSXChild);
          default:
              report(parser, 0 /* Unexpected */);
      }
      return undefined; // note: get rid of this
  }
  /**
   * Parses JSX attributes
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXAttributes(parser, context) {
      const attributes = [];
      while (parser.index < parser.source.length) {
          if (parser.token === 167774773 /* Divide */ || parser.token === 167774016 /* GreaterThan */)
              break;
          attributes.push(parseJSXAttribute(parser, context));
      }
      return attributes;
  }
  /**
   * Parses JSX spread attribute
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXSpreadAttribute(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 41943052 /* LeftBrace */);
      expect(parser, context, 14 /* Ellipsis */);
      const expression = parseExpressionCoverGrammar(parser, context & ~exports.Context.InJSXChild, parseAssignmentExpression);
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'JSXSpreadAttribute',
          argument: expression,
      });
  }
  /**
   * Parses JSX namespace name
   *
   * @param parser Parser object
   * @param context Context masks
   * @param namespace Identifier
   * @param pos Line / Column location
   */
  function parseJSXNamespacedName(parser, context, namespace, pos) {
      expect(parser, context, 16777237 /* Colon */);
      const name = parseJSXIdentifier(parser, context);
      return finishNode(context, parser, pos, {
          type: 'JSXNamespacedName',
          namespace,
          name,
      });
  }
  /**
   * Parses JSX attribute name
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXAttributeName(parser, context) {
      const pos = getLocation(parser);
      const identifier = parseJSXIdentifier(parser, context);
      return parser.token === 16777237 /* Colon */ ?
          parseJSXNamespacedName(parser, context, identifier, pos) :
          identifier;
  }
  /**
   * Parses JSX Attribute value
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXAttributeValue(parser, context) {
      switch (scanJSXAttributeValue(parser, context)) {
          case 33554435 /* StringLiteral */:
              return parseLiteral(parser, context);
          case 41943052 /* LeftBrace */:
              return parseJSXExpressionContainer(parser, context | exports.Context.InJSXChild);
          case 167774015 /* LessThan */:
              return parseJSXRootElement(parser, context | exports.Context.InJSXChild);
          default:
              tolerant(parser, context, 87 /* InvalidJSXAttributeValue */);
              return undefined; // note: get rid of this
      }
  }
  /**
   * Parses JSX Attribute
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXAttribute(parser, context) {
      const pos = getLocation(parser);
      if (parser.token === 41943052 /* LeftBrace */)
          return parseJSXSpreadAttribute(parser, context);
      scanJSXIdentifier(parser);
      const attrName = parseJSXAttributeName(parser, context);
      const value = parser.token === 83886109 /* Assign */ ? parseJSXAttributeValue(parser, context) : null;
      return finishNode(context, parser, pos, {
          type: 'JSXAttribute',
          value: value,
          name: attrName,
      });
  }
  /**
   * Parses JSX Attribute value
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanJSXAttributeValue(parser, context) {
      parser.lastIndex = parser.index;
      const ch = parser.source.charCodeAt(parser.index);
      switch (ch) {
          case 34 /* DoubleQuote */:
          case 39 /* SingleQuote */:
              return scanJSXString(parser, context, ch);
          default:
              return nextToken(parser, context);
      }
  }
  /**
   * Parses JSX String
   *
   * @param parser Parser object
   * @param context Context masks
   * @param quote Code point
   */
  function scanJSXString(parser, context, quote) {
      const rawStart = parser.index;
      parser.index++;
      parser.column++;
      let ret = '';
      let ch = parser.source.charCodeAt(parser.index);
      while (ch !== quote) {
          ret += fromCodePoint(ch);
          parser.index++;
          parser.column++;
          ch = parser.source.charCodeAt(parser.index);
          if (parser.index >= parser.source.length)
              report(parser, 6 /* UnterminatedString */);
      }
      parser.index++;
      parser.column++; // skip the quote
      // raw
      if (context & exports.Context.OptionsRaw)
          parser.tokenRaw = parser.source.slice(rawStart, parser.index);
      parser.tokenValue = ret;
      return 33554435 /* StringLiteral */;
  }
  /**
   * Parses JJSX Empty Expression
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXEmptyExpression(parser, context) {
      const pos = getLocation(parser);
      return finishNode(context, parser, pos, {
          type: 'JSXEmptyExpression',
      });
  }
  /**
   * Parses JSX Spread child
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXSpreadChild(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 14 /* Ellipsis */);
      const expression = parseExpression(parser, context);
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'JSXSpreadChild',
          expression,
      });
  }
  /**
   * Parses JSX Expression container
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXExpressionContainer(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 41943052 /* LeftBrace */);
      // Note: JSX Expressions can't be empty
      if (parser.token === 17825807 /* RightBrace */)
          tolerant(parser, context, 84 /* NonEmptyJSXExpression */);
      const expression = parseExpressionCoverGrammar(parser, context & ~exports.Context.InJSXChild, parseAssignmentExpression);
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'JSXExpressionContainer',
          expression,
      });
  }
  /**
   * Parses JSX Expression
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Line / Column location
   */
  function parseJSXExpression(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 41943052 /* LeftBrace */);
      if (parser.token === 14 /* Ellipsis */)
          return parseJSXSpreadChild(parser, context);
      const expression = parser.token === 17825807 /* RightBrace */ ?
          parseJSXEmptyExpression(parser, context) :
          parseExpressionCoverGrammar(parser, context, parseAssignmentExpression);
      nextJSXToken(parser);
      return finishNode(context, parser, pos, {
          type: 'JSXExpressionContainer',
          expression,
      });
  }
  /**
   * Parses JSX Closing fragment
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXClosingFragment(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 25 /* JSXClose */);
      expect(parser, context, 167774016 /* GreaterThan */);
      return finishNode(context, parser, pos, {
          type: 'JSXClosingFragment',
      });
  }
  /**
   * Parses JSX Closing Element
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Line / Column location
   */
  function parseJSXClosingElement(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 25 /* JSXClose */);
      const name = parseJSXElementName(parser, context);
      if (context & exports.Context.InJSXChild)
          expect(parser, context, 167774016 /* GreaterThan */);
      else
          nextJSXToken(parser);
      return finishNode(context, parser, pos, {
          type: 'JSXClosingElement',
          name,
      });
  }
  /**
   * Parses JSX Identifier
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXIdentifier(parser, context) {
      const { token, tokenValue: name, tokenRaw: raw } = parser;
      if (!(token & (131072 /* IsIdentifier */ | 4096 /* Keyword */))) {
          tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      }
      const pos = getLocation(parser);
      nextToken(parser, context);
      const node = finishNode(context, parser, pos, {
          type: 'JSXIdentifier',
          name,
      });
      if (context & exports.Context.OptionsRawidentifiers)
          node.raw = raw;
      return node;
  }
  /**
   * Parses JSX Member expression
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Line / Column location
   */
  function parseJSXMemberExpression(parser, context, expr, pos) {
      // Note: In order to be able to parse cases like ''<A.B.C.D.E.foo-bar />', where the dash is located at the
      // end, we must rescan for the JSX Identifier now. This because JSX identifiers differ from normal identifiers
      scanJSXIdentifier(parser);
      return finishNode(context, parser, pos, {
          type: 'JSXMemberExpression',
          object: expr,
          property: parseJSXIdentifier(parser, context),
      });
  }
  /**
   * Parses JSX Element name
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseJSXElementName(parser, context) {
      const pos = getLocation(parser);
      scanJSXIdentifier(parser);
      let elementName = parseJSXIdentifier(parser, context);
      if (parser.token === 16777237 /* Colon */)
          return parseJSXNamespacedName(parser, context, elementName, pos);
      while (consume(parser, context, 16777229 /* Period */)) {
          elementName = parseJSXMemberExpression(parser, context, elementName, pos);
      }
      return elementName;
  }
  /**
   * Scans JSX Identifier
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function scanJSXIdentifier(parser) {
      const { token } = parser;
      if (token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          const firstCharPosition = parser.index;
          let ch = parser.source.charCodeAt(parser.index);
          while ((parser.index < parser.source.length) && (ch === 45 /* Hyphen */ || (isValidIdentifierPart(ch)))) {
              ch = readNext(parser);
          }
          parser.tokenValue += parser.source.substr(firstCharPosition, parser.index - firstCharPosition);
      }
      return parser.token;
  }

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
  function parseExpression(parser, context) {
      const pos = getLocation(parser);
      const expr = parseExpressionCoverGrammar(parser, context, parseAssignmentExpression);
      return parser.token === 16777234 /* Comma */ ?
          parseSequenceExpression(parser, context, expr, pos) :
          expr;
  }
  /**
   * Parse secuence expression
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseSequenceExpression(parser, context, left, pos) {
      const expressions = [left];
      while (consume(parser, context, 16777234 /* Comma */)) {
          expressions.push(parseExpressionCoverGrammar(parser, context, parseAssignmentExpression));
      }
      return finishNode(context, parser, pos, {
          type: 'SequenceExpression',
          expressions,
      });
  }
  /**
   * Parse yield expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-YieldExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseYieldExpression(parser, context, pos) {
      // YieldExpression[In] :
      //    yield
      //    yield [no LineTerminator here] AssignmentExpression[?In, Yield]
      //    yield [no LineTerminator here] * AssignmentExpression[?In, Yield]
      // https://tc39.github.io/ecma262/#sec-generator-function-definitions-static-semantics-early-errors
      if (context & exports.Context.InParameter)
          tolerant(parser, context, 51 /* YieldInParameter */);
      expect(parser, context, 1107316842 /* YieldKeyword */);
      let argument = null;
      let delegate = false;
      if (!(parser.flags & exports.Flags.NewLine)) {
          delegate = consume(parser, context, 167774771 /* Multiply */);
          // 'Token.IsExpressionStart' bitmask contains the complete set of
          // tokens that can appear after an AssignmentExpression, and none of them
          // can start an AssignmentExpression.
          if (delegate || parser.token & 33554432 /* IsExpressionStart */) {
              argument = parseAssignmentExpression(parser, context);
          }
      }
      return finishNode(context, parser, pos, {
          type: 'YieldExpression',
          argument,
          delegate,
      });
  }
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
  function parseAssignmentExpression(parser, context) {
      const pos = getLocation(parser);
      let { token } = parser;
      if (context & exports.Context.Yield && token & 1073741824 /* IsYield */)
          return parseYieldExpression(parser, context, pos);
      let expr = token & 524288 /* IsAsync */ && lookahead(parser, context, nextTokenisIdentifierOrParen)
          ? parserCoverCallExpressionAndAsyncArrowHead(parser, context)
          : parseConditionalExpression(parser, context, pos);
      if (parser.token === 10 /* Arrow */) {
          if (token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
              if (token & (20480 /* FutureReserved */ | 4194304 /* IsEvalOrArguments */)) {
                  // Invalid: ' yield => { 'use strict'; 0 };'
                  if (token & 20480 /* FutureReserved */) {
                      parser.flags |= exports.Flags.HasStrictReserved;
                  }
                  if (token & 4194304 /* IsEvalOrArguments */) {
                      if (context & exports.Context.Strict)
                          tolerant(parser, context, 47 /* StrictEvalArguments */);
                      parser.flags |= exports.Flags.StrictEvalArguments;
                  }
              }
              expr = [expr];
          }
          return parseArrowFunction(parser, context &= ~exports.Context.Async, pos, expr);
      }
      if (hasBit(parser.token, 67108864 /* IsAssignOp */)) {
          token = parser.token;
          if (context & exports.Context.Strict && nameIsArgumentsOrEval(expr.name)) {
              tolerant(parser, context, 17 /* StrictLHSAssignment */);
          }
          else if (consume(parser, context, 83886109 /* Assign */)) {
              if (!(parser.flags & exports.Flags.AllowDestructuring)) {
                  tolerant(parser, context, 73 /* InvalidDestructuringTarget */);
              }
              // Only re-interpret if not inside a formal parameter list
              if (!(context & exports.Context.InParameter))
                  reinterpret(parser, context, expr);
              if (context & exports.Context.InParen)
                  parser.flags |= exports.Flags.SimpleParameterList;
              if (parser.token & 262144 /* IsAwait */) {
                  setPendingError(parser);
                  parser.flags |= exports.Flags.HasAwait;
              }
              else if (context & exports.Context.InParen &&
                  context & (exports.Context.Strict | exports.Context.Yield) &&
                  parser.token & 1073741824 /* IsYield */) {
                  setPendingError(parser);
                  parser.flags |= exports.Flags.HasYield;
              }
          }
          else {
              if (!isValidSimpleAssignmentTarget(expr)) {
                  tolerant(parser, context, 5 /* InvalidLHSInAssignment */);
              }
              parser.flags &= ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding);
              nextToken(parser, context);
          }
          const right = parseExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression);
          parser.pendingExpressionError = null;
          return finishNode(context, parser, pos, {
              type: 'AssignmentExpression',
              left: expr,
              operator: tokenDesc(token),
              right,
          });
      }
      return expr;
  }
  /**
   * Parse conditional expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ConditionalExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseConditionalExpression(parser, context, pos) {
      const test = parseBinaryExpression(parser, context, 0, pos);
      if (!consume(parser, context, 22 /* QuestionMark */))
          return test;
      const consequent = parseExpressionCoverGrammar(parser, context & ~exports.Context.AllowDecorator | exports.Context.AllowIn, parseAssignmentExpression);
      expect(parser, context, 16777237 /* Colon */);
      return finishNode(context, parser, pos, {
          type: 'ConditionalExpression',
          test,
          consequent,
          alternate: parseExpressionCoverGrammar(parser, context, parseAssignmentExpression),
      });
  }
  /**
   * Parse binary expression.
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-exp-operator)
   * @see [Link](https://tc39.github.io/ecma262/#sec-binary-logical-operators)
   * @see [Link](https://tc39.github.io/ecma262/#sec-additive-operators)
   * @see [Link](https://tc39.github.io/ecma262/#sec-bitwise-shift-operators)
   * @see [Link](https://tc39.github.io/ecma262/#sec-equality-operators)
   * @see [Link](https://tc39.github.io/ecma262/#sec-binary-logical-operators)
   * @see [Link](https://tc39.github.io/ecma262/#sec-relational-operators)
   * @see [Link](https://tc39.github.io/ecma262/#sec-multiplicative-operators)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param minPrec Minimum precedence value
   * @param pos Line / Column info
   * @param Left Left hand side of the binary expression
   */
  function parseBinaryExpression(parser, context, minPrec, pos, left = parseUnaryExpression(parser, context)) {
      // Shift-reduce parser for the binary operator part of the JS expression
      // syntax.
      const bit = context & exports.Context.AllowIn ^ exports.Context.AllowIn;
      while (hasBit(parser.token, 167772160 /* IsBinaryOp */)) {
          const t = parser.token;
          const prec = t & 3840 /* Precedence */;
          const delta = (t === 167775030 /* Exponentiate */) << 8 /* PrecStart */;
          if (bit && t === 167786289 /* InKeyword */)
              break;
          // When the next token is no longer a binary operator, it's potentially the
          // start of an expression, so we break the loop
          if (prec + delta <= minPrec)
              break;
          nextToken(parser, context);
          left = finishNode(context, parser, pos, {
              type: t & 2097152 /* IsLogical */ ? 'LogicalExpression' : 'BinaryExpression',
              left,
              right: parseBinaryExpression(parser, context & ~exports.Context.AllowIn, prec, getLocation(parser)),
              operator: tokenDesc(t),
          });
      }
      return left;
  }
  /**
   * Parse await expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AwaitExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Location info
   */
  function parseAwaitExpression(parser, context, pos) {
      if (context & exports.Context.InParameter)
          tolerant(parser, context, 52 /* AwaitInParameter */);
      expect(parser, context, 34017389 /* AwaitKeyword */);
      return finishNode(context, parser, pos, {
          type: 'AwaitExpression',
          argument: parseUnaryExpression(parser, context),
      });
  }
  /**
   * Parses unary expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-UnaryExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseUnaryExpression(parser, context) {
      const pos = getLocation(parser);
      const { token } = parser;
      if (hasBit(token, 301989888 /* IsUnaryOp */)) {
          nextToken(parser, context);
          if (parser.flags & exports.Flags.EscapedKeyword) {
              tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
          }
          const argument = parseExpressionCoverGrammar(parser, context, parseUnaryExpression);
          if (parser.token === 167775030 /* Exponentiate */) {
              tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
          }
          if (context & exports.Context.Strict && token === 302002219 /* DeleteKeyword */) {
              if (argument.type === 'Identifier') {
                  tolerant(parser, context, 43 /* StrictDelete */);
              }
              else if (isPropertyWithPrivateFieldKey(argument)) {
                  tolerant(parser, context, 44 /* DeletePrivateField */);
              }
          }
          return finishNode(context, parser, pos, {
              type: 'UnaryExpression',
              operator: tokenDesc(token),
              argument,
              prefix: true,
          });
      }
      return context & exports.Context.Async && token & 262144 /* IsAwait */
          ? parseAwaitExpression(parser, context, pos)
          : parseUpdateExpression(parser, context, pos);
  }
  /**
   * Parses update expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-UpdateExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseUpdateExpression(parser, context, pos) {
      const { token } = parser;
      if (hasBit(parser.token, 570425344 /* IsUpdateOp */)) {
          nextToken(parser, context);
          const expr = parseLeftHandSideExpression(parser, context, pos);
          validateUpdateExpression(parser, context, expr, 'Prefix');
          return finishNode(context, parser, pos, {
              type: 'UpdateExpression',
              argument: expr,
              operator: tokenDesc(token),
              prefix: true,
          });
      }
      else if (context & exports.Context.OptionsJSX && token === 167774015 /* LessThan */) {
          return parseJSXRootElement(parser, context | exports.Context.InJSXChild);
      }
      const expression = parseLeftHandSideExpression(parser, context, pos);
      if (hasBit(parser.token, 570425344 /* IsUpdateOp */) && !(parser.flags & exports.Flags.NewLine)) {
          validateUpdateExpression(parser, context, expression, 'Postfix');
          const operator = parser.token;
          nextToken(parser, context);
          return finishNode(context, parser, pos, {
              type: 'UpdateExpression',
              argument: expression,
              operator: tokenDesc(operator),
              prefix: false,
          });
      }
      return expression;
  }
  /**
   * Parse assignment rest element
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentRestElement)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseRestElement(parser, context, args = []) {
      const pos = getLocation(parser);
      expect(parser, context, 14 /* Ellipsis */);
      if (context & exports.Context.InParen && parser.token & 262144 /* IsAwait */)
          parser.flags |= exports.Flags.HasAwait;
      const argument = parseBindingIdentifierOrPattern(parser, context, args);
      return finishNode(context, parser, pos, {
          type: 'RestElement',
          argument,
      });
  }
  /**
   * Parse spread element
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-SpreadElement)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseSpreadElement(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 14 /* Ellipsis */);
      const argument = restoreExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression);
      return finishNode(context, parser, pos, {
          type: 'SpreadElement',
          argument,
      });
  }
  /**
   * Parse left hand side expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-LeftHandSideExpression)
   *
   * @param Parser Parer instance
   * @param Context Contextmasks
   * @param pos Location info
   */
  function parseLeftHandSideExpression(parser, context, pos) {
      const expr = context & exports.Context.OptionsNext && parser.token === 33566810 /* ImportKeyword */
          ? parseCallImportOrMetaProperty(parser, context | exports.Context.AllowIn)
          : parseMemberExpression(parser, context | exports.Context.AllowIn, pos);
      return parseCallExpression(parser, context | exports.Context.AllowIn, pos, expr);
  }
  /**
   * Parse member expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-MemberExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Location info
   * @param expr Expression
   */
  function parseMemberExpression(parser, context, pos, expr = parsePrimaryExpression(parser, context)) {
      while (true) {
          switch (parser.token) {
              case 16777229 /* Period */: {
                  consume(parser, context, 16777229 /* Period */);
                  parser.flags = parser.flags & ~exports.Flags.AllowBinding | exports.Flags.AllowDestructuring;
                  const property = parseIdentifierNameOrPrivateName(parser, context);
                  expr = finishNode(context, parser, pos, {
                      type: 'MemberExpression',
                      object: expr,
                      computed: false,
                      property,
                  });
                  continue;
              }
              case 41943059 /* LeftBracket */: {
                  consume(parser, context, 41943059 /* LeftBracket */);
                  parser.flags = parser.flags & ~exports.Flags.AllowBinding | exports.Flags.AllowDestructuring;
                  const property = parseExpression(parser, context);
                  expect(parser, context, 20 /* RightBracket */);
                  expr = finishNode(context, parser, pos, {
                      type: 'MemberExpression',
                      object: expr,
                      computed: true,
                      property,
                  });
                  continue;
              }
              case 33554441 /* TemplateTail */: {
                  expr = finishNode(context, parser, pos, {
                      type: 'TaggedTemplateExpression',
                      tag: expr,
                      quasi: parseTemplateLiteral(parser, context),
                  });
                  continue;
              }
              case 33554440 /* TemplateCont */: {
                  expr = finishNode(context, parser, pos, {
                      type: 'TaggedTemplateExpression',
                      tag: expr,
                      quasi: parseTemplate(parser, context | exports.Context.TaggedTemplate),
                  });
                  continue;
              }
              default:
                  return expr;
          }
      }
  }
  /**
   * Parse call expression
   *
   * @param parser Parer instance
   * @param context Context masks
   * @param pos Line / Colum info
   * @param expr Expression
   */
  function parseCallExpression(parser, context, pos, expr) {
      while (true) {
          expr = parseMemberExpression(parser, context, pos, expr);
          if (parser.token !== 50331659 /* LeftParen */)
              return expr;
          const args = parseArgumentList(parser, context & ~exports.Context.AllowDecorator);
          expr = finishNode(context, parser, pos, {
              type: 'CallExpression',
              callee: expr,
              arguments: args,
          });
      }
  }
  /**
   * Parse cover call expression and async arrow head
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-CoverCallExpressionAndAsyncArrowHead)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parserCoverCallExpressionAndAsyncArrowHead(parser, context) {
      const pos = getLocation(parser);
      let expr = parseMemberExpression(parser, context | exports.Context.AllowIn, pos);
      // Here we jump right into it and parse a simple, faster sub-grammar for
      // async arrow / async identifier + call expression. This could have been done different
      // but ESTree sucks!
      //
      // - J.K. Thomas
      if (parser.token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          if (parser.token & 262144 /* IsAwait */)
              tolerant(parser, context, 40 /* DisallowedInContext */);
          return parseAsyncArrowFunction(parser, context, exports.ModifierState.Await, pos, [parseAndClassifyIdentifier(parser, context)]);
      }
      if (parser.flags & exports.Flags.NewLine)
          tolerant(parser, context, 36 /* InvalidLineBreak */, 'async');
      while (parser.token === 50331659 /* LeftParen */) {
          expr = parseMemberExpression(parser, context, pos, expr);
          const args = parseAsyncArgumentList(parser, context);
          if (parser.token === 10 /* Arrow */) {
              expr = parseAsyncArrowFunction(parser, context, exports.ModifierState.Await, pos, args);
              break;
          }
          expr = finishNode(context, parser, pos, {
              type: 'CallExpression',
              callee: expr,
              arguments: args,
          });
      }
      return expr;
  }
  /**
   * Parse argument list
   *
   * @see [https://tc39.github.io/ecma262/#prod-ArgumentList)
   *
   * @param Parser Parser object
   * @param Context Context masks
   */
  function parseArgumentList(parser, context) {
      // ArgumentList :
      //   AssignmentOrSpreadExpression
      //   ArgumentList , AssignmentOrSpreadExpression
      //
      // AssignmentOrSpreadExpression :
      //   ... AssignmentExpression
      //   AssignmentExpression
      expect(parser, context, 50331659 /* LeftParen */);
      const expressions = [];
      while (parser.token !== 16 /* RightParen */) {
          if (parser.token === 14 /* Ellipsis */) {
              expressions.push(parseSpreadElement(parser, context));
          }
          else {
              if (context & exports.Context.Yield && hasBit(parser.token, 1073741824 /* IsYield */)) {
                  parser.flags |= exports.Flags.HasYield;
                  setPendingError(parser);
              }
              expressions.push(parseExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression));
          }
          if (parser.token !== 16 /* RightParen */)
              expect(parser, context, 16777234 /* Comma */);
      }
      expect(parser, context, 16 /* RightParen */);
      return expressions;
  }
  /**
   * Parse argument list for async arrow / async call expression
   *
   * @see [https://tc39.github.io/ecma262/#prod-ArgumentList)
   *
   * @param Parser Parser object
   * @param Context Context masks
   */
  function parseAsyncArgumentList(parser, context) {
      // Here we are parsing an "extended" argument list tweaked to handle async arrows. This is
      // done here to avoid overhead and possible performance loss if we only
      // parse out a simple call expression - E.g 'async(foo, bar)' or 'async(foo, bar)()';
      //
      // - J.K. Thomas
      expect(parser, context, 50331659 /* LeftParen */);
      const args = [];
      let { token } = parser;
      let state = exports.CoverCallState.Empty;
      while (parser.token !== 16 /* RightParen */) {
          if (parser.token === 14 /* Ellipsis */) {
              parser.flags |= exports.Flags.SimpleParameterList;
              args.push(parseSpreadElement(parser, context));
              state = exports.CoverCallState.HasSpread;
          }
          else {
              token = parser.token;
              state = validateAsyncArgumentList(parser, context, state);
              args.push(restoreExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression));
          }
          if (consume(parser, context, 16777234 /* Comma */)) {
              parser.flags &= ~exports.Flags.AllowDestructuring;
              if (state & exports.CoverCallState.HasSpread)
                  state = exports.CoverCallState.SeenSpread;
          }
          if (parser.token === 16 /* RightParen */)
              break;
      }
      expect(parser, context, 16 /* RightParen */);
      if (parser.token === 10 /* Arrow */) {
          if (state & exports.CoverCallState.SeenSpread) {
              tolerant(parser, context, 78 /* ParamAfterRest */);
          }
          else if (state & exports.CoverCallState.EvalOrArguments) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 47 /* StrictEvalArguments */);
              parser.flags |= exports.Flags.StrictEvalArguments;
          }
          else if (state & exports.CoverCallState.Yield) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 51 /* YieldInParameter */);
              parser.flags |= exports.Flags.HasStrictReserved;
          }
          else if (parser.flags & exports.Flags.HasYield) {
              tolerant(parser, context, 51 /* YieldInParameter */);
          }
          else if (state & exports.CoverCallState.Await || parser.flags & exports.Flags.HasAwait) {
              tolerant(parser, context, 52 /* AwaitInParameter */);
          }
      }
      return args;
  }
  /**
   * Parse primary expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-PrimaryExpression)
   *
   * @param Parser Parser object
   * @param Context Context masks
   */
  function parsePrimaryExpression(parser, context) {
      switch (parser.token) {
          case 33685505 /* Identifier */:
              return parseIdentifier(parser, context);
          case 33554434 /* NumericLiteral */:
          case 33554435 /* StringLiteral */:
              return parseLiteral(parser, context);
          case 594028 /* AsyncKeyword */:
              return parseAsyncFunctionOrIdentifier(parser, context);
          case 50331659 /* LeftParen */:
              return parseParenthesizedExpression(parser, context | exports.Context.InParen);
          case 41943059 /* LeftBracket */:
              return restoreExpressionCoverGrammar(parser, context, parseArrayLiteral);
          case 41943052 /* LeftBrace */:
              return restoreExpressionCoverGrammar(parser, context, parseObjectLiteral);
          case 33566808 /* FunctionKeyword */:
              return parseFunctionExpression(parser, context);
          case 33566727 /* NullKeyword */:
          case 33566726 /* TrueKeyword */:
          case 33566725 /* FalseKeyword */:
              return parseNullOrTrueOrFalseLiteral(parser, context);
          case 120 /* At */:
          case 33566797 /* ClassKeyword */:
              return parseClassExpression(parser, context);
          case 33566811 /* NewKeyword */:
              return parseNewExpressionOrMetaProperty(parser, context);
          case 33566813 /* SuperKeyword */:
              return parseSuperProperty(parser, context);
          case 33554551 /* BigIntLiteral */:
              return parseBigIntLiteral(parser, context);
          case 33566815 /* ThisKeyword */:
              return parseThisExpression(parser, context);
          case 115 /* Hash */:
              return parseIdentifierNameOrPrivateName(parser, context);
          case 167774773 /* Divide */:
          case 100663333 /* DivideAssign */:
              scanRegularExpression(parser, context);
              return parseRegularExpressionLiteral(parser, context);
          case 33554441 /* TemplateTail */:
              return parseTemplateLiteral(parser, context);
          case 33554440 /* TemplateCont */:
              return parseTemplate(parser, context);
          case 33574984 /* LetKeyword */:
              return parseLetAsIdentifier(parser, context);
          case 12369 /* DoKeyword */:
              if (context & exports.Context.OptionsExperimental)
                  return parseDoExpression(parser, context);
          default:
              return parseAndClassifyIdentifier(parser, context);
      }
  }
  /**
   * Parse do expression (*experimental*)
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function parseDoExpression(parser, context) {
      // AssignmentExpression ::
      //     do '{' StatementList '}'
      const pos = getLocation(parser);
      expect(parser, context, 12369 /* DoKeyword */);
      return finishNode(context, parser, pos, {
          type: 'DoExpression',
          body: parseBlockStatement(parser, context)
      });
  }
  /**
   * Parse 'let' as identifier in 'sloppy mode', and throws
   * in 'strict mode'  / 'module code'. We also avoid a lookahead on the
   * ASI restictions while checking this after parsing out the 'let' keyword
   *
   * @param parser Parser object
   * @param context context mask
   */
  function parseLetAsIdentifier(parser, context) {
      if (context & exports.Context.Strict)
          tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
      const pos = getLocation(parser);
      const name = parser.tokenValue;
      nextToken(parser, context);
      if (parser.flags & exports.Flags.NewLine) {
          if (parser.token === 41943059 /* LeftBracket */)
              tolerant(parser, context, 1 /* UnexpectedToken */, 'let');
      }
      return finishNode(context, parser, pos, {
          type: 'Identifier',
          name,
      });
  }
  /**
   * Parse either async function expression or identifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
   * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
   *
   * @param parser Parser object
   * @param context  context mask
   */
  function parseAsyncFunctionOrIdentifier(parser, context) {
      return lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine) ?
          parseAsyncFunctionOrAsyncGeneratorExpression(parser, context) :
          parseIdentifier(parser, context);
  }
  /**
   * Parses identifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-Identifier)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseIdentifier(parser, context) {
      const pos = getLocation(parser);
      const name = parser.tokenValue;
      nextToken(parser, context | exports.Context.TaggedTemplate);
      const node = finishNode(context, parser, pos, {
          type: 'Identifier',
          name,
      });
      if (context & exports.Context.OptionsRawidentifiers)
          node.raw = parser.tokenRaw;
      return node;
  }
  /**
   * Parse regular expression literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-literals-regular-expression-literals)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseRegularExpressionLiteral(parser, context) {
      const pos = getLocation(parser);
      const { tokenRegExp, tokenValue, tokenRaw } = parser;
      nextToken(parser, context);
      const node = finishNode(context, parser, pos, {
          type: 'Literal',
          value: tokenValue,
          regex: tokenRegExp,
      });
      if (context & exports.Context.OptionsRaw)
          node.raw = tokenRaw;
      return node;
  }
  /**
   * Parses string and number literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-NumericLiteral)
   * @see [Link](https://tc39.github.io/ecma262/#prod-StringLiteral)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseLiteral(parser, context) {
      const pos = getLocation(parser);
      const value = parser.tokenValue;
      if (context & exports.Context.Strict && parser.flags & exports.Flags.HasOctal) {
          tolerant(parser, context, 61 /* StrictOctalLiteral */);
      }
      nextToken(parser, context);
      const node = finishNode(context, parser, pos, {
          type: 'Literal',
          value,
      });
      if (context & exports.Context.OptionsRaw)
          node.raw = parser.tokenRaw;
      return node;
  }
  /**
   * Parses BigInt literal (stage 3 proposal)
   *
   * @see [Link](https://tc39.github.io/proposal-bigint/)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseBigIntLiteral(parser, context) {
      const pos = getLocation(parser);
      const { tokenValue, tokenRaw } = parser;
      nextToken(parser, context);
      const node = finishNode(context, parser, pos, {
          type: 'Literal',
          value: tokenValue,
          bigint: tokenRaw,
      });
      if (context & exports.Context.OptionsRaw)
          node.raw = parser.tokenRaw;
      return node;
  }
  /**
   * Parses either null or boolean literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-BooleanLiteral)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseNullOrTrueOrFalseLiteral(parser, context) {
      const pos = getLocation(parser);
      const { token } = parser;
      const raw = tokenDesc(token);
      if (parser.flags & exports.Flags.EscapedKeyword)
          tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
      nextToken(parser, context);
      const node = finishNode(context, parser, pos, {
          type: 'Literal',
          value: token === 33566727 /* NullKeyword */ ? null : raw === 'true',
      });
      if (context & exports.Context.OptionsRaw)
          node.raw = raw;
      return node;
  }
  /**
   * Parse this expression
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseThisExpression(parser, context) {
      if (parser.flags & exports.Flags.EscapedKeyword)
          tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
      const pos = getLocation(parser);
      nextToken(parser, context | exports.Context.DisallowEscapedKeyword);
      return finishNode(context, parser, pos, {
          type: 'ThisExpression',
      });
  }
  /**
   * Parse identifier name
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-IdentifierName)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param t token
   */
  function parseIdentifierName(parser, context, t) {
      if (!(t & (131072 /* IsIdentifier */ | 4096 /* Keyword */)))
          tolerant(parser, context, 4 /* UnexpectedKeyword */, tokenDesc(t));
      return parseIdentifier(parser, context);
  }
  /**
   * Parse identifier name or private name (stage 3 proposal)
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseIdentifierNameOrPrivateName(parser, context) {
      if (!consume(parser, context, 115 /* Hash */))
          return parseIdentifierName(parser, context, parser.token);
      const { tokenValue } = parser;
      const pos = getLocation(parser);
      const name = tokenValue;
      nextToken(parser, context);
      return finishNode(context, parser, pos, {
          type: 'PrivateName',
          name,
      });
  }
  /**
   * Parse array literal
   *
   * ArrayLiteral :
   *   [ Elisionopt ]
   *   [ ElementList ]
   *   [ ElementList , Elisionopt ]
   *
   * ElementList :
   *   Elisionopt AssignmentExpression
   *   Elisionopt ... AssignmentExpression
   *   ElementList , Elisionopt AssignmentExpression
   *   ElementList , Elisionopt SpreadElement
   *
   * Elision :
   *   ,
   *   Elision ,
   *
   * SpreadElement :
   *   ... AssignmentExpression
   *
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ArrayLiteral)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseArrayLiteral(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 41943059 /* LeftBracket */);
      const elements = [];
      while (parser.token !== 20 /* RightBracket */) {
          if (consume(parser, context, 16777234 /* Comma */)) {
              elements.push(null);
          }
          else if (parser.token === 14 /* Ellipsis */) {
              elements.push(parseSpreadElement(parser, context));
              if (parser.token !== 20 /* RightBracket */) {
                  parser.flags &= ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding);
                  expect(parser, context, 16777234 /* Comma */);
              }
          }
          else {
              elements.push(restoreExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression));
              if (parser.token !== 20 /* RightBracket */)
                  expect(parser, context, 16777234 /* Comma */);
          }
      }
      expect(parser, context, 20 /* RightBracket */);
      return finishNode(context, parser, pos, {
          type: 'ArrayExpression',
          elements,
      });
  }
  /**
   * Parses cover parenthesized expression and arrow parameter list
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-parseCoverParenthesizedExpressionAndArrowParameterList)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseParenthesizedExpression(parser, context) {
      expect(parser, context, 50331659 /* LeftParen */);
      if (consume(parser, context, 16 /* RightParen */)) {
          parser.flags &= ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding);
          if (parser.token === 10 /* Arrow */)
              return [];
      }
      else if (parser.token === 14 /* Ellipsis */) {
          const restExpr = [parseRestElement(parser, context)];
          expect(parser, context, 16 /* RightParen */);
          parser.flags = parser.flags & ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding) | exports.Flags.SimpleParameterList;
          if (parser.token !== 10 /* Arrow */)
              tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
          return restExpr;
      }
      // Record the sequence position
      const sequencepos = getLocation(parser);
      let state = validateCoverParenthesizedExpression(parser, exports.CoverParenthesizedState.None);
      let expr = restoreExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression);
      // Sequence expression
      if (parser.token === 16777234 /* Comma */) {
          state |= exports.CoverParenthesizedState.SequenceExpression;
          const expressions = [expr];
          while (consume(parser, context | exports.Context.DisallowEscapedKeyword, 16777234 /* Comma */)) {
              if (parser.token === 14 /* Ellipsis */) {
                  if (!(parser.flags & exports.Flags.AllowBinding))
                      tolerant(parser, context, 77 /* NotBindable */);
                  parser.flags |= exports.Flags.SimpleParameterList;
                  const restElement = parseRestElement(parser, context);
                  expect(parser, context, 16 /* RightParen */);
                  if (parser.token !== 10 /* Arrow */)
                      tolerant(parser, context, 78 /* ParamAfterRest */);
                  expressions.push(restElement);
                  return expressions;
              }
              else if (consume(parser, context, 16 /* RightParen */)) {
                  if (parser.token !== 10 /* Arrow */)
                      tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                  return expressions;
              }
              else {
                  state = validateCoverParenthesizedExpression(parser, state);
                  expressions.push(restoreExpressionCoverGrammar(parser, context, parseAssignmentExpression));
              }
          }
          expr = finishNode(context, parser, sequencepos, {
              type: 'SequenceExpression',
              expressions,
          });
      }
      expect(parser, context, 16 /* RightParen */);
      if (parser.token === 10 /* Arrow */) {
          if (state & exports.CoverParenthesizedState.HasEvalOrArguments) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 47 /* StrictEvalArguments */);
              parser.flags |= exports.Flags.StrictEvalArguments;
          }
          else if (state & exports.CoverParenthesizedState.HasReservedWords) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
              parser.flags |= exports.Flags.HasStrictReserved;
          }
          else if (!(parser.flags & exports.Flags.AllowBinding)) {
              tolerant(parser, context, 77 /* NotBindable */);
          }
          else if (parser.flags & exports.Flags.HasYield) {
              tolerant(parser, context, 51 /* YieldInParameter */);
          }
          else if (context & exports.Context.Async && parser.flags & exports.Flags.HasAwait) {
              tolerant(parser, context, 52 /* AwaitInParameter */);
          }
          parser.flags &= ~(exports.Flags.AllowBinding | exports.Flags.HasAwait | exports.Flags.HasYield);
          return (state & exports.CoverParenthesizedState.SequenceExpression ? expr.expressions : [expr]);
      }
      parser.flags &= ~(exports.Flags.HasAwait | exports.Flags.HasYield | exports.Flags.AllowBinding);
      if (!isValidSimpleAssignmentTarget(expr))
          parser.flags &= ~exports.Flags.AllowDestructuring;
      return expr;
  }
  /**
   * Parses function expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionExpression)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseFunctionExpression(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 33566808 /* FunctionKeyword */);
      const isGenerator = consume(parser, context, 167774771 /* Multiply */) ? exports.ModifierState.Generator : exports.ModifierState.None;
      let id = null;
      const { token } = parser;
      if (token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          if (token & 4194304 /* IsEvalOrArguments */) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 47 /* StrictEvalArguments */);
              parser.flags |= exports.Flags.StrictEvalArguments;
          }
          if (parser.token & 1073741824 /* IsYield */ && isGenerator & exports.ModifierState.Generator) {
              tolerant(parser, context, 49 /* YieldBindingIdentifier */);
          }
          id = parseBindingIdentifier(parser, context);
      }
      const { params, body } = swapContext(parser, context & ~(exports.Context.Method | exports.Context.AllowSuperProperty), isGenerator, parseFormalListAndBody);
      return finishNode(context, parser, pos, {
          type: 'FunctionExpression',
          params,
          body,
          async: false,
          generator: !!(isGenerator & exports.ModifierState.Generator),
          expression: false,
          id,
      });
  }
  /**
   * Parses async function or async generator expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionExpression)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseAsyncFunctionOrAsyncGeneratorExpression(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 594028 /* AsyncKeyword */);
      expect(parser, context, 33566808 /* FunctionKeyword */);
      const isGenerator = consume(parser, context, 167774771 /* Multiply */) ? exports.ModifierState.Generator : exports.ModifierState.None;
      const isAwait = exports.ModifierState.Await;
      let id = null;
      const { token } = parser;
      if (token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          if (token & 4194304 /* IsEvalOrArguments */) {
              if (context & exports.Context.Strict || isAwait & exports.ModifierState.Await)
                  tolerant(parser, context, 47 /* StrictEvalArguments */);
              parser.flags |= exports.Flags.StrictFunctionName;
          }
          if (token & 262144 /* IsAwait */)
              tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
          if (parser.token & 1073741824 /* IsYield */ && isGenerator & exports.ModifierState.Generator)
              tolerant(parser, context, 49 /* YieldBindingIdentifier */);
          id = parseBindingIdentifier(parser, context);
      }
      const { params, body } = swapContext(parser, context & ~(exports.Context.Method | exports.Context.AllowSuperProperty), isGenerator | isAwait, parseFormalListAndBody);
      return finishNode(context, parser, pos, {
          type: 'FunctionExpression',
          params,
          body,
          async: true,
          generator: !!(isGenerator & exports.ModifierState.Generator),
          expression: false,
          id,
      });
  }
  /**
   * Parse computed property names
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ComputedPropertyName)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseComputedPropertyName(parser, context) {
      expect(parser, context, 41943059 /* LeftBracket */);
      const key = parseAssignmentExpression(parser, context | exports.Context.AllowIn);
      expect(parser, context, 20 /* RightBracket */);
      return key;
  }
  /**
   * Parse property name
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyName)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parsePropertyName(parser, context) {
      switch (parser.token) {
          case 33554434 /* NumericLiteral */:
          case 33554435 /* StringLiteral */:
              return parseLiteral(parser, context);
          case 41943059 /* LeftBracket */:
              return parseComputedPropertyName(parser, context);
          default:
              return parseIdentifier(parser, context);
      }
  }
  /**
   * Parse object spread properties
   *
   * @see [Link](https://tc39.github.io/proposal-object-rest-spread/#Spread)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseSpreadProperties(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 14 /* Ellipsis */);
      if (parser.token & 8388608 /* IsBindingPattern */)
          parser.flags &= ~exports.Flags.AllowDestructuring;
      const argument = parseAssignmentExpression(parser, context | exports.Context.AllowIn);
      return finishNode(context, parser, pos, {
          type: 'SpreadElement',
          argument,
      });
  }
  /**
   * Parses object literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ObjectLiteral)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseObjectLiteral(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 41943052 /* LeftBrace */);
      const properties = [];
      while (parser.token !== 17825807 /* RightBrace */) {
          properties.push(parser.token === 14 /* Ellipsis */ ?
              parseSpreadProperties(parser, context) :
              parsePropertyDefinition(parser, context));
          if (parser.token !== 17825807 /* RightBrace */)
              expect(parser, context, 16777234 /* Comma */);
      }
      expect(parser, context, 17825807 /* RightBrace */);
      parser.flags &= ~exports.Flags.HasProtoField;
      return finishNode(context, parser, pos, {
          type: 'ObjectExpression',
          properties,
      });
  }
  /**
   * Parse property definition
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-PropertyDefinition)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parsePropertyDefinition(parser, context) {
      const pos = getLocation(parser);
      const flags = parser.flags;
      let value;
      let state = consume(parser, context, 167774771 /* Multiply */) ? exports.ObjectState.Generator | exports.ObjectState.Method : exports.ObjectState.Method;
      const t = parser.token;
      let key = parsePropertyName(parser, context);
      if (!(parser.token & 16777216 /* IsShorthandProperty */)) {
          if (flags & exports.Flags.EscapedKeyword) {
              tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
          }
          else if (!(state & exports.ObjectState.Generator) && t & 524288 /* IsAsync */ && !(parser.flags & exports.Flags.NewLine)) {
              state |= consume(parser, context, 167774771 /* Multiply */) ? exports.ObjectState.Generator | exports.ObjectState.Async : exports.ObjectState.Async;
              key = parsePropertyName(parser, context);
          }
          else if (t === 69743 /* GetKeyword */) {
              state = state & ~exports.ObjectState.Method | exports.ObjectState.Getter;
              key = parsePropertyName(parser, context);
          }
          else if (t === 69744 /* SetKeyword */) {
              state = state & ~exports.ObjectState.Method | exports.ObjectState.Setter;
              key = parsePropertyName(parser, context);
          }
          if (state & (exports.ObjectState.Getter | exports.ObjectState.Setter)) {
              if (state & exports.ObjectState.Generator)
                  tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
          }
      }
      if (parser.token === 50331659 /* LeftParen */) {
          value = parseMethodDeclaration(parser, context, state);
      }
      else {
          state &= ~exports.ObjectState.Method;
          if (parser.token === 16777237 /* Colon */) {
              if ((state & (exports.ObjectState.Async | exports.ObjectState.Generator))) {
                  tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
              }
              else if (t !== 41943059 /* LeftBracket */ && parser.tokenValue === '__proto__') {
                  if (parser.flags & exports.Flags.HasProtoField) {
                      // Record the error and put it on hold until we've determined
                      // whether or not we're destructuring
                      setPendingExpressionError(parser, 63 /* DuplicateProto */);
                  }
                  else
                      parser.flags |= exports.Flags.HasProtoField;
              }
              expect(parser, context, 16777237 /* Colon */);
              // Invalid: 'async ({a: await}) => 1'
              if (parser.token & 262144 /* IsAwait */)
                  parser.flags |= exports.Flags.HasAwait;
              value = restoreExpressionCoverGrammar(parser, context, parseAssignmentExpression);
          }
          else {
              if ((state & (exports.ObjectState.Generator | exports.ObjectState.Async)) || !isValidIdentifier(context, t)) {
                  tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(t));
              }
              else if (context & (exports.Context.Strict | exports.Context.Yield) && t & 1073741824 /* IsYield */) {
                  setPendingError(parser);
                  parser.flags |= exports.Flags.HasYield;
              }
              state |= exports.ObjectState.Shorthand;
              if (parser.token === 83886109 /* Assign */) {
                  if (context & exports.Context.Strict && t & 4194304 /* IsEvalOrArguments */) {
                      report(parser, 47 /* StrictEvalArguments */);
                  }
                  else
                      setPendingExpressionError(parser, 91 /* InvalidCoverInitializedName */);
                  expect(parser, context, 83886109 /* Assign */);
                  if (context & (exports.Context.Strict | exports.Context.Yield | exports.Context.Async) && parser.token & (1073741824 /* IsYield */ | 262144 /* IsAwait */)) {
                      setPendingError(parser);
                      parser.flags |= parser.token & 1073741824 /* IsYield */ ? exports.Flags.HasYield : exports.Flags.HasAwait;
                  }
                  value = parseAssignmentPattern(parser, context, key, pos);
              }
              else {
                  if (t & 262144 /* IsAwait */) {
                      if (context & exports.Context.Async)
                          tolerant(parser, context, 46 /* UnexpectedReserved */);
                      setPendingError(parser);
                      parser.flags |= exports.Flags.HasAwait;
                  }
                  value = key;
              }
          }
      }
      return finishNode(context, parser, pos, {
          type: 'Property',
          key,
          value,
          kind: !(state & exports.ObjectState.Getter | state & exports.ObjectState.Setter) ? 'init' : (state & exports.ObjectState.Setter) ? 'set' : 'get',
          computed: t === 41943059 /* LeftBracket */,
          method: !!(state & exports.ObjectState.Method),
          shorthand: !!(state & exports.ObjectState.Shorthand),
      });
  }
  /**
   * Parse statement list
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseMethodDeclaration(parser, context, state) {
      const pos = getLocation(parser);
      const isGenerator = state & exports.ObjectState.Generator ? exports.ModifierState.Generator : exports.ModifierState.None;
      const isAsync = state & exports.ObjectState.Async ? exports.ModifierState.Await : exports.ModifierState.None;
      const { params, body } = swapContext(parser, context | exports.Context.Method, isGenerator | isAsync, parseFormalListAndBody, state);
      return finishNode(context, parser, pos, {
          type: 'FunctionExpression',
          params,
          body,
          async: !!(state & exports.ObjectState.Async),
          generator: !!(state & exports.ObjectState.Generator),
          expression: false,
          id: null,
      });
  }
  /**
   * Parse arrow function
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ArrowFunction)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseArrowFunction(parser, context, pos, params) {
      parser.flags &= ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding);
      if (parser.flags & exports.Flags.NewLine)
          tolerant(parser, context, 36 /* InvalidLineBreak */, '=>');
      expect(parser, context, 10 /* Arrow */);
      return parseArrowBody(parser, context & ~exports.Context.Async, params, pos, exports.ModifierState.None);
  }
  /**
   * Parse async arrow function
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncArrowFunction)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseAsyncArrowFunction(parser, context, state, pos, params) {
      parser.flags &= ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding);
      if (parser.flags & exports.Flags.NewLine)
          tolerant(parser, context, 36 /* InvalidLineBreak */, 'async');
      expect(parser, context, 10 /* Arrow */);
      return parseArrowBody(parser, context | exports.Context.Async, params, pos, state);
  }
  /**
   * Shared helper function for both async arrow and arrows
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ArrowFunction)
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncArrowFunction)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  // https://tc39.github.io/ecma262/#prod-AsyncArrowFunction
  function parseArrowBody(parser, context, params, pos, state) {
      parser.pendingExpressionError = null;
      for (const i in params)
          reinterpret(parser, context | exports.Context.InParameter, params[i]);
      const expression = parser.token !== 41943052 /* LeftBrace */;
      const body = expression ? parseExpressionCoverGrammar(parser, context & ~(exports.Context.Yield | exports.Context.InParameter), parseAssignmentExpression) :
          swapContext(parser, context & ~(exports.Context.Yield | exports.Context.AllowDecorator) | exports.Context.InFunctionBody, state, parseFunctionBody);
      return finishNode(context, parser, pos, {
          type: 'ArrowFunctionExpression',
          body,
          params,
          id: null,
          async: !!(state & exports.ModifierState.Await),
          generator: false,
          expression,
      });
  }
  /**
   * Parses formal parameters and function body.
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
   * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseFormalListAndBody(parser, context, state) {
      const paramList = parseFormalParameters(parser, context | exports.Context.InParameter, state);
      const args = paramList.args;
      const params = paramList.params;
      const body = parseFunctionBody(parser, context & ~exports.Context.AllowDecorator | exports.Context.InFunctionBody, args);
      return { params, body };
  }
  /**
   * Parse funciton body
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionBody)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseFunctionBody(parser, context, params) {
      // Note! The 'params' has an 'any' type now because it's really shouldn't be there. This should have been
      // on the parser object instead. So for now the 'params' arg are only used within the
      // 'parseFormalListAndBody' method, and not within the arrow function body.
      const pos = getLocation(parser);
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 41943052 /* LeftBrace */);
      const body = [];
      while (parser.token === 33554435 /* StringLiteral */) {
          const { tokenRaw, tokenValue } = parser;
          body.push(parseDirective(parser, context));
          if (tokenRaw.length === /* length of prologue*/ 12 && tokenValue === 'use strict') {
              if (parser.flags & exports.Flags.SimpleParameterList) {
                  tolerant(parser, context, 64 /* IllegalUseStrict */);
              }
              else if (parser.flags & (exports.Flags.HasStrictReserved | exports.Flags.StrictFunctionName)) {
                  tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
              }
              else if (parser.flags & exports.Flags.StrictEvalArguments) {
                  tolerant(parser, context, 47 /* StrictEvalArguments */);
              }
              context |= exports.Context.Strict;
          }
      }
      if (context & exports.Context.Strict) {
          validateParams(parser, context, params);
      }
      const { labelSet } = parser;
      parser.labelSet = {};
      const savedFlags = parser.flags;
      parser.flags = parser.flags & ~(exports.Flags.StrictFunctionName | exports.Flags.StrictEvalArguments | exports.Flags.InSwitchStatement | exports.Flags.InIterationStatement) | exports.Flags.AllowDestructuring;
      while (parser.token !== 17825807 /* RightBrace */) {
          body.push(parseStatementListItem(parser, context));
      }
      if (savedFlags & exports.Flags.InIterationStatement)
          parser.flags |= exports.Flags.InIterationStatement;
      if (savedFlags & exports.Flags.InSwitchStatement)
          parser.flags |= exports.Flags.InSwitchStatement;
      parser.labelSet = labelSet;
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'BlockStatement',
          body,
      });
  }
  /**
   * Parse formal parameters
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameters)
   *
   * @param Parser object
   * @param Context masks
   * @param Optional objectstate. Default to none
   */
  function parseFormalParameters(parser, context, state) {
      // FormalParameterList :
      //   [empty]
      //   FunctionRestParameter
      //   FormalsList
      //   FormalsList , FunctionRestParameter
      //
      // FunctionRestParameter :
      //   ... BindingIdentifier
      //
      // FormalsList :
      //   FormalParameter
      //   FormalsList , FormalParameter
      //
      // FormalParameter :
      //   BindingElement
      //
      // BindingElement :
      //   SingleNameBinding
      //   BindingPattern Initializeropt
      expect(parser, context, 50331659 /* LeftParen */);
      parser.flags &= ~(exports.Flags.SimpleParameterList | exports.Flags.HasStrictReserved);
      const args = [];
      const params = [];
      while (parser.token !== 16 /* RightParen */) {
          if (parser.token === 14 /* Ellipsis */) {
              if (state & exports.ObjectState.Setter)
                  tolerant(parser, context, 67 /* BadSetterRestParameter */);
              parser.flags |= exports.Flags.SimpleParameterList;
              params.push(parseRestElement(parser, context, args));
              break;
          }
          params.push(parseFormalParameterList(parser, context, args));
          if (!consume(parser, context, 16777234 /* Comma */))
              break;
          if (parser.token === 16 /* RightParen */)
              break;
      }
      if (state & exports.ObjectState.Setter && params.length !== 1) {
          tolerant(parser, context, 66 /* AccessorWrongArgs */, 'Setter', 'one', '');
      }
      if (state & exports.ObjectState.Getter && params.length > 0) {
          tolerant(parser, context, 66 /* AccessorWrongArgs */, 'Getter', 'no', 's');
      }
      expect(parser, context, 16 /* RightParen */);
      return { params, args };
  }
  /**
   * Parse formal parameter list
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-FormalParameterList)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseFormalParameterList(parser, context, args) {
      const pos = getLocation(parser);
      if (parser.token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          if (hasBit(parser.token, 20480 /* FutureReserved */)) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 50 /* UnexpectedStrictReserved */);
              parser.flags |= exports.Flags.StrictFunctionName;
          }
          if (hasBit(parser.token, 4194304 /* IsEvalOrArguments */)) {
              if (context & exports.Context.Strict)
                  tolerant(parser, context, 47 /* StrictEvalArguments */);
              parser.flags |= exports.Flags.StrictEvalArguments;
          }
      }
      else {
          parser.flags |= exports.Flags.SimpleParameterList;
      }
      const left = parseBindingIdentifierOrPattern(parser, context, args);
      if (!consume(parser, context, 83886109 /* Assign */))
          return left;
      if (parser.token & (1073741824 /* IsYield */ | 262144 /* IsAwait */) && context & (exports.Context.Yield | exports.Context.Async)) {
          tolerant(parser, context, parser.token & 262144 /* IsAwait */ ? 52 /* AwaitInParameter */ : 51 /* YieldInParameter */);
      }
      parser.flags |= exports.Flags.SimpleParameterList;
      return finishNode(context, parser, pos, {
          type: 'AssignmentPattern',
          left,
          right: parseExpressionCoverGrammar(parser, context, parseAssignmentExpression),
      });
  }
  /**
   * Parse class expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ClassExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseClassExpression(parser, context) {
      const pos = getLocation(parser);
      let decorators = [];
      if (context & exports.Context.OptionsExperimental)
          decorators = parseDecorators(parser, context);
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 33566797 /* ClassKeyword */);
      const { token } = parser;
      let state = exports.ObjectState.None;
      let id = null;
      let superClass = null;
      if ((token !== 41943052 /* LeftBrace */ && token !== 12372 /* ExtendsKeyword */)) {
          if (context & exports.Context.Async && token & 262144 /* IsAwait */) {
              tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
          }
          id = parseBindingIdentifier(parser, context | exports.Context.Strict);
      }
      if (consume(parser, context, 12372 /* ExtendsKeyword */)) {
          superClass = parseLeftHandSideExpression(parser, context | exports.Context.Strict, pos);
          state |= exports.ObjectState.Heritage;
      }
      const body = parseClassBodyAndElementList(parser, context | exports.Context.Strict, state);
      return finishNode(context, parser, pos, context & exports.Context.OptionsExperimental ? {
          type: 'ClassExpression',
          id,
          superClass,
          body,
          decorators
      } : {
          type: 'ClassExpression',
          id,
          superClass,
          body,
      });
  }
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
  function parseClassBodyAndElementList(parser, context, state) {
      const pos = getLocation(parser);
      expect(parser, context, 41943052 /* LeftBrace */);
      const body = [];
      let decorators = [];
      while (parser.token !== 17825807 /* RightBrace */) {
          if (!consume(parser, context, 17825809 /* Semicolon */)) {
              if (context & exports.Context.OptionsExperimental) {
                  decorators = parseDecorators(parser, context);
                  if (parser.token === 17825807 /* RightBrace */)
                      report(parser, 92 /* TrailingDecorators */);
                  if (decorators.length !== 0 && parser.tokenValue === 'constructor') {
                      report(parser, 93 /* GeneratorConstructor */);
                  }
              }
              body.push(context & exports.Context.OptionsNext && parser.token === 115 /* Hash */
                  ? parsePrivateFields(parser, context, decorators)
                  : parseClassElement(parser, context, state, decorators));
          }
      }
      parser.flags &= ~exports.Flags.HasConstructor;
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'ClassBody',
          body,
      });
  }
  /**
   * Parse class element and class public instance fields & private instance fields
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ClassElement)
   * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseClassElement(parser, context, state, decorators) {
      const pos = getLocation(parser);
      let { tokenValue, token } = parser;
      const flags = parser.flags;
      if (consume(parser, context, 167774771 /* Multiply */)) {
          state |= exports.ObjectState.Generator;
      }
      if (parser.token === 41943059 /* LeftBracket */)
          state |= exports.ObjectState.Computed;
      if (parser.tokenValue === 'constructor') {
          if (state & exports.ObjectState.Generator)
              tolerant(parser, context, 45 /* InvalidConstructor */, 'generator');
          else if (state & exports.ObjectState.Heritage)
              context |= exports.Context.AllowSuperProperty;
          state |= exports.ObjectState.Constructor;
      }
      let key = parsePropertyName(parser, context);
      let value;
      if (!(parser.token & 16777216 /* IsShorthandProperty */)) {
          if (flags & exports.Flags.EscapedKeyword)
              tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
          if (token === 20585 /* StaticKeyword */) {
              token = parser.token;
              if (consume(parser, context, 167774771 /* Multiply */))
                  state |= exports.ObjectState.Generator;
              tokenValue = parser.tokenValue;
              if (parser.token === 41943059 /* LeftBracket */)
                  state |= exports.ObjectState.Computed;
              if (parser.tokenValue === 'prototype')
                  tolerant(parser, context, 65 /* StaticPrototype */);
              state |= exports.ObjectState.Static;
              key = parsePropertyName(parser, context);
              if (context & exports.Context.OptionsNext && isInstanceField(parser)) {
                  if (tokenValue === 'constructor')
                      tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                  return parseFieldDefinition(parser, context, key, state, pos, decorators);
              }
          }
          if (parser.token !== 50331659 /* LeftParen */) {
              if (token & 524288 /* IsAsync */ && !(state & exports.ObjectState.Generator) && !(parser.flags & exports.Flags.NewLine)) {
                  token = parser.token;
                  tokenValue = parser.tokenValue;
                  state |= exports.ObjectState.Async;
                  if (consume(parser, context, 167774771 /* Multiply */))
                      state |= exports.ObjectState.Generator;
                  if (parser.token === 41943059 /* LeftBracket */)
                      state |= exports.ObjectState.Computed;
                  key = parsePropertyName(parser, context);
              }
              else if ((token === 69743 /* GetKeyword */ || token === 69744 /* SetKeyword */)) {
                  state |= token === 69743 /* GetKeyword */ ? exports.ObjectState.Getter : exports.ObjectState.Setter;
                  tokenValue = parser.tokenValue;
                  if (parser.token === 41943059 /* LeftBracket */)
                      state |= exports.ObjectState.Computed;
                  key = parsePropertyName(parser, context & ~exports.Context.Strict);
              }
              if (tokenValue === 'prototype') {
                  tolerant(parser, context, 65 /* StaticPrototype */);
              }
              else if (!(state & exports.ObjectState.Static) && tokenValue === 'constructor') {
                  tolerant(parser, context, 45 /* InvalidConstructor */, 'accessor');
              }
          }
      }
      if (parser.token === 50331659 /* LeftParen */) {
          if (!(state & exports.ObjectState.Computed) && state & exports.ObjectState.Constructor) {
              if (parser.flags & exports.Flags.HasConstructor)
                  report(parser, 12 /* DuplicateConstructor */);
              else
                  parser.flags |= exports.Flags.HasConstructor;
          }
          value = parseMethodDeclaration(parser, context, state);
      }
      else {
          if (context & exports.Context.OptionsNext)
              return parseFieldDefinition(parser, context, key, state, pos, decorators);
          tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
      }
      const kind = (state & exports.ObjectState.Constructor) ? 'constructor' : (state & exports.ObjectState.Getter) ? 'get' :
          (state & exports.ObjectState.Setter) ? 'set' : 'method';
      return finishNode(context, parser, pos, context & exports.Context.OptionsExperimental ? {
          type: 'MethodDefinition',
          kind,
          static: !!(state & exports.ObjectState.Static),
          computed: !!(state & exports.ObjectState.Computed),
          key,
          value,
          decorators
      } : {
          type: 'MethodDefinition',
          kind,
          static: !!(state & exports.ObjectState.Static),
          computed: !!(state & exports.ObjectState.Computed),
          key,
          value,
      });
  }
  /**
   * Parses field definition.
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseFieldDefinition(parser, context, key, state, pos, decorators) {
      if (state & exports.ObjectState.Constructor)
          tolerant(parser, context, 0 /* Unexpected */);
      let value = null;
      if (state & (exports.ObjectState.Async | exports.ObjectState.Generator))
          tolerant(parser, context, 0 /* Unexpected */);
      if (consume(parser, context, 83886109 /* Assign */)) {
          if (parser.token & 4194304 /* IsEvalOrArguments */)
              tolerant(parser, context, 47 /* StrictEvalArguments */);
          value = parseAssignmentExpression(parser, context);
      }
      consume(parser, context, 16777234 /* Comma */);
      return finishNode(context, parser, pos, context & exports.Context.OptionsExperimental ? {
          type: 'FieldDefinition',
          key,
          value,
          computed: !!(state & exports.ObjectState.Computed),
          static: !!(state & exports.ObjectState.Static),
          decorators
      } : {
          type: 'FieldDefinition',
          key,
          value,
          computed: !!(state & exports.ObjectState.Computed),
          static: !!(state & exports.ObjectState.Static),
      });
  }
  /**
   * Parse private name
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parsePrivateName(parser, context, pos) {
      const name = parser.tokenValue;
      nextToken(parser, context);
      return finishNode(context, parser, pos, {
          type: 'PrivateName',
          name,
      });
  }
  /**
   * Parses private instance fields
   *
   * @see [Link](https://tc39.github.io/proposal-class-public-fields/)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parsePrivateFields(parser, context, decorators) {
      const pos = getLocation(parser);
      expect(parser, context | exports.Context.InClass, 115 /* Hash */);
      if (parser.tokenValue === 'constructor')
          tolerant(parser, context, 41 /* PrivateFieldConstructor */);
      const key = parsePrivateName(parser, context, pos);
      if (parser.token === 50331659 /* LeftParen */)
          return parsePrivateMethod(parser, context, key, pos, decorators);
      let value = null;
      if (consume(parser, context, 83886109 /* Assign */)) {
          if (parser.token & 4194304 /* IsEvalOrArguments */)
              tolerant(parser, context, 47 /* StrictEvalArguments */);
          value = parseAssignmentExpression(parser, context);
      }
      consume(parser, context, 16777234 /* Comma */);
      return finishNode(context, parser, pos, context & exports.Context.OptionsExperimental ? {
          type: 'FieldDefinition',
          key,
          value,
          computed: false,
          static: false,
          decorators
      } : {
          type: 'FieldDefinition',
          key,
          value,
          computed: false,
          static: false,
      });
  }
  function parsePrivateMethod(parser, context, key, pos, decorators) {
      const value = parseMethodDeclaration(parser, context | exports.Context.Strict, exports.ObjectState.None);
      parser.flags &= ~(exports.Flags.AllowDestructuring | exports.Flags.AllowBinding);
      return finishNode(context, parser, pos, context & exports.Context.OptionsExperimental ? {
          type: 'MethodDefinition',
          kind: 'method',
          static: false,
          computed: false,
          key,
          value,
          decorators
      } : {
          type: 'MethodDefinition',
          kind: 'method',
          static: false,
          computed: false,
          key,
          value,
      });
  }
  /**
   * Parse either call expression or import expressions
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseCallImportOrMetaProperty(parser, context) {
      const pos = getLocation(parser);
      const id = parseIdentifier(parser, context);
      // Import.meta - Stage 3 proposal
      if (consume(parser, context, 16777229 /* Period */)) {
          if (context & exports.Context.Module && parser.tokenValue === 'meta')
              return parseMetaProperty(parser, context, id, pos);
          tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      }
      let expr = parseImportExpression(parser, context, pos);
      expect(parser, context, 50331659 /* LeftParen */);
      const args = parseExpressionCoverGrammar(parser, context | exports.Context.AllowIn, parseAssignmentExpression);
      expect(parser, context, 16 /* RightParen */);
      expr = finishNode(context, parser, pos, {
          type: 'CallExpression',
          callee: expr,
          arguments: [args],
      });
      return expr;
  }
  /**
   * Parse Import() expression. (Stage 3 proposal)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param pos Location
   */
  function parseImportExpression(parser, context, pos) {
      return finishNode(context, parser, pos, {
          type: 'Import',
      });
  }
  /**
   * Parse meta property
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param meta Identifier
   * @param pos Location
   */
  function parseMetaProperty(parser, context, meta, pos) {
      return finishNode(context, parser, pos, {
          meta,
          type: 'MetaProperty',
          property: parseIdentifier(parser, context),
      });
  }
  /**
   * Parse new expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-NewExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseNewExpressionOrMetaProperty(parser, context) {
      const pos = getLocation(parser);
      const id = parseIdentifier(parser, context);
      if (consume(parser, context | exports.Context.DisallowEscapedKeyword, 16777229 /* Period */)) {
          if (parser.tokenValue !== 'target' ||
              !(context & (exports.Context.InParameter | exports.Context.InFunctionBody)))
              tolerant(parser, context, 53 /* MetaNotInFunctionBody */);
          return parseMetaProperty(parser, context, id, pos);
      }
      return finishNode(context, parser, pos, {
          type: 'NewExpression',
          callee: parseImportOrMemberExpression(parser, context, pos),
          arguments: parser.token === 50331659 /* LeftParen */ ? parseArgumentList(parser, context) : [],
      });
  }
  /**
   * Parse either import or member expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-MemberExpression)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseImportOrMemberExpression(parser, context, pos) {
      const { token } = parser;
      if (context & exports.Context.OptionsNext && token === 33566810 /* ImportKeyword */) {
          // Invalid: '"new import(x)"'
          if (lookahead(parser, context, nextTokenIsLeftParen))
              tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(token));
          // Fixes cases like ''new import.meta','
          return parseCallImportOrMetaProperty(parser, context);
      }
      return parseMemberExpression(parser, context, pos);
  }
  /**
   * Parse super property
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-SuperProperty)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseSuperProperty(parser, context) {
      // SuperProperty[Yield, Await]:
      //  super[Expression[+In, ?Yield, ?Await]]
      //  super.IdentifierName
      const pos = getLocation(parser);
      expect(parser, context, 33566813 /* SuperKeyword */);
      switch (parser.token) {
          case 50331659 /* LeftParen */:
              // The super property has to be within a class constructor
              if (!(context & exports.Context.AllowSuperProperty))
                  tolerant(parser, context, 54 /* BadSuperCall */);
              break;
          case 41943059 /* LeftBracket */:
          case 16777229 /* Period */:
              if (!(context & exports.Context.Method))
                  tolerant(parser, context, 55 /* UnexpectedSuper */);
              break;
          default:
              tolerant(parser, context, 56 /* LoneSuper */);
      }
      return finishNode(context, parser, pos, {
          type: 'Super',
      });
  }
  /**
   * Parse template literal
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-TemplateLiteral)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseTemplateLiteral(parser, context) {
      const pos = getLocation(parser);
      return finishNode(context, parser, pos, {
          type: 'TemplateLiteral',
          expressions: [],
          quasis: [parseTemplateSpans(parser, context)],
      });
  }
  /**
   * Parse template head
   *
   * @param parser Parser object
   * @param context Context masks
   * @param cooked Cooked template value
   * @param raw Raw template value
   * @param pos Current location
   */
  function parseTemplateHead(parser, context, cooked = null, raw, pos) {
      parser.token = consumeTemplateBrace(parser, context);
      return finishNode(context, parser, pos, {
          type: 'TemplateElement',
          value: {
              cooked,
              raw,
          },
          tail: false,
      });
  }
  /**
   * Parse template
   *
   * @param parser Parser object
   * @param context Context masks
   * @param expression Expression AST node
   * @param quasis Array of Template elements
   */
  function parseTemplate(parser, context, expressions = [], quasis = []) {
      const pos = getLocation(parser);
      const { tokenValue, tokenRaw } = parser;
      expect(parser, context, 33554440 /* TemplateCont */);
      expressions.push(parseExpression(parser, context));
      const t = getLocation(parser);
      quasis.push(parseTemplateHead(parser, context, tokenValue, tokenRaw, pos));
      if (parser.token === 33554441 /* TemplateTail */) {
          quasis.push(parseTemplateSpans(parser, context, t));
      }
      else {
          parseTemplate(parser, context, expressions, quasis);
      }
      return finishNode(context, parser, pos, {
          type: 'TemplateLiteral',
          expressions,
          quasis,
      });
  }
  /**
   * Parse template spans
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-TemplateSpans)
   *
   * @param parser Parser object
   * @param context Context masks
   * @param loc Current AST node location
   */
  function parseTemplateSpans(parser, context, pos = getLocation(parser)) {
      const { tokenValue, tokenRaw } = parser;
      expect(parser, context, 33554441 /* TemplateTail */);
      return finishNode(context, parser, pos, {
          type: 'TemplateElement',
          value: {
              cooked: tokenValue,
              raw: tokenRaw,
          },
          tail: true,
      });
  }
  /**
   * Parses decorators
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseDecoratorList(parser, context) {
      const pos = getLocation(parser);
      return finishNode(context, parser, pos, {
          type: 'Decorator',
          expression: parseLeftHandSideExpression(parser, context, pos)
      });
  }
  /**
   * Parses a list of decorators
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseDecorators(parser, context) {
      const decoratorList = [];
      while (consume(parser, context, 120 /* At */)) {
          decoratorList.push(parseDecoratorList(parser, context | exports.Context.AllowDecorator));
      }
      return decoratorList;
  }

  (function (Context) {
      Context[Context["Empty"] = 0] = "Empty";
      Context[Context["OptionsNext"] = 1] = "OptionsNext";
      Context[Context["OptionsRanges"] = 2] = "OptionsRanges";
      Context[Context["OptionsJSX"] = 4] = "OptionsJSX";
      Context[Context["OptionsRaw"] = 8] = "OptionsRaw";
      Context[Context["OptionsLoc"] = 16] = "OptionsLoc";
      Context[Context["OptionsGlobalReturn"] = 32] = "OptionsGlobalReturn";
      Context[Context["OptionsComments"] = 64] = "OptionsComments";
      Context[Context["OptionsShebang"] = 128] = "OptionsShebang";
      Context[Context["OptionsRawidentifiers"] = 256] = "OptionsRawidentifiers";
      Context[Context["OptionsTolerant"] = 512] = "OptionsTolerant";
      Context[Context["OptionsNode"] = 1024] = "OptionsNode";
      Context[Context["OptionsExperimental"] = 2048] = "OptionsExperimental";
      Context[Context["Strict"] = 4096] = "Strict";
      Context[Context["Module"] = 8192] = "Module";
      Context[Context["TaggedTemplate"] = 16384] = "TaggedTemplate";
      Context[Context["InClass"] = 32768] = "InClass";
      Context[Context["AllowIn"] = 65536] = "AllowIn";
      Context[Context["Async"] = 131072] = "Async";
      Context[Context["Yield"] = 262144] = "Yield";
      Context[Context["InParameter"] = 524288] = "InParameter";
      Context[Context["InFunctionBody"] = 1048576] = "InFunctionBody";
      Context[Context["AllowSingleStatement"] = 2097152] = "AllowSingleStatement";
      Context[Context["BlockScope"] = 4194304] = "BlockScope";
      Context[Context["ForStatement"] = 8388608] = "ForStatement";
      Context[Context["RequireIdentifier"] = 16777216] = "RequireIdentifier";
      Context[Context["Method"] = 33554432] = "Method";
      Context[Context["AllowSuperProperty"] = 67108864] = "AllowSuperProperty";
      Context[Context["InParen"] = 134217728] = "InParen";
      Context[Context["InJSXChild"] = 268435456] = "InJSXChild";
      Context[Context["DisallowEscapedKeyword"] = 536870912] = "DisallowEscapedKeyword";
      Context[Context["AllowDecorator"] = 1073741824] = "AllowDecorator";
      Context[Context["LocationTracker"] = 18] = "LocationTracker";
  })(exports.Context || (exports.Context = {}));
  (function (Flags) {
      Flags[Flags["None"] = 0] = "None";
      Flags[Flags["NewLine"] = 1] = "NewLine";
      Flags[Flags["AllowBinding"] = 2] = "AllowBinding";
      Flags[Flags["AllowDestructuring"] = 4] = "AllowDestructuring";
      Flags[Flags["SimpleParameterList"] = 8] = "SimpleParameterList";
      Flags[Flags["InSwitchStatement"] = 16] = "InSwitchStatement";
      Flags[Flags["InIterationStatement"] = 32] = "InIterationStatement";
      Flags[Flags["HasStrictReserved"] = 64] = "HasStrictReserved";
      Flags[Flags["HasOctal"] = 128] = "HasOctal";
      Flags[Flags["SimpleAssignmentTarget"] = 256] = "SimpleAssignmentTarget";
      Flags[Flags["HasProtoField"] = 512] = "HasProtoField";
      Flags[Flags["StrictFunctionName"] = 1024] = "StrictFunctionName";
      Flags[Flags["StrictEvalArguments"] = 2048] = "StrictEvalArguments";
      Flags[Flags["InFunctionBody"] = 4096] = "InFunctionBody";
      Flags[Flags["HasAwait"] = 8192] = "HasAwait";
      Flags[Flags["HasYield"] = 16384] = "HasYield";
      Flags[Flags["EscapedKeyword"] = 32768] = "EscapedKeyword";
      Flags[Flags["HasConstructor"] = 65536] = "HasConstructor";
  })(exports.Flags || (exports.Flags = {}));
  (function (Labels) {
      Labels[Labels["None"] = 0] = "None";
      Labels[Labels["NotNested"] = 1] = "NotNested";
      Labels[Labels["Nested"] = 2] = "Nested";
  })(exports.Labels || (exports.Labels = {}));
  (function (NumericState) {
      NumericState[NumericState["None"] = 0] = "None";
      NumericState[NumericState["SeenSeparator"] = 1] = "SeenSeparator";
      NumericState[NumericState["EigthOrNine"] = 2] = "EigthOrNine";
      NumericState[NumericState["Float"] = 4] = "Float";
      NumericState[NumericState["BigInt"] = 8] = "BigInt";
  })(exports.NumericState || (exports.NumericState = {}));
  (function (ScannerState) {
      ScannerState[ScannerState["None"] = 0] = "None";
      ScannerState[ScannerState["NewLine"] = 1] = "NewLine";
      ScannerState[ScannerState["LastIsCR"] = 2] = "LastIsCR";
  })(exports.ScannerState || (exports.ScannerState = {}));
  (function (ModifierState) {
      ModifierState[ModifierState["None"] = 0] = "None";
      ModifierState[ModifierState["Generator"] = 1] = "Generator";
      ModifierState[ModifierState["Await"] = 2] = "Await";
  })(exports.ModifierState || (exports.ModifierState = {}));
  (function (CoverParenthesizedState) {
      CoverParenthesizedState[CoverParenthesizedState["None"] = 0] = "None";
      CoverParenthesizedState[CoverParenthesizedState["SequenceExpression"] = 1] = "SequenceExpression";
      CoverParenthesizedState[CoverParenthesizedState["HasEvalOrArguments"] = 2] = "HasEvalOrArguments";
      CoverParenthesizedState[CoverParenthesizedState["HasReservedWords"] = 4] = "HasReservedWords";
      CoverParenthesizedState[CoverParenthesizedState["HasYield"] = 8] = "HasYield";
      CoverParenthesizedState[CoverParenthesizedState["HasBinding"] = 16] = "HasBinding";
  })(exports.CoverParenthesizedState || (exports.CoverParenthesizedState = {}));
  (function (Escape) {
      Escape[Escape["Empty"] = -1] = "Empty";
      Escape[Escape["StrictOctal"] = -2] = "StrictOctal";
      Escape[Escape["EightOrNine"] = -3] = "EightOrNine";
      Escape[Escape["InvalidHex"] = -4] = "InvalidHex";
      Escape[Escape["OutOfRange"] = -5] = "OutOfRange";
  })(exports.Escape || (exports.Escape = {}));
  (function (RegexFlags) {
      RegexFlags[RegexFlags["Empty"] = 0] = "Empty";
      RegexFlags[RegexFlags["IgnoreCase"] = 1] = "IgnoreCase";
      RegexFlags[RegexFlags["Global"] = 2] = "Global";
      RegexFlags[RegexFlags["Multiline"] = 4] = "Multiline";
      RegexFlags[RegexFlags["Unicode"] = 8] = "Unicode";
      RegexFlags[RegexFlags["Sticky"] = 16] = "Sticky";
      RegexFlags[RegexFlags["DotAll"] = 32] = "DotAll";
  })(exports.RegexFlags || (exports.RegexFlags = {}));
  (function (CoverCallState) {
      CoverCallState[CoverCallState["Empty"] = 0] = "Empty";
      CoverCallState[CoverCallState["SeenSpread"] = 1] = "SeenSpread";
      CoverCallState[CoverCallState["HasSpread"] = 2] = "HasSpread";
      CoverCallState[CoverCallState["SimpleParameter"] = 4] = "SimpleParameter";
      CoverCallState[CoverCallState["EvalOrArguments"] = 8] = "EvalOrArguments";
      CoverCallState[CoverCallState["Yield"] = 16] = "Yield";
      CoverCallState[CoverCallState["Await"] = 32] = "Await";
  })(exports.CoverCallState || (exports.CoverCallState = {}));
  (function (RegexState) {
      RegexState[RegexState["Empty"] = 0] = "Empty";
      RegexState[RegexState["Escape"] = 1] = "Escape";
      RegexState[RegexState["Class"] = 2] = "Class";
  })(exports.RegexState || (exports.RegexState = {}));
  (function (ObjectState) {
      ObjectState[ObjectState["None"] = 0] = "None";
      ObjectState[ObjectState["Async"] = 1] = "Async";
      ObjectState[ObjectState["Generator"] = 2] = "Generator";
      ObjectState[ObjectState["Getter"] = 4] = "Getter";
      ObjectState[ObjectState["Setter"] = 8] = "Setter";
      ObjectState[ObjectState["Computed"] = 16] = "Computed";
      ObjectState[ObjectState["Method"] = 32] = "Method";
      ObjectState[ObjectState["Shorthand"] = 64] = "Shorthand";
      ObjectState[ObjectState["Static"] = 128] = "Static";
      ObjectState[ObjectState["Constructor"] = 256] = "Constructor";
      ObjectState[ObjectState["Heritage"] = 512] = "Heritage";
  })(exports.ObjectState || (exports.ObjectState = {}));
  /**
   * Validate break and continue statement
   *
   * @param parser Parser object
   * @param label label
   * @param isContinue true if validation continue statement
   */
  function validateBreakOrContinueLabel(parser, context, label, isContinue) {
      const state = hasLabel(parser, label);
      if (!state)
          tolerant(parser, context, 32 /* UnknownLabel */, label);
      if (isContinue && !(state & exports.Labels.Nested))
          tolerant(parser, context, 31 /* IllegalContinue */, label);
  }
  /**
   * Add label to the stack
   *
   * @param parser Parser object
   * @param label label
   */
  function addLabel(parser, label) {
      if (parser.labelSet === undefined)
          parser.labelSet = {};
      parser.labelSet[`$${label}`] = isIterationStatement(parser.token) ? exports.Labels.Nested : exports.Labels.NotNested;
  }
  /**
   * Remove label from the stack
   *
   * @param parser Parser object
   * @param label label
   */
  function popLabel(parser, label) {
      parser.labelSet[`$${label}`] = exports.Labels.None;
  }
  /**
   * Returns either true or false. Depends if the label exist.
   *
   * @param parser Parser object
   * @param label Label
   */
  function hasLabel(parser, label) {
      return !parser.labelSet ? exports.Labels.None : parser.labelSet[`$${label}`];
  }
  /**
   * Finish each the node for each parse. Set line / and column on the node if the
   * options are set for it
   *
   * @param parser Parser object
   * @param context Context masks
   * @param meta Line / column
   * @param node AST node
   */
  function finishNode(context, parser, meta, node) {
      const { lastIndex, lastLine, lastColumn, sourceFile, index } = parser;
      if (context & exports.Context.LocationTracker) {
          if (context & exports.Context.OptionsRanges) {
              node.start = meta.index;
              node.end = lastIndex;
          }
          if (context & exports.Context.OptionsLoc) {
              node.loc = {
                  start: { line: meta.line, column: meta.column },
                  end: { line: lastLine, column: lastColumn }
              };
              if (sourceFile)
                  node.loc.source = sourceFile;
          }
      }
      return node;
  }
  /**
   * Consumes the next token. If the consumed token is not of the expected type
   * then report an error and return null. Otherwise return true.
   *
   * @param parser Parser object
   * @param context Context masks
   * @param t Token
   * @param Err Optionally error message to be thrown
   */
  function expect(parser, context, token, err = 1 /* UnexpectedToken */) {
      if (parser.token !== token)
          report(parser, err, tokenDesc(parser.token));
      nextToken(parser, context);
      return true;
  }
  /**
   * If the next token matches the given token, this consumes the token
   * and returns true. Otherwise return false.
   *
   * @param parser Parser object
   * @param context Context masks
   * @param t Token
   */
  function consume(parser, context, token) {
      if (parser.token !== token)
          return false;
      nextToken(parser, context);
      return true;
  }
  /**
   * Advance and return the next token in the stream
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function nextToken(parser, context) {
      parser.lastIndex = parser.index;
      parser.lastLine = parser.line;
      parser.lastColumn = parser.column;
      return (parser.token = scan(parser, context));
  }
  const hasBit = (mask, flags) => (mask & flags) === flags;
  /**
   * Automatic Semicolon Insertion
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-automatic-semicolon-insertion)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function consumeSemicolon(parser, context) {
      return parser.token & 1048576 /* ASI */ || parser.flags & exports.Flags.NewLine
          ? consume(parser, context, 17825809 /* Semicolon */)
          : report(parser, !(context & exports.Context.Async) && parser.token & 262144 /* IsAwait */ ? 38 /* AwaitOutsideAsync */ : 1 /* UnexpectedToken */, tokenDesc(parser.token));
  }
  /**
   * Bit fiddle current grammar state and keep track of the state during the parse and restore
   * it back to original state after finish parsing or throw.
   *
   * Ideas for this is basicly from V8 and SM, but also the Esprima parser does this in a similar way.
   *
   * However this implementation is an major improvement over similiar implementations, and
   * does not require additonal bitmasks to be set / unset during the parsing outside this function.
   *
   * @param parser Parser state
   * @param context Context mask
   * @param callback Callback function
   * @param errMsg Optional error message
   */
  function parseExpressionCoverGrammar(parser, context, callback) {
      const { flags, pendingExpressionError } = parser;
      parser.flags |= exports.Flags.AllowBinding | exports.Flags.AllowDestructuring;
      parser.pendingExpressionError = undefined;
      const res = callback(parser, context);
      // If there exist an pending expression error, we throw an error at
      // the same location it was recorded
      if (!!parser.pendingExpressionError) {
          const { error, line, column, index } = parser.pendingExpressionError;
          constructError(parser, context, index, line, column, error);
      }
      // Here we - just in case - disallow both binding and destructuring
      // and only set the bitmaks if the previous flags (before the callback)
      // is positive.
      // Note that this bitmasks may have been turned off during parsing
      // the callback
      parser.flags &= ~(exports.Flags.AllowBinding | exports.Flags.AllowDestructuring);
      if (flags & exports.Flags.AllowBinding)
          parser.flags |= exports.Flags.AllowBinding;
      if (flags & exports.Flags.AllowDestructuring)
          parser.flags |= exports.Flags.AllowDestructuring;
      parser.pendingExpressionError = pendingExpressionError;
      return res;
  }
  /**
   * Restor current grammar to previous state, or unset necessary bitmasks
   *
   * @param parser Parser state
   * @param context Context mask
   * @param callback Callback function
   */
  function restoreExpressionCoverGrammar(parser, context, callback) {
      const { flags, pendingExpressionError } = parser;
      parser.flags |= exports.Flags.AllowBinding | exports.Flags.AllowDestructuring;
      // Clear pending expression error
      parser.pendingExpressionError = undefined;
      const res = callback(parser, context);
      // Both the previous bitmasks and bitmasks set during parsing the callback
      // has to be positive for us to allow further binding or destructuring.
      // Note that we allow both before the callback, so this is the only thing
      // we need to check for.
      if (!(parser.flags & exports.Flags.AllowBinding) || !(flags & exports.Flags.AllowBinding)) {
          parser.flags &= ~exports.Flags.AllowBinding;
      }
      if (!(parser.flags & exports.Flags.AllowDestructuring) || !(flags & exports.Flags.AllowDestructuring)) {
          parser.flags &= ~exports.Flags.AllowDestructuring;
      }
      // Here we either
      //  1) restore to previous pending expression error
      //  or
      //  2) if a pending expression error have been set during the parse (*only in object literal*)
      //  we overwrite previous error, and keep the new one
      parser.pendingExpressionError = pendingExpressionError || parser.pendingExpressionError;
      return res;
  }
  /**
   * Set / unset yield / await context masks based on the
   * ModifierState masks before invoking the callback and
   * returning it's content
   *
   * @param parser Parser object
   * @param context Context masks
   * @param state Modifier state
   * @param callback Callback function to be invoked
   * @param methodState Optional Objectstate.
   */
  function swapContext(parser, context, state, callback, methodState = exports.ObjectState.None) {
      context &= ~(exports.Context.Async | exports.Context.Yield | exports.Context.InParameter);
      if (state & exports.ModifierState.Generator)
          context |= exports.Context.Yield;
      if (state & exports.ModifierState.Await)
          context |= exports.Context.Async;
      return callback(parser, context, methodState);
  }
  /**
   * Validates function params
   *
   * Note! In case anyone want to enable full scoping, replace 'paramSet' with an similiar
   * object on the parser object itself. Then push / set the tokenValue to
   * it an use an bitmask to mark it as an 'variable' not 'blockscope'. Then when
   * implementing lexical scoping, you can use that for validation.
   *
   * @param parser  Parser object
   * @param context Context masks
   * @param params Array of token values
   */
  function validateParams(parser, context, params) {
      const paramSet = new Map();
      for (let i = 0; i < params.length; i++) {
          const key = `@${params[i]}`;
          if (paramSet.get(key)) {
              tolerant(parser, context, 81 /* ParamDupe */);
          }
          else
              paramSet.set(key, true);
      }
  }
  /**
   * Reinterpret various expressions as pattern
   * This is only used for assignment and arrow parameter list
   *
   * @param parser  Parser object
   * @param context Context masks
   * @param node AST node
   */
  const reinterpret = (parser, context, node) => {
      switch (node.type) {
          case 'Identifier':
              if (context & exports.Context.Strict && nameIsArgumentsOrEval(node.name))
                  report(parser, 3 /* InvalidEscapedReservedWord */);
          case 'ArrayPattern':
          case 'AssignmentPattern':
          case 'ObjectPattern':
          case 'RestElement':
          case 'MetaProperty':
              return;
          case 'ArrayExpression':
              node.type = 'ArrayPattern';
              for (let i = 0; i < node.elements.length; ++i) {
                  // skip holes in pattern
                  if (node.elements[i] !== null) {
                      reinterpret(parser, context, node.elements[i]);
                  }
              }
              return;
          case 'ObjectExpression':
              node.type = 'ObjectPattern';
              for (let i = 0; i < node.properties.length; i++) {
                  reinterpret(parser, context, node.properties[i]);
              }
              return;
          case 'Property':
              reinterpret(parser, context, node.value);
              return;
          case 'SpreadElement':
              node.type = 'RestElement';
              if (node.argument.type !== 'ArrayExpression' &&
                  node.argument.type !== 'ObjectExpression' &&
                  !isValidSimpleAssignmentTarget(node.argument)) {
                  tolerant(parser, context, 71 /* RestDefaultInitializer */);
              }
              reinterpret(parser, context, node.argument);
              break;
          case 'AssignmentExpression':
              node.type = 'AssignmentPattern';
              delete node.operator; // operator is not relevant for assignment pattern
              reinterpret(parser, context, node.left); // recursive descent
              return;
          case 'MemberExpression':
              if (!(context & exports.Context.InParameter))
                  return;
          // Fall through
          default:
              tolerant(parser, context, context & exports.Context.InParameter ? 77 /* NotBindable */ : 73 /* InvalidDestructuringTarget */, node.type);
      }
  };
  /**
   * Does a lookahead.
   *
   * @param parser Parser object
   * @param context  Context masks
   * @param callback Callback function to be invoked
   */
  function lookahead(parser, context, callback) {
      const { tokenValue, flags, line, column, startColumn, index, lastColumn, startLine, lastLine, lastIndex, startIndex, tokenRaw, token, lastValue, tokenRegExp, labelSet, errors, errorLocation, pendingExpressionError } = parser;
      const res = callback(parser, context);
      parser.index = index;
      parser.token = token;
      parser.tokenValue = tokenValue;
      parser.tokenValue = tokenValue;
      parser.flags = flags;
      parser.line = line;
      parser.column = column;
      parser.tokenRaw = tokenRaw;
      parser.lastValue = lastValue;
      parser.startColumn = startColumn;
      parser.lastColumn = lastColumn;
      parser.startLine = startLine;
      parser.lastLine = lastLine;
      parser.lastIndex = lastIndex;
      parser.startIndex = startIndex;
      parser.tokenRegExp = tokenRegExp;
      parser.labelSet = labelSet;
      parser.errors = errors;
      parser.errorLocation = errorLocation;
      parser.tokenRegExp = tokenRegExp;
      parser.pendingExpressionError = pendingExpressionError;
      return res;
  }
  /**
   * Returns true if this an valid simple assignment target
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function isValidSimpleAssignmentTarget(node) {
      return node.type === 'Identifier' || node.type === 'MemberExpression' ? true : false;
  }
  /**
   * Get current node location
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function getLocation(parser) {
      return {
          line: parser.startLine,
          column: parser.startColumn,
          index: parser.startIndex
      };
  }
  /**
   * Returns true if this is an valid identifier
   *
   * @param context  Context masks
   * @param t  Token
   */
  function isValidIdentifier(context, t) {
      if (context & exports.Context.Strict) {
          if (context & exports.Context.Module && t & 262144 /* IsAwait */)
              return false;
          if (t & 1073741824 /* IsYield */)
              return false;
          return (t & 131072 /* IsIdentifier */) === 131072 /* IsIdentifier */ || (t & 69632 /* Contextual */) === 69632 /* Contextual */;
      }
      return ((t & 131072 /* IsIdentifier */) === 131072 /* IsIdentifier */ ||
          (t & 69632 /* Contextual */) === 69632 /* Contextual */ ||
          (t & 20480 /* FutureReserved */) === 20480 /* FutureReserved */);
  }
  /**
   * Returns true if this an valid lexical binding and not an identifier
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function isLexical(parser, context) {
      nextToken(parser, context);
      const { token } = parser;
      return !!(token & (131072 /* IsIdentifier */ | 8388608 /* IsBindingPattern */ | 1073741824 /* IsYield */ | 262144 /* IsAwait */) ||
          token === 33574984 /* LetKeyword */ ||
          (token & 69632 /* Contextual */) === 69632 /* Contextual */);
  }
  /**
   * Returns true if this is end of case or default clauses
   *
   * @param parser Parser object
   */
  function isEndOfCaseOrDefaultClauses(parser) {
      return (parser.token === 12368 /* DefaultKeyword */ || parser.token === 17825807 /* RightBrace */ || parser.token === 12363 /* CaseKeyword */);
  }
  /**
   * Validates if the next token in the stream is a left paren or a period
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function nextTokenIsLeftParenOrPeriod(parser, context) {
      nextToken(parser, context);
      return parser.token === 50331659 /* LeftParen */ || parser.token === 16777229 /* Period */;
  }
  /**
   * Validates if the next token in the stream is a identifier or left paren
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function nextTokenisIdentifierOrParen(parser, context) {
      nextToken(parser, context);
      const { token } = parser;
      return token & (131072 /* IsIdentifier */ | 1073741824 /* IsYield */) || token === 50331659 /* LeftParen */;
  }
  /**
   * Validates if the next token in the stream is left parenthesis.
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function nextTokenIsLeftParen(parser, context) {
      nextToken(parser, context);
      return parser.token === 50331659 /* LeftParen */;
  }
  /**
   * Validates if the next token in the stream is a function keyword on the same line.
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function nextTokenIsFuncKeywordOnSameLine(parser, context) {
      nextToken(parser, context);
      return !(parser.flags & exports.Flags.NewLine) && parser.token === 33566808 /* FunctionKeyword */;
  }
  /**
   * Checks if the property has any private field key
   *
   * @param parser Parser object
   * @param context  Context masks
   */
  function isPropertyWithPrivateFieldKey(expr) {
      return !expr.property ? false : expr.property.type === 'PrivateName';
  }
  /**
   * Parse and classify itendifier - similar method as in V8
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseAndClassifyIdentifier(parser, context) {
      const { token, tokenValue: name } = parser;
      if (context & exports.Context.Strict) {
          if (context & exports.Context.Module && token & 262144 /* IsAwait */)
              tolerant(parser, context, 40 /* DisallowedInContext */, tokenDesc(parser.token));
          if (token & 1073741824 /* IsYield */)
              tolerant(parser, context, 40 /* DisallowedInContext */, tokenDesc(parser.token));
          if ((token & 131072 /* IsIdentifier */) === 131072 /* IsIdentifier */ || (token & 69632 /* Contextual */) === 69632 /* Contextual */) {
              return parseIdentifier(parser, context);
          }
          report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      }
      if (context & exports.Context.Yield && token & 1073741824 /* IsYield */)
          tolerant(parser, context, 40 /* DisallowedInContext */, tokenDesc(parser.token));
      if (context & exports.Context.Async && token & 262144 /* IsAwait */)
          tolerant(parser, context, 40 /* DisallowedInContext */, tokenDesc(parser.token));
      if ((token & 131072 /* IsIdentifier */) === 131072 /* IsIdentifier */ ||
          (token & 69632 /* Contextual */) === 69632 /* Contextual */ ||
          (token & 20480 /* FutureReserved */) === 20480 /* FutureReserved */) {
          return parseIdentifier(parser, context);
      }
      report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
  }
  function nameIsArgumentsOrEval(value) {
      return value === 'eval' || value === 'arguments';
  }
  /**
   * Records an error from current position. If we report an error later, we'll do it from
   * this position.
   *
   * @param parser Parser object
   */
  function setPendingError(parser) {
      parser.errorLocation = {
          line: parser.startLine,
          column: parser.startColumn,
          index: parser.startIndex
      };
  }
  /**
   * Returns tagName for JSX element
   *
   * @param elementName JSX Element name
   */
  function isEqualTagNames(elementName) {
      // tslint:disable-next-line:switch-default | this switch is exhaustive
      switch (elementName.type) {
          case 'JSXIdentifier':
              return elementName.name;
          case 'JSXNamespacedName':
              return `${isEqualTagNames(elementName.namespace)}:${isEqualTagNames(elementName.name)}`;
          case 'JSXMemberExpression':
              return `${isEqualTagNames(elementName.object)}.${isEqualTagNames(elementName.property)}`;
      }
  }
  /**
   * Returns true if this is an instance field ( stage 3 proposal)
   *
   * @param parser Parser object
   */
  function isInstanceField(parser) {
      const { token } = parser;
      return token === 17825807 /* RightBrace */ || token === 17825809 /* Semicolon */ || token === 83886109 /* Assign */;
  }
  /**
   *
   * @param parser Parser object
   * @param context Context masks
   * @param expr  AST expressions
   * @param prefix prefix
   */
  function validateUpdateExpression(parser, context, expr, prefix) {
      if (context & exports.Context.Strict && nameIsArgumentsOrEval(expr.name)) {
          tolerant(parser, context, 68 /* StrictLHSPrefixPostFix */, prefix);
      }
      if (!isValidSimpleAssignmentTarget(expr)) {
          tolerant(parser, context, 5 /* InvalidLHSInAssignment */);
      }
  }
  /**
   * Record expression error
   *
   * @param parser Parser object
   * @param error Error message
   */
  function setPendingExpressionError(parser, type) {
      parser.pendingExpressionError = {
          error: errorMessages[type],
          line: parser.line,
          column: parser.column,
          index: parser.index
      };
  }
  /**
   * Validate coer parenthesized expression
   *
   * @param parser Parser object
   * @param state CoverParenthesizedState
   */
  function validateCoverParenthesizedExpression(parser, state) {
      const { token } = parser;
      if (token & 8388608 /* IsBindingPattern */) {
          parser.flags |= exports.Flags.SimpleParameterList;
      }
      else {
          if ((token & 4194304 /* IsEvalOrArguments */) === 4194304 /* IsEvalOrArguments */) {
              setPendingError(parser);
              state |= exports.CoverParenthesizedState.HasEvalOrArguments;
          }
          else if ((token & 20480 /* FutureReserved */) === 20480 /* FutureReserved */) {
              setPendingError(parser);
              state |= exports.CoverParenthesizedState.HasReservedWords;
          }
          else if ((token & 262144 /* IsAwait */) === 262144 /* IsAwait */) {
              setPendingError(parser);
              parser.flags |= exports.Flags.HasAwait;
          }
      }
      return state;
  }
  /**
   * Validate coer parenthesized expression
   *
   * @param parser Parser object
   * @param state CoverParenthesizedState
   */
  function validateAsyncArgumentList(parser, context, state) {
      const { token } = parser;
      if (!(parser.flags & exports.Flags.AllowBinding)) {
          tolerant(parser, context, 77 /* NotBindable */);
      }
      else if (token & 8388608 /* IsBindingPattern */) {
          parser.flags |= exports.Flags.SimpleParameterList;
      }
      else {
          if ((token & 4194304 /* IsEvalOrArguments */) === 4194304 /* IsEvalOrArguments */) {
              setPendingError(parser);
              state |= exports.CoverCallState.EvalOrArguments;
          }
          else if ((token & 262144 /* IsAwait */) === 262144 /* IsAwait */) {
              setPendingError(parser);
              state |= exports.CoverCallState.Await;
          }
          else if ((token & 1073741824 /* IsYield */) === 1073741824 /* IsYield */) {
              setPendingError(parser);
              state |= exports.CoverCallState.Yield;
          }
      }
      return state;
  }
  /**
   * Returns true if iteration statement. Otherwise return false,
   *
   * @param t Token
   */
  function isIterationStatement(t) {
      return t === 12369 /* DoKeyword */ || t === 12386 /* WhileKeyword */ || t === 12374 /* ForKeyword */;
  }
  /**
   * Returns true if in or of token. Otherwise return false,
   *
   * @param t Token
   */
  function isInOrOf(t) {
      return t === 69746 /* OfKeyword */ || t === 167786289 /* InKeyword */;
  }

  /*@internal*/
  const errorMessages = {
      [0 /* Unexpected */]: 'Unexpected token',
      [1 /* UnexpectedToken */]: 'Unexpected token \'%0\'',
      [2 /* ExpectedToken */]: 'Expected token \'%0\'',
      [3 /* InvalidEscapedReservedWord */]: 'Keyword must not contain escaped characters',
      [4 /* UnexpectedKeyword */]: 'Keyword \'%0\' is reserved',
      [5 /* InvalidLHSInAssignment */]: 'Invalid left-hand side in assignment',
      [6 /* UnterminatedString */]: 'Unterminated string literal',
      [7 /* UnterminatedRegExp */]: 'Unterminated regular expression literal',
      [8 /* UnterminatedComment */]: 'Unterminated MultiLineComment',
      [9 /* UnterminatedTemplate */]: 'Unterminated template literal',
      [10 /* UnexpectedChar */]: 'Invalid character \'%0\'',
      [11 /* StrictOctalEscape */]: 'Octal escapes are not allowed in strict mode',
      [13 /* InvalidEightAndNine */]: 'Escapes \\8 or \\9 are not syntactically valid escapes',
      [14 /* UnicodeOutOfRange */]: 'Unicode escape code point out of range',
      [15 /* DuplicateRegExpFlag */]: 'Duplicate regular expression flag \'%0\'',
      [16 /* UnexpectedTokenRegExpFlag */]: 'Unexpected regular expression flag \'%0\'',
      [17 /* StrictLHSAssignment */]: 'Eval or arguments can\'t be assigned to in strict mode code',
      [18 /* IllegalReturn */]: 'Illegal return statement',
      [19 /* StrictFunction */]: 'In strict mode code, functions can only be declared at top level or inside a block',
      [20 /* SloppyFunction */]: 'In non-strict mode code, functions can only be declared at top level, inside a block, or as the body of an if statement',
      [21 /* ForbiddenAsStatement */]: '%0 can\'t appear in single-statement context',
      [22 /* GeneratorInSingleStatementContext */]: 'Generators can only be declared at the top level or inside a block',
      [23 /* ForAwaitNotOf */]: '\'for await\' loop should be used with \'of\'',
      [24 /* DeclarationMissingInitializer */]: 'Missing initializer in %0 declaration',
      [25 /* ForInOfLoopInitializer */]: '\'for-%0\' loop variable declaration may not have an initializer',
      [26 /* ForInOfLoopMultiBindings */]: 'Invalid left-hand side in for-%0 loop: Must have a single binding.',
      [27 /* LetInLexicalBinding */]: 'let is disallowed as a lexically bound name',
      [28 /* UnexpectedLexicalDeclaration */]: 'Lexical declaration cannot appear in a single-statement context',
      [29 /* LabelRedeclaration */]: 'Label \'%0\' has already been declared',
      [30 /* InvalidNestedStatement */]: '%0  statement must be nested within an iteration statement',
      [31 /* IllegalContinue */]: 'Illegal continue statement: \'%0\' does not denote an iteration statement',
      [32 /* UnknownLabel */]: 'Undefined label \'%0\'',
      [33 /* MultipleDefaultsInSwitch */]: 'More than one default clause in switch statement',
      [34 /* ImportExportDeclAtTopLevel */]: '%0 declarations may only appear at top level of a module',
      [35 /* AsyncFunctionInSingleStatementContext */]: 'Async functions can only be declared at the top level or inside a block',
      [36 /* InvalidLineBreak */]: 'No line break is allowed after \'%0\'',
      [37 /* StrictModeWith */]: 'Strict mode code may not include a with statement',
      [38 /* AwaitOutsideAsync */]: 'Await is only valid in async functions',
      [39 /* UnNamedFunctionDecl */]: 'Function declaration must have a name in this context',
      [12 /* DuplicateConstructor */]: 'Duplicate constructor method in class',
      [40 /* DisallowedInContext */]: '\'%0\' may not be used as an identifier in this context',
      [43 /* StrictDelete */]: 'Delete of an unqualified identifier in strict mode',
      [44 /* DeletePrivateField */]: 'Private fields can not be deleted',
      [41 /* PrivateFieldConstructor */]: 'Classes may not have a private field named \'#constructor\'',
      [42 /* PublicFieldConstructor */]: 'Classes may not have a field named \'constructor\'',
      [45 /* InvalidConstructor */]: 'Class constructor may not be a \'%0\'',
      [46 /* UnexpectedReserved */]: 'Unexpected reserved word',
      [47 /* StrictEvalArguments */]: 'Unexpected eval or arguments in strict mode',
      [48 /* AwaitBindingIdentifier */]: '\'await\' is not a valid identifier inside an async function',
      [49 /* YieldBindingIdentifier */]: '\'yield\' is not a valid identifier inside an generator function',
      [50 /* UnexpectedStrictReserved */]: 'Unexpected strict mode reserved word',
      [52 /* AwaitInParameter */]: 'Await expression not allowed in formal parameter',
      [51 /* YieldInParameter */]: 'Yield expression not allowed in formal parameter',
      [53 /* MetaNotInFunctionBody */]: 'new.target only allowed within functions',
      [54 /* BadSuperCall */]: 'super() is not allowed in this context',
      [55 /* UnexpectedSuper */]: 'Member access from super not allowed in this context',
      [56 /* LoneSuper */]: 'Only "(" or "." or "[" are allowed after \'super\'',
      [57 /* YieldReservedKeyword */]: '\'yield\' is a reserved keyword within generator function bodies',
      [58 /* ContinuousNumericSeparator */]: 'Only one underscore is allowed as numeric separator',
      [59 /* TrailingNumericSeparator */]: 'Numeric separators are not allowed at the end of numeric literals',
      [60 /* ZeroDigitNumericSeparator */]: 'Numeric separator can not be used after leading 0.',
      [61 /* StrictOctalLiteral */]: 'Legacy octal literals are not allowed in strict mode',
      [62 /* InvalidLhsInAssignment */]: 'Invalid left-hand side in assignment',
      [63 /* DuplicateProto */]: 'Property name __proto__ appears more than once in object literal',
      [64 /* IllegalUseStrict */]: 'Illegal \'use strict\' directive in function with non-simple parameter list',
      [65 /* StaticPrototype */]: 'Classes may not have a static property named \'prototype\'',
      [66 /* AccessorWrongArgs */]: '%0 functions must have %1 argument%2',
      [67 /* BadSetterRestParameter */]: 'Setter function argument must not be a rest parameter',
      [68 /* StrictLHSPrefixPostFix */]: '%0 increment/decrement may not have eval or arguments operand in strict mode',
      [69 /* InvalidElisonInObjPropList */]: 'Elision not allowed in object property list',
      [70 /* ElementAfterRest */]: 'Rest element must be last element',
      [72 /* ElementAfterSpread */]: 'Spread element must be last element',
      [71 /* RestDefaultInitializer */]: 'Rest parameter may not have a default initializer',
      [73 /* InvalidDestructuringTarget */]: 'Invalid destructuring assignment target',
      [74 /* UnexpectedSurrogate */]: 'Unexpected surrogate pair',
      [75 /* MalformedEscape */]: 'Malformed %0 character escape sequence',
      [76 /* TemplateOctalLiteral */]: 'Template literals may not contain octal escape sequences',
      [77 /* NotBindable */]: 'Invalid binding pattern',
      [78 /* ParamAfterRest */]: 'Rest parameter must be last formal parameter',
      [79 /* NoCatchOrFinally */]: 'Missing catch or finally after try',
      [80 /* NewlineAfterThrow */]: 'Illegal newline after throw',
      [81 /* ParamDupe */]: 'Duplicate parameter name not allowed in this context',
      [82 /* AsAfterImportStart */]: 'Missing keyword \'as\' after import *',
      [83 /* LabelNoColon */]: 'Labels must be followed by a \':\'',
      [84 /* NonEmptyJSXExpression */]: 'JSX attributes must only be assigned a non-empty  \'expression\'',
      [85 /* ExpectedJSXClosingTag */]: 'Expected corresponding JSX closing tag for %0',
      [86 /* AdjacentJSXElements */]: 'Adjacent JSX elements must be wrapped in an enclosing tag',
      [87 /* InvalidJSXAttributeValue */]: 'Invalid JSX attribute value',
      [88 /* RestWithComma */]: 'Rest element may not have a trailing comma',
      [89 /* UndefinedUnicodeCodePoint */]: 'Undefined Unicode code-point',
      [90 /* HtmlCommentInModule */]: 'HTML comments are not allowed in modules',
      [91 /* InvalidCoverInitializedName */]: 'Invalid shorthand property initializer',
      [92 /* TrailingDecorators */]: 'Trailing decorator may be followed by method',
      [93 /* GeneratorConstructor */]: 'Decorators can\'t be used with a constructor',
      [94 /* InvalidRestBindingPattern */]: '`...` must be followed by an identifier in declaration contexts',
  };
  /**
   * Collect line, index, and colum from either the recorded error
   * or directly from the parser and returns it
   *
   * @param parser Parser instance
   * @param context Context masks
   * @param index  The 0-based end index of the error.
   * @param line The 0-based line position of the error.
   * @param column The 0-based column position of the error.
   * @param parser The 0-based end index of the current node.
   * @param description Error description
   */
  /*@internal*/
  function constructError(parser, context, index, line, column, description) {
      const error = new SyntaxError(`Line ${line}, column ${column}: ${description}`);
      error.index = index;
      error.line = line;
      error.column = column;
      error.description = description;
      if (context & exports.Context.OptionsTolerant) {
          parser.errors.push(error);
      }
      else
          throw error;
  }
  /**
   * Collect line, index, and colum from either the recorded error
   * or directly from the parser and returns it
   *
   * @param parser Parser instance
   */
  function getErrorLocation(parser) {
      let { index, startLine: line, startColumn: column } = parser;
      const errorLoc = parser.errorLocation;
      if (!!errorLoc) {
          index = errorLoc.index;
          line = errorLoc.line;
          column = errorLoc.column;
      }
      return { index, line, column };
  }
  /**
   * Throws an error
   *
   * @param parser Parser instance
   * @param context Context masks
   * @param type Error type
   * @param params Error params
   */
  /*@internal*/
  function report(parser, type, ...params) {
      const { index, line, column } = getErrorLocation(parser);
      const errorMessage = errorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
      constructError(parser, exports.Context.Empty, index, line, column, errorMessage);
  }
  /**
   * If in tolerant mode, all errors are pushed to a top-level error array containing
   * otherwise throws
   *
   * @param parser Parser instance
   * @param context Context masks
   * @param type Error type
   * @param params Error params
   */
  /*@internal*/
  function tolerant(parser, context, type, ...params) {
      const { index, line, column } = getErrorLocation(parser);
      const errorMessage = errorMessages[type].replace(/%(\d+)/g, (_, i) => params[i]);
      constructError(parser, context, index, line, column, errorMessage);
  }

  // Declarations
  /**
   * Parses class declaration
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseClassDeclaration(parser, context) {
      const pos = getLocation(parser);
      let decorators = [];
      if (context & exports.Context.OptionsExperimental)
          decorators = parseDecorators(parser, context);
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 33566797 /* ClassKeyword */);
      const id = (context & exports.Context.RequireIdentifier && (parser.token !== 33685505 /* Identifier */))
          ? null :
          parseBindingIdentifier(parser, context | exports.Context.Strict | exports.Context.DisallowEscapedKeyword);
      let state = exports.ObjectState.None;
      let superClass = null;
      if (consume(parser, context, 12372 /* ExtendsKeyword */)) {
          superClass = parseLeftHandSideExpression(parser, context | exports.Context.Strict, pos);
          state |= exports.ObjectState.Heritage;
      }
      const body = parseClassBodyAndElementList(parser, context & ~exports.Context.RequireIdentifier | exports.Context.Strict | exports.Context.InClass, state);
      return finishNode(context, parser, pos, context & exports.Context.OptionsExperimental ? {
          type: 'ClassDeclaration',
          id,
          superClass,
          body,
          decorators
      } : {
          type: 'ClassDeclaration',
          id,
          superClass,
          body
      });
  }
  /**
   * Parses function declaration
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-FunctionDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseFunctionDeclaration(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 33566808 /* FunctionKeyword */);
      let isGenerator = exports.ModifierState.None;
      if (consume(parser, context, 167774771 /* Multiply */)) {
          if (context & exports.Context.AllowSingleStatement && !(context & exports.Context.InFunctionBody)) {
              tolerant(parser, context, 22 /* GeneratorInSingleStatementContext */);
          }
          isGenerator = exports.ModifierState.Generator;
      }
      return parseFunctionDeclarationBody(parser, context, isGenerator, pos);
  }
  /**
   * Parses out a function declartion body
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
   *
   * @param parser Parser object
   * @param context Context mask
   * @param state Modifier state
   * @param pos Current location
   */
  function parseFunctionDeclarationBody(parser, context, state, pos) {
      const { token } = parser;
      let id = null;
      if (context & exports.Context.Yield && token & 1073741824 /* IsYield */)
          tolerant(parser, context, 49 /* YieldBindingIdentifier */);
      if (context & exports.Context.Async && token & 262144 /* IsAwait */)
          tolerant(parser, context, 48 /* AwaitBindingIdentifier */);
      if (token !== 50331659 /* LeftParen */) {
          id = parseBindingIdentifier(parser, context);
          // Unnamed functions are forbidden in statement context.
      }
      else if (!(context & exports.Context.RequireIdentifier))
          tolerant(parser, context, 39 /* UnNamedFunctionDecl */);
      const { params, body } = swapContext(parser, context & ~(exports.Context.Method | exports.Context.AllowSuperProperty | exports.Context.RequireIdentifier), state, parseFormalListAndBody);
      return finishNode(context, parser, pos, {
          type: 'FunctionDeclaration',
          params,
          body,
          async: !!(state & exports.ModifierState.Await),
          generator: !!(state & exports.ModifierState.Generator),
          expression: false,
          id,
      });
  }
  /**
   * Parses async function or async generator declaration
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 594028 /* AsyncKeyword */);
      expect(parser, context, 33566808 /* FunctionKeyword */);
      const isAwait = exports.ModifierState.Await;
      const isGenerator = consume(parser, context, 167774771 /* Multiply */) ? exports.ModifierState.Generator : exports.ModifierState.None;
      return parseFunctionDeclarationBody(parser, context, isGenerator | isAwait, pos);
  }
  /**
   * VariableDeclaration :
   *   BindingIdentifier Initializeropt
   *   BindingPattern Initializer
   *
   * VariableDeclarationNoIn :
   *   BindingIdentifier InitializerNoInopt
   *   BindingPattern InitializerNoIn
   *
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseVariableDeclaration(parser, context, isConst) {
      const pos = getLocation(parser);
      const isBindingPattern = (parser.token & 8388608 /* IsBindingPattern */) !== 0;
      const id = parseBindingIdentifierOrPattern(parser, context);
      let init = null;
      if (consume(parser, context | exports.Context.DisallowEscapedKeyword, 83886109 /* Assign */)) {
          init = parseExpressionCoverGrammar(parser, context & ~(exports.Context.BlockScope | exports.Context.ForStatement), parseAssignmentExpression);
          if (isInOrOf(parser.token) && (context & exports.Context.ForStatement || isBindingPattern)) {
              if (parser.token === 167786289 /* InKeyword */) {
                  // https://github.com/tc39/test262/blob/master/test/annexB/language/statements/for-in/strict-initializer.js
                  if (context & (exports.Context.BlockScope | exports.Context.Strict | exports.Context.Async) || isBindingPattern) {
                      tolerant(parser, context, 25 /* ForInOfLoopInitializer */, tokenDesc(parser.token));
                  }
              }
              else
                  tolerant(parser, context, 25 /* ForInOfLoopInitializer */, tokenDesc(parser.token));
          }
          // Note: Initializers are required for 'const' and binding patterns
      }
      else if (!isInOrOf(parser.token) && (isConst || isBindingPattern)) {
          tolerant(parser, context, 24 /* DeclarationMissingInitializer */, isConst ? 'const' : 'destructuring');
      }
      return finishNode(context, parser, pos, {
          type: 'VariableDeclarator',
          init,
          id,
      });
  }
  /**
   * Parses variable declaration list
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-VariableDeclarationList)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseVariableDeclarationList(parser, context, isConst) {
      const list = [parseVariableDeclaration(parser, context, isConst)];
      while (consume(parser, context, 16777234 /* Comma */))
          list.push(parseVariableDeclaration(parser, context, isConst));
      if (context & exports.Context.ForStatement && isInOrOf(parser.token) && list.length !== 1) {
          tolerant(parser, context, 26 /* ForInOfLoopMultiBindings */, tokenDesc(parser.token));
      }
      return list;
  }

  // Statements
  /**
   * Parses statement list items
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-StatementListItem)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseStatementListItem(parser, context) {
      switch (parser.token) {
          case 33566808 /* FunctionKeyword */:
              return parseFunctionDeclaration(parser, context);
          case 120 /* At */:
          case 33566797 /* ClassKeyword */:
              return parseClassDeclaration(parser, context);
          case 33574984 /* LetKeyword */:
              return parseLetOrExpressionStatement(parser, context | exports.Context.AllowIn);
          case 33566793 /* ConstKeyword */:
              return parseVariableStatement(parser, context | exports.Context.BlockScope | exports.Context.AllowIn);
          case 594028 /* AsyncKeyword */:
              return parseAsyncFunctionDeclarationOrStatement(parser, context);
          case 33566810 /* ImportKeyword */: {
              if (context & exports.Context.OptionsNext && lookahead(parser, context, nextTokenIsLeftParenOrPeriod)) {
                  return parseExpressionStatement(parser, context | exports.Context.AllowIn);
              }
          }
          case 12371 /* ExportKeyword */:
              if (context & exports.Context.Module) {
                  tolerant(parser, context, 34 /* ImportExportDeclAtTopLevel */, tokenDesc(parser.token));
              }
          default:
              return parseStatement(parser, context | exports.Context.AllowSingleStatement);
      }
  }
  /**
   * Parses statements
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-Statement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseStatement(parser, context) {
      switch (parser.token) {
          case 33566791 /* VarKeyword */:
              return parseVariableStatement(parser, context | exports.Context.AllowIn);
          case 17825809 /* Semicolon */:
              return parseEmptyStatement(parser, context);
          case 33566814 /* SwitchKeyword */:
              return parseSwitchStatement(parser, context);
          case 41943052 /* LeftBrace */:
              return parseBlockStatement(parser, context);
          case 12380 /* ReturnKeyword */:
              return parseReturnStatement(parser, context);
          case 12377 /* IfKeyword */:
              return parseIfStatement(parser, context);
          case 12369 /* DoKeyword */:
              return parseDoWhileStatement(parser, context);
          case 12386 /* WhileKeyword */:
              return parseWhileStatement(parser, context);
          case 12387 /* WithKeyword */:
              return parseWithStatement(parser, context);
          case 12362 /* BreakKeyword */:
              return parseBreakStatement(parser, context);
          case 12366 /* ContinueKeyword */:
              return parseContinueStatement(parser, context);
          case 12367 /* DebuggerKeyword */:
              return parseDebuggerStatement(parser, context);
          case 302002272 /* ThrowKeyword */:
              return parseThrowStatement(parser, context);
          case 12385 /* TryKeyword */:
              return parseTryStatement(parser, context | exports.Context.DisallowEscapedKeyword);
          case 12374 /* ForKeyword */:
              return parseForStatement(parser, context | exports.Context.ForStatement);
          case 594028 /* AsyncKeyword */:
              if (lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine)) {
                  tolerant(parser, context, 35 /* AsyncFunctionInSingleStatementContext */);
              }
              return parseExpressionOrLabelledStatement(parser, context | exports.Context.AllowSingleStatement);
          case 33566808 /* FunctionKeyword */:
              // V8
              tolerant(parser, context, context & exports.Context.Strict ? 19 /* StrictFunction */ : 20 /* SloppyFunction */);
          case 33566797 /* ClassKeyword */:
              tolerant(parser, context, 21 /* ForbiddenAsStatement */, tokenDesc(parser.token));
          default:
              return parseExpressionOrLabelledStatement(parser, context);
      }
  }
  /**
   * Parses empty statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-EmptyStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseEmptyStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      return finishNode(context, parser, pos, {
          type: 'EmptyStatement'
      });
  }
  /**
   * Parses the continue statement production
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ContinueStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseContinueStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      // Appearing of continue without an IterationStatement leads to syntax error
      if (!(parser.flags & (exports.Flags.InSwitchStatement | exports.Flags.InIterationStatement))) {
          tolerant(parser, context, 30 /* InvalidNestedStatement */, tokenDesc(parser.token));
      }
      let label = null;
      if (!(parser.flags & exports.Flags.NewLine) && parser.token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          const { tokenValue } = parser;
          label = parseIdentifier(parser, context);
          validateBreakOrContinueLabel(parser, context, tokenValue, true);
      }
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ContinueStatement',
          label
      });
  }
  /**
   * Parses the break statement production
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-BreakStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseBreakStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      let label = null;
      if (!(parser.flags & exports.Flags.NewLine) && parser.token & (131072 /* IsIdentifier */ | 4096 /* Keyword */)) {
          const { tokenValue } = parser;
          label = parseIdentifier(parser, context);
          validateBreakOrContinueLabel(parser, context, tokenValue, false);
      }
      else if (!(parser.flags & (exports.Flags.InSwitchStatement | exports.Flags.InIterationStatement))) {
          tolerant(parser, context, 30 /* InvalidNestedStatement */, 'break');
      }
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'BreakStatement',
          label
      });
  }
  /**
   * Parses the if statement production
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-if-statement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseIfStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      expect(parser, context, 50331659 /* LeftParen */);
      const test = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      expect(parser, context, 16 /* RightParen */);
      const consequent = parseConsequentOrAlternate(parser, context | exports.Context.DisallowEscapedKeyword);
      const alternate = consume(parser, context, 12370 /* ElseKeyword */) ? parseConsequentOrAlternate(parser, context) : null;
      return finishNode(context, parser, pos, {
          type: 'IfStatement',
          test,
          consequent,
          alternate
      });
  }
  /**
   * Parse either consequent or alternate. Supports AnnexB.
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseConsequentOrAlternate(parser, context) {
      return context & exports.Context.Strict || parser.token !== 33566808 /* FunctionKeyword */
          ? parseStatement(parser, context & ~exports.Context.AllowSingleStatement)
          : parseFunctionDeclaration(parser, context);
  }
  /**
   * Parses the debugger statement production
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-DebuggerStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseDebuggerStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'DebuggerStatement'
      });
  }
  /**
   * Parses try statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-TryStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseTryStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      const block = parseBlockStatement(parser, context);
      const handler = parser.token === 12364 /* CatchKeyword */ ? parseCatchBlock(parser, context) : null;
      const finalizer = consume(parser, context, 12373 /* FinallyKeyword */) ? parseBlockStatement(parser, context) : null;
      if (!handler && !finalizer)
          tolerant(parser, context, 79 /* NoCatchOrFinally */);
      return finishNode(context, parser, pos, {
          type: 'TryStatement',
          block,
          handler,
          finalizer
      });
  }
  /**
   * Parses catch block
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-Catch)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseCatchBlock(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      let param = null;
      if (consume(parser, context, 50331659 /* LeftParen */)) {
          const params = [];
          param = parseBindingIdentifierOrPattern(parser, context, params);
          validateParams(parser, context, params);
          expect(parser, context, 16 /* RightParen */);
      }
      const body = parseBlockStatement(parser, context);
      return finishNode(context, parser, pos, {
          type: 'CatchClause',
          param,
          body
      });
  }
  /**
   * Parses throw statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ThrowStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseThrowStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      if (parser.flags & exports.Flags.NewLine)
          tolerant(parser, context, 80 /* NewlineAfterThrow */);
      const argument = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ThrowStatement',
          argument
      });
  }
  /**
   * Parses expression statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseExpressionStatement(parser, context) {
      const pos = getLocation(parser);
      const expr = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ExpressionStatement',
          expression: expr
      });
  }
  /**
   * Parse directive node
   *
   * * @see [Link](https://tc39.github.io/ecma262/#sec-directive-prologues-and-the-use-strict-directive)
   *
   * @param parser Parser object
   * @param context Context masks
   */
  function parseDirective(parser, context) {
      const pos = getLocation(parser);
      const directive = parser.tokenRaw.slice(1, -1);
      const expr = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ExpressionStatement',
          expression: expr,
          directive
      });
  }
  /**
   * Parses either expression or labelled statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
   * @see [Link](https://tc39.github.io/ecma262/#prod-LabelledStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseExpressionOrLabelledStatement(parser, context) {
      const pos = getLocation(parser);
      const { tokenValue, token } = parser;
      const expr = parseExpression(parser, (context & ~(exports.Context.AllowSingleStatement | exports.Context.AllowDecorator)) | exports.Context.AllowIn);
      if (token & (131072 /* IsIdentifier */ | 4096 /* Keyword */) && parser.token === 16777237 /* Colon */) {
          // If within generator function bodies, we do it like this so we can throw an nice error message
          if (context & exports.Context.Yield && token & 1073741824 /* IsYield */)
              tolerant(parser, context, 57 /* YieldReservedKeyword */);
          expect(parser, context, 16777237 /* Colon */, 83 /* LabelNoColon */);
          if (hasLabel(parser, tokenValue))
              tolerant(parser, context, 29 /* LabelRedeclaration */, tokenValue);
          addLabel(parser, tokenValue);
          const body = !(context & exports.Context.Strict) &&
              context & exports.Context.AllowSingleStatement &&
              parser.token === 33566808 /* FunctionKeyword */
              ? parseFunctionDeclaration(parser, context)
              : parseStatement(parser, context);
          popLabel(parser, tokenValue);
          return finishNode(context, parser, pos, {
              type: 'LabeledStatement',
              label: expr,
              body
          });
      }
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ExpressionStatement',
          expression: expr
      });
  }
  /**
   * Parses do while statement
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseDoWhileStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      const body = parseIterationStatement(parser, context);
      expect(parser, context, 12386 /* WhileKeyword */);
      expect(parser, context, 50331659 /* LeftParen */);
      const test = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      expect(parser, context, 16 /* RightParen */);
      consume(parser, context, 17825809 /* Semicolon */);
      return finishNode(context, parser, pos, {
          type: 'DoWhileStatement',
          body,
          test
      });
  }
  /**
   * Parses while statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-grammar-notation-WhileStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseWhileStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      expect(parser, context, 50331659 /* LeftParen */);
      const test = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      expect(parser, context, 16 /* RightParen */);
      const body = parseIterationStatement(parser, context);
      return finishNode(context, parser, pos, {
          type: 'WhileStatement',
          test,
          body
      });
  }
  /**
   * Parses block statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-BlockStatement)
   * @see [Link](https://tc39.github.io/ecma262/#prod-Block)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseBlockStatement(parser, context) {
      const pos = getLocation(parser);
      const body = [];
      expect(parser, context, 41943052 /* LeftBrace */);
      while (parser.token !== 17825807 /* RightBrace */) {
          body.push(parseStatementListItem(parser, context));
      }
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'BlockStatement',
          body
      });
  }
  /**
   * Parses return statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ReturnStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseReturnStatement(parser, context) {
      const pos = getLocation(parser);
      if (!(context & (exports.Context.OptionsGlobalReturn | exports.Context.InFunctionBody))) {
          tolerant(parser, context, 18 /* IllegalReturn */);
      }
      if (parser.flags & exports.Flags.EscapedKeyword)
          tolerant(parser, context, 3 /* InvalidEscapedReservedWord */);
      nextToken(parser, context);
      const argument = !(parser.token & 1048576 /* ASI */) && !(parser.flags & exports.Flags.NewLine)
          ? parseExpression(parser, (context & ~(exports.Context.InFunctionBody | exports.Context.AllowDecorator)) | exports.Context.AllowIn)
          : null;
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ReturnStatement',
          argument
      });
  }
  /**
   * Sets the necessary mutable parser flags. The parser flags will
   * be unset after done parsing out the statements.
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-grammar-notation-IterationStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseIterationStatement(parser, context) {
      // Note: We are deviating from the original grammar here beauce the original grammar says that the
      // 'iterationStatement' should return either'for', 'do' or 'while' statements. We are doing some
      // bitfiddling before and after to modify the parser state before we let the 'parseStatement'
      // return the mentioned statements (to match the original grammar).
      const savedFlags = parser.flags;
      parser.flags |= exports.Flags.InIterationStatement | exports.Flags.AllowDestructuring;
      const body = parseStatement(parser, (context & ~exports.Context.AllowSingleStatement) | exports.Context.DisallowEscapedKeyword);
      parser.flags = savedFlags;
      return body;
  }
  /**
   * Parses with statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-WithStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseWithStatement(parser, context) {
      if (context & exports.Context.Strict)
          tolerant(parser, context, 37 /* StrictModeWith */);
      const pos = getLocation(parser);
      nextToken(parser, context);
      expect(parser, context, 50331659 /* LeftParen */);
      const object = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      expect(parser, context, 16 /* RightParen */);
      const body = parseStatement(parser, context & ~exports.Context.AllowSingleStatement);
      return finishNode(context, parser, pos, {
          type: 'WithStatement',
          object,
          body
      });
  }
  /**
   * Parses switch statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-SwitchStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseSwitchStatement(parser, context) {
      const pos = getLocation(parser);
      nextToken(parser, context);
      expect(parser, context, 50331659 /* LeftParen */);
      const discriminant = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      expect(parser, context, 16 /* RightParen */);
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 41943052 /* LeftBrace */);
      const cases = [];
      const savedFlags = parser.flags;
      parser.flags |= exports.Flags.InSwitchStatement;
      let seenDefault = false;
      while (parser.token !== 17825807 /* RightBrace */) {
          const clause = parseCaseOrDefaultClauses(parser, context);
          cases.push(clause);
          if (clause.test === null) {
              if (seenDefault)
                  tolerant(parser, context, 33 /* MultipleDefaultsInSwitch */);
              seenDefault = true;
          }
      }
      parser.flags = savedFlags;
      expect(parser, context, 17825807 /* RightBrace */);
      return finishNode(context, parser, pos, {
          type: 'SwitchStatement',
          discriminant,
          cases
      });
  }
  /**
   * Parses either default clause or case clauses
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-CaseClauses)
   * @see [Link](https://tc39.github.io/ecma262/#prod-DefaultClause)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseCaseOrDefaultClauses(parser, context) {
      const pos = getLocation(parser);
      let test = null;
      if (consume(parser, context, 12363 /* CaseKeyword */)) {
          test = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      }
      else {
          expect(parser, context, 12368 /* DefaultKeyword */);
      }
      expect(parser, context, 16777237 /* Colon */);
      const consequent = [];
      while (!isEndOfCaseOrDefaultClauses(parser)) {
          consequent.push(parseStatementListItem(parser, context | exports.Context.AllowIn));
      }
      return finishNode(context, parser, pos, {
          type: 'SwitchCase',
          test,
          consequent
      });
  }
  /**
   * Parses variable statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-VariableStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseVariableStatement(parser, context, shouldConsume = true) {
      const pos = getLocation(parser);
      const { token } = parser;
      const isConst = token === 33566793 /* ConstKeyword */;
      nextToken(parser, context);
      const declarations = parseVariableDeclarationList(parser, context, isConst);
      // Only consume semicolons if not inside the 'ForStatement' production
      if (shouldConsume)
          consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'VariableDeclaration',
          kind: tokenDesc(token),
          declarations
      });
  }
  /**
   * Parses either an lexical declaration (let) or an expression statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-let-and-const-declarations)
   * @see [Link](https://tc39.github.io/ecma262/#prod-ExpressionStatement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseLetOrExpressionStatement(parser, context, shouldConsume = true) {
      return lookahead(parser, context, isLexical)
          ? parseVariableStatement(parser, context | exports.Context.BlockScope, shouldConsume)
          : parseExpressionOrLabelledStatement(parser, context);
  }
  /**
   * Parses either async function declaration or statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
   * @see [Link](https://tc39.github.io/ecma262/#prod-Statement)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseAsyncFunctionDeclarationOrStatement(parser, context) {
      return lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine)
          ? parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context)
          : parseStatement(parser, context);
  }
  /**
   * Parses either For, ForIn or ForOf statement
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-for-statement)
   * @see [Link](https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseForStatement(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 12374 /* ForKeyword */);
      const awaitToken = !!(context & exports.Context.Async && consume(parser, context, 34017389 /* AwaitKeyword */));
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 50331659 /* LeftParen */);
      const { token } = parser;
      let init = null;
      let sequencePos = null;
      let variableStatement = null;
      let type = 'ForStatement';
      let test = null;
      let update = null;
      let right;
      if (token === 33566793 /* ConstKeyword */ || (token === 33574984 /* LetKeyword */ && lookahead(parser, context, isLexical))) {
          variableStatement = parseVariableStatement(parser, (context & ~exports.Context.AllowIn) | exports.Context.BlockScope, false);
      }
      else if (token === 33566791 /* VarKeyword */) {
          variableStatement = parseVariableStatement(parser, context & ~exports.Context.AllowIn, false);
      }
      else if (token !== 17825809 /* Semicolon */) {
          sequencePos = getLocation(parser);
          init = restoreExpressionCoverGrammar(parser, (context & ~exports.Context.AllowIn) | exports.Context.DisallowEscapedKeyword, parseAssignmentExpression);
      }
      if (consume(parser, context, 69746 /* OfKeyword */)) {
          type = 'ForOfStatement';
          if (init) {
              if (!(parser.flags & exports.Flags.AllowDestructuring) || init.type === 'AssignmentExpression') {
                  tolerant(parser, context, 73 /* InvalidDestructuringTarget */);
              }
              reinterpret(parser, context, init);
          }
          else
              init = variableStatement;
          right = parseAssignmentExpression(parser, context | exports.Context.AllowIn);
      }
      else if (consume(parser, context, 167786289 /* InKeyword */)) {
          if (init) {
              if (!(parser.flags & exports.Flags.AllowDestructuring))
                  tolerant(parser, context, 73 /* InvalidDestructuringTarget */);
              reinterpret(parser, context, init);
          }
          else
              init = variableStatement;
          type = 'ForInStatement';
          right = parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn);
      }
      else {
          if (parser.token === 16777234 /* Comma */)
              init = parseSequenceExpression(parser, context, init, sequencePos);
          if (variableStatement)
              init = variableStatement;
          expect(parser, context, 17825809 /* Semicolon */);
          test = parser.token !== 17825809 /* Semicolon */
              ? parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn)
              : null;
          expect(parser, context, 17825809 /* Semicolon */);
          update = parser.token !== 16 /* RightParen */
              ? parseExpression(parser, (context & ~exports.Context.AllowDecorator) | exports.Context.AllowIn)
              : null;
      }
      expect(parser, context, 16 /* RightParen */);
      const body = parseIterationStatement(parser, context);
      return finishNode(context, parser, pos, type === 'ForOfStatement'
          ? {
              type,
              body,
              left: init,
              right,
              await: awaitToken
          }
          : right
              ? {
                  type: type,
                  body,
                  left: init,
                  right
              }
              : {
                  type: type,
                  body,
                  init,
                  test,
                  update
              });
  }

  // 15.2 Modules
  /**
   * Parse module item list
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItemList)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseModuleItemList(parser, context) {
      // Prime the scanner
      nextToken(parser, context);
      const statements = [];
      while (parser.token !== 1048576 /* EndOfSource */) {
          statements.push(parser.token === 33554435 /* StringLiteral */ ?
              parseDirective(parser, context) :
              parseModuleItem(parser, context | exports.Context.AllowIn));
      }
      return statements;
  }
  /**
   * Parse module item
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleItem)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseModuleItem(parser, context) {
      switch (parser.token) {
          // @decorator
          case 120 /* At */:
              return parseDecorators(parser, context);
          // ExportDeclaration
          case 12371 /* ExportKeyword */:
              return parseExportDeclaration(parser, context);
          // ImportDeclaration
          case 33566810 /* ImportKeyword */:
              // 'Dynamic Import' or meta property disallowed here
              if (!(context & exports.Context.OptionsNext && lookahead(parser, context, nextTokenIsLeftParenOrPeriod))) {
                  return parseImportDeclaration(parser, context);
              }
          // falls through
          default:
              return parseStatementListItem(parser, context);
      }
  }
  /**
   * Parse export declaration
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ExportDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseExportDeclaration(parser, context) {
      const pos = getLocation(parser);
      const specifiers = [];
      let source = null;
      let declaration = null;
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 12371 /* ExportKeyword */);
      switch (parser.token) {
          // export * FromClause ;
          case 167774771 /* Multiply */:
              return parseExportAllDeclaration(parser, context, pos);
          case 12368 /* DefaultKeyword */:
              return parseExportDefault(parser, context, pos);
          case 41943052 /* LeftBrace */:
              {
                  // export ExportClause FromClause ;
                  // export ExportClause ;
                  expect(parser, context, 41943052 /* LeftBrace */);
                  let hasReservedWord = false;
                  while (parser.token !== 17825807 /* RightBrace */) {
                      if (parser.token !== 69743 /* GetKeyword */ && parser.token & 12288 /* Reserved */) {
                          hasReservedWord = true;
                          setPendingError(parser);
                      }
                      specifiers.push(parseNamedExportDeclaration(parser, context));
                      if (parser.token !== 17825807 /* RightBrace */)
                          expect(parser, context, 16777234 /* Comma */);
                  }
                  expect(parser, context | exports.Context.DisallowEscapedKeyword, 17825807 /* RightBrace */);
                  if (parser.token === 69745 /* FromKeyword */) {
                      source = parseModuleSpecifier(parser, context);
                      //  The left hand side can't be a keyword where there is no
                      // 'from' keyword since it references a local binding.
                  }
                  else if (hasReservedWord)
                      tolerant(parser, context, 46 /* UnexpectedReserved */);
                  consumeSemicolon(parser, context);
                  break;
              }
          // export ClassDeclaration
          case 33566797 /* ClassKeyword */:
              declaration = (parseClassDeclaration(parser, context));
              break;
          // export LexicalDeclaration
          case 33574984 /* LetKeyword */:
          case 33566793 /* ConstKeyword */:
              declaration = parseVariableStatement(parser, context | exports.Context.BlockScope);
              break;
          // export VariableDeclaration
          case 33566791 /* VarKeyword */:
              declaration = parseVariableStatement(parser, context);
              break;
          // export HoistableDeclaration
          case 33566808 /* FunctionKeyword */:
              declaration = parseFunctionDeclaration(parser, context);
              break;
          // export HoistableDeclaration
          case 594028 /* AsyncKeyword */:
              if (lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine)) {
                  declaration = parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context);
                  break;
              }
          // Falls through
          default:
              report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      }
      return finishNode(context, parser, pos, {
          type: 'ExportNamedDeclaration',
          source,
          specifiers,
          declaration,
      });
  }
  /**
   * Parse export all declaration
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseExportAllDeclaration(parser, context, pos) {
      expect(parser, context, 167774771 /* Multiply */);
      const source = parseModuleSpecifier(parser, context);
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ExportAllDeclaration',
          source,
      });
  }
  /**
   * Parse named export declaration
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseNamedExportDeclaration(parser, context) {
      const pos = getLocation(parser);
      // ExportSpecifier :
      // IdentifierName
      // IdentifierName as IdentifierName
      const local = parseIdentifierName(parser, context | exports.Context.DisallowEscapedKeyword, parser.token);
      const exported = consume(parser, context, 167843947 /* AsKeyword */)
          ? parseIdentifierName(parser, context, parser.token)
          : local;
      return finishNode(context, parser, pos, {
          type: 'ExportSpecifier',
          local,
          exported,
      });
  }
  /**
   * Parse export default
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-HoistableDeclaration)
   * @see [Link](https://tc39.github.io/ecma262/#prod-ClassDeclaration)
   * @see [Link](https://tc39.github.io/ecma262/#prod-HoistableDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   * @param pos Location
   */
  function parseExportDefault(parser, context, pos) {
      expect(parser, context | exports.Context.DisallowEscapedKeyword, 12368 /* DefaultKeyword */);
      let declaration;
      switch (parser.token) {
          // export default HoistableDeclaration[Default]
          case 33566808 /* FunctionKeyword */:
              declaration = parseFunctionDeclaration(parser, context | exports.Context.RequireIdentifier);
              break;
          // export default ClassDeclaration[Default]
          // export default  @decl ClassDeclaration[Default]
          case 120 /* At */:
          case 33566797 /* ClassKeyword */:
              declaration = parseClassDeclaration(parser, context & ~exports.Context.AllowIn | exports.Context.RequireIdentifier);
              break;
          // export default HoistableDeclaration[Default]
          case 594028 /* AsyncKeyword */:
              declaration = parseAsyncFunctionOrAssignmentExpression(parser, context | exports.Context.RequireIdentifier);
              break;
          default:
              // export default [lookahead ∉ {function, class}] AssignmentExpression[In] ;
              declaration = parseAssignmentExpression(parser, context | exports.Context.AllowIn);
              consumeSemicolon(parser, context);
      }
      return finishNode(context, parser, pos, {
          type: 'ExportDefaultDeclaration',
          declaration,
      });
  }
  /**
   * Parse import declaration
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ImportDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseImportDeclaration(parser, context) {
      const pos = getLocation(parser);
      expect(parser, context, 33566810 /* ImportKeyword */);
      let source;
      let specifiers = [];
      // 'import' ModuleSpecifier ';'
      if (parser.token === 33554435 /* StringLiteral */) {
          source = parseLiteral(parser, context);
      }
      else {
          specifiers = parseImportClause(parser, context | exports.Context.DisallowEscapedKeyword);
          source = parseModuleSpecifier(parser, context);
      }
      consumeSemicolon(parser, context);
      return finishNode(context, parser, pos, {
          type: 'ImportDeclaration',
          specifiers,
          source,
      });
  }
  /**
   * Parse import clause
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ImportClause)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseImportClause(parser, context) {
      const specifiers = [];
      switch (parser.token) {
          // 'import' ModuleSpecifier ';'
          case 33685505 /* Identifier */:
              {
                  specifiers.push(parseImportDefaultSpecifier(parser, context));
                  if (consume(parser, context, 16777234 /* Comma */)) {
                      switch (parser.token) {
                          // import a, * as foo
                          case 167774771 /* Multiply */:
                              parseNameSpaceImport(parser, context, specifiers);
                              break;
                          // import a, {bar}
                          case 41943052 /* LeftBrace */:
                              parseNamedImports(parser, context, specifiers);
                              break;
                          default:
                              tolerant(parser, context, 1 /* UnexpectedToken */, tokenDesc(parser.token));
                      }
                  }
                  break;
              }
          // import {bar}
          case 41943052 /* LeftBrace */:
              parseNamedImports(parser, context, specifiers);
              break;
          // import * as foo
          case 167774771 /* Multiply */:
              parseNameSpaceImport(parser, context, specifiers);
              break;
          default:
              report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      }
      return specifiers;
  }
  /**
   * Parse named imports
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-NamedImports)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseNamedImports(parser, context, specifiers) {
      expect(parser, context, 41943052 /* LeftBrace */);
      while (parser.token !== 17825807 /* RightBrace */) {
          specifiers.push(parseImportSpecifier(parser, context));
          if (parser.token !== 17825807 /* RightBrace */)
              expect(parser, context, 16777234 /* Comma */);
      }
      expect(parser, context, 17825807 /* RightBrace */);
  }
  /**
   * Parse import specifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ImportSpecifier)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseImportSpecifier(parser, context) {
      const pos = getLocation(parser);
      const { token } = parser;
      const imported = parseIdentifierName(parser, context | exports.Context.DisallowEscapedKeyword, token);
      let local;
      if (consume(parser, context, 167843947 /* AsKeyword */)) {
          local = parseBindingIdentifier(parser, context);
      }
      else {
          // An import name that is a keyword is a syntax error if it is not followed
          // by the keyword 'as'.
          if (hasBit(token, 12288 /* Reserved */))
              tolerant(parser, context, 46 /* UnexpectedReserved */);
          if (hasBit(token, 4194304 /* IsEvalOrArguments */))
              tolerant(parser, context, 47 /* StrictEvalArguments */);
          local = imported;
      }
      return finishNode(context, parser, pos, {
          type: 'ImportSpecifier',
          local,
          imported,
      });
  }
  /**
   * Parse binding identifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-NameSpaceImport)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseNameSpaceImport(parser, context, specifiers) {
      // NameSpaceImport:
      //  * as ImportedBinding
      const pos = getLocation(parser);
      expect(parser, context, 167774771 /* Multiply */);
      expect(parser, context, 167843947 /* AsKeyword */, 82 /* AsAfterImportStart */);
      const local = parseBindingIdentifier(parser, context);
      specifiers.push(finishNode(context, parser, pos, {
          type: 'ImportNamespaceSpecifier',
          local,
      }));
  }
  /**
   * Parse module specifier
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-ModuleSpecifier)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseModuleSpecifier(parser, context) {
      // ModuleSpecifier :
      //   StringLiteral
      expect(parser, context, 69745 /* FromKeyword */);
      if (parser.token !== 33554435 /* StringLiteral */)
          report(parser, 1 /* UnexpectedToken */, tokenDesc(parser.token));
      return parseLiteral(parser, context);
  }
  /**
   * Parse import default specifier
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseImportDefaultSpecifier(parser, context) {
      return finishNode(context, parser, getLocation(parser), {
          type: 'ImportDefaultSpecifier',
          local: parseIdentifier(parser, context),
      });
  }
  /**
   * Parses either async function or assignment expression
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-AssignmentExpression)
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncFunctionDeclaration)
   * @see [Link](https://tc39.github.io/ecma262/#prod-AsyncGeneratorDeclaration)
   *
   * @param parser  Parser object
   * @param context Context masks
   */
  function parseAsyncFunctionOrAssignmentExpression(parser, context) {
      return lookahead(parser, context, nextTokenIsFuncKeywordOnSameLine) ?
          parseAsyncFunctionOrAsyncGeneratorDeclaration(parser, context | exports.Context.RequireIdentifier) :
          parseAssignmentExpression(parser, context | exports.Context.AllowIn);
  }

  /**
   * Creates the parser object
   *
   * @param source The source coode to parser
   * @param sourceFile Optional source file info to be attached in every node
   */
  function createParser(source, sourceFile) {
      return {
          // The source code to parse
          source,
          // Source length
          length: source.length,
          // Current position
          index: 0,
          // Current line
          line: 1,
          // Current column
          column: 0,
          // Start position  before current token
          startIndex: 0,
          // Start position column before current token
          startColumn: 0,
          // Start position line before current token
          startLine: 1,
          // End position after parsing after current token
          lastIndex: 0,
          // End column position after current token
          lastColumn: 0,
          // End line position after current token
          lastLine: 0,
          // Pending cover grammar errors
          pendingExpressionError: undefined,
          // Mutable parser flags. Allows destructuring by default.
          flags: exports.Flags.AllowDestructuring,
          // The tokens
          token: 1048576 /* EndOfSource */,
          // Misc
          tokenRaw: '',
          lastValue: 0,
          comments: [],
          sourceFile,
          tokenRegExp: undefined,
          tokenValue: undefined,
          labelSet: undefined,
          errorLocation: undefined,
          errors: [],
      };
  }
  /**
   * Creating the parser
   *
   * @param source The source coode to parser
   * @param options The parser options
   * @param context Context masks
   */
  function parseSource(source, options, /*@internal*/ context) {
      let sourceFile = '';
      if (!!options) {
          // The flag to enable module syntax support
          if (options.module)
              context |= exports.Context.Module;
          // The flag to enable stage 3 support (ESNext)
          if (options.next)
              context |= exports.Context.OptionsNext;
          // The flag to enable React JSX parsing
          if (options.jsx)
              context |= exports.Context.OptionsJSX;
          // The flag to enable start and end offsets to each node
          if (options.ranges)
              context |= exports.Context.OptionsRanges;
          // The flag to enable line/column location information to each node
          if (options.loc)
              context |= exports.Context.OptionsLoc;
          // The flag to attach raw property to each literal node
          if (options.raw)
              context |= exports.Context.OptionsRaw;
          // Attach raw property to each identifier node
          if (options.rawIdentifier)
              context |= exports.Context.OptionsRawidentifiers;
          // The flag to allow return in the global scope
          if (options.globalReturn)
              context |= exports.Context.OptionsGlobalReturn;
          // The flag to allow to skip shebang - '#'
          if (options.skipShebang)
              context |= exports.Context.OptionsShebang;
          // Enable tolerant mode
          if (options.tolerant)
              context |= exports.Context.OptionsTolerant;
          // Set to true to record the source file in every node's loc object when the loc option is set.
          if (!!options.source)
              sourceFile = options.source;
          // Create a top-level comments array containing all comments
          if (!!options.comments)
              context |= exports.Context.OptionsComments;
          // The flag to enable implied strict mode
          if (options.impliedStrict)
              context |= exports.Context.Strict;
          // The flag to enable experimental features
          if (options.experimental)
              context |= exports.Context.OptionsExperimental;
          // The flag to set to bypass methods in Node
          if (options.node)
              context |= exports.Context.OptionsNode;
          // Accepts a callback function to be invoked for each syntax node (as the node is constructed)
      }
      const parser = createParser(source, sourceFile);
      const body = context & exports.Context.Module ?
          parseModuleItemList(parser, context) :
          parseStatementList(parser, context);
      const node = {
          type: 'Program',
          sourceType: context & exports.Context.Module ? 'module' : 'script',
          body: body,
      };
      if (context & exports.Context.LocationTracker) {
          if (context & exports.Context.OptionsRanges) {
              node.start = 0;
              node.end = source.length;
          }
          if (context & exports.Context.OptionsLoc) {
              node.loc = {
                  start: { line: 1, column: 0 },
                  end: { line: parser.line, column: parser.column
                  }
              };
              if (sourceFile)
                  node.loc.source = sourceFile;
          }
      }
      if (context & exports.Context.OptionsComments)
          node.comments = parser.comments;
      if (context & exports.Context.OptionsTolerant)
          node.errors = parser.errors;
      return node;
  }
  /**
   * Parse statement list
   *
   * @see [Link](https://tc39.github.io/ecma262/#prod-StatementList)
   *
   * @param Parser instance
   * @param Context masks
   */
  function parseStatementList(parser, context) {
      const statements = [];
      let hasProlog = true; // Parsing directive prologue.
      // prime the scanner
      nextToken(parser, context | exports.Context.DisallowEscapedKeyword);
      while (parser.token !== 1048576 /* EndOfSource */) {
          if (hasProlog && parser.token !== 33554435 /* StringLiteral */)
              hasProlog = false;
          if (hasProlog) {
              if (!(context & exports.Context.Strict) && parser.tokenRaw.length === 12 && parser.tokenValue === 'use strict') {
                  context |= exports.Context.Strict;
              }
              statements.push(parseDirective(parser, context));
          }
          else {
              statements.push(parseStatementListItem(parser, context));
          }
      }
      return statements;
  }
  /**
   * Parse either script code or module code
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-scripts)
   * @see [Link](https://tc39.github.io/ecma262/#sec-modules)
   *
   * @param source source code to parse
   * @param options parser options
   */
  function parse(source, options) {
      return options && options.module
          ? parseModule(source, options)
          : parseScript(source, options);
  }
  /**
   * Parse script code
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-scripts)
   *
   * @param source source code to parse
   * @param options parser options
   */
  function parseScript(source, options) {
      return parseSource(source, options, exports.Context.Empty);
  }
  /**
   * Parse module code
   *
   * @see [Link](https://tc39.github.io/ecma262/#sec-modules)
   *
   * @param source source code to parse
   * @param options parser options
   */
  function parseModule(source, options) {
      return parseSource(source, options, exports.Context.Strict | exports.Context.Module);
  }



  var estree = /*#__PURE__*/Object.freeze({

  });



  var index = /*#__PURE__*/Object.freeze({
    scanIdentifier: scanIdentifier,
    scanMaybeIdentifier: scanMaybeIdentifier,
    scanHexIntegerLiteral: scanHexIntegerLiteral,
    scanOctalOrBinary: scanOctalOrBinary,
    scanImplicitOctalDigits: scanImplicitOctalDigits,
    scanSignedInteger: scanSignedInteger,
    scanNumericLiteral: scanNumericLiteral,
    scanNumericSeparator: scanNumericSeparator,
    scanDecimalDigitsOrSeparator: scanDecimalDigitsOrSeparator,
    scanDecimalAsSmi: scanDecimalAsSmi,
    scanRegularExpression: scanRegularExpression,
    scan: scan,
    scanEscapeSequence: scanEscapeSequence,
    throwStringError: throwStringError,
    scanString: scanString,
    consumeTemplateBrace: consumeTemplateBrace,
    scanTemplate: scanTemplate,
    skipSingleHTMLComment: skipSingleHTMLComment,
    skipSingleLineComment: skipSingleLineComment,
    skipMultiLineComment: skipMultiLineComment,
    addComment: addComment,
    nextUnicodeChar: nextUnicodeChar,
    isIdentifierPart: isIdentifierPart,
    escapeInvalidCharacters: escapeInvalidCharacters,
    consumeOpt: consumeOpt,
    consumeLineFeed: consumeLineFeed,
    scanPrivateName: scanPrivateName,
    advanceNewline: advanceNewline,
    fromCodePoint: fromCodePoint,
    readNext: readNext,
    toHex: toHex,
    advanceOnMaybeAstral: advanceOnMaybeAstral
  });



  var parser = /*#__PURE__*/Object.freeze({
    parseClassDeclaration: parseClassDeclaration,
    parseFunctionDeclaration: parseFunctionDeclaration,
    parseAsyncFunctionOrAsyncGeneratorDeclaration: parseAsyncFunctionOrAsyncGeneratorDeclaration,
    parseVariableDeclarationList: parseVariableDeclarationList,
    parseExpression: parseExpression,
    parseSequenceExpression: parseSequenceExpression,
    parseAssignmentExpression: parseAssignmentExpression,
    parseRestElement: parseRestElement,
    parseLeftHandSideExpression: parseLeftHandSideExpression,
    parsePrimaryExpression: parsePrimaryExpression,
    parseIdentifier: parseIdentifier,
    parseLiteral: parseLiteral,
    parseBigIntLiteral: parseBigIntLiteral,
    parseIdentifierName: parseIdentifierName,
    parseFunctionExpression: parseFunctionExpression,
    parseAsyncFunctionOrAsyncGeneratorExpression: parseAsyncFunctionOrAsyncGeneratorExpression,
    parsePropertyName: parsePropertyName,
    parseObjectLiteral: parseObjectLiteral,
    parseFormalListAndBody: parseFormalListAndBody,
    parseFunctionBody: parseFunctionBody,
    parseFormalParameters: parseFormalParameters,
    parseFormalParameterList: parseFormalParameterList,
    parseClassBodyAndElementList: parseClassBodyAndElementList,
    parseClassElement: parseClassElement,
    parseDecorators: parseDecorators,
    parseModuleItemList: parseModuleItemList,
    parseModuleItem: parseModuleItem,
    parseExportDeclaration: parseExportDeclaration,
    parseImportDeclaration: parseImportDeclaration,
    createParser: createParser,
    parseSource: parseSource,
    parseStatementList: parseStatementList,
    parse: parse,
    parseScript: parseScript,
    parseModule: parseModule,
    parseBindingIdentifierOrPattern: parseBindingIdentifierOrPattern,
    parseBindingIdentifier: parseBindingIdentifier,
    parseAssignmentRestElement: parseAssignmentRestElement,
    parseAssignmentPattern: parseAssignmentPattern,
    parseBindingInitializer: parseBindingInitializer,
    parseStatementListItem: parseStatementListItem,
    parseStatement: parseStatement,
    parseEmptyStatement: parseEmptyStatement,
    parseContinueStatement: parseContinueStatement,
    parseBreakStatement: parseBreakStatement,
    parseIfStatement: parseIfStatement,
    parseDebuggerStatement: parseDebuggerStatement,
    parseTryStatement: parseTryStatement,
    parseCatchBlock: parseCatchBlock,
    parseThrowStatement: parseThrowStatement,
    parseExpressionStatement: parseExpressionStatement,
    parseDirective: parseDirective,
    parseExpressionOrLabelledStatement: parseExpressionOrLabelledStatement,
    parseDoWhileStatement: parseDoWhileStatement,
    parseWhileStatement: parseWhileStatement,
    parseBlockStatement: parseBlockStatement,
    parseReturnStatement: parseReturnStatement,
    parseIterationStatement: parseIterationStatement,
    parseWithStatement: parseWithStatement,
    parseSwitchStatement: parseSwitchStatement,
    parseCaseOrDefaultClauses: parseCaseOrDefaultClauses,
    parseVariableStatement: parseVariableStatement,
    parseJSXRootElement: parseJSXRootElement,
    parseJSXOpeningElement: parseJSXOpeningElement,
    nextJSXToken: nextJSXToken,
    scanJSXToken: scanJSXToken,
    parseJSXText: parseJSXText,
    parseJSXAttributes: parseJSXAttributes,
    parseJSXSpreadAttribute: parseJSXSpreadAttribute,
    parseJSXNamespacedName: parseJSXNamespacedName,
    parseJSXAttributeName: parseJSXAttributeName,
    parseJSXAttribute: parseJSXAttribute,
    parseJSXEmptyExpression: parseJSXEmptyExpression,
    parseJSXSpreadChild: parseJSXSpreadChild,
    parseJSXExpressionContainer: parseJSXExpressionContainer,
    parseJSXExpression: parseJSXExpression,
    parseJSXClosingFragment: parseJSXClosingFragment,
    parseJSXClosingElement: parseJSXClosingElement,
    parseJSXIdentifier: parseJSXIdentifier,
    parseJSXMemberExpression: parseJSXMemberExpression,
    parseJSXElementName: parseJSXElementName,
    scanJSXIdentifier: scanJSXIdentifier
  });

  // tslint:disable-next-line:variable-name
  const Parser = parser;

  const version = '1.6.9';

  exports.version = version;
  exports.ESTree = estree;
  exports.Scanner = index;
  exports.parse = parse;
  exports.parseSource = parseSource;
  exports.parseModule = parseModule;
  exports.parseScript = parseScript;
  exports.characterType = characterType;
  exports.errorMessages = errorMessages;
  exports.constructError = constructError;
  exports.report = report;
  exports.tolerant = tolerant;
  exports.tokenDesc = tokenDesc;
  exports.descKeyword = descKeyword;
  exports.Parser = Parser;
  exports.isValidIdentifierPart = isValidIdentifierPart;
  exports.isValidIdentifierStart = isValidIdentifierStart;
  exports.mustEscape = mustEscape;
  exports.validateBreakOrContinueLabel = validateBreakOrContinueLabel;
  exports.addLabel = addLabel;
  exports.popLabel = popLabel;
  exports.hasLabel = hasLabel;
  exports.finishNode = finishNode;
  exports.expect = expect;
  exports.consume = consume;
  exports.nextToken = nextToken;
  exports.hasBit = hasBit;
  exports.consumeSemicolon = consumeSemicolon;
  exports.parseExpressionCoverGrammar = parseExpressionCoverGrammar;
  exports.restoreExpressionCoverGrammar = restoreExpressionCoverGrammar;
  exports.swapContext = swapContext;
  exports.validateParams = validateParams;
  exports.reinterpret = reinterpret;
  exports.lookahead = lookahead;
  exports.isValidSimpleAssignmentTarget = isValidSimpleAssignmentTarget;
  exports.getLocation = getLocation;
  exports.isValidIdentifier = isValidIdentifier;
  exports.isLexical = isLexical;
  exports.isEndOfCaseOrDefaultClauses = isEndOfCaseOrDefaultClauses;
  exports.nextTokenIsLeftParenOrPeriod = nextTokenIsLeftParenOrPeriod;
  exports.nextTokenisIdentifierOrParen = nextTokenisIdentifierOrParen;
  exports.nextTokenIsLeftParen = nextTokenIsLeftParen;
  exports.nextTokenIsFuncKeywordOnSameLine = nextTokenIsFuncKeywordOnSameLine;
  exports.isPropertyWithPrivateFieldKey = isPropertyWithPrivateFieldKey;
  exports.parseAndClassifyIdentifier = parseAndClassifyIdentifier;
  exports.nameIsArgumentsOrEval = nameIsArgumentsOrEval;
  exports.setPendingError = setPendingError;
  exports.isEqualTagNames = isEqualTagNames;
  exports.isInstanceField = isInstanceField;
  exports.validateUpdateExpression = validateUpdateExpression;
  exports.setPendingExpressionError = setPendingExpressionError;
  exports.validateCoverParenthesizedExpression = validateCoverParenthesizedExpression;
  exports.validateAsyncArgumentList = validateAsyncArgumentList;
  exports.isInOrOf = isInOrOf;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
