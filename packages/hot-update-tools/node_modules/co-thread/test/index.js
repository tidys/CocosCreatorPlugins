
var thread = require('..');
var co = require('co');

describe('thread(fn, n)', function(){
  it('should spawn multiple generators', function(done){
    var n = 0;

    co(function *(){
      yield thread(function *(){
        ++n;
      }, 50);

      n.should.equal(50);
    })(done);
  })
})