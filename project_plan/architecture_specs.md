# SummaStudy Architecture Specifications

## 1. Event-Driven Architecture Suggestions
- **Async Processing**: Use Celery with Redis/RabbitMQ for long-running tasks (OCR, Embedding, Classification).
- **Event Bus**: Implement a central event bus for cross-domain notifications (e.g., `resource.processed` -> `notification.send`).
- **Webhooks**: Provide webhooks for external integrations (e.g., Institution LMS sync).
- **Audit Streaming**: Stream activity logs to an ELK stack or similar for real-time monitoring.

## 2. Naming Conventions
- **Models**: PascalCase (e.g., `CourseEnrollment`).
- **Fields**: snake_case (e.g., `created_at`).
- **APIs**: kebab-case (e.g., `/api/course-topics/`).
- **Events**: dot.notation (e.g., `study.session.started`).
- **TypeScript**: interfaces in PascalCase, properties in camelCase.

## 3. Recommended Enums/Constants
- **User Roles**: `ADMIN`, `LECTURER`, `STUDENT`, `GUEST`.
- **Resource Types**: `PDF`, `VIDEO`, `LINK`, `MARKDOWN`, `QUIZ`.
- **Task Status**: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`.
- **Enrollment Status**: `ACTIVE`, `COMPLETED`, `DROPPED`, `SUSPENDED`.

## 4. State Machine Suggestions
- **Resource Lifecycle**: `Draft` -> `Uploading` -> `Processing` -> `Ready` | `Error`.
- **Tutorial Booking**: `Requested` -> `Confirmed` -> `Attended` | `NoShow` | `Cancelled`.
- **Quiz Attempt**: `Started` -> `InProgress` -> `Submitted` -> `Graded`.

## 5. Recommended Service Boundaries
- **Academic Service**: Manages Institutions, Departments, Courses, Topics, and Resources.
- **Learning Service**: Handles Enrollments, Progress, Flashcards, Quizzes, and Study Sessions.
- **AI Engine Service**: Responsible for OCR, Embeddings, Summarization, and Chat.
- **Marketplace Service**: Manages Marketplace Listings and Transactions.
- **Identity Service**: Handles Authentication, Roles, and Permissions.

## 6. Resource Transformation Architecture
1. **Ingestion**: Raw file upload to S3.
2. **Extraction**: OCR task extracts raw text.
3. **Refinement**: AI Classification task tags the content.
4. **Chunking**: Text is split into overlapping windows for context retention.
5. **Vectorization**: Chunks are sent to Embedding service.
6. **Indexing**: Vectors are stored in Vector DB (e.g., pgvector) with metadata.
7. **Synthesis**: AISummary and auto-generated Quizzes are created from the processed text.
