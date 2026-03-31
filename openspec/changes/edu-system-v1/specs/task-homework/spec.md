## ADDED Requirements

### Requirement: Teachers can publish tasks
The system SHALL allow teachers to publish tasks with title, description, deadline.

#### Scenario: Publish task
- **WHEN** teacher publishes task
- **THEN** task is created with status published

### Requirement: Students can submit homework
The system SHALL allow students to submit homework before deadline.

#### Scenario: Submit on time
- **WHEN** student submits before deadline
- **THEN** status is submitted

### Requirement: Late submissions are marked
The system SHALL mark submissions after deadline as late.
