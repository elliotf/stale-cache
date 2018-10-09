const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const Promise = require('bluebird');
chai.config.includeStack = true;
chai.use(require('sinon-chai'));

const Stale = require('.');

describe('stale-cache', function() {
  beforeEach(function() {
    this.sinon = sinon.createSandbox();
  });

  it('can be instantiated', function() {
    const stale = new Stale();
  });

  describe('#get', function() {
    let stale;
    let populator;

    beforeEach(function() {
      stale = new Stale({
        ttl: 10,
      });

      let counter = 0;
      populator = this.sinon.spy(function() {
        return Promise.delay(6).then(function() {
          return ++counter;
        });
      });
    });

    context('when the cache is not populated', function() {
      it('resolves the value from the populator', function() {
        return stale.get('key', populator).then(function(value) {
          expect(value).to.equal(1);

          expect(populator).to.have.callCount(1);
        });
      });
    });

    context('when the cache is populated', function() {
      beforeEach(function() {
        return stale.get('key', populator);
      });

      it('returns the cached value', function() {
        return stale.get('key', populator).then(function(value) {
          expect(value).to.equal(1);

          expect(populator).to.have.callCount(1);
        });
      });

      context('when the cache should have expired', function() {
        it('returns the existing value while refreshing', function() {
          return Promise.delay(6).then(function() {
            return stale.get('key', populator).then(function(value) {
              expect(value).to.equal(1);

              expect(populator).to.have.callCount(2);
            })
          })
          .then(function() {
            return Promise.delay(6).then(function() {
              return stale.get('key', populator).then(function(value) {
                expect(value).to.equal(2);

                expect(populator).to.have.callCount(2);
              });
            });
          });
        });
      });
    });
  });
});
