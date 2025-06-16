-- Insert admin user with your email
INSERT INTO users (email, full_name, is_admin, auth_provider) VALUES 
('zeeshan@huddle01.com', 'Zeeshan Admin', true, 'email');

-- Sample quiz data
INSERT INTO quizzes (id, title, description, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Sports Knowledge Quiz', 'Test your sports knowledge!', false);

-- Sample questions
INSERT INTO questions (quiz_id, question_text, options, correct_answer, points) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Which sport is known as "The Beautiful Game"?', 
 '["Basketball", "Soccer/Football", "Tennis", "Baseball"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440000', 'How many players are on a basketball team on the court at one time?', 
 '["4", "5", "6", "7"]', 1, 1),
('550e8400-e29b-41d4-a716-446655440000', 'What does NFL stand for?', 
 '["National Football League", "North Football League", "New Football League", "National Field League"]', 0, 1);
