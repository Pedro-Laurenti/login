## USUÁRIOS

```sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('student', 'mentor') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE PwdResetTokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    hash_url VARCHAR(255) NOT NULL, --hash-segredo para página enviável de "(re)defina sua senha"
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

## CURSOS

```sql
-- Tabela de Cursos
CREATE TABLE Courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL, -- Nome do curso
    description TEXT, -- Descrição do curso
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    course_id INT NOT NULL, -- Relaciona a turma a um curso
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
);

CREATE TABLE ClassUsers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

## AULAS

```sql
-- Tabela de Aulas
CREATE TABLE Lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    lesson_description TEXT, -- Descrição da aula em richtext
    course_id INT NOT NULL, -- Relaciona a aula a um curso
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
);

-- Tabela de Conteúdos das Aulas
CREATE TABLE LessonContents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    content_type ENUM('video', 'text', 'activity', 'reunion') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES Lessons(id) ON DELETE CASCADE
);
```

### TEXTOS

```sql
CREATE TABLE LessonText (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    text_title TEXT, -- Titulo do texto (caso tipo='text')
    text_content TEXT, -- richtext do texto (caso tipo='text')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);

```

### VIDEOS

```sql
CREATE TABLE LessonVideo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    video_title TEXT, -- Titulo do vídeo (caso tipo='video')
    video_url VARCHAR(255), -- URL do vídeo (caso tipo='video')
    video_content TEXT, -- richtext do vídeo (caso tipo='video')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);

```

### REUNIÕES

```sql
CREATE TABLE LessonReunions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    reunion_title TEXT, -- Titulo da reunião  (caso tipo='reunion')
    reunion_url VARCHAR(255), -- URL da reunião (caso tipo='reunion')
    reunion_description TEXT, -- Descrição richtext da reunião (caso tipo='reunion')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);

CREATE TABLE ReunionSchedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reunion_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reunion_id) REFERENCES LessonReunions(id) ON DELETE CASCADE
);
```

### ATIVIDADES

```sql

-- Tabela de Enunciados (ligados ao conteúdo do tipo 'activity')
CREATE TABLE ActivityStatements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    statement_text TEXT NOT NULL, -- Texto do enunciado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);

-- Tabela de Alternativas (ligadas aos enunciados)
CREATE TABLE ActivityOptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    statement_id INT NOT NULL,
    option_text TEXT NOT NULL, -- Texto da alternativa
    is_correct BOOLEAN NOT NULL DEFAULT FALSE, -- Indica se a alternativa é correta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (statement_id) REFERENCES ActivityStatements(id) ON DELETE CASCADE
);

-- Tabela de Respostas dos Alunos (ligadas às alternativas)
CREATE TABLE StudentAnswers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    option_id INT NOT NULL, -- Alternativa escolhida pelo aluno
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES ActivityOptions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

```