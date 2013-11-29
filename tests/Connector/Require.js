require('should');
var lists = require('../../isg-lists.js');

describe('Lists', function() {
    describe('Connector', function() {
        it('Require', function() {
            lists.should.be.an.instanceof(isgLists);
        });
    });
});