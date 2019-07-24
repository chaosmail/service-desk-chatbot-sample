// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class Issue {
    constructor(severity, title, description) {
        this.severity = severity;
        this.title = title;
        this.description = description;
        this.updatedAt;
        this.createdAt = Date.now();
    }
}

module.exports.Issue = Issue;
