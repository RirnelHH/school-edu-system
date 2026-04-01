## ADDED Requirements

### Requirement: Teachers can create teaching plans
The system SHALL allow teachers to create teaching plans with weekly breakdown.

### Requirement: Lesson plans follow approval workflow
The system SHALL route lesson plans through group leader review to director approval.

### Requirement: Teaching plans support Excel batch import
The system SHALL allow bulk import of teaching plans via Excel template upload.

### Requirement: Multi-teacher lesson plan collaboration
The system SHALL allow multiple teachers to collaborate on lesson plans for the same course/class.

### Requirement: Multi-stage lesson plan approval
The system SHALL route lesson plans through teacher self-review → group leader → director approval.

---

## Implementation Details (2026-03-31)

### Data Models

```prisma
model TeachingPlan {
  id            String   @id @default(cuid())
  title         String
  semesterId    String
  teacherId     String
  status        TeachingPlanStatus
  submittedAt   DateTime?
  approvedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  entries       TeachingPlanEntry[]
  lessonPlans   LessonPlan[]
  teachers      TeachingPlanTeacher[]
}

model TeachingPlanEntry {
  id              String  @id @default(cuid())
  teachingPlanId  String
  courseId        String
  weekNumber      Int
  content         String  // Week content description
  teachingType    String  // "theory" | "practice"
  periodType      String  // "morning" | "afternoon"
}

model LessonPlan {
  id            String   @id @default(cuid())
  teachingPlanId String
  weekNumber    Int
  content       String   // Lesson plan content
  attachments   String[] // File URLs
  status        LessonPlanStatus
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  approvals     LessonPlanTeacherApproval[]
}

model TeachingPlanTeacher {
  id            String @id @default(cuid())
  teachingPlanId String
  teacherId     String
  role          String // "owner" | "collaborator"
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/teaching-plans` | Create teaching plan |
| GET | `/api/v1/teaching-plans` | List teaching plans |
| GET | `/api/v1/teaching-plans/:id` | Get teaching plan detail |
| POST | `/api/v1/teaching-plans/:id/submit` | Submit for approval |
| POST | `/api/v1/teaching-plans/:id/approve` | Approve teaching plan |
| POST | `/api/v1/teaching-plans/:id/reject` | Reject teaching plan |
| POST | `/api/v1/teaching-plans/excel/import` | Batch import from Excel |
| POST | `/api/v1/teaching-plans/lesson-plans` | Create lesson plan |
| GET | `/api/v1/teaching-plans/lesson-plans/:teachingPlanId` | List lesson plans |
| POST | `/api/v1/teaching-plans/lesson-plans/:id/submit` | Submit lesson plan |
| POST | `/api/v1/teaching-plans/lesson-plans/:id/teacher-approve` | Multi-teacher approval |
| POST | `/api/v1/teaching-plans/lesson-plans/:id/director-approve` | Director final approval |

### Status Workflow

**Teaching Plan:**
```
DRAFT → PENDING_TEACHER → PENDING_GROUP_LEADER → APPROVED/REJECTED
```

**Lesson Plan:**
```
DRAFT → PENDING_TEACHER → PENDING_GROUP_LEADER → PENDING_DIRECTOR → APPROVED/REJECTED
```

### Excel Import

- Template columns: `course_name`, `class_name`, `teacher_name`, `week_number`, `content`, `teaching_type`, `period_type`
- Supports batch upload of weekly teaching entries
- Validates course and class existence before import
