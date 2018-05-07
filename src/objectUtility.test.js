import { has, get, getObjectPath, set, getStringPathForArray, assurePathExists } from './objectUtility';
import { expect } from 'chai';

describe('object', () => {
  describe('getObjectPath', () => {
    it('returns the correct path sections for a complicated path', () => {
      expect(getObjectPath('a.b.c[1].d.efg[99]')).to.deep.equal(['a', 'b', 'c', 1, 'd', 'efg', 99]);
    });
    it('returns an array if the original is an array', () => {
      const original = ['a', 'b', 'c'];
      expect(getObjectPath(original)).to.deep.equal(original);
    })
  });
  describe('set', () => {
    it('sets subobject values into the original object', () => {
      const tempObject = {};
      set(tempObject, 'a.b.c[1]', 'hello');
      expect(tempObject.a.b.c[1]).equal('hello');
    })
  });
  describe('get', () => {
    it('gets subobject from original object', () => {
      const tempObject = { a: { b: { c: '123', e: [ 1, 2, 3 ] } } };
      expect(get(tempObject, 'a.b.c')).equal('123');
      expect(get(tempObject, 'a.b.e[1]')).equal(2);
      expect(get(tempObject, 'a.b.e[5]')).equal(undefined);
      expect(get(tempObject, 'a.b.e[5]', 'test')).equal('test');
    })
  });
  describe('has', () => {
    it('says whether or not the object has a subkey', () => {
      const tempObject = { first: 'yes', second: 'yes' };
      expect(has(tempObject, 'first')).to.equal(true);
      expect(has(tempObject, 'ninteyninth')).to.equal(false);
      expect(has(tempObject, null)).to.equal(false);
    })
  });
  describe('getStringPathForArray', () => {
    it('is the opposite of getObjectPath', () => {
      const original = 'a.b.c[1][2][3].four[5]';
      expect(getStringPathForArray(getObjectPath(original))).equal(original);
    });
  });
  describe('assurePathExists', () => {
    it('assures object path exists, and creates it if it does not', () => {
      const original = {};
      assurePathExists(original, 'a.b.c[1]', 'hello');
      expect(original).to.deep.equal({ a: { b: { c: [undefined, 'hello'] } } });
    });
  });
});
