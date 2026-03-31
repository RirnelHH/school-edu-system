## ADDED Requirements

### Requirement: Grades are calculated by formula
The system SHALL calculate totalScore = usualScore * ratio + finalScore * ratio.

#### Scenario: Calculate grade
- **WHEN** usualScore=90, finalScore=70 with 30%/70% ratio
- **THEN** totalScore = 27 + 49 = 76

### Requirement: Students can view their own grades
The system SHALL allow students to view only their own published grades.

#### Scenario: View own grade
- **WHEN** student queries their own grades
- **THEN** grades are returned

#### Scenario: View others grade
- **WHEN** student queries other student grades
- **THEN** system returns 403 Forbidden
