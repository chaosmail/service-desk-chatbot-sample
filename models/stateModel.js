// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const states = {
    DEFAULT: 'default',
    ISSUE: 'issue',
    QNA: 'qna'
}

class State {
    constructor() {
        this.state = states.DEFAULT;
    }
}

module.exports.State = State;
module.exports.states = states;
