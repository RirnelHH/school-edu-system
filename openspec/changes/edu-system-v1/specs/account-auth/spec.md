## ADDED Requirements

### Requirement: Account can login with username and password
The system SHALL allow users to login with username and password credentials.

#### Scenario: Successful login
- **WHEN** user submits valid username and password
- **THEN** system returns JWT token and user info

#### Scenario: Invalid credentials
- **WHEN** user submits invalid password
- **THEN** system returns 401 Unauthorized

### Requirement: Account can login with WeChat OAuth
The system SHALL allow users to login via WeChat OAuth for mini-program.

#### Scenario: WeChat login success
- **WHEN** user approves WeChat authorization
- **THEN** system returns JWT token and binds WeChat openid

### Requirement: Account locks after 5 failed login attempts
The system SHALL lock account for 30 minutes after 5 consecutive failed login attempts.

#### Scenario: Account locked
- **WHEN** user fails login 5 times
- **THEN** account is locked and returns 423 Locked

#### Scenario: Locked user attempts login
- **WHEN** locked user attempts login within 30 minutes
- **THEN** system returns 423 Locked with remaining lock time

### Requirement: JWT token expires after 24 hours
The system SHALL invalidate JWT tokens after 24 hours.

#### Scenario: Expired token access
- **WHEN** user accesses with expired token
- **THEN** system returns 401 Unauthorized

### Requirement: Token can be refreshed
The system SHALL allow users to refresh expired tokens.

#### Scenario: Refresh token
- **WHEN** user submits valid refresh token
- **THEN** system returns new JWT token

### Requirement: Login attempts are logged
The system SHALL record login attempts with IP, timestamp, and device info.

#### Scenario: Login logged
- **WHEN** user attempts login
- **THEN** system creates LoginLog entry
