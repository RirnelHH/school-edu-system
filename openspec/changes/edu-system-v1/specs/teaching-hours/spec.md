## ADDED Requirements

### Requirement: Teaching hours use duplicate coefficient
The system SHALL apply coefficient 1.0 to largest class, others by config.

#### Scenario: Calculate duplicate coefficient
- **WHEN** teacher teaches 3 classes with 45, 38, 42 students
- **THEN** class with 45 students gets coefficient 1.0, 38 gets 0.9, 42 gets 0.85

### Requirement: Class size coefficient is applied
The system SHALL apply class size coefficient based on configured ranges.

#### Scenario: Class size coefficient
- **WHEN** class has 45 students
- **THEN** coefficient is 1.15 for range 41-50

### Requirement: Suspensions reduce teaching hours
The system SHALL subtract suspended hours from total teaching hours.
