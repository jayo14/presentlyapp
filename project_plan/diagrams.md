# SummaStudy Architecture Diagrams

This document contains visual representations of the SummaStudy architecture using Mermaid.

## 1. Full ERD
```mermaid
erDiagram
    INSTITUTION ||--o{ DEPARTMENT : contains
    INSTITUTION ||--o{ USER : has
    DEPARTMENT ||--o{ COURSE : offers
    COURSE ||--o{ COURSE_TOPIC : has
    COURSE_TOPIC ||--o{ RESOURCE : includes
    RESOURCE ||--o{ RESOURCE_CHUNK : fragmented_into
    RESOURCE ||--o{ AI_SUMMARY : summarized_by
    COURSE ||--o{ COURSE_ENROLLMENT : has
    USER ||--o{ COURSE_ENROLLMENT : enrolls_in
    COURSE_TOPIC ||--o{ QUIZ : assesses
    QUIZ ||--o{ QUESTION : contains
    COURSE ||--o{ FLASHCARD_DECK : has
    USER ||--o{ FLASHCARD_DECK : owns
    INSTITUTION ||--o{ TUTORIAL_ROOM : provides
    TUTORIAL_ROOM ||--o{ TUTORIAL_BOOKING : schedules
    USER ||--o{ TUTORIAL_BOOKING : books
    RESOURCE ||--o{ MARKETPLACE_RESOURCE : listed_as
    USER ||--o{ MARKETPLACE_RESOURCE : sells
    USER ||--o{ AI_CONVERSATION : conducts
    AI_CONVERSATION ||--o{ AI_MESSAGE : contains
    USER ||--o{ LEARNING_PROGRESS : tracks
    USER ||--o{ STUDY_SESSION : performs
    USER ||--o{ RECOMMENDATION : receives
    USER ||--o{ ACTIVITY_LOG : generates
    RESOURCE ||--o{ UPLOAD_TASK : tracked_by
    RESOURCE ||--o{ OCR_TASK : processed_by
    RESOURCE ||--o{ EMBEDDING_TASK : indexed_by
    RESOURCE ||--o{ CLASSIFICATION_TASK : categorized_by

    USER {
        uuid id
        string email
        string role
    }
    COURSE {
        uuid id
        string code
        string title
    }
    RESOURCE {
        uuid id
        string title
        string type
        string file_path
    }
    RESOURCE_CHUNK {
        uuid id
        text content
        vector embedding
    }
```

## 2. Domain Map
```mermaid
graph TD
    subgraph Core_Academic
        Institution --> Department
        Department --> Course
        Course --> CourseTopic
        CourseTopic --> Resource
    end

    subgraph User_Learning
        User --> CourseEnrollment
        CourseEnrollment --> LearningProgress
        User --> StudySession
        User --> FlashcardDeck
        User --> AIConversation
    end

    subgraph AI_Intelligence
        Resource --> OCR_Task
        OCR_Task --> ResourceChunk
        ResourceChunk --> Embedding_Task
        Embedding_Task --> AISummary
        Embedding_Task --> Recommendation
    end

    subgraph Infrastructure
        Admin --> Institution
        Institution --> TutorialRoom
        User --> ActivityLog
    end
```

## 3. Entity Lifecycles (Example: Resource)
```mermaid
stateDiagram-v2
    [*] --> Uploading
    Uploading --> Processing: Upload Success
    Processing --> OCR_Running: Trigger OCR
    OCR_Running --> Chunking: Text Extracted
    Chunking --> Embedding: Segments Created
    Embedding --> Ready: Vectors Indexed
    Ready --> Archived: Manual Action
    Processing --> Error: Failure
    Error --> [*]
```

## 4. Ownership Map
```mermaid
mindmap
  root((SummaStudy Ownership))
    System
      Admin
      ActivityLog
      Institution
    Institution
      Department
      TutorialRoom
      Course
    Course
      CourseTopic
      Quiz
      Resource
    User
      CourseEnrollment
      FlashcardDeck
      AIConversation
      TutorialBooking
      StudySession
      MarketplaceResource
```

## 5. Modular Architecture Map
```mermaid
graph LR
    subgraph Frontend
        WebApp
        MobileApp
    end

    subgraph API_Gateway
        AuthService
        Routing
    end

    subgraph Microservices_Domains
        AcademicSvc[Academic Domain]
        LearningSvc[Learning Domain]
        AISvc[AI Engine]
        SchedulerSvc[Scheduling Domain]
    end

    subgraph Data_Storage
        Postgres[(Relational DB)]
        VectorDB[(Vector Store)]
        Redis[(Cache/Queue)]
        S3[(Object Storage)]
    end

    WebApp --> API_Gateway
    MobileApp --> API_Gateway
    API_Gateway --> AcademicSvc
    API_Gateway --> LearningSvc
    AcademicSvc --> Postgres
    AISvc --> VectorDB
    AISvc --> S3
```

## 6. Data Flow Architecture (RAG)
```mermaid
sequenceDiagram
    participant User
    participant App
    participant AIService
    participant VectorDB
    participant LLM

    User->>App: Asks Question about Course
    App->>AIService: Request Contextual Answer
    AIService->>VectorDB: Query relevant chunks (Similarity Search)
    VectorDB-->>AIService: Return Text Segments
    AIService->>LLM: Prompt + Context Chunks + User Question
    LLM-->>AIService: Generate Answer
    AIService-->>App: Return Answer
    App-->>User: Display AI Response
```

## 7. AI Integration Architecture
```mermaid
graph TD
    RawFile[Raw Resource File] --> OCR[OCR Engine]
    OCR --> TextChunks[Text Chunks]
    TextChunks --> Embedder[Embedding Model]
    Embedder --> VectorIndex[Vector Database]

    UserQuery[User Query] --> EmbedderQuery[Embedding Model]
    EmbedderQuery --> Search[Similarity Search]
    VectorIndex --> Search
    Search --> Context[Retrieved Context]
    Context --> LLM[Large Language Model]
    LLM --> Response[User Response]

    TextChunks --> Summarizer[Summarization Model]
    Summarizer --> Summary[AI Summary]

    TextChunks --> Generator[Question/Flashcard Generator]
    Generator --> Quiz[Quiz/Flashcards]
```

## 8. Permission Matrix (Overview)
```mermaid
graph LR
    Admin -->|Full Access| Institution
    Lecturer -->|Manage| Course
    Lecturer -->|Create| Resource
    Student -->|View/Study| Course
    Student -->|Book| TutorialRoom
    Guest -->|View| Marketplace
```
