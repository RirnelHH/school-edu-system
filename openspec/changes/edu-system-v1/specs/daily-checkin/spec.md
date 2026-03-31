## ADDED Requirements

### Requirement: Students can check in daily
The system SHALL record student check-in with GPS location and timestamp.

#### Scenario: Check in
- **WHEN** student checks in with location
- **THEN** check-in record is created with status checked_in

### Requirement: Late arrival is detected
The system SHALL mark check-ins after configured time as late.

#### Scenario: Late detection
- **WHEN** student checks in at 08:05 for 08:00 deadline
- **THEN** status is late
