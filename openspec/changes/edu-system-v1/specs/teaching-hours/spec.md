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

---

## Implementation Details (2026-03-31)

### Data Models

```prisma
model TeachingHoursCoefficient {
  id          String   @id @default(cuid())
  name        String   // e.g., "理论课", "实践课", "早晚自习"
  type        String   // "theory" | "practice" | "self_study"
  coefficient Float    @default(1.0)
  description String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TeachingHoursRecord {
  id              String   @id @default(cuid())
  teacherId       String
  semesterId      String
  courseId        String
  classId         String
  periodType      String   // "morning" | "afternoon" | "evening"
  hours           Float
  coefficient     Float    @default(1.0)
  finalHours      Float    // hours * coefficient
  isDuplicate     Boolean  @default(false)
  isSuspended     Boolean  @default(false)
  suspendedHours  Float    @default(0)
  weekNumber      Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/teaching-hours/coefficients` | List all coefficients |
| POST | `/api/v1/teaching-hours/coefficients` | Create coefficient |
| PUT | `/api/v1/teaching-hours/coefficients/:id` | Update coefficient |
| GET | `/api/v1/teaching-hours/records` | List teaching hour records |
| GET | `/api/v1/teaching-hours/records/:teacherId` | Get teacher's hours |
| POST | `/api/v1/teaching-hours/calculate` | Calculate total hours for teacher |
| GET | `/api/v1/teaching-hours/summary/:teacherId` | Get hours summary by course |
| POST | `/api/v1/teaching-hours/suspensions` | Record suspension periods |
| GET | `/api/v1/teaching-hours/suspensions/:semesterId` | List suspensions |

### Coefficient Calculation Logic

1. **Duplicate Class Coefficient**: Largest class gets 1.0, others get configured ratio (e.g., 0.9, 0.85)
2. **Class Size Coefficient**: Based on student count ranges:
   - ≤20: 0.8
   - 21-30: 0.95
   - 31-40: 1.05
   - 41-50: 1.15
   - \>50: 1.25
3. **Final Hours** = Base Hours × Class Size Coefficient × Duplicate Coefficient
4. **Suspension Deduction**: Suspended periods subtract from total (tracked separately)

### Test Coverage
- `teaching-hours.service.spec.ts`: 169 lines of unit tests covering coefficient calculation and suspension logic
