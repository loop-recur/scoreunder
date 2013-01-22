if(typeof _ == "undefined") {
  if(typeof require != "undefined") {
    var _ = require('./underscore');
  } else {
    throw("This library depends on underscore");
  }
}


;(function() {
  var __ = {}

    , root = this
    
    , configuration = {
        'each': { sig: ['function', '[object]', 'array|object'] },
        'forEach': { alias: 'each' },
        'map' : { sig: ['function', '[object]', 'array'] },
        'collect': { alias: 'map' },
        'reduce': { sig: ['function', '_', '[object]', 'array|object'] },
        'inject': { alias: 'reduce' },
        'foldl': { alias: 'reduce' },
        'reduceRight': { sig: ['function', '_', '[object]', 'array|object'] },
        'foldr': { alias: 'reduceRight' },
        'find': { sig: ['function', '[object]', 'array|object'] },
        'detect': { alias: 'find' },
        'select': { sig: ['function', '[object]', 'array|object'] },
        'filter': { alias: 'select' },
        'reject': { sig: ['function', '[object]', 'array|object'] },
        'every': { sig: ['function', '[object]', 'array|object'] },
        'all': { alias: 'every' },

        // 'some': {run_if_first_arg_is: 'array', opt_context: true},
        // 'invoke': {skip_flip: true, curry_length: 2},
        // 'max': {run_if_first_arg_is: 'array', opt_context: true},
        // 'min': {run_if_first_arg_is: 'array', opt_context: true},
        // 'sortBy': {opt_context: true},
        
        // TODO: fix scoreunder to work with first()'s type sig.
        // TODO: Enable specs for first(), head() and take().
        //'first': { sig: ['[number]', 'array'] },
        //'head': { alias: 'first' },
        //'take': { alias: 'first' },
        
        // 'initial' : {run_if_first_arg_is: 'array'},
        // 'last': {run_if_first_arg_is: 'array', curry_length: 2},
        // 'rest': {run_if_first_arg_is: 'array'},
        // 'flatten': {run_if_first_arg_is: 'array'},
        // 'without': {run_if_first_arg_is: 'array'},
        // 'uniq': {run_if_first_arg_is: 'array'},
        // 'object': {skip_flip: true},
        // 'indexOf': {curry_length: 2},
        // 'lastIndexOf': {curry_length: 2},
        // 'sortedIndex': {curry_length: 2},
        // 'debounce': {curry_length: 2},
        // 'times': {opt_context: true},
        // 'random': {skip_flip: true},
        // 'range': {skip_flip: true}
      }

    , toOmit = [ 'difference'
               , 'bind'
               , 'bindAll'
               , 'memoize'
               , 'delay'
               , 'defer'
               , 'extend'
               , 'pick'
               , 'omit'
               , 'defaults'
               , 'template'
               , 'compose'
               ]

  //+ slice :: a -> [b]
    , slice = Array.prototype.slice
  
  //+ toArray :: a -> [b]
    , toArray = function(x) {
        return slice.call(x);
      }
  
  //- altered from from wu.js
  //+ curry :: f
    , curry = function (fn /* variadic number of args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        var f = function () {
          return fn.apply(this, args.concat(toArray(arguments)));
        };
        return f;
      }

  //+ autoCurry :: f -> Int -> f
    , autoCurry = function (fn, numArgs) {
        numArgs = numArgs || fn.length;
        var f = function () {
          if (arguments.length < numArgs) {
            return numArgs - arguments.length > 0 ?
              autoCurry(curry.apply(this, [fn].concat(toArray(arguments))),
              numArgs - arguments.length) :
              curry.apply(this, [fn].concat(toArray(arguments)));
          } else {
            return fn.apply(this, arguments);
          }
        };
        f.toString = function(){ return fn.toString(); };
        f.curried = true;
        return f;
      }
     
  //+ decorateFunctionPrototypeWithAutoCurry :: IO
    , decorateFunctionPrototypeWithAutoCurry = (function() {
        Function.prototype.autoCurry = function(n) {
          return autoCurry(this, n);
        };
      })()

  //- altered from functional.js
  //+ decorateFunctionPrototypeWithFlip :: IO
    , decorateFunctionPrototypeWithFlip = (function() {
        Function.prototype.flip = function(optional_arg_idx) {
          var fn = this;
          optional_arg_idx = optional_arg_idx || 0;

          return function() {
            var args = Array.prototype.slice.call(arguments,0)
              , to_be_flipped = args.slice(0,optional_arg_idx).reverse() //bad?
              , args = to_be_flipped.concat(args.slice(optional_arg_idx));
            return fn.apply(this,args);
          }
        };
      })()
     
  //+ fillOptionalsAsNull :: [String] -> [a]
    , fillOptionalsAsNull = function(types, args) {
        args[types.length-1] = args[args.length-1];
        types.map(function(t,i) {
          args[i] = t.match(/\[/) ? undefined : args[i];
        });
        return args;
      }

  //+ _checkArgType :: Int -> a -> [String] -> b -> Bool
    , _checkArgType = function(i, arg, types, main_arg) {
        var type = (arg instanceof Array) ? 'array' : (typeof arg)
          , type_is_optional = !!types[i].match(/\[/)
          , type_of_arg_is_type_of_main_arg = (main_arg.search(type) >= 0);
        return type_is_optional && type_of_arg_is_type_of_main_arg;
      }

  //+ receivedAllArgsExceptOptionals :: [String] -> [a] -> b -> Bool
    , receivedAllArgsExceptOptionals = function(types, args, main_arg) {
        var got_all = false
          , i
          , number_of_args = args.length;
        for (i = 0; i < number_of_args; i++) {
          if (_checkArgType(i, args[i], types, main_arg)) {
            got_all = true;
            break;
          };
        }
        return got_all;
      }

  //+ receivedAllArgs :: Int -> Int -> Bool
    , receivedAllArgs = function(arg_len, f_len) {
        return arg_len >= f_len;
      }

  //+ _nonOptionalArgLength :: [String] -> [String]
    , _nonOptionalArgLength = function(types) {
        return types.filter(function(t){ return !t.match(/\[/); }).length;
      }

  //+ typeCurry :: f -> [String] -> [a] -> g
    , typeCurry = function tc(f, types, curried_args) {
        var numArgs = numArgs || types.length
          , main_arg = types[types.length-1]
          , minimum_len = _nonOptionalArgLength(types);
        return function() {  
          var args = curried_args.concat(toArray(arguments))
            , arg_len = args.length;
          if (receivedAllArgs(arg_len, numArgs)) {
            return f.apply(this, args);
          }
          
          if ((arg_len >= minimum_len) && receivedAllArgsExceptOptionals(types, args, main_arg)){
            return f.apply(this, fillOptionalsAsNull(types, args));
          }

          return tc(f, types, args);
        }
      }

  //+ decorateFunctionPrototypeWithTypeCurry :: IO
    , decorateFunctionPrototypeWithTypeCurry = (function() {
        Function.prototype.typeCurry = function(types) {
          return typeCurry(this, types, []);
        };
      })()

  //+ getTypeSig :: String -> [String]
    , getTypeSig = function(key) {
        return configuration[key] ? configuration[key].sig : undefined;
      }

  //+ getAlias :: String -> String
    , getAlias = function(key) {
        return configuration[key] ? configuration[key].alias : undefined;
      }

  //+ getAutoCurriedFunction :: String -> f
    , getAutoCurriedFunction = function(key) {
        var fun = _[key];
        return function() {
          var args = toArray(arguments)
            , s = args[args.length - 1]
            , total = [s].concat(args.slice(0, -1));
          return fun.apply(this, total);
        }.autoCurry(fun.length);
      }

  //+ decorateScoreUnderObject :: String -> IO
    , decorateScoreUnderObject = function(key) {
        var not_a_function_in_underscore = typeof _[key] != "function"
          , omit_from_auto_curry = _.contains(toOmit, key)
          , alias = getAlias(key)
          , type_sig = alias ? getTypeSig(alias) : getTypeSig(key)
          ;

        if(not_a_function_in_underscore || omit_from_auto_curry) {
          return __[key] = _[key];
        }

        __[key] = getAutoCurriedFunction(key);
    
        if(type_sig) {
          __[key] = __[key].typeCurry(type_sig);
        }
      }

  //+ exposeFunction :: f -> Bool
    , exposeFunction = function(f) {
        var omit = ['expose'];
        return omit.indexOf(f) == -1 ? true : false;
      }

  //+ expose :: a -> IO
    , expose = function(ns) {
        var f;
        ns = ns || root;
        for (f in __) {
          if (exposeFunction(f) && __.hasOwnProperty(f)) {
            ns[f] = __[f];
          }
        }
      }

  //+ decorateScoreUnderWithExpose :: IO
    , decorateScoreUnderWithExpose = (function() {
        __['expose'] = expose;
      })()
    ;

  for(key in _) { decorateScoreUnderObject(key) };

  if(typeof module !== 'undefined' && module.exports) {
    exports = module.exports = __;
  } else {
    root._ = __;
  }
  
})(); 
