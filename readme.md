## Description

This package is used to interact with Nexuscript from a hook.

## Usage

    import nexusdk from 'wizebin/nexusdk';

    nexusdk.on('start', () => {
        // start your hook here
    })

    nexusdk.on('stop', () => {
        // stop your hook here
    })

    nexusdk.sendMessage(messageData); // Tell nexuscript your hook has been triggered
