import * as object from './objectUtility';
export { object };

const env = {};

const IPC = 1;
const SOCKET = 2;

export class nexusdk {
  constructor({ id, name } = {}) {
    this.errors = [];
    this.onInternalMessage = this.onInternalMessage.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
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
    } else if (name === 'set_hook') {
      this.hook = data;
    }
  }

  sendData(message) {
    if (this.communicationType === IPC) {
      this.process.send({ meta: this.meta, hook: this.hook, time: new Date().toISOString(), message });
    }
  }

  sendMessage(type, data) {
    return this.sendData({ type, data });
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

const sdk = new nexusdk();

export function wrapAction(actionFunction, configuration) {
  function exit(code) {
    sdk.sendMessage('exit', code);
    process.exit(code);
  }
  sdk.on('start', (properties) => {
    try {
      const result = actionFunction(properties, (type, msg) => sdk.sendMessage(type, msg));
      if (result instanceof Promise) {
        result.then(result => {
          sdk.sendMessage('result', result)
          exit(0);
        });
      } else {
        sdk.sendMessage('result', result);
        exit(0);
      }
    } catch (err) {
      sdk.sendMessage('error', err);
      exit(1);
    }
  });

  sdk.on('configuration', () => {
    sdk.sendMessage('configuration', configuration);
  });

  sdk.on('exit', () => {
    exit(0);
  });
}

export function wrapHook(hookFunction, configuration) {
  sdk.on('start', (properties) => {
    try {
      const result = hookFunction(properties, (type, msg) => sdk.sendMessage(type, msg));
    } catch (err) {
      sdk.sendMessage('error', err);
    }
  });

  sdk.on('configuration', () => {
    sdk.sendMessage('configuration', configuration);
  });
}

export default sdk;
