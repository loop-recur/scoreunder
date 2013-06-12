describe("Scoreunder", function() {
  var list = [1,2,3,4]
    , obj = { 'one': 1, 'two': 2, 'three': 3, 'four': 4 }
    , context = { multiplier: 5 }
    ;

  it("compacts the array", function() {
    expect(_.compact([1, null, [3], null, 5])).toEqual([1, [3], 5]);
  });

  it("returns the difference", function() {
    expect(_.difference([1, 2, 3, 4, 5], [5, 2, 10])).toEqual([1, 3, 4]);
    expect(_.difference([1, 2, 3, 4, 5])([5, 2, 10], [1])).toEqual([3, 4]);
  });

  it("drops x amount", function() {
    expect(_.drop(2, [1,2,3,4,5])).toEqual([3,4,5]);
    expect(_.drop(2)([1,2,3,4,5])).toEqual([3,4,5]);
  });

  it("finds the index with a function", function() {
    expect(_.findIndex(function(x){ return x < 0}, [1,-2,3])).toEqual(1);
    expect(_.findIndex(function(x){ return x < 0})([1,-2,3])).toEqual(1);
  });

  it("returns the first element of a list", function() {
    expect(_.first(list)).toEqual(1);
  });

  it("flattens a nested list", function() {
    expect(_.flatten([1,2,[3]])).toEqual([1,2,3]);
    expect(_.flatten([1,2,[[3]]])).toEqual([1,2,[3]]);
  });

  it("flattens a nested list deep", function() {
    expect(_.flattenDeep([1,2,[[3]]])).toEqual([1,2,3]);
  });

  it("returns the elements index", function() {
    expect(_.indexOf(4, list)).toEqual(3);
    expect(_.indexOf(4)(list)).toEqual(3);
    expect(_.indexOf(2, [1,2,3,4,2], 3)).toEqual(4);
    expect(_.indexOf(5, [1,2,3,4,5], 3, true)).toEqual(4);
  });

  it("returns everything but the last or specified length", function() {
    expect(_.initial([1, 2, 3])).toEqual([1, 2]);
    expect(_.initial([1, 2, 3], 2)).toEqual([1]); //TODO shouldn't take 2 second
  });

  it("returns the similar elements", function() {
    expect(_.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1])).toEqual([1, 2]);
    expect(_.intersection([1, 2, 3])([101, 2, 1, 10], [2, 1])).toEqual([1, 2]);
  });

  it("returns the last element of a list", function() {
    expect(_.last([1,2,3])).toEqual(3);
  });

  it("returns the last index of the found element in the list", function() {
    expect(_.lastIndexOf(2, [1,2,3,2])).toEqual(3);
    expect(_.lastIndexOf(2)([1,2,3,2])).toEqual(3);
    expect(_.lastIndexOf(2, [1, 2, 3, 1, 2, 3], 3)).toEqual(1);
  });

  it("returns the last index of the found element in the list", function() {
    expect(_.lastIndexOf(2, [1,2,3,2])).toEqual(3);
    expect(_.lastIndexOf(2)([1,2,3,2])).toEqual(3);
    expect(_.lastIndexOf(2, [1, 2, 3, 1, 2, 3], 3)).toEqual(1);
  });

  it("returns the first n elements of a list", function() {
    expect(_.take(3, list)).toEqual([1,2,3]);
    expect(_.take(3)(list)).toEqual([1,2,3]);
  });

  it("curries and flips filter", function() {
    var getEvens = _.filter(function(n){ return !(n % 2); });
    var result = getEvens(list);
    expect(result).toEqual([2,4]);
  });
  
  it("runs immediately", function() {
    isEven = function(n) { 
      return !(n % 2);
    }
    var result = _.filter(isEven, list);
    expect(result).toEqual([2,4]);
  });

  it("does not globally expose functions automatically", function() {
    expect(window.map).toBeUndefined();
  });

  describe("expose", function() {
    var add2 = function(x) { return x + 2; }
      , cleanup = function() {
          for (f in _) {
            if (_.hasOwnProperty(f)) { 
              delete window[f];
            }
          }
        }
      ;

    beforeEach(_.expose);
    afterEach(cleanup);

    it("exposes all functions to the global namespace", function() {
      expect(map).toBeDefined();
      expect(window.map).toBeDefined();
      expect(map(add2, list)).toEqual([3, 4, 5, 6]);
    });

    it("omits designated functions from exposure", function() {
      expect(window.expose).toBeUndefined();
    });
  });
  
  describe("each", function() {
    var total = 0
      , index = 0
      , keys = []
      , origList = []
      , sum = function(x, i, l) { 
          total += x;
          index = i;
          origList.push(l[i]);
        }
      , sumWithContext = function(x, i) { 
          total += (x * this.multiplier);
          index = i;
        }
      , sumObj = function(val, key) { total += val; keys.push(key); }
      , sumObjWithContext = function(val, key) { 
          total += (val * this.multiplier);
          keys.push(key);
        }
      ;

    afterEach(function() {
      total = 0;
      index = 0;
      keys = [];
      origList = [];
    })

    it("is aliased as 'forEach'", function() {
      _.forEach(sumWithContext, list, context);
      expect(total).toEqual(50);
      expect(index).toEqual(3);
    })
    
    it("iterates over a list, passes value and index to iterator", function() {
      _.each(sum, list);
      expect(total).toEqual(10);
      expect(index).toEqual(3);
    });

    it("iterates over a list, with an optional context", function() {
      _.each(sumWithContext, list, context);
      expect(total).toEqual(50)
      expect(index).toEqual(3);
    });

    it("iterates over an object, passes key and value to iterator", function() {
      _.each(sumObj, obj);
      expect(total).toEqual(10);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
    });

    it("iterates over an object, with an optional context", function() {
      _.each(sumObjWithContext, obj, context);
      expect(total).toEqual(50);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
    });

    it("iterates over an object, ignoring the object's prototype", function() {
      obj.constructor.prototype.five = 5
      _.each(sumObjWithContext, obj, context);
      expect(total).toEqual(50);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
      delete obj.constructor.prototype.five;
    });

    it("references the original collection from inside the iterator", function() {
      _.each(sum, list);
      expect(origList).toEqual(list);
    });

    it("handles a null properly", function() {
      _.each(sum, null)
      expect(total).toEqual(0);
      expect(index).toEqual(0);
    });

    it("can be partially applied", function() {
      _.each(sumObjWithContext)(obj, context);
      expect(total).toEqual(50);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
    });
  });

  describe("map", function() {
    var addIndex = function(x, i) { return x + i; }
      , addKey = function(val, key) { switch(key) {
          case 'one': return val + 1; 
          case 'two': return val + 2;
          case 'three': return val + 3;
          case 'four': return val + 4;
          default: return val;
        }}
      , multiply = function(x, i) { return x * this.multiplier; }
      ;

    it("is aliased as 'collect'", function() {
      expect(_.map(addIndex, list)).toEqual(_.collect(addIndex, list));
    });

    it("iterates over a list, passing a value and index to the iterator, and returns the new list", function() {
      expect(_.map(addIndex, list)).toEqual([1, 3, 5, 7]);
    });

    it("iterates over a list, with an optional context, and returns the new list", function() {
      expect(_.map(multiply, list, context)).toEqual([5, 10, 15, 20]);
    });

    // TODO fix scoreunder to correctly handle obj as main_args with no optional context obj
    xit("iterates over an object, passing value and key to the iterator, and returns a list", function() {
      expect(_.map(addKey, obj)).toEqual([2, 4, 6, 8]);
    });

    it("iterates over an object, with an optional context, and returns a new list", function() {
      expect(_.map(multiply, obj, context)).toEqual([5, 10, 15, 20]);
    });

    // TODO fix scoreunder to correctly handle a null as the main_arg
    xit("handles a null properly", function() {
      expect(_.map(addIndex, null)).toEqual([]);
    });

    it("can be partially applied", function() {
      expect(_.map(addIndex)(list)).toEqual([1, 3, 5, 7]);
      expect(_.map(multiply)(list, context)).toEqual([5,10,15,20]);
      // TODO fix scoreunder to correctly partially apply an optional context
      //expect(_.map(multiply)(context)(list)).toEqual([5,10,15,20]);
      //console.log("MAP");
      //expect(_.map(multiply, context)(list)).toEqual([5,10,15,20]);
      //console.log("END");
      //expect(_.map(addKey)(obj)).toEqual([2, 4, 6, 8]);
      //expect(_.map(multiply)(context, obj)).toEqual([5,10,15,20]);
      // TODO fix scoreunder to correctly partially apply an optional context
      //expect(_.map(multiply, context)(obj)).toEqual([5,10,15,20]);
      //expect(_.map(multiply)(context)(obj)).toEqual([5,10,15,20]);
    });
  });

  describe("reduce", function() {
    var sum = function(sum, num) { return sum + num; }
      , sumWithContext = function(sum, num) { return sum + num * this.multiplier; }
      ;

    it("is aliased as 'inject'", function() {
      expect(_.reduce(sum, 0, list)).toEqual(_.inject(sum, 0, list));
    });

    it("is aliased as 'foldl'", function() {
      expect(_.reduce(sum, 0, list)).toEqual(_.foldl(sum, 0, list));
    });

    it("returns the sum of an array of numbers", function() {
      expect(_.reduce(sum, 0, list)).toEqual(10);
    });

    it("returns the sum of an array, with an optional context", function() {
      expect(_.reduce(sumWithContext, 0, list, context)).toEqual(50);
    });

    it("returns the sum of an object containing numbers", function() {
      expect(_.reduce(sum, 0, obj)).toEqual(10);
    });

    it("returns the sum of an object containing numbers, with an optional context", function() {
      expect(_.reduce(sumWithContext, 0, obj, context)).toEqual(50);
    });

    // TODO modify scoreunder to work with default initial values
    xit("has a default initial value of zero, for lists", function() {
      expect(_.reduce(sum, list)).toEqual(10);
    });

    // TODO modify scoreunder to work with default initial values
    xit("has a default inital value of zero, for objects", function() {
      expect(_.reduce(sum, obj)).toEqual(10);
    });

    // TODO modify scoreunder to work with default initial values
    xit("handles a null (without initial value) properly", function() {
      var err;
      try { _.reduce(sum, null); } 
      catch (ex) { err = ex; }
      expect(err instanceof TypeError).toEqual(true);
    });

    it("handles a null (with initial value) properly", function() {
      expect(_.reduce(sum, 5, null)).toEqual(5);
    });

    it("handles undefined as a special case", function() {
      expect(_.reduce(sum, undefined, [])).toEqual(undefined);
    });

    // TODO modify scoreunder to throw an error for this case
    xit("throws an error for empty arrays with no initial value", function() {
      expect(_.reduce(sum, [])).toThrow();
    });

    it("can be partially applied", function() {
      expect(_.reduce(sum)(0, list)).toEqual(10);
      expect(_.reduce(sum)(0)(list)).toEqual(10);
      expect(_.reduce(sum, 0)(list)).toEqual(10);
      expect(_.reduce(sum)(0, obj)).toEqual(10);
      expect(_.reduce(sum)(0)(obj)).toEqual(10);
      expect(_.reduce(sum, 0)(obj)).toEqual(10);
    });
  });

  describe("reduceRight", function() {
    var words = ['foo', 'bar', 'baz']
      , wordsObj = {'foo': 'foo', 'bar': 'bar', 'baz': 'baz'}
      , joinWords = function(memo, word) { return memo + word; }
      ;

    it("is aliased as 'foldr'", function() {
      expect(_.reduceRight(joinWords, '', words)).toEqual(_.foldr(joinWords, '', words));
    });

    it("reduces a list from right to left", function() {
      expect(_.reduceRight(joinWords, '', words)).toEqual('bazbarfoo');
    });

    it("reduces a object from right to left", function() {
      expect(_.reduceRight(joinWords, '', wordsObj)).toEqual('bazbarfoo');
    });

    it("handles a null (with initial value) properly", function() {
      expect(_.reduceRight(joinWords, '', null)).toEqual('');
    });

    it("can be partially applied", function() {
      expect(_.reduceRight(joinWords)('', words)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords)('')(words)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords, '')(words)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords)('', wordsObj)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords)('')(wordsObj)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords, '')(wordsObj)).toEqual('bazbarfoo');
    });
  });

  describe("find", function() {
    var greaterThan2 = function(x) { return x > 2; };

    it("is aliased as 'detect'", function() {
      expect(_.find(greaterThan2, list)).toEqual(_.detect(greaterThan2, list));
    });

    it("returns the first value of a list that matches the conditional", function() {
      expect(_.find(greaterThan2, list)).toEqual(3);
    });

    it("returns the first value of an object that matches the conditional", function() {
      expect(_.find(greaterThan2, obj)).toEqual(3);
    });

    it("returns undefined if the value is not found", function() {
      expect(_.find(greaterThan2, [0])).toEqual(undefined);
    });

    it("can be partially applied", function() {
      expect(_.find(greaterThan2)(list)).toEqual(3);
      expect(_.find(greaterThan2)(obj)).toEqual(3);
    });
  });

  describe("detect", function() {
    var greaterThan2 = function(x) { return x > 2; };

    it("is aliased as 'find'", function() {
      expect(_.detect(greaterThan2, list)).toEqual(_.find(greaterThan2, list));
    });
  });

  describe("select", function() {
    var isEven = function(n) {
      return !(n % 2);
    };

    it("is aliased as 'filter'", function() {
      expect(_.filter(isEven, list)).toEqual(_.select(isEven, list));
    });

    it("returns a filtered list", function() {
      expect(_.select(isEven, list)).toEqual([2,4]);
    });

    it("returns a filtered list, from an object", function() {
      expect(_.select(isEven, obj)).toEqual([2,4]);
    });

    it("can be partially applied", function() {
      expect(_.select(isEven)(list)).toEqual([2,4]);
      expect(_.select(isEven)(obj)).toEqual([2,4]);
    });
  });

  describe("filter", function() {
    var isEven = function(n) {
      return !(n % 2);
    };

    it("is aliased as 'select'", function() {
      expect(_.select(isEven, list)).toEqual(_.filter(isEven, list));
    });
  });

  describe("reject", function() {
    var isEven = function(n) { return !(n % 2); };

    it("returns a list of values rejected from a list", function() {
      expect(_.reject(isEven, list)).toEqual([1,3]);
    });

    it("returns a list of values rejected from an object", function() {
      expect(_.reject(isEven, obj)).toEqual([1,3]);
    });

    it("can be partially applied", function() {
      expect(_.reject(isEven)(list)).toEqual([1,3]);
      expect(_.reject(isEven)(obj)).toEqual([1,3]);
    });
  });

  describe("every", function() {
    var notAString = function(x) { return typeof x != 'string'; };

    it("is aliased as 'all'", function() {
      expect(_.every(notAString, list)).toEqual(_.all(notAString, list));
    });

    it("returns true if all values in array pass truth test", function() {
      expect(_.every(notAString, list)).toEqual(true);
    });
  });

  describe("all", function() {
    var notAString = function(x) { return typeof x != 'string'; };

    it("is aliased as 'every'", function() {
      expect(_.all(notAString, list)).toEqual(_.every(notAString, list));
    });
  });
});
