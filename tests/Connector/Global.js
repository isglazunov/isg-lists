require('should');
var _ = require('lodash');
require('../../isg-lists.js');

describe('Lists', function() {
    describe('Connector', function() {
        it('Global', function() {
            Lists.should.have.type('function');
            var lists = new isgLists();
            lists.should.be.an.instanceof(isgLists);
        });
    });
});