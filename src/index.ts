import * as core from '@actions/core';
import * as github from '@actions/github';
import IssueKeyFinder from './issuekeyfinder';
import Jira from './jira';

interface Args {
    string?: string;
    from?: string;
}

interface ActionResult {
    issue: string;
    [key: string]: any; // Allow additional properties
}

// Check if required environment variables exist
const home = process.env.HOME;
if (!home) {
    throw new Error('HOME environment variable is not set');
}

const githubEventPath = process.env.GITHUB_EVENT_PATH;
if (!githubEventPath) {
    throw new Error('GITHUB_EVENT_PATH environment variable is not set');
}
const githubEvent: any = require(githubEventPath);

async function run(): Promise<void> {
    const jira: Jira = new Jira ({
                baseUrl: core.getInput('jira_base_url'),
        token: core.getInput('jira_token'),
        email: core.getInput('jira_email'),
    });
    try {
        const issueFinder = new IssueKeyFinder({
            githubEvent,
            argv: parseArgs(),
            jira,
        });
        const result: ActionResult | undefined = await issueFinder.execute();

        if (result) {
            console.log(`Detected issueKey: ${result.issue}`);

            // Expose created issue's key as an output
            core.setOutput('issue', result.issue);
        } else {

            console.log('No issue keys found.');
            core.setFailed('No issue keys found.');
        }
    } catch (error) {
        core.setFailed((error as Error).toString());
    }
}

run();


function parseArgs(): Args {
    return {
        string: core.getInput('string'),
        from: core.getInput('from'),
    };
}