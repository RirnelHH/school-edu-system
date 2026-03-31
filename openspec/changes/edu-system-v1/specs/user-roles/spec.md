## ADDED Requirements

### Requirement: User can have multiple roles
The system SHALL allow a user to have one base role and multiple additional roles.

#### Scenario: Teacher with additional roles
- **WHEN** user is a teacher and assigned as class teacher
- **THEN** user has baseRole=teacher and additionalRoles=[class_teacher]

### Requirement: User can switch active role
The system SHALL allow users with multiple roles to switch their active role.

#### Scenario: Role switch
- **WHEN** user switches from teacher to class_teacher
- **THEN** subsequent requests use class_teacher permissions

### Requirement: Roles have scoped permissions
The system SHALL enforce permission boundaries based on role scope.

#### Scenario: Class teacher can only manage own class
- **WHEN** class_teacher attempts to approve leave for other class
- **THEN** system returns 403 Forbidden

### Requirement: Student positions can be assigned
The system SHALL allow class teachers to assign positions (monitor, study_leader, etc.) to students.

#### Scenario: Assign position
- **WHEN** class_teacher assigns student as monitor
- **THEN** StudentPosition record is created

### Requirement: Admin role has full access
The system SHALL grant admin role access to all system management functions.

#### Scenario: Admin accesses system config
- **WHEN** admin accesses any system configuration
- **THEN** system allows the operation
