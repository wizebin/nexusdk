import { expect } from 'chai';
import { Nexusdk, wrapSDKAction, wrapSDKHook } from './index';

let sendData = null;
let exitData = null;
let originalSend = process.send;
let originalExit = process.exit;

describe('Nexusdk', () => {
  before(() => {
    process.send = data => {sendData = data;}
  });
  after(() => {
    process.send = originalSend;
  });

  describe('wrapAction', () => {
    it('sends messages correctly', () => {
      const sdk = new Nexusdk();
      let expectedData = null;
      wrapSDKAction(sdk, (data) => { expectedData = data; return true; });
      sdk.onReceiveMessage({ type: 'start', data: 'bloop' });
      expect(expectedData).to.equal('bloop');
    });

    it('calls process.exit when it receives an exit message correctly', () => {
      const sdk = new Nexusdk();
      let expectedData = null;
      let exitData = null;
      wrapSDKAction(sdk, (data) => { expectedData = data; return true; });
      process.exit = () => {exitData = true;}
      sdk.onReceiveMessage({ type: 'exit' });
      process.exit = originalExit;
      expect(expectedData).to.equal(null);
      expect(exitData).to.equal(true);
    });
  });

  describe('wrapHook', () => {
    it('sends messages correctly', () => {
      const sdk = new Nexusdk();
      let expectedData = null;
      wrapSDKHook(sdk, (properties, messages) => { messages.trigger(properties) });
      sendData = null;
      sdk.onReceiveMessage({ type: 'start', data: { name: 'bazinga' } });
      expect(sendData).to.have.deep.property('message', { type: 'trigger', caller: 'start', data: { name: 'bazinga' } });

      sendData = null;
      sdk.onReceiveMessage({ type: 'unhandled_message', data: { name: 'bazinga' } });
      expect(sendData).to.equal(null);

      let exitData = null;
      process.exit = () => {exitData = true;}
      sdk.onReceiveMessage({ type: 'exit' });
      process.exit = originalExit;
      expect(expectedData).to.equal(null);
      expect(exitData).to.equal(true);
    });
  });
});
