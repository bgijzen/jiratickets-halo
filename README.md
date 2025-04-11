# Jira Tickets Halo Action

A GitHub Action that integrates Jira tickets with Halo, automating the workflow between issue tracking and development.

## Description

This action allows you to sync Jira tickets with Halo, enabling automated workflow transitions, comment syncing, and status updates between your Jira project management and Halo environment.

## Usage

Add this action to your workflow file:

```yaml
name: Jira Tickets Halo Integration

on:
    issues:
        types: [opened, closed, reopened]
    pull_request:
        types: [opened, closed, merged]

jobs:
    sync-jira-halo:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            
            - name: Jira Tickets Halo Sync
                uses: your-username/jiratickets-halo@v1
                with:
                    jira-base-url: ${{ secrets.JIRA_BASE_URL }}
                    jira-api-token: ${{ secrets.JIRA_API_TOKEN }}
                    jira-user-email: ${{ secrets.JIRA_USER_EMAIL }}
                    halo-api-key: ${{ secrets.HALO_API_KEY }}
                    halo-instance: ${{ secrets.HALO_INSTANCE }}
```

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| `jira-base-url` | Base URL of your Jira instance | Yes |
| `jira-api-token` | API token for Jira authentication | Yes |
| `jira-user-email` | Email address associated with Jira API token | Yes |
| `halo-api-key` | API key for Halo authentication | Yes |
| `halo-instance` | Your Halo instance identifier | Yes |

## Outputs

| Output | Description |
|--------|-------------|
| `synced-tickets` | JSON array of successfully synced ticket IDs |
| `sync-status` | Status of the sync operation (success/partial/failed) |

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.