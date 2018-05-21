## Description

This package is used to interact with Nexuscript as an action or hook.

## Example Hook
*This hook listens for file changes at path and tells nexuscript when any changes occur*
https://github.com/wizebin/nexuscript-file-hook

        import { wrapHook } from 'nexusdk';
        import * as fs from 'fs';
        import path from 'path';

        export default wrapHook((properties, messages) => {
            const { trigger } = messages;
            const { path: location, recursive } = properties;

            const watcher = fs.watch(location, { recursive }, (action, filename) => {
                trigger({ action, filename: path.join(location, filename), relative_filename: filename, time: new Date().toISOString() });
            });
        });

## Example Action
*This action sends a system notification*
https://github.com/wizebin/nexuscript-notification-action

        import { wrapAction } from 'nexusdk';
        import notifier from 'node-notifier';

        const boundNotify = notifier.notify.bind(notifier);

        wrapAction((properties) => {
            const { title, message, timeout } = properties;

            const result = boundNotify({
                title,
                message: message ? message : ' ',
                timeout: timeout ? timeout : undefined,
            });

            return !!result;
        });


## Example Package.json nexuscript configuration

        "nexuscript": {
            "author": "nexuscript",
            "price": "free",
            "type": "action",
            "configuration": {
                "account_sid": "string",
                "auth_token": "string",
                "from": "string",
                "to": "string",
                "body": "string"
            },
            "category": "phone",
            "build_command": "npm run build",
            "dist_folder": "dist",
            "dist_file": "dist/src/main.js"
        }
