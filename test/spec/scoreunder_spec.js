describe("Scoreunder", function() {

  it("curries and flips filter", function() {
    var getEvens = _.filter(function(n){ return !(n % 2); });
    var result = getEvens([1,2,3,4,5,6,7,8]);
    expect(result).toEqual([2,4,6,8]);
  });
  
  it("runs immediately", function() {
    var result = _.filter(function(n){ return !(n % 2); }, [1,2,3,4,5,6,7,8]);
    expect(result).toEqual([2,4,6,8]);
  });
  
  it("gets the first element", function() {
    var result = _.first([1,2,3,4,5,6,7,8]);
    expect(result).toEqual(1);
  });
  
  it("takes the first n elements", function() {
    var take3 = _.first(3);
    var result = take3([1,2,3,4,5,6,7,8]);
    expect(result).toEqual([1,2,3]);
  });
  
  it("takes the first n elements immediately", function() {
    var result = _.first(3, [1,2,3,4,5,6,7,8]);
    expect(result).toEqual([1,2,3]);
  });

});