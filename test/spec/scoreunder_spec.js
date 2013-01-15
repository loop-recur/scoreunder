describe("Scoreunder", function() {
  var list = [1,2,3,4,5,6,7,8];

  it("curries and flips filter", function() {
    var getEvens = _.filter(function(n){ return !(n % 2); });
    var result = getEvens([1,2,3,4,5,6,7,8]);
    expect(result).toEqual([2,4,6,8]);
  });
  
  it("runs immediately", function() {
    isEven = function(n) { 
      return !(n % 2);
    }
    var result = _.filter(isEven, [1,2,3,4,5,6,7,8]);
    expect(result).toEqual([2,4,6,8]);
  });
  
  describe("each", function() {
    
  });

  describe("filter", function() {
    var isEven = function(n) {
      return !(n % 2);
    };

    it("returns a filtered list", function() {
      expect(_.filter(isEven, list)).toEqual([2,4,6,8]);
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
