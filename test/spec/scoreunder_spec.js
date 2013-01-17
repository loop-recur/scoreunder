describe("Scoreunder", function() {
  var list = [1,2,3,4]
    , obj = { 'one': 1, 'two': 2, 'three': 3, 'four': 4 }
    , context = { multiplier: 5 }
    ;

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
      _.forEach(sumWithContext, context, list);
      expect(total).toEqual(50);
      expect(index).toEqual(3);
    })
    
    it("iterates over a list, passes value and index to iterator", function() {
      _.each(sum, list);
      expect(total).toEqual(10);
      expect(index).toEqual(3);
    });

    it("iterates over a list, with an optional context", function() {
      _.each(sumWithContext, context, list);
      expect(total).toEqual(50)
      expect(index).toEqual(3);
    });

    it("iterates over an object, passes key and value to iterator", function() {
      _.each(sumObj, obj);
      expect(total).toEqual(10);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
    });

    it("iterates over an object, with an optional context", function() {
      _.each(sumObjWithContext, context, obj);
      expect(total).toEqual(50);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
    });

    it("iterates over an object, ignoring the object's prototype", function() {
      obj.constructor.prototype.five = 5
      _.each(sumObjWithContext, context, obj);
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
      _.each(sumObjWithContext)(context, obj);
      expect(total).toEqual(50);
      expect(keys).toEqual(['one', 'two', 'three', 'four']);
    });
  });

  describe("map", function() {
    var addIndex = function(x, i) { return x + i; }
      , multiply = function(x, i) { return x * this.multiplier; }
      ;

    it("is aliased as 'collect'", function() {
      expect(_.map(addIndex, list)).toEqual(_.collect(addIndex, list));
    });

    it("iterates over a list, passing a value and index to the iterator, and returns the new list", function() {
      expect(_.map(addIndex, list)).toEqual([1, 3, 5, 7]);
    });

    it("iterates over a list, with an optional context, and returns the new list", function() {
      expect(_.map(multiply, context, list)).toEqual([5, 10, 15, 20]);
    });

    it("handles a null properly", function() {
      expect(_.map(addIndex, null)).toEqual([]);
    });

    it("can be partially applied", function() {
      expect(_.map(addIndex)(list)).toEqual([1, 3, 5, 7]);
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

    it("returns the sum of an array", function() {
      expect(_.reduce(sum, 0, list)).toEqual(10);
    });

    it("returns the sum of an array, with an optional context", function() {
      expect(_.reduce(sumWithContext, 0, context, list)).toEqual(50);
    });

    xit("has a default initial value of zero", function() {
      expect(_.reduce(sum, list)).toEqual(10);
    });

    xit("handles a null (without initial value) properly", function() {
      var err;
      try { _.reduce(sum, 0, null); } 
      catch (ex) { err = ex; }
      expect(err instanceof TypeError).toEqual(true);
    });

    it("handles a null (with initial value) properly", function() {
      expect(_.reduce(sum, 5, null)).toEqual(5);
    });

    xit("handles undefined as a special case", function() {
      expect(_.reduce(sum, undefined, list)).toEqual(undefined);
    });

    xit("throws an error for empty arrays with no initial value", function() {
      expect(_.reduce(sum, [])).toThrow();
    });

    it("can be partially applied", function() {
      expect(_.reduce(sum)(0, list)).toEqual(10);
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

    it("can be partially applied", function() {
      expect(_.select(isEven)(list)).toEqual([2,4]);
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

  xdescribe("first", function() {
    it("returns the first element of a list", function() {
      expect(_.first(list)).toEqual(1);
    });

    it("returns the first n elements of a list", function() {
      expect(_.first(3, list)).toEqual([1,2,3]);
    });
    
    it("can be partially applied", function() {
      expect(_.first(3)(list)).toEqual([1,2,3]);
    });
  });

});
