# SummaStudy Domain-Driven Architecture: Entity Definitions

This document defines the core entities of the SummaStudy platform following Domain-Driven Design principles.

---

## 1. Admin
1. **Purpose**: Represents high-level system administrators responsible for global configuration and oversight.
2. **Responsibilities**: Manage institutions, global system settings, and high-level platform health.
3. **Ownership**: System level.
4. **Relationships**: Manages Institutions, views ActivityLogs.
5. **Lifecycle**: Created via system bootstrap; persistent.
6. **States**: Active, Suspended.
7. **Permissions**: All-access (Superuser).
8. **Validation rules**: Must have a valid corporate/system email.
9. **AI interactions**: None directly, but oversees AI usage limits.
10. **Events/actions**: CreateInstitution, SuspendInstitution, ViewSystemHealth.
11. **Scalability concerns**: Low count, but critical security endpoint.
12. **Recommended database structure**: Extension of the custom User model (is_staff, is_superuser).
13. **Recommended API structure**: `/api/admin/*` (REST).
14. **Frontend usage**: Global Dashboard for platform metrics.
15. **Backend usage**: Django Admin and custom Admin views.
16. **Potential future extensions**: Regional admins, specialized support roles.

---

## 2. Institution
1. **Purpose**: Represents a school, university, or training center.
2. **Responsibilities**: Tenant container for all academic data.
3. **Ownership**: Admin.
4. **Relationships**: Has many Departments, Courses, and Users.
5. **Lifecycle**: Created by Admin; can be archived.
6. **States**: Active, Inactive, Pending Verification.
7. **Permissions**: Viewable by associated users; editable by Admin.
8. **Validation rules**: Unique name, valid domain, registration number.
9. **AI interactions**: Custom AI branding/tuning per institution.
10. **Events/actions**: Onboard, Deactivate, ConfigureSettings.
11. **Scalability concerns**: Multi-tenancy isolation (Schema or Filter-based).
12. **Recommended database structure**: Table `institutions` with slug, name, settings JSON.
13. **Recommended API structure**: `/api/institutions/{id}/`.
14. **Frontend usage**: Institution profile and management pages.
15. **Backend usage**: Context provider for tenant filtering.
16. **Potential future extensions**: Multiple campuses, parent-child institution relationships.

---

## 3. Department
1. **Purpose**: Organizational unit within an Institution (e.g., Computer Science).
2. **Responsibilities**: Grouping courses and faculty members.
3. **Ownership**: Institution.
4. **Relationships**: Belongs to Institution; has many Courses and Faculty.
5. **Lifecycle**: Created by Institution Admin.
6. **States**: Active, Archived.
7. **Permissions**: Managed by Institution Admin.
8. **Validation rules**: Unique name within Institution.
9. **AI interactions**: None.
10. **Events/actions**: Create, Delete, MoveCourses.
11. **Scalability concerns**: Moderate growth.
12. **Recommended database structure**: Table `departments` (institution_id, name).
13. **Recommended API structure**: `/api/institutions/{inst_id}/departments/`.
14. **Frontend usage**: Directory and filtering.
15. **Backend usage**: Organizational grouping.
16. **Potential future extensions**: Departmental budget and resource management.

---

## 4. Course
1. **Purpose**: An academic subject taught over a period (e.g., CS101).
2. **Responsibilities**: Container for learning content, enrollments, and sessions.
3. **Ownership**: Department/Institution.
4. **Relationships**: Belongs to Department; has many CourseTopics, Resources, and Enrollments.
5. **Lifecycle**: Drafted, Published, Archived.
6. **States**: Upcoming, In Progress, Completed.
7. **Permissions**: Viewable by Enrolled Students/Instructors.
8. **Validation rules**: Unique course code, valid duration.
9. **AI interactions**: AI-generated course syllabus, auto-tagging.
10. **Events/actions**: Publish, EnrollStudent, AddResource.
11. **Scalability concerns**: High volume of resources and enrollments.
12. **Recommended database structure**: Table `courses` (code, title, description, credits).
13. **Recommended API structure**: `/api/courses/{id}/`.
14. **Frontend usage**: Course detail pages, enrollment cards.
15. **Backend usage**: Core entity for content delivery.
16. **Potential future extensions**: Pre-requisite graphs, certificate generation.


---

## 5. CourseEnrollment
1. **Purpose**: Tracks a user's participation in a course.
2. **Responsibilities**: Managing access rights to course materials and tracking grades/progress.
3. **Ownership**: User (Student) and Course.
4. **Relationships**: Links User to Course; relates to LearningProgress.
5. **Lifecycle**: Requested -> Active -> Completed/Dropped.
6. **States**: Pending, Active, Suspended, Completed, Dropped.
7. **Permissions**: Student views their own; Instructor views all in course.
8. **Validation rules**: User must exist; Course must be active; No duplicate active enrollments.
9. **AI interactions**: AI-personalized learning paths based on enrollment status.
10. **Events/actions**: Enroll, Drop, Complete, Grade.
11. **Scalability concerns**: High write frequency during enrollment periods.
12. **Recommended database structure**: Table `course_enrollments` (user_id, course_id, role, status).
13. **Recommended API structure**: `/api/courses/{id}/enroll/`.
14. **Frontend usage**: "My Courses" section, Enrollment buttons.
15. **Backend usage**: Authorization check for resource access.
16. **Potential future extensions**: Waitlist management, partial completion tracking.

---

## 6. CourseTopic
1. **Purpose**: Granular subject area within a Course (e.g., "Intro to Calculus").
2. **Responsibilities**: Grouping related Resources and Quizzes.
3. **Ownership**: Course.
4. **Relationships**: Belongs to Course; has many Resources.
5. **Lifecycle**: Created by Instructor.
6. **States**: Published, Draft.
7. **Permissions**: Editable by Course Instructor.
8. **Validation rules**: Must belong to a valid course.
9. **AI interactions**: Auto-generated topic outlines and descriptions.
10. **Events/actions**: AddTopic, ReorderTopics.
11. **Scalability concerns**: Deeply nested structures can impact query performance.
12. **Recommended database structure**: Table `course_topics` (course_id, title, order_index).
13. **Recommended API structure**: `/api/courses/{id}/topics/`.
14. **Frontend usage**: Course curriculum accordion/sidebar.
15. **Backend usage**: Content organization.
16. **Potential future extensions**: Topic-level mastery tracking.

---

## 7. Resource
1. **Purpose**: Actual learning material (PDF, Video, Link, Note).
2. **Responsibilities**: Storing raw content or reference to storage.
3. **Ownership**: CourseTopic or User (if personal).
4. **Relationships**: Belongs to CourseTopic; parent of ResourceChunks.
5. **Lifecycle**: Uploading -> Processing -> Ready -> Archived.
6. **States**: Processing, Active, Error, Private.
7. **Permissions**: Access controlled by Course Enrollment.
8. **Validation rules**: Supported file types, size limits.
9. **AI interactions**: OCR processing, embedding generation, summarization.
10. **Events/actions**: Upload, Process, Download, View.
11. **Scalability concerns**: Large file storage and bandwidth.
12. **Recommended database structure**: Table `resources` (title, type, s3_path, size).
13. **Recommended API structure**: `/api/resources/{id}/`.
14. **Frontend usage**: Document viewer, video player, resource list.
15. **Backend usage**: Storage abstraction and processing triggers.
16. **Potential future extensions**: Versioning, collaborative editing.

---

## 8. ResourceChunk
1. **Purpose**: Atomic pieces of a Resource (e.g., a page of a PDF or a section of text).
2. **Responsibilities**: Storing text and vector embeddings for AI search.
3. **Ownership**: Resource.
4. **Relationships**: Belongs to Resource.
5. **Lifecycle**: Created during EmbeddingTask.
6. **States**: Raw, Embedded.
7. **Permissions**: System-level access for AI context.
8. **Validation rules**: Max token length for LLM context.
9. **AI interactions**: RAG (Retrieval-Augmented Generation) source material.
10. **Events/actions**: Chunk, Embed.
11. **Scalability concerns**: Massive row count (millions of chunks for large libraries). Requires Vector Database.
12. **Recommended database structure**: Relational (PostgreSQL) for text + Vector DB (pgvector or Pinecone) for embeddings.
13. **Recommended API structure**: Not exposed directly to frontend. Internal AI service usage.
14. **Frontend usage**: Highlighting search results within a document.
15. **Backend usage**: AI context retrieval.
16. **Potential future extensions**: Cross-resource semantic linking.

---

## 9. AISummary
1. **Purpose**: AI-generated summary of a Resource or CourseTopic.
2. **Responsibilities**: Providing quick overviews and key takeaways.
3. **Ownership**: Resource or CourseTopic.
4. **Relationships**: Belongs to Resource/Topic.
5. **Lifecycle**: Generated after resource processing.
6. **States**: Generating, Ready, Outdated.
7. **Permissions**: Inherited from parent Resource.
8. **Validation rules**: Minimum source content required.
9. **AI interactions**: Generated via LLM (e.g., Gemini).
10. **Events/actions**: Generate, Regenerate, Edit.
11. **Scalability concerns**: LLM cost and latency.
12. **Recommended database structure**: Table `ai_summaries` (parent_id, content, model_version).
13. **Recommended API structure**: `/api/resources/{id}/summary/`.
14. **Frontend usage**: Summary tab on resource page.
15. **Backend usage**: Quick content preview.
16. **Potential future extensions**: Multi-level summaries (executive, detailed, bullet points).

---

## 10. FlashcardDeck
1. **Purpose**: Collection of study cards for spaced repetition.
2. **Responsibilities**: Organizing study materials for active recall.
3. **Ownership**: User or Course.
4. **Relationships**: Contains Flashcards; linked to StudySession.
5. **Lifecycle**: Created -> Used -> Updated.
6. **States**: Public, Private, Shared.
7. **Permissions**: Owner/Course members.
8. **Validation rules**: Deck name required.
9. **AI interactions**: Auto-generation of cards from Resources.
10. **Events/actions**: Create, Study, Share.
11. **Scalability concerns**: High study activity tracking.
12. **Recommended database structure**: Table `flashcard_decks` and `flashcards` (front, back).
13. **Recommended API structure**: `/api/flashcards/decks/{id}/`.
14. **Frontend usage**: Flashcard study interface (Swipe UI).
15. **Backend usage**: Spaced repetition algorithm (Anki/SuperMemo).
16. **Potential future extensions**: Image/Audio cards, collaborative decks.

---

## 11. Quiz
1. **Purpose**: Assessment tool for testing knowledge.
2. **Responsibilities**: Evaluating user understanding of a Topic.
3. **Ownership**: CourseTopic or User (generated).
4. **Relationships**: Belongs to Topic; has many Questions; linked to LearningProgress.
5. **Lifecycle**: Draft -> Published -> Attempted.
6. **States**: Active, Draft, Archived.
7. **Permissions**: Instructors edit; Students attempt.
8. **Validation rules**: Must have at least one question and answer.
9. **AI interactions**: AI-generated quiz questions based on Resource content.
10. **Events/actions**: Create, StartAttempt, SubmitQuiz.
11. **Scalability concerns**: Real-time evaluation and grading for many users.
12. **Recommended database structure**: Table `quizzes`, `questions`, `options`, `attempts`.
13. **Recommended API structure**: `/api/quizzes/{id}/attempt/`.
14. **Frontend usage**: Quiz taking UI, results dashboard.
15. **Backend usage**: Scoring logic and feedback generation.
16. **Potential future extensions**: Adaptive testing, proctoring integration.

---

## 12. PastQuestion
1. **Purpose**: Individual question from previous exams.
2. **Responsibilities**: Repository for historical exam data.
3. **Ownership**: Institution/Course.
4. **Relationships**: Belongs to PastQuestionSet.
5. **Lifecycle**: Digitized -> Validated -> Live.
6. **States**: Verified, Unverified.
7. **Permissions**: Access based on subscription/enrollment.
8. **Validation rules**: Year, subject, and institution required.
9. **AI interactions**: AI-generated explanations and similar question mapping.
10. **Events/actions**: Add, Flag, Solve.
11. **Scalability concerns**: Huge volume of unstructured data (needs good indexing).
12. **Recommended database structure**: Table `past_questions` (text, image_url, year, course_code).
13. **Recommended API structure**: `/api/past-questions/search/`.
14. **Frontend usage**: Exam prep search and practice mode.
15. **Backend usage**: Search and classification.
16. **Potential future extensions**: Crowdsourced solutions.

---

## 13. PastQuestionSet
1. **Purpose**: Grouping of PastQuestions (e.g., "UNILAG 2022 CS Exam").
2. **Responsibilities**: Simulating real exam environments.
3. **Ownership**: Institution/Course.
4. **Relationships**: Contains many PastQuestions.
5. **Lifecycle**: Published periodically.
6. **States**: Complete, Incomplete.
7. **Permissions**: Enrollment-based.
8. **Validation rules**: Must specify year and course.
9. **AI interactions**: Performance prediction based on set attempts.
10. **Events/actions**: PracticeSet, ViewSolution.
11. **Scalability concerns**: High concurrent access during exam seasons.
12. **Recommended database structure**: Table `past_question_sets` (year, institution_id, course_id).
13. **Recommended API structure**: `/api/past-question-sets/{id}/`.
14. **Frontend usage**: Past question library.
15. **Backend usage**: Exam simulation logic.
16. **Potential future extensions**: Timing and leaderboard for practice sets.

---

## 14. TutorialRoom
1. **Purpose**: Virtual or physical space for collaborative study.
2. **Responsibilities**: Managing scheduling and capacity for tutoring.
3. **Ownership**: Institution.
4. **Relationships**: Has many TutorialBookings.
5. **Lifecycle**: Configured -> Scheduled -> Active.
6. **States**: Available, Booked, Out of Service.
7. **Permissions**: Registered students/tutors.
8. **Validation rules**: Capacity limits, operating hours.
9. **AI interactions**: Room occupancy prediction and schedule optimization.
10. **Events/actions**: Book, CheckIn, Cancel.
11. **Scalability concerns**: Double-booking prevention (locking).
12. **Recommended database structure**: Table `tutorial_rooms` (name, capacity, institution_id).
13. **Recommended API structure**: `/api/rooms/availability/`.
14. **Frontend usage**: Room booking calendar.
15. **Backend usage**: Scheduling logic.
16. **Potential future extensions**: Integrated video conferencing for virtual rooms.

---

## 15. TutorialBooking
1. **Purpose**: A reserved session in a TutorialRoom.
2. **Responsibilities**: Tracking who is using which room and when.
3. **Ownership**: User (Student/Tutor).
4. **Relationships**: Belongs to TutorialRoom and User.
5. **Lifecycle**: Requested -> Confirmed -> InProgress -> Completed.
6. **States**: Pending, Confirmed, Cancelled, Completed.
7. **Permissions**: User modifies own; Admin modifies all.
8. **Validation rules**: No overlapping bookings for the same room.
9. **AI interactions**: Automated reminders and rescheduling suggestions.
10. **Events/actions**: Request, Confirm, Cancel, NoShow.
11. **Scalability concerns**: Real-time availability updates.
12. **Recommended database structure**: Table `tutorial_bookings` (room_id, user_id, start_time, end_time).
13. **Recommended API structure**: `/api/bookings/`.
14. **Frontend usage**: "My Bookings" list.
15. **Backend usage**: Calendar and notification management.
16. **Potential future extensions**: Payment integration for private tutors.

---

## 16. MarketplaceResource
1. **Purpose**: Premium study materials for sale or exchange.
2. **Responsibilities**: Managing transactions and digital rights for shared content.
3. **Ownership**: User (Seller).
4. **Relationships**: Links to Resource; belongs to Marketplace.
5. **Lifecycle**: Listed -> Purchased -> Delivered.
6. **States**: Active, Sold, Hidden, Under Review.
7. **Permissions**: Anyone can view; only owner can edit.
8. **Validation rules**: Valid price, original content.
9. **AI interactions**: Automated pricing suggestions and quality assessment.
10. **Events/actions**: List, Buy, Review, Report.
11. **Scalability concerns**: Transaction integrity and secure payment.
12. **Recommended database structure**: Table `marketplace_resources` (resource_id, price, seller_id).
13. **Recommended API structure**: `/api/marketplace/items/`.
14. **Frontend usage**: Storefront and listing UI.
15. **Backend usage**: E-commerce and wallet logic.
16. **Potential future extensions**: Bidding system, subscription bundles.

---

## 17. AIConversation
1. **Purpose**: Chat session between a User and the AI Tutor.
2. **Responsibilities**: Maintaining state for ongoing AI interactions.
3. **Ownership**: User.
4. **Relationships**: Contains many AIMessages; linked to a Course or Resource (context).
5. **Lifecycle**: Started -> Active -> Archived.
6. **States**: Active, Archived.
7. **Permissions**: User-only access.
8. **Validation rules**: Must be associated with a user.
9. **AI interactions**: The core entity for conversational AI.
10. **Events/actions**: Create, Clear, SummarizeSession.
11. **Scalability concerns**: Long chat histories (token limits and storage).
12. **Recommended database structure**: Table `ai_conversations` (user_id, context_id, title).
13. **Recommended API structure**: `/api/ai/chats/`.
14. **Frontend usage**: Chat sidebar and history.
15. **Backend usage**: Session management for LLM context.
16. **Potential future extensions**: Voice-based chat, multi-user conversations.

---

## 18. AIMessage
1. **Purpose**: Individual entry in an AIConversation.
2. **Responsibilities**: Storing the text of user prompts and AI responses.
3. **Ownership**: AIConversation.
4. **Relationships**: Belongs to AIConversation.
5. **Lifecycle**: Created when user sends or AI responds.
6. **States**: Sending, Sent, Error.
7. **Permissions**: Inherited from Conversation.
8. **Validation rules**: Text cannot be empty.
9. **AI interactions**: Individual prompts and completions.
10. **Events/actions**: Send, Delete, Retry.
11. **Scalability concerns**: High volume of message logs.
12. **Recommended database structure**: Table `ai_messages` (convo_id, role, content, timestamp).
13. **Recommended API structure**: `/api/ai/chats/{id}/messages/`.
14. **Frontend usage**: Chat bubbles.
15. **Backend usage**: Context window assembly for LLM.
16. **Potential future extensions**: Rich media messages (LaTeX, Code, Images).

---

## 19. LearningProgress
1. **Purpose**: Tracking a user's mastery of Courses and Topics.
2. **Responsibilities**: Calculating completion percentages and mastery scores.
3. **Ownership**: User.
4. **Relationships**: Links User to Course/Topic/Resource.
5. **Lifecycle**: Starts at 0 -> Updates on activity -> Completed.
6. **States**: Not Started, In Progress, Mastered.
7. **Permissions**: User views own; Instructor views class progress.
8. **Validation rules**: Progress values between 0-100.
9. **AI interactions**: Learning gap analysis and remedial path generation.
10. **Events/actions**: UpdateProgress, MarkComplete.
11. **Scalability concerns**: High frequency of updates during study sessions.
12. **Recommended database structure**: Table `learning_progress` (user_id, entity_id, entity_type, percentage, mastery_score).
13. **Recommended API structure**: `/api/progress/`.
14. **Frontend usage**: Progress bars and badges.
15. **Backend usage**: Gamification and recommendation triggers.
16. **Potential future extensions**: Skill trees and competency mapping.

---

## 20. StudySession
1. **Purpose**: A timed block of study activity (e.g., Pomodoro).
2. **Responsibilities**: Monitoring active learning time and focus.
3. **Ownership**: User.
4. **Relationships**: Linked to Course/Topic/Resource.
5. **Lifecycle**: Started -> Active -> Paused -> Ended.
6. **States**: Active, Paused, Completed.
7. **Permissions**: User views own.
8. **Validation rules**: Start time must be before end time.
9. **AI interactions**: Productivity analysis and break suggestions.
10. **Events/actions**: Start, Pause, Stop, AddNote.
11. **Scalability concerns**: Heartbeat tracking for session persistence.
12. **Recommended database structure**: Table `study_sessions` (user_id, duration, resource_id).
13. **Recommended API structure**: `/api/sessions/`.
14. **Frontend usage**: Study timer and session summary.
15. **Backend usage**: Analytics and time-spent tracking.
16. **Potential future extensions**: Focused-mode (blocking other apps/sites).

---

## 21. Recommendation
1. **Purpose**: AI-suggested content or actions for a user.
2. **Responsibilities**: Personalizing the learning experience.
3. **Ownership**: User.
4. **Relationships**: Suggests Resources/Courses/Topics.
5. **Lifecycle**: Calculated -> Displayed -> Dismissed/Accepted.
6. **States**: New, Seen, Accepted, Dismissed.
7. **Permissions**: System-generated.
8. **Validation rules**: Must be relevant to user's current progress.
9. **AI interactions**: Recommendation engine (Collaborative filtering/Semantic).
10. **Events/actions**: Show, Click, Feedback.
11. **Scalability concerns**: Real-time computation for dynamic feeds.
12. **Recommended database structure**: Table `recommendations` (user_id, suggested_entity_id, reason_code, weight).
13. **Recommended API structure**: `/api/recommendations/`.
14. **Frontend usage**: "Recommended for You" carousel.
15. **Backend usage**: Content discovery algorithm.
16. **Potential future extensions**: Time-aware recommendations (e.g., "Review this before tomorrow's quiz").

---

## 22. ActivityLog
1. **Purpose**: Immutable audit trail of system actions.
2. **Responsibilities**: Compliance, troubleshooting, and audit.
3. **Ownership**: System.
4. **Relationships**: Linked to User and Resource.
5. **Lifecycle**: Created at event time; persistent/archived after long periods.
6. **States**: Logged.
7. **Permissions**: Admin-only access.
8. **Validation rules**: Must include user, timestamp, and action.
9. **AI interactions**: Anomaly detection for security monitoring.
10. **Events/actions**: SystemWide.
11. **Scalability concerns**: Massive write volume (needs high-performance logging or DB).
12. **Recommended database structure**: Time-series DB or specialized logging service.
13. **Recommended API structure**: `/api/admin/logs/`.
14. **Frontend usage**: Admin audit dashboard.
15. **Backend usage**: Security and debug monitoring.
16. **Potential future extensions**: Behavioral analytics.

---

## 23. UploadTask
1. **Purpose**: Asynchronous task for handling large file uploads.
2. **Responsibilities**: Managing file chunking, integrity, and storage.
3. **Ownership**: User.
4. **Relationships**: Linked to a Resource.
5. **Lifecycle**: Initiated -> Uploading -> Verifying -> Completed.
6. **States**: Pending, Progressing, Completed, Failed.
7. **Permissions**: User who initiated the upload.
8. **Validation rules**: Checksums, file size, quota.
9. **AI interactions**: Triggers subsequent AI tasks (OCR, etc.).
10. **Events/actions**: Start, ProgressUpdate, Cancel.
11. **Scalability concerns**: Concurrent high-bandwidth uploads.
12. **Recommended database structure**: Table `upload_tasks` (user_id, file_id, progress).
13. **Recommended API structure**: `/api/upload/status/{id}/`.
14. **Frontend usage**: Upload progress bars.
15. **Backend usage**: Celery/Redis task management.
16. **Potential future extensions**: Resumable uploads (TUS protocol).

---

## 24. OCRTask
1. **Purpose**: Asynchronous task to extract text from images/PDFs.
2. **Responsibilities**: Converting non-searchable content into raw text.
3. **Ownership**: System (triggered by Resource upload).
4. **Relationships**: Linked to Resource.
5. **Lifecycle**: Queued -> Processing -> Success/Failure.
6. **States**: Queued, Processing, Success, Failure.
7. **Permissions**: Internal system.
8. **Validation rules**: Image clarity, supported language.
9. **AI interactions**: Visual model for text recognition.
10. **Events/actions**: Queue, Execute, Callback.
11. **Scalability concerns**: GPU/CPU intensive.
12. **Recommended database structure**: Table `ocr_tasks` (resource_id, result_text, confidence).
13. **Recommended API structure**: Internal.
14. **Frontend usage**: "Transcribing document..." status.
15. **Backend usage**: Background worker.
16. **Potential future extensions**: Handwritten note recognition.

---

## 25. EmbeddingTask
1. **Purpose**: Asynchronous task to generate vector embeddings for text chunks.
2. **Responsibilities**: Transforming text into mathematical vectors for AI search.
3. **Ownership**: System.
4. **Relationships**: Linked to ResourceChunk.
5. **Lifecycle**: Triggered after OCR -> Generating -> Vector DB Insert.
6. **States**: Queued, Embedding, Indexed.
7. **Permissions**: Internal system.
8. **Validation rules**: Text chunk size within model limits.
9. **AI interactions**: Integration with embedding models (OpenAI/Gemini/HuggingFace).
10. **Events/actions**: Generate, BatchInsert.
11. **Scalability concerns**: High cost per token; batching required.
12. **Recommended database structure**: Task log + Vector Database.
13. **Recommended API structure**: Internal.
14. **Frontend usage**: None directly.
15. **Backend usage**: Populating RAG knowledge base.
16. **Potential future extensions**: Cross-lingual embeddings.

---

## 26. ClassificationTask
1. **Purpose**: Asynchronous task to categorize Resources (e.g., "Math", "Handout").
2. **Responsibilities**: Automatic tagging and organizational metadata generation.
3. **Ownership**: System.
4. **Relationships**: Linked to Resource.
5. **Lifecycle**: Triggered after OCR/Chunking -> Analyzed -> Tagged.
6. **States**: Queued, Classifying, Completed.
7. **Permissions**: Internal system.
8. **Validation rules**: Minimum text for accurate classification.
9. **AI interactions**: Zero-shot or few-shot classification using LLMs.
10. **Events/actions**: TagResource, UpdateMetadata.
11. **Scalability concerns**: API rate limits for classification models.
12. **Recommended database structure**: Table `classification_tasks` (resource_id, predicted_labels, confidence).
13. **Recommended API structure**: Internal.
14. **Frontend usage**: Automated course structure suggestions.
15. **Backend usage**: Content organization.
16. **Potential future extensions**: Sentiment and complexity analysis.
