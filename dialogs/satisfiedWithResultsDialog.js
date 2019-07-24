// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    ChoiceFactory,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require('botbuilder-dialogs');

const {State, states} = require('../models/stateModel');

const CHOICE_PROMPT = 'CHOICE_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'SATISFIED_DIALOG';

class SatisfiedWithResultsDialog extends ComponentDialog {
    constructor(self) {
        super('SatisfiedWithResultsDialog');

        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        
        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.satisfiedStep.bind(this),
            this.nextStep.bind(this),
            this.summaryStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async satisfiedStep(step) {  
        return await step.prompt(CONFIRM_PROMPT, { prompt: 'Are you satisfied with the answer?' });
    }

    async nextStep(step) {  
        if (step.result) {
            let msg = `I am glad I could help!`;
            return await step.context.sendActivity(msg);
        }
        else {
            return await step.prompt(CHOICE_2_PROMPT, {
                prompt: 'How would you like to proceed?',
                choices: ChoiceFactory.toChoices(['open ticket', 'speak to human', 'restart'])
            });
        }
    }

    async summaryStep(step) {
        if (step.result.value == 'open ticket') {
            
            let msg = `Hang on, we will open a ticket for you!`;            
            await step.context.sendActivity(msg);
        }
        else if (step.result.value == 'speak to human') {

            let msg = `Let's connect you with a Service Desk employee..`;            
            await step.context.sendActivity(msg);
        }
        else {
            await step.context.sendActivity('Thanks. Your issue will be discarded.');
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await step.endDialog();
    }
}

module.exports.SatisfiedWithResultsDialog = SatisfiedWithResultsDialog;
