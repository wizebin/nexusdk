import * as object from './objectUtility';
export { object };

const env = {};

const IPC = 1;
const SOCKET = 2;

export class Nexusdk {
  constructor({ id, name } = {}) {
    this.errors = [];
    this.onInternalMessage = this.onInternalMessage.bind(this);
    this.onReceiveMessage = this.onReceiveMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    if (typeof global.process !== 'undefined') {
      this.communicationType = IPC;
      global.process.on('message', this.onReceiveMessage);
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
      global.process.send({ meta: this.meta, hook: this.hook, time: new Date().toISOString(), message });
    }
  }

  sendMessage(type, data, caller) {
    return this.sendData({ type, data, caller });
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

function getPlainError(err) {
  let result = {};
  const keys = Object.getOwnPropertyNames(err);
  for (let keydex = 0; keydex < keys.length; keydex += 1) {
    const key = keys[keydex];
    result[key] = err[key];
  }
  return result;
}

export function wrapSDKFunction(sdk, func, exit, caller) {
  return (...args) => {
    try {
      const result = func(...args);
      if (result instanceof Promise) {
        result.then(result => {
          sdk.sendMessage('result', result, caller)
        });
      } else {
        sdk.sendMessage('result', result, caller);
      }
    } catch (err) {
      sdk.sendMessage('error', getPlainError(err), caller);
    }
  }
}

export function wrapSDKAction(sdk, actionFunction, requiredConfiguration) {
  function exit(code) {
    sdk.sendMessage('exit', code);
    process.exit(code);
  }
  sdk.on('start', wrapSDKFunction(sdk, actionFunction, exit, 'start'));

  sdk.on('configuration', () => {
    sdk.sendMessage('configuration', requiredConfiguration);
  });

  sdk.on('exit', () => {
    exit(0);
  });
}

export function wrapSDKHook(sdk, hookFunction, requiredConfiguration, preload, cleanup) {
  function exit(code) {
    sdk.sendMessage('exit', code);
    process.exit(code);
  }

  const messageCallbacks = {
    message: (type, data) => sdk.sendMessage(type, data, 'start'),
    trigger: (data) => sdk.sendMessage('trigger', data, 'start'),
    stop: () => sdk.sendMessage('stop', null, 'start'),
    config: () => sdk.sendMessage('config', null, 'start'),
  };

  sdk.on('start', (properties) => {
    hookFunction(properties, messageCallbacks);
  });

  preload && sdk.on('preload', wrapSDKFunction(sdk, preload, exit, 'preload'));
  cleanup && sdk.on('cleanup', wrapSDKFunction(sdk, cleanup, exit, 'cleanup'));

  sdk.on('configuration', () => {
    sdk.sendMessage('configuration', requiredConfiguration);
  });

  sdk.on('exit', () => {
    exit(0);
  });
}

const globalSDK = new Nexusdk();

export function wrapFunction(...args) {
  return wrapSDKFunction(globalSDK, ...args);
}
export function wrapAction(...args) {
  return wrapSDKAction(globalSDK, ...args);
}
export function wrapHook(...args) {
  return wrapSDKHook(globalSDK, ...args);
}

export default globalSDK;
