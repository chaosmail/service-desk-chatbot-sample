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
const { Issue } = require('../models/issueModel');

const ISSUE = 'ISSUE';
const CHOICE_PROMPT = 'CHOICE_PROMPT';
const TITLE_PROMPT = 'TITLE_PROMPT';
const DESCRIPTION_PROMPT = 'DESCRIPTION_PROMPT';
const CONFIRM_PROMPT = 'CONFIRM_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class SubmitIssueDialog extends ComponentDialog {
    constructor(self) {
        super('submitIssueDialog');

        this.issue = self.createProperty(ISSUE);

        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new TextPrompt(TITLE_PROMPT));
        this.addDialog(new TextPrompt(DESCRIPTION_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.severityStep.bind(this),
            this.titleStep.bind(this),
            this.descriptionStep.bind(this),
            this.confirmStep.bind(this),
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

    async severityStep(step) {
        // WaterfallStep always finishes with the end of the Waterfall or with another dialog; here it is a Prompt Dialog.
        // Running a prompt here means the next WaterfallStep will be run when the users response is received.        
        return await step.prompt(CHOICE_PROMPT, {
            prompt: 'Please enter severity of the issue.',
            choices: ChoiceFactory.toChoices(['critical', 'major', 'minor', 'trivial'])
        });
    }

    async titleStep(step) {
        step.values.severity = step.result.value;
        return await step.prompt(TITLE_PROMPT, `What is the title of the issue?`);
    }

    async descriptionStep(step) {
        step.values.title = step.result;
        return await step.prompt(DESCRIPTION_PROMPT, `What is the description of the issue?`);
    }

    async confirmStep(step) {
        step.values.description = step.result;

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is a Prompt Dialog.
        return await step.prompt(CONFIRM_PROMPT, { prompt: 'Do you want to report this issue now?' });
    }

    async summaryStep(step) {
        if (step.result) {
            // Get the current profile object from user state.
            const issue = await this.issue.get(step.context, new Issue());

            issue.severity = step.values.severity;
            issue.title = step.values.title;
            issue.description = step.values.description;
            issue.updatedAt = Date.now();
            
            let msg = `Issue '${ issue.title }' with severity '${ issue.severity }':\n`;
            msg += '"' + issue.description + '"';

            await step.context.sendActivity(msg);
        } else {
            await step.context.sendActivity('Thanks. Your issue will be discarded.');
        }

        // WaterfallStep always finishes with the end of the Waterfall or with another dialog, here it is the end.
        return await step.endDialog();
    }
}

module.exports.SubmitIssueDialog = SubmitIssueDialog;
