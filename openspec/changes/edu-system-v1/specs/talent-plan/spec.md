## ADDED Requirements

### Requirement: Group leader can create talent development plan
The system SHALL allow group leaders to create talent development plans with courses and timeline.

#### Scenario: Create plan
- **WHEN** group leader creates plan for major and grade with courses
- **THEN** plan is created with status=draft

### Requirement: Director can approve talent development plan
The system SHALL allow directors to approve or reject talent development plans.

#### Scenario: Approve plan
- **WHEN** director approves plan
- **THEN** plan status becomes approved

#### Scenario: Reject plan
- **WHEN** director rejects plan with comment
- **THEN** plan status becomes rejected and returns to draft
