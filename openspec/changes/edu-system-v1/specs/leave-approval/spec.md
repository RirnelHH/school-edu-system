## ADDED Requirements

### Requirement: Students can submit leave requests
The system SHALL allow students to submit leave requests with type, dates, and reason.

#### Scenario: Submit leave
- **WHEN** student submits personal leave for 2 days
- **THEN** leave request is created with status=pending, currentStep=1

### Requirement: Class teacher can approve leaves
The system SHALL allow class teachers to approve or reject leaves for their class students.

#### Scenario: Approve leave
- **WHEN** class teacher approves leave
- **THEN** currentStep becomes 2

### Requirement: Director gives final approval
The system SHALL allow directors to give final approval on leaves.

#### Scenario: Final approval
- **WHEN** director approves leave
- **THEN** status becomes approved
