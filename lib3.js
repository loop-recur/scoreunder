// Type system of some sort
//
// Ex.
//
// a = [1, 2, 3]
//
// will throw an error if a is not an array
// a = t.arr( a )
//
// will throw an error if a is not an array of numbers
// a = t.arrOf(t.num)( a )
//
var t = (function(){

  var t = {}

  var typeOf = t.typeOf = function(type) {
    return function(p) {
      if (typeof p !== type) {
        throw new Error("Expected " + type + ". Got " + p);
      }
      return p;
    };
  };

  t.str = typeOf('string');
  t.num = typeOf('number');
  t.obj = typeOf('object');
  t.bool = typeOf('boolean');
  t.func = typeOf('function');

  var arr = t.arr = function(a) {
    if (Object.prototype.toString.call(a) !== "[object Array]") {
      throw new Error("Expected array, got " + a);
    }
    return a;
  };

  t.arrOf = function(c) {
    return function(a) {
      return map( c, arr(a) );
    };
  };

  return t;

})();




// Curry

var slice = Array.prototype.slice
  
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
    };

Function.prototype.autoCurry = function(n) {
  return autoCurry(this, n);
};



var root



  , compact = function( array ) {
      var results = [],
          arr = array.slice(0);
      for( var i = 0, l = arr.length; i < l; i++ ) {
        if( !!arr[i] ) results.push( arr[i] );
      }
      return results;
    }



  , indexOf = function(value, array) {
      var index = -1,
          length = array.length;
      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }.autoCurry(2)



  , map = function( fn, x ) {
      var results = [];
      if (x.map) return x.map(fn);
      if (x.length === +x.length) {
        for( var i = 0, l = x.length; i < l; i++ ){
          results.push( fn( x[i] ) );
        }
      } else {
        for (var key in x) {
          if(x.hasOwnProperty(key)){
            results.push( fn( x[key] ) );
          }
        }
      }
      return results;
    }.autoCurry(2)



  , compose = function( f ) {
      var fns = Array.prototype.slice.call(arguments).reverse();
      return function( x ){
        for( var i = 0, l = fns.length; i < l; i++ ){
          x = fns[i]( x );
        }
        return x;
      }
    }



  , filter = function( fn, x ) {
      var results = [];
      if ( x.filter ) return x.filter( fn );
      if (x.length === +x.length) {
        for( var i = 0, l = x.length; i < l; i++ ){
          if ( fn(x[i]) ) results.push( x[i] );
        }
      } else {
        for (var key in x) {
          if(x.hasOwnProperty(key)){
            if ( fn(x[key]) ) results.push( x[key] );
          }
        }
      }
      return results;
    }.autoCurry(2)


  
  , pluck = function( prop, obj ) {
      return obj[prop];
    }.autoCurry(2)



  , sortBy = function( fn, array ) {
      return array.slice(0).sort(function(a,b) {
        if (fn(a) < fn(b)) return -1;
        if (fn(a) > fn(b)) return 1;
        return 0;
      });
    }.autoCurry(2)


  /////////



  , first = function( array ) {
      if (array.length === 0) return [];
      return array[0];
    }


  , take = function( count, array ){
      if (array.length === 0) return [];
      var results = [];
      for( var i = 0; i < count; i++ ) {
        results.push(array[i]);
      }
      return results;
    }.autoCurry(2)
      


  , last = function( array ) {
      if (array.length === 0) return [];
      return array[array.length-1]
    }


  , initial = function( array ) {
      if (array.length === 0) return [];
      var results = [];
      for( var i = 0, l = array.length-1; i < l; i++ ){
        results.push( array[i] );
      }
      return results;
    }


  , rest = function( array ) {
      return array.slice(1);
    }


  , drop = function( count, array ) {
      if (array.length === 0) return [];
      return array.slice(count);
    }.autoCurry(2)


  , max = function( array ) {
      result = array[0]
      for (var i = 1, len = array.length; i < len; i++) {
        if (array[i] > result) result = array[i];
      }
      return result;
    }


  , min = function( array ) {
      result = array[0]
      for (var i = 1, len = array.length; i < len; i++) {
        if (array[i] < result) result = array[i];
      }
      return result;
    }



  , range = function(start, stop) {
      return rangeStep( start, stop, 1 );
    }.autoCurry(2)



  , rangeStep = function(start, stop, step) {
      var len = Math.max(Math.ceil((stop - start) / step), 0);
      var idx = 0;
      var range = new Array(len);
      while(idx < len) {
        range[idx++] = start;
        start += step;
      }
      return range;
    }.autoCurry(3)
