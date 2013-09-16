// AutoCurry
(function(lodash){

  //+ toArray :: arguments -> [b]
  var toArray = function(x) {
      return slice.call(x);
    }

  //- altered from from wu.js
  //+ curry :: f
    , curry = function (fn /* variadic number of args */) {
        var args = slice.call(arguments, 1);
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
      };


var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function annotate(fn) {
  var $inject,
      fnText,
      argDecl,
      last;

  if (typeof fn == 'function') {
    if (!($inject = fn.$inject)) {
      $inject = [];
      if (fn.length) {
        fnText = fn.toString().replace(STRIP_COMMENTS, '');
        argDecl = fnText.match(FN_ARGS);
        argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
          arg.replace(FN_ARG, function(all, underscore, name){
            $inject.push(name);
          });
        });
      }
      fn.$inject = $inject;
    }
  }
  return $inject;
}

  window.lib3 = { annotate: annotate };
  window.lodash = lodash;
  Object.getOwnPropertyNames(lodash).forEach(function(v,k){
    //console.log(v);
    //console.log(k);
    var lmethod = lodash[v];
    if (lodash.isFunction(lmethod)){
    var lmethodInfo = annotate(lmethod);

    //console.log(lmethodInfo);
    var callBackIndex = lmethodInfo.indexOf("callback");
    var funcIndex = lmethodInfo.indexOf("func");
    if (callBackIndex>0){
      window.lib3[v] = autoCurry(function(callback){
        var rest = lodash.rest(arguments);
        rest.splice(callBackIndex,0,callback);
        return lmethod.apply(this, rest);
      });
      /*Function.prototype.autoCurry = function(n) {
  return autoCurry(this, n);
};*/  
    }else if (funcIndex>0){
      window.lib3[v] = autoCurry(function(callback){
          var rest = lodash.rest(arguments);
          rest.splice(funcIndex,0,callback);
          return lmethod.apply(this, rest);
        });

    }else{
      window.lib3[v] = autoCurry(lmethod);
      console.log(v);
      console.log(lmethodInfo);
    }
    }
    //["array", "callback", "thisArg"] 
  });


})(_)
