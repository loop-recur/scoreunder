describe("Scoreunder", function() {
  var list = [1,2,3,4]
    , obj = { 'one': 1, 'two': 2, 'three': 3, 'four': 4 }
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
      , context = { multiplier: 5 }
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
    var add2 = function(x) { return x + 2; };

    it("is aliased as 'collect'", function() {
      expect(_.map(add2, list)).toEqual(_.collect(add2, list));
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
