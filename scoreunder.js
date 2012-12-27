if(typeof _ == "undefined") {
  if(typeof require != "undefined") {
    var _ = require('./underscore');
  } else {
    throw("This library depends on underscore");
  }
}

// altered from from wu.js
(function() {
  var toArray = function(x) {
    return Array.prototype.slice.call(x);
  }
  
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
})();


(function(){
  
  var __ = {};
  var root = this;

  var configuration = {
    'each': {opt_context: true},
    'map' : {opt_context: true},
    'reduce':  {arg_order: [1,2,0,3], opt_context: true},
    'reduceRight': {flip_index: 3, opt_context: true},
    'find': {opt_context: true},
    'filter': {opt_context: true},
    'reject': {opt_context: true},
    'every': {opt_context: true},
    'some': {run_if_first_arg_is: 'array', opt_context: true},
    'invoke': {skip_flip: true, curry_length: 2},
    'max': {run_if_first_arg_is: 'array', opt_context: true},
    'min': {run_if_first_arg_is: 'array', opt_context: true},
    'sortBy': {opt_context: true},
    'first': {run_if_first_arg_is: 'array', curry_length: 2},
    'initial' : {run_if_first_arg_is: 'array'},
    'last': {run_if_first_arg_is: 'array', curry_length: 2},
    'rest': {run_if_first_arg_is: 'array'},
    'flatten': {run_if_first_arg_is: 'array'},
    'without': {run_if_first_arg_is: 'array'},
    'uniq': {run_if_first_arg_is: 'array'},
    'object': {skip_flip: true},
    'indexOf': {curry_length: 2},
    'lastIndexOf': {curry_length: 2},
    'sortedIndex': {curry_length: 2},
    'debounce': {curry_length: 2},
    'times': {opt_context: true},
    'random': {skip_flip: true},
    'range': {skip_flip: true}
  }

  var toOmit = ['difference', 'bind', 'bindAll', 'memoize', 'delay', 'defer', 'extend', 'pick', 'omit', 'defaults', 'template', 'compose'];

  var checkType = function(first_args_type, arg) {
    if(first_args_type == 'array') { return _.isArray(arg); }
    return typeof(arg) == first_args_type;
  }

  var checkTypeBeforeAutoCurry = function(first_args_type, f, curried_f){
    return function() {
      var args = Array.prototype.slice.call(arguments);
      return checkType(first_args_type, args[0]) ?
                                      f.apply(f, arguments) :
                                      curried_f.apply(f, arguments);
    }
  }

  var flipAndCurry = function(f, n, flip_idx) {
    flip_idx = flip_idx || n;
    return f.flip(flip_idx).autoCurry(n);
  }

  var rearrangeArgs = function(f, order, n) {
    return function() {
      var new_args = []
        , args = Array.prototype.slice.call(arguments);
      for(i in order) { new_args[order[i]] = args[i]; }
      return f.apply(f, new_args);
    }.autoCurry(n);
  }

  var decorateScoreUnderObject = function(key) {
    if((typeof _[key] != "function") || _.contains(toOmit, key)) {
      return __[key] = _[key];
    }
  
    var config = configuration[key] || {}
      , underscore_fn = _[key]
      , curry_len = config.curry_length || underscore_fn.length
      , curried_f;
  
    if(config.opt_context) { curry_len -= 1 }
  
    if(curry_len === 1) { return __[key] = underscore_fn; }
    if(config.skip_flip) { return __[key] = underscore_fn.autoCurry(curry_len); }
  
    curried_f = config.arg_order ?
                rearrangeArgs(underscore_fn, config.arg_order, curry_len) :
                flipAndCurry(underscore_fn, curry_len, config.flip_index);
  
  
    if(config.run_if_first_arg_is){
      return __[key] = checkTypeBeforeAutoCurry(config.run_if_first_arg_is, underscore_fn, curried_f);
    }
    __[key] = curried_f;
  }

  for(key in _) { decorateScoreUnderObject(key) };

  if(typeof module !== 'undefined' && module.exports) {
    exports = module.exports = __;
  } else {
    root._ = __;
  }
  
})(); 
