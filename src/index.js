import * as object from './objectUtility';
export { object };

const env = {};
// if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
//   env.HOST = process.env.HOST;
//   env.PORT = process.env.PORT;
//   env.HOOK_ID = process.env.HOOK_ID;
// }

const IPC = 1;
const SOCKET = 2;

export default class nexusdk {
  constructor({ id, name } = {}) {
    this.errors = [];
    this.onInternalMessage = this.onInternalMessage.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    if (typeof global.process !== 'undefined') {
      this.communicationType = IPC;
      this.process = global.process;
      this.process.on('message', this.onReceiveMessage);
    }
    this.hook = { id, name };
    this.callbacks = { internal: this.onInternalMessage };
  }

  onInternalMessage(message) {
    const { name, data } = message;
    if (name === 'meta') {
      this.meta = data;
    }
  }

  sendMessage(message) {
    if (this.communicationType === IPC) {
      this.process.send({ meta: this.meta, hook: this.hook, time: new Date().toISOString(), message });
    }
  }

  onReceiveMessage(message) {
    const { type, data } = message;

    const callback = this.callbacks[type];
    if (callback) {
      callback(data, { type });
    }
  }

  on(messageName, callback) {
    if (messageName === 'internal') {
      console.error('The internal callback is reserved');
    }
    this.callbacks[messageName] = callback;
  }
};
