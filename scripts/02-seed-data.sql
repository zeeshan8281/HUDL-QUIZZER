-- Insert admin user (you'll need to sign up first, then update this)
-- Replace 'your-user-id' with actual user ID after signing up
-- INSERT INTO profiles (id, email, full_name, is_admin) 
-- VALUES ('your-user-id', 'admin@example.com', 'Admin User', true);

-- Sample quiz data
INSERT INTO quizzes (id, title, description, is_active, created_by) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'General Knowledge Quiz', 'Test your general knowledge!', false, null);

-- Sample questions
INSERT INTO questions (quiz_id, question_text, options, correct_answer, points) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'What is the capital of France?', 
 '["Paris", "London", "Berlin", "Madrid"]', 0, 1),
('550e8400-e29b-41d4-a716-446655440000', 'Which planet is known as the Red Planet?', 
 '["Venus", "Mars", "Jupiter", "Saturn"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440000', 'What is 2 + 2?', 
 '["3", "4", "5", "6"]', 1, 1);
