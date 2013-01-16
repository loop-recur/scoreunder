if(typeof _ == "undefined") {
  if(typeof require != "undefined") {
    var _ = require('./underscore');
  } else {
    throw("This library depends on underscore");
  }
}


(function() {
  var toArray = function(x) {
    return Array.prototype.slice.call(x);
  }
  
  // altered from from wu.js
  var curry = function (fn /* variadic number of args */) {
         var args = Array.prototype.slice.call(arguments, 1);
         var f = function () {
             return fn.apply(this, args.concat(toArray(arguments)));
         };
         return f;
     };

  var autoCurry = function (fn, numArgs) {
         numArgs = numArgs || fn.length;
         var f = function () {
             if (arguments.length < numArgs) {
                 return numArgs - arguments.length > 0 ?
                     autoCurry(curry.apply(this, [fn].concat(toArray(arguments))),
                                  numArgs - arguments.length) :
                     curry.apply(this, [fn].concat(toArray(arguments)));
             }
             else {
                 return fn.apply(this, arguments);
             }
         };
         f.toString = function(){ return fn.toString(); };
         f.curried = true;
         return f;
     };
     
     Function.prototype.autoCurry = function(n) {
       return autoCurry(this, n);
     }
     
     // altered from functional.js
     Function.prototype.flip=function(optional_arg_idx){
       var fn = this;
       optional_arg_idx = optional_arg_idx || 0;

       return function(){
         var args = Array.prototype.slice.call(arguments,0)
           , to_be_flipped = args.slice(0,optional_arg_idx).reverse() //bad?
           , args = to_be_flipped.concat(args.slice(optional_arg_idx));
         return fn.apply(this,args);
       }
     };
     
     var fillOptionalsAsNull = function(types, args) {
       args[types.length-1] = args[args.length-1];
       types.map(function(t,i){
         args[i] = t.match(/\[/) ? undefined : args[i];
       });
       return args;
     }

     var _checkArgType = function(i, arg, types, main_arg) {
       var type = (typeof arg)
         , type_is_optional = !!types[i].match(/\[/)
         , has_type = (types[i].search(type) >= 0) // search in case []
         , type_of_arg_is_type_of_main_arg = (main_arg.search(type) >= 0);
       return type_is_optional && type_of_arg_is_type_of_main_arg;
     }

     var receivedAllArgsExceptOptionals = function(types, args, main_arg) {
       var got_all = false;
       for(var i = 0, l = args.length; i < l; i++) {
         if(_checkArgType(i, args[i], types, main_arg)) {
           got_all = true;
           break;
         };
       }
       return got_all;
     }

     var receivedAllArgs = function(arg_len, f_len) {
       return arg_len >= f_len;
     }

     var _nonOptionalArgLength = function(types) {
       return types.filter(function(t){ return !t.match(/\[/); }).length;
     }

     var typeCurry = function tc(f, types, curried_args) {
       var numArgs = numArgs || types.length
         , main_arg = types[types.length-1]
         , minimum_len = _nonOptionalArgLength(types);
       return function() {  
         var args = curried_args.concat(toArray(arguments))
           , arg_len = args.length;
          
         if(receivedAllArgs(arg_len, numArgs)) {
           return f.apply(this, args);
         }
          
         if((arg_len >= minimum_len) && receivedAllArgsExceptOptionals(types, args, main_arg)){
           return f.apply(this, fillOptionalsAsNull(types, args));
         }
         return tc(f, types, args);
       }
     }

     Function.prototype.typeCurry = function(types) {
       return typeCurry(this, types, []);
     }
})();


(function(){
  
  var __ = {};
  var root = this;

  var configuration = {
    'each': {sig: ['function', '[object]', 'array|object']},
    'map' : {sig: ['function', '[object]', 'array|object']},
    'reduce':  {sig: ['function', 'd_', '[object]', 'array|object']},
    // 'reduceRight': {flip_index: 3, opt_context: true},
    // 'find': {opt_context: true},
    'select': {sig: ['function', '[object]', 'array|object']},
    'filter': {alias: 'select'},
    // 'reject': {opt_context: true},
    // 'every': {opt_context: true},
    // 'some': {run_if_first_arg_is: 'array', opt_context: true},
    // 'invoke': {skip_flip: true, curry_length: 2},
    // 'max': {run_if_first_arg_is: 'array', opt_context: true},
    // 'min': {run_if_first_arg_is: 'array', opt_context: true},
    // 'sortBy': {opt_context: true},
    // 'first': {run_if_first_arg_is: 'array', curry_length: 2},
    'first': {sig: ['[number]', 'array']},
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
  };

  var toOmit = ['difference', 'bind', 'bindAll', 'memoize', 'delay', 'defer', 'extend', 'pick', 'omit', 'defaults', 'template', 'compose'];

  var decorateScoreUnderObject = function(key) {
    var fun = _[key]
      , typeSig = configuration[key] ? configuration[key].sig : undefined
      , alias = configuration[key] ? configuration[key].alias : undefined
      , aliasTypeSig = configuration[alias] ? configuration[alias].sig : undefined
      ;
    
    if((typeof _[key] != "function") || _.contains(toOmit, key)) {
      return __[key] = _[key];
    }
    
    __[key] = function(){
      var args = Array.prototype.slice.call(arguments)
        , s = args[args.length-1];
      var total = [s].concat(args.slice(0,-1));
      return fun.apply(this, total);
    }.autoCurry(fun.length);
    
    if(typeSig) {
      __[key] = __[key].typeCurry(typeSig);
    } else if (alias) {
      __[key] = __[key].typeCurry(aliasTypeSig);
    }

  };

  for(key in _) { decorateScoreUnderObject(key) };

  if(typeof module !== 'undefined' && module.exports) {
    exports = module.exports = __;
  } else {
    root._ = __;
  }
  
})(); 
