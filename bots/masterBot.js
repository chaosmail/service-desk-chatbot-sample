// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler } = require('botbuilder');
const {State, states} = require('../models/stateModel');

class MasterBot extends ActivityHandler {
    
    constructor(conversationState, userState, qnaBot, dialogBot) {
        super();
        if (!conversationState) throw new Error('[MasterBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[MasterBot]: Missing parameter. userState is required');

        this.conversationState = conversationState;
        this.userState = userState;

        this.qnaBot = qnaBot;
        this.dialogBot = dialogBot;
        this.masterState = this.userState.createProperty('MasterState');

        this.onMessage(async (context, next) => {
            console.log('Running master bot Message Activity.');

            const data = await this.masterState.get(context, new State());
            
            console.log(data.state);

            if (data.state == states.ISSUE) {
                // Run the dialog bot
                await this.dialogBot.run(context, next);
                data.state = states.DEFAULT;
            }
            else {
                await this.qnaBot.run(context, next);
                data.state = states.ISSUE;
                await this.masterState.set(context, data);
                await this.dialogBot.run(context, next);
            }

            await this.conversationState.saveChanges(context, false);
            await next();
        });
    }
}

module.exports.MasterBot = MasterBot;
