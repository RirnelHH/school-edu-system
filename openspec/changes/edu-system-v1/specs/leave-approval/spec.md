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

---

## Implementation Details (2026-03-31)

### Data Models

```prisma
model LeaveRequest {
  id          String   @id @default(cuid())
  studentId   String
  type        LeaveType // "personal" | "sick" | "official"
  startDate   DateTime
  endDate     DateTime
  reason      String
  status      LeaveStatus // "pending" | "approved" | "rejected"
  currentStep Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  student     Student @relation(fields: [studentId], references: [id])
  steps       LeaveStep[]
}

model LeaveStep {
  id           String   @id @default(cuid())
  leaveRequestId String
  step         Int      // 1=class_teacher, 2=director
  approverId   String?
  decision     Decision? // "approved" | "rejected"
  comment      String?
  decidedAt    DateTime?
  createdAt    DateTime @default(now())
}

enum LeaveType {
  personal  // 事假
  sick      // 病假
  official  // 公假
}

enum LeaveStatus {
  pending
  approved
  rejected
}

enum Decision {
  approved
  rejected
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/leaves` | Create leave request |
| GET | `/api/v1/leaves` | List leaves (role-filtered) |
| GET | `/api/v1/leaves/:id` | Get leave detail |
| POST | `/api/v1/leaves/:id/submit` | Submit leave request |
| POST | `/api/v1/leaves/:id/class-teacher-approve` | Class teacher approves |
| POST | `/api/v1/leaves/:id/director-approve` | Director final approval |
| POST | `/api/v1/leaves/:id/reject` | Reject leave (any approver) |

### Approval Workflow

```
学生提交请假
    ↓
Step 1: 班主任审批 (class_teacher)
    ↓ 同意 ↓ 拒绝
    ↓     ↓
Step 2: 主任审批 (director) → 最终决定
    ↓ 同意 ↓ 拒绝
   完成   驳回
```

### Role-Based Access

- Students: can only see their own leave requests
- Class Teachers: can approve/reject leaves for students in their class
- Directors: can give final approval on all leaves
- Admin: full access to all leave requests
