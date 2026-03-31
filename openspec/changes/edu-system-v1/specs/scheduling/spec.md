## ADDED Requirements

### Requirement: Course hours can be configured per class
The system SHALL allow configuring theory and lab hours for each course per class.

#### Scenario: Configure hours
- **WHEN** group leader sets totalHours=64, theoryHours=32, labHours=32
- **THEN** system validates theoryHours + labHours = totalHours

### Requirement: Schedule conflicts are detected
The system SHALL detect and report conflicts in scheduling.

#### Scenario: Teacher time conflict
- **WHEN** scheduling entry conflicts with teacher unavailable time
- **THEN** system marks entry with conflict type teacher_unavailable

### Requirement: Lab courses require computer room
The system SHALL require lab courses to be assigned to a computer room.

#### Scenario: Lab without room
- **WHEN** lessonType=lab and roomId is null
- **THEN** system returns 400 error

### Requirement: Computer room capacity is checked
The system SHALL verify computer room capacity >= student count.

#### Scenario: Insufficient capacity
- **WHEN** computer room has 30 computers for 50 students
- **THEN** system marks conflict type computer_room_capacity
