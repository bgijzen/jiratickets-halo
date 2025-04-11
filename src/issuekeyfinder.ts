import _ from 'lodash';
import Jira from './jira';

// Regular expression to match Jira issue keys
const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g;

// Event template strings for different sources
const eventTemplates: Record<string, string> = {
  branch: '{{event.ref}}',
  commits: "{{event.commits.map(c=>c.message).join(' ')}}",
};

// Define interfaces for type safety
interface JiraConfig {
  baseUrl: string;
  token: string;
  email: string;
}

interface Args {
  string?: string;
  from?: string;
}

interface GithubEvent {
  ref?: string;
  commits?: Array<{ message: string }>;
  [key: string]: any;
}

interface ActionParams {
  githubEvent: GithubEvent;
  argv: Args;
  jira: Jira;
}

interface FoundIssue {
  issue: string;
}

class IssueKeyFinder {
  private Jira: Jira;
  private argv: Args;
  private githubEvent: GithubEvent;

  constructor({ githubEvent, argv, jira }: ActionParams) {
    this.Jira = jira
    this.argv = argv;
    this.githubEvent = githubEvent;
  }

  async execute(): Promise<FoundIssue | undefined> {
    if (this.argv.string) {
      const foundIssue = await this.findIssueKeyIn(this.argv.string);

      if (foundIssue) return foundIssue;
    }

    if (this.argv.from) {
      const template = eventTemplates[this.argv.from];

      if (template) {
        const searchStr = this.preprocessString(template);
        const foundIssue = await this.findIssueKeyIn(searchStr);

        if (foundIssue) return foundIssue;
      }
    }
    
    return undefined;
  }

  private async findIssueKeyIn(searchStr: string): Promise<FoundIssue | undefined> {
    const match = searchStr.match(issueIdRegEx);

    console.log(`Searching in string: \n ${searchStr}`);

    if (!match) {
      console.log(`String does not contain issueKeys`);
      return undefined;
    }

    for (const issueKey of match) {
      const issue = await this.Jira.getIssue(issueKey, { fields: ["summary","description","parent"] });

      if (issue) {
        return { issue: issue.key };
      }
    }
    
    return undefined;
  }

  private preprocessString(str: string): string {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    const tmpl = _.template(str);

    return tmpl({ event: this.githubEvent });
  }
}

export default IssueKeyFinder;