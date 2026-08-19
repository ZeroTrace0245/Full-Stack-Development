-- ProBoard Database Schema for SQL Server
-- Run this script after creating the database

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE Users (
	id INT PRIMARY KEY IDENTITY(1,1),
	username NVARCHAR(255) NOT NULL UNIQUE,
	email NVARCHAR(255) NOT NULL UNIQUE,
	password_hash NVARCHAR(255) NOT NULL,
	role NVARCHAR(50) DEFAULT 'Standard User',
	is_active BIT DEFAULT 1,
	created_at DATETIME DEFAULT GETDATE(),
	updated_at DATETIME DEFAULT GETDATE(),
	last_login DATETIME NULL
);

CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_users_email ON Users(email);

-- ============================================
-- BOARDS/PROJECTS TABLE
-- ============================================
CREATE TABLE Boards (
	id INT PRIMARY KEY IDENTITY(1,1),
	title NVARCHAR(255) NOT NULL,
	description NVARCHAR(1000),
	created_by INT NOT NULL,
	is_active BIT DEFAULT 1,
	created_at DATETIME DEFAULT GETDATE(),
	updated_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE INDEX idx_boards_created_by ON Boards(created_by);

-- ============================================
-- COLUMNS TABLE
-- ============================================
CREATE TABLE Columns (
	id INT PRIMARY KEY IDENTITY(1,1),
	board_id INT NOT NULL,
	title NVARCHAR(255) NOT NULL,
	column_order INT DEFAULT 0,
	created_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (board_id) REFERENCES Boards(id) ON DELETE CASCADE
);

CREATE INDEX idx_columns_board_id ON Columns(board_id);

-- ============================================
-- TASKS/CARDS TABLE
-- ============================================
CREATE TABLE Tasks (
	id INT PRIMARY KEY IDENTITY(1,1),
	board_id INT NOT NULL,
	column_id INT NOT NULL,
	task_order INT DEFAULT 0,
	title NVARCHAR(255) NOT NULL,
	description NVARCHAR(1000),
	assignee_id INT,
	priority NVARCHAR(50) DEFAULT 'Medium', -- High, Medium, Low
	type NVARCHAR(50) DEFAULT 'Feature', -- Feature, Bug, UI
	due_date DATE,
	estimate INT, -- hours
	created_by INT NOT NULL,
	created_at DATETIME DEFAULT GETDATE(),
	updated_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (board_id) REFERENCES Boards(id) ON DELETE CASCADE,
	FOREIGN KEY (column_id) REFERENCES Columns(id),
	FOREIGN KEY (assignee_id) REFERENCES Users(id),
	FOREIGN KEY (created_by) REFERENCES Users(id)
);

CREATE INDEX idx_tasks_board_id ON Tasks(board_id);
CREATE INDEX idx_tasks_column_id ON Tasks(column_id);
CREATE INDEX idx_tasks_assignee_id ON Tasks(assignee_id);
CREATE INDEX idx_tasks_created_by ON Tasks(created_by);

-- ============================================
-- MESSAGES (TEAM CHAT) TABLE
-- ============================================
CREATE TABLE Messages (
	id INT PRIMARY KEY IDENTITY(1,1),
	sender_id INT NOT NULL,
	project_id INT NOT NULL,
	content NVARCHAR(MAX) NOT NULL,
	is_edited BIT DEFAULT 0,
	edited_at DATETIME NULL,
	created_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (sender_id) REFERENCES Users(id),
	FOREIGN KEY (project_id) REFERENCES Boards(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_project_id ON Messages(project_id);
CREATE INDEX idx_messages_sender_id ON Messages(sender_id);
CREATE INDEX idx_messages_created_at ON Messages(created_at);

-- ============================================
-- DIRECT MESSAGES TABLE
-- ============================================
CREATE TABLE DirectMessages (
	id INT PRIMARY KEY IDENTITY(1,1),
	sender_id INT NOT NULL,
	receiver_id INT NOT NULL,
	content NVARCHAR(MAX) NOT NULL,
	is_read BIT DEFAULT 0,
	is_edited BIT DEFAULT 0,
	edited_at DATETIME NULL,
	created_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (sender_id) REFERENCES Users(id),
	FOREIGN KEY (receiver_id) REFERENCES Users(id)
);

CREATE INDEX idx_direct_messages_sender_id ON DirectMessages(sender_id);
CREATE INDEX idx_direct_messages_receiver_id ON DirectMessages(receiver_id);
CREATE INDEX idx_direct_messages_created_at ON DirectMessages(created_at);

-- ============================================
-- ACTIVITIES TABLE
-- ============================================
CREATE TABLE Activities (
	id INT PRIMARY KEY IDENTITY(1,1),
	user_id INT NOT NULL,
	board_id INT NOT NULL,
	action NVARCHAR(255) NOT NULL, -- 'create', 'update', 'move', 'delete'
	task_id INT,
	details NVARCHAR(1000),
	timestamp DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (user_id) REFERENCES Users(id),
	FOREIGN KEY (board_id) REFERENCES Boards(id) ON DELETE CASCADE,
	FOREIGN KEY (task_id) REFERENCES Tasks(id)
);

CREATE INDEX idx_activities_board_id ON Activities(board_id);
CREATE INDEX idx_activities_user_id ON Activities(user_id);
CREATE INDEX idx_activities_timestamp ON Activities(timestamp);

-- ============================================
-- BOARD MEMBERS TABLE (for future use)
-- ============================================
CREATE TABLE BoardMembers (
	id INT PRIMARY KEY IDENTITY(1,1),
	board_id INT NOT NULL,
	user_id INT NOT NULL,
	role NVARCHAR(50) DEFAULT 'Viewer', -- Owner, Editor, Viewer
	joined_at DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (board_id) REFERENCES Boards(id) ON DELETE CASCADE,
	FOREIGN KEY (user_id) REFERENCES Users(id),
	UNIQUE(board_id, user_id)
);

CREATE INDEX idx_board_members_board_id ON BoardMembers(board_id);
CREATE INDEX idx_board_members_user_id ON BoardMembers(user_id);

-- ============================================
-- SAMPLE DATA
-- ============================================
-- Insert sample users
INSERT INTO Users (username, email, password_hash, role)
VALUES 
('admin', 'admin@proboard.com', '$2a$10$YJZjSRAbFgGF/bE9AZt1CuQ8RiLyJNqJkWNQ8RiLyJNqJkWNQ8RiLy', 'Admin'),
('john_doe', 'john@proboard.com', '$2a$10$YJZjSRAbFgGF/bE9AZt1CuQ8RiLyJNqJkWNQ8RiLyJNqJkWNQ8RiLy', 'Standard User'),
('jane_smith', 'jane@proboard.com', '$2a$10$YJZjSRAbFgGF/bE9AZt1CuQ8RiLyJNqJkWNQ8RiLyJNqJkWNQ8RiLy', 'Standard User'),
('mike_wilson', 'mike@proboard.com', '$2a$10$YJZjSRAbFgGF/bE9AZt1CuQ8RiLyJNqJkWNQ8RiLyJNqJkWNQ8RiLy', 'Standard User');

-- Insert sample board
INSERT INTO Boards (title, description, created_by)
VALUES ('ProBoard Demo', 'Demonstration project for ProBoard', 1);

-- Insert sample columns
INSERT INTO Columns (board_id, title, column_order)
VALUES 
(1, 'Sprint Backlog', 1),
(1, 'In Development', 2),
(1, 'Deployed to Production', 3);

-- Insert sample tasks
INSERT INTO Tasks (board_id, column_id, title, description, assignee_id, priority, type, estimate, created_by, task_order)
VALUES 
(1, 1, 'Set up React project', 'Initialize React project with Vite', 2, 'High', 'Feature', 2, 1, 1),
(1, 1, 'Design database schema', 'Create SQL Server database design', 3, 'High', 'Feature', 3, 1, 2),
(1, 2, 'Build API endpoints', 'Create Express REST API', 4, 'Medium', 'Feature', 5, 1, 1),
(1, 3, 'Deploy to production', 'Deploy application to production server', 2, 'Low', 'Feature', 2, 1, 1);

-- Insert sample team message
INSERT INTO Messages (sender_id, project_id, content)
VALUES (1, 1, 'Welcome to ProBoard! Let''s build something amazing together! 🚀');

-- Insert sample direct message
INSERT INTO DirectMessages (sender_id, receiver_id, content)
VALUES (2, 3, 'Hey Jane, do you have time to review the database schema?');

-- Print confirmation
PRINT 'Database schema created successfully!';
