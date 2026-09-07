# Agent permissions

## Default posture

Deny by default. Grant the minimum repository, filesystem, network, and secret access required for the current task.

## Allowed (typical implementation task)

- Read governing specs, ADRs, policies, and AGENTS.md
- Read/write within the assigned sibling repository workspace
- Create branches, commits, and PRs for the assigned task
- Run declared tests and linters
- Write evidence candidates to approved paths

## Denied unless explicitly granted

- Cross-repository writes outside the task graph
- Production secret access
- Infrastructure destroy / data deletion
- Changing security or approval policies
- Force-push to protected branches
- Marking own work `DONE`

## Permission binding

Permissions are attached to the task by the engine and enforced by the runtime. Agents must not self-elevate.
