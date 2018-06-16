const nexusdk = require('../../dist/src/index');
nexusdk.wrapHook(function (properties, messages) {
  const { data, accounts } = properties;
  messages.trigger({ test: data })
});
