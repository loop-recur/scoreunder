;(function (window, global_module, global_exports, undefined) {
  var lib3 = {}
    , xmod = global_exports ? require('./support/xmod') : window.xmod
    ;
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


// lodash internal helpers
// ========================

var arrayRef = []
  , concat = [].concat
  , slice = [].slice
  , isArray = Array.isArray
  , push = [].push
  , nativeMax = Math.max
  , nativeMin = Math.min
  , nativeSlice = arrayRef.slice
  ;

// crazy over the top lodash speed crap helpers
var largeArraySize = 75
var maxPoolSize = 10;
var arrayPool = [];
var objectPool = [];

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
   * customized, this method returns the custom method, otherwise it returns
   * the `basicIndexOf` function.
   *
   * @private
   * @returns {Function} Returns the "indexOf" function.
   */
  function getIndexOf(array, value, fromIndex) {
    return basicIndexOf
  }

  /**
   * A basic implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Mixed} value The value to search for.
   * @param {Number} [fromIndex=0] The index to search from.
   * @returns {Number} Returns the index of the matched value or `-1`.
   */
  function basicIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {Null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length;

    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return cache.object === false
      ? (releaseObject(result), null)
      : result;
  }

    /**
   * Releases the given `array` back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    if (arrayPool.length == maxPoolSize) {
      arrayPool.length = maxPoolSize - 1;
    }
    array.length = 0;
    arrayPool.push(array);
  }

  /**
   * Releases the given `object` back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    if (objectPool.length == maxPoolSize) {
      objectPool.length = maxPoolSize - 1;
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    objectPool.push(object);
  }


// AutoCurry
(function(){

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

Function.prototype.autoCurry = function(n) {
  return autoCurry(this, n);
};
})()


var root

  , compact = function( array ) {
      var results = [],
          arr = array.slice(0);
      for( var i = 0, l = arr.length; i < l; i++ ) {
        if( !!arr[i] ) results.push( arr[i] );
      }
      return results;
    }

  /**
    * Creates an array of `array` elements not present in the other arrays
    * using strict equality for comparisons, i.e. `===`.
    *
    * @static
    * @memberOf _
    * @category Arrays
    * @param {Array} array The array to process.
    * @param {Array} [array1, array2, ...] Arrays to check.
    * @returns {Array} Returns a new array of `array` elements not present in the
    *  other arrays.
    * @example
    *
    * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
    * // => [1, 3, 4]
    */
  , difference = function(array) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          seen = concat.apply(arrayRef, nativeSlice.call(arguments, 1)),
          result = [];

      var isLarge = length >= largeArraySize && indexOf === basicIndexOf;

      if (isLarge) {
        var cache = createCache(seen);
        if (cache) {
          indexOf = cacheIndexOf;
          seen = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(seen, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(seen);
      }
      return result;
    }.autoCurry(2)

  /**
   * This method is similar to `_.find`, except that it returns the index of
   * the element that passes the callback check, instead of the element itself.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to search.
   * @param {Function|Object|String} [callback=identity] The function called per
   *  iteration. If a property name or object is passed, it will be used to create
   *  a "_.pluck" or "_.where" style callback, respectively.
   * @param {Mixed} [thisArg] The `this` binding of `callback`.
   * @returns {Mixed} Returns the index of the found element, else `-1`.
   * @example
   *
   * _.findIndex(['apple', 'banana', 'beet'], function(food) {
   *   return /^b/.test(food);
   * });
   * // => 1
   */
  , findIndex = function(callback, array) {
      var index = -1,
          length = array ? array.length : 0;

      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }.autoCurry(2)

        /**
     * Iterates over an object's own enumerable properties, executing the `callback`
     * for each property. The `callback` is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by explicitly
     * returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {Mixed} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   alert(key);
     * });
     * // => alerts '0', '1', and 'length' (order is not guaranteed)
     */
    , forOwn = function (callback, collection) {
      var index, iterable = collection, result = iterable;
      if (!iterable){return result;} 
      var ownIndex = -1,
          ownProps = Object.keys(iterable), //Object.keys is in ES5 
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false) return result;    
      }
      return result
    }

    , find = function(callback, collection) {
        var index = -1,
            length = collection ? collection.length : 0;
        if (collection.find){
          return collection.find(callback);
        }

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            if (callback(value, index, collection)) {
              return value;
            }
          }
        } else {
          var result;
          forOwn(function(value, index, collection) {
            if (callback(value, index, collection)) {
              result = value;
              return false;
            }
          }, collection);
          return result;
        }
    }.autoCurry(2)

   /**
    * Flattens a nested array (the nesting can be to any depth). If `isShallow`
    * is truthy, `array` will only be flattened a single level. If `callback`
    * is passed, each element of `array` is passed through a `callback` before
    * flattening. The `callback` is bound to `thisArg` and invoked with three
    * arguments; (value, index, array).
    *
    * If a property name is passed for `callback`, the created "_.pluck" style
    * callback will return the property value of the given element.
    *
    * If an object is passed for `callback`, the created "_.where" style callback
    * will return `true` for elements that have the properties of the given object,
    * else `false`.
    *
    * @static
    * @memberOf _
    * @category Arrays
    * @param {Array} array The array to flatten.
    * @param {Boolean} [isDeep=false] A flag to flatten past a single level.
    * @param {Function|Object|String} [callback=identity] The function called per
    *  iteration. If a property name or object is passed, it will be used to create
    *  a "_.pluck" or "_.where" style callback, respectively.
    * @param {Mixed} [thisArg] The `this` binding of `callback`.
    * @returns {Array} Returns a new flattened array.
    * @example
    *
    * _.flatten([1, [2], [3, [[4]]]], true);
    * // => [1, 2, 3, 4];
    *
    * _.flatten([1, [2], [3, [[4]]]]);
    * // => [1, 2, 3, [[4]]];
    *
    * var stooges = [
    *   { 'name': 'curly', 'quotes': ['Oh, a wise guy, eh?', 'Poifect!'] },
    *   { 'name': 'moe', 'quotes': ['Spread out!', 'You knucklehead!'] }
    * ];
    *
    * // using "_.pluck" callback shorthand
    * _.flatten(stooges, 'quotes');
    * // => ['Oh, a wise guy, eh?', 'Poifect!', 'Spread out!', 'You knucklehead!']
    */
  , flatten = function(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
  
        if (isArray(value)) {
          push.apply(result, value);
        } else {
          result.push(value);
        }
      }
      return result;
    }

  , flattenDeep = function(array, callback) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
  
        // recursively flatten arrays (susceptible to call stack limits)
        if (isArray(value)) {
          push.apply(result, flatten(value));
        } else {
          result.push(value);
        }
      }
      return result;
    }

   /**
    * Computes the intersection of all the passed-in arrays using strict equality
    * for comparisons, i.e. `===`.
    *
    * @static
    * @memberOf _
    * @category Arrays
    * @param {Array} [array1, array2, ...] Arrays to process.
    * @returns {Array} Returns a new array of unique elements that are present
    *  in **all** of the arrays.
    * @example
    *
    * _.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1]);
    * // => [1, 2]
    */
  , intersection = function(array, others) {
      var args = arguments,
          argsLength = args.length,
          argsIndex = -1,
          caches = getArray(),
          index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [],
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = args[argsIndex];
        caches[argsIndex] = indexOf === basicIndexOf &&
          (value ? value.length : 0) >= largeArraySize &&
          createCache(argsIndex ? args[argsIndex] : seen);
      }
      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }.autoCurry()

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Mixed} value The value to search for.
     * @param {Number} [fromIndex=array.length-1] The index to search from.
     * @returns {Number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
  , lastIndexOf = function(value, array) {
      var index = array ? array.length : 0;

      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }.autoCurry(2)


  , map = function( fn, x ) {
      var results = [];
      if (x.map) return x.map(function(x){ return fn(x); }); //ignore index which screws with applicatives
      if (x.length === +x.length) {
        for( var i = 0, l = x.length; i < l; i++ ){
          results.push( fn( x[i] ) );
        }
      }
      // removed object behavior. fmap over an object for this.
      return results;
    }.autoCurry(2)

    // WISH: Try to keep passing args in as if lazy evaluation
    // compose(fmap(x), fmap(g)) == compose(fmap, fmap)(f, g, x, y)
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
      }
      // We can implement a filter for objects with foldable
      return results;
    }.autoCurry(2)

  , not = function( fn, x) {
    return !fn(x);
  }.autoCurry(2)

  , reject = function( fn, x ) {
     return filter(not(fn),x);
  }

  , reduce = function(fn,init,sequence){
      var len = sequence.length
        , result = init
        ;
      for(var i=0;i<len;i++) {
        result = fn.apply(null,[result,sequence[i]]);
      }
      return result;
    }.autoCurry()

  , reduceRight = function(fn,init,sequence){
      var len=sequence.length
        ,result=init
        ;
      for(var i=len;--i>=0;) {
        result = fn.apply(null,[result, sequence[i]]);
      }
      return result;
    }.autoCurry()
      
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


  , isEqual = function(a,b){
      return a === b;
  }.autoCurry(2)
  ;
// ---------------------------------------
  
  lib3.compact = compact;
  lib3.difference = difference;
  lib3.findIndex = findIndex;
  lib3.flatten = flatten;
  lib3.flattenDeep = flattenDeep;
  lib3.intersection = intersection;
  lib3.lastIndexOf = lastIndexOf;
  lib3.map = map;
  lib3.compose = compose;
  lib3.filter = filter;
  lib3.reject = reject;
  lib3.reduce = reduce;
  lib3.reduceRight = reduceRight;
  lib3.pluck = pluck;
  lib3.sortBy = sortBy;
  lib3.first = first;
  lib3.find = find;
  lib3.take = take;
  lib3.last = last;
  lib3.initial = initial;
  lib3.rest = rest;
  lib3.drop = drop;
  lib3.max = max;
  lib3.min = min;
  lib3.range = range;
  lib3.rangeStep = rangeStep;
  lib3.isEqual = isEqual;

  lib3.expose = function(){ xmod.expose(window, lib3) };
  xmod.exportModule('lib3', lib3, global_module, global_exports);

}(this, (typeof module == 'object' && module), (typeof exports == 'object' && exports)));
