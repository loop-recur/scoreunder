describe("Scoreunder", function() {
  var list = [1,2,3,4]
    , _ = lib3
    , obj = { 'one': 1, 'two': 2, 'three': 3, 'four': 4 }
    , context = { multiplier: 5 }
    ;

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

  describe("Array", function(){

    it("[compact] removes nulls from the array", function() {
      expect(_.compact([1, null, [3], null, 5])).toEqual([1, [3], 5]);
    });

    it("[difference] returns the difference", function() {
      expect(_.difference([1, 2, 3, 4, 5], [5, 2, 10])).toEqual([1, 3, 4]);
      expect(_.difference([1, 2, 3, 4, 5])([5, 2, 10], [1])).toEqual([3, 4]);
    });

    it("[drop] drops x amount", function() {
      expect(_.drop(2, [1,2,3,4,5])).toEqual([3,4,5]);
      expect(_.drop(2)([1,2,3,4,5])).toEqual([3,4,5]);
    });

    it("[findIndex] finds the index with a function", function() {
      expect(_.findIndex(function(x){ return x < 0}, [1,-2,3])).toEqual(1);
      expect(_.findIndex(function(x){ return x < 0})([1,-2,3])).toEqual(1);
    });

    it("[first] returns the first element of a list", function() {
      expect(_.first(list)).toEqual(1);
    });

    it("[flatten] flattens a nested list", function() {
      expect(_.flatten([1,2,[3]])).toEqual([1,2,3]);
      expect(_.flatten([1,2,[[3]]])).toEqual([1,2,[3]]);
    });

    it("[flattenDeep] flattens a nested list deep", function() {
      expect(_.flattenDeep([1,2,[[3]]])).toEqual([1,2,3]);
    });

    it("[initial] returns everything but the last or specified length", function() {
      expect(_.initial([1, 2, 3])).toEqual([1, 2]);
    });

    it("[intersection] returns the similar elements", function() {
      expect(_.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1])).toEqual([1, 2]);
      expect(_.intersection([1, 2, 3])([101, 2, 1, 10], [2, 1])).toEqual([1, 2]);
    });

    it("[last] returns the last element of a list", function() {
      expect(_.last([1,2,3])).toEqual(3);
    });

    it("[lastIndexOf] returns the last index of the found element in the list", function() {
      expect(_.lastIndexOf(2, [1,2,3,2])).toEqual(3);
      expect(_.lastIndexOf(2)([1,2,3,2])).toEqual(3);
    });

    it("[rest] returns the rest of a list", function() {
      expect(_.rest([1,2,3,4])).toEqual([2,3,4]);
      expect(_.rest([1])).toEqual([]);
    });

    it("[take] returns the first n elements of a list", function() {
      expect(_.take(3, list)).toEqual([1,2,3]);
      expect(_.take(3)(list)).toEqual([1,2,3]);
    });

    it("[map] iterates over a list, passing a value and index to the iterator, and returns the new list", function() {
      var addOne = function(x) { return x + 1; }
      expect(_.map(addOne, list)).toEqual([2, 3, 4, 5]);
      expect(_.map(addOne)(list)).toEqual([2, 3, 4, 5]);
    });

    it("[reduce] returns the sum of an array of numbers", function() {
      var sum = function(sum, num) { return sum + num; };
      expect(_.reduce(sum, 0, list)).toEqual(10);
      expect(_.reduce(sum)(0)(list)).toEqual(10);
      expect(_.reduce(sum, 0)(list)).toEqual(10);
    });

    it("[reduceRight] reduces a list from right to left", function() {
      var words = ['foo', 'bar', 'baz']
        , joinWords = function(memo, word) { return memo + word; }
        ;
      expect(_.reduceRight(joinWords, '', words)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords)('', words)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords)('')(words)).toEqual('bazbarfoo');
      expect(_.reduceRight(joinWords, '')(words)).toEqual('bazbarfoo');
    });

    it("[filter] keeps values that pass the predicate", function() {
      var isEven = function(n) { return !(n % 2); }
      expect(_.filter(isEven, list)).toEqual([2,4]);
      expect(_.filter(isEven)(list)).toEqual([2,4]);
      expect(_.filter(_.isEqual(1))(list)).toEqual([1]);
    });
  });

  describe("find", function() {
    var greaterThan2 = function(x) { return x > 2; };

    /*it("is aliased as 'detect'", function() {
      expect(_.find(greaterThan2, list)).toEqual(_.detect(greaterThan2, list));
    });*/

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


  xdescribe("every", function() {
    var notAString = function(x) { return typeof x != 'string'; };

    it("is aliased as 'all'", function() {
      expect(_.every(notAString, list)).toEqual(_.all(notAString, list));
    });

    it("returns true if all values in array pass truth test", function() {
      expect(_.every(notAString, list)).toEqual(true);
    });
  });
});
