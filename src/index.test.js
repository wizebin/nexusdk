import { expect } from 'chai';
import { Nexusdk, wrapSDKAction, wrapSDKHook } from './index';
import { fork } from 'child_process';
import path from 'path';

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
      sdk.onReceiveMessage({ type: 'start', data: { data: { a: 'bloop' }, accounts: [], id: '1234', path: 'asfd' } });
      expect(expectedData).to.deep.equal({ data: { a: 'bloop' }, accounts: [], id: '1234', path: 'asfd' });
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
      sdk.onReceiveMessage({ type: 'start', data: { data: { a: 'bloop' }, accounts: [], id: '1234', path: 'asfd' } });
      expect(sendData).to.have.deep.property('message', { type: 'trigger', caller: 'start', data: { data: { a: 'bloop' }, accounts: [], id: '1234', path: 'asfd' } });
      expect(sendData).to.have.deep.property('execution', '1234');

      sendData = null;
      sdk.onReceiveMessage({ type: 'unhandled_message', data: { data: { a: 'bloop' }, accounts: [], id: '1234', path: 'asfd' } });
      expect(sendData).to.equal(null);

      let exitData = null;
      process.exit = () => {exitData = true;}
      sdk.onReceiveMessage({ type: 'exit' });
      process.exit = originalExit;
      expect(expectedData).to.equal(null);
      expect(exitData).to.equal(true);
    });
    it('executes child processes correctly', (done) => {
      const child = fork(path.join(__dirname, 'test/oneHook.js'), [], { stdio: 'pipe', execArgv: [] });
      expect(child).to.not.equal(null);
      child.on('message', (data) => {
        if (data.type === 'trigger') {
          expect(data.message.data).to.deep.equal({ test: { a: 'b' } });
        }
      });
      if (child.stdout) {
        child.stdout.on('data', data => console.log(data.toString()));
        child.stderr.on('data', data => console.error(data.toString()));
      }
      child.on('exit', (data) => {
        expect(data).to.equal(0);
        done();
      });
      child.send({ type: 'start', data: { data: { a: 'b' }, id: '5' } });
      child.send({ type: 'exit' });
    });
  });
});
