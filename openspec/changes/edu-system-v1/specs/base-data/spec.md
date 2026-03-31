## ADDED Requirements

### Requirement: Schools can be managed
The system SHALL allow administrators to create, edit, and delete school records.

#### Scenario: Create school
- **WHEN** admin creates a new school with name and code
- **THEN** school record is created with unique ID

### Requirement: Departments can be managed
The system SHALL allow administrators to create, edit, and delete department records.

#### Scenario: Create department
- **WHEN** admin creates a department under a school
- **THEN** department record is created with school relationship

### Requirement: Majors can be managed
The system SHALL allow administrators to create, edit, and delete major records.

#### Scenario: Create major
- **WHEN** admin creates a major under a department
- **THEN** major record is created

### Requirement: Classes can be managed
The system SHALL allow administrators to create, edit, and delete class records.

#### Scenario: Create class
- **WHEN** admin creates a class with name, grade, major, and teacher
- **THEN** class record is created with studentCount=0

### Requirement: Students can be imported via Excel
The system SHALL allow bulk import of students from Excel template.

#### Scenario: Import students
- **WHEN** admin uploads Excel file with student data
- **THEN** students are created and linked to class

#### Scenario: Duplicate student number
- **WHEN** imported student number already exists
- **THEN** import fails for that row with reason

### Requirement: Academic years can be configured
The system SHALL allow administrators to configure academic years and semesters.

#### Scenario: Create academic year
- **WHEN** admin creates academic year 2024-2025
- **THEN** academic year record is created with start/end dates
