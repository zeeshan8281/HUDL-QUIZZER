-- Create leaderboard table
CREATE TABLE IF NOT EXISTS quiz_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  wallet_address TEXT,
  score INTEGER NOT NULL,
  total_points INTEGER NOT NULL,
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (ROUND((score::DECIMAL / total_points::DECIMAL) * 100, 2)) STORED,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, user_id) -- One entry per user per quiz (best score)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_quiz ON quiz_leaderboard(quiz_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON quiz_leaderboard(quiz_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_percentage ON quiz_leaderboard(quiz_id, percentage DESC);

-- Function to update leaderboard when quiz is completed
CREATE OR REPLACE FUNCTION update_quiz_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update leaderboard entry
  INSERT INTO quiz_leaderboard (
    quiz_id, 
    user_id, 
    user_name, 
    wallet_address, 
    score, 
    total_points, 
    completed_at
  )
  SELECT 
    NEW.quiz_id,
    NEW.user_id,
    COALESCE(u.full_name, u.email, SUBSTRING(u.wallet_address, 1, 8) || '...') as user_name,
    u.wallet_address,
    NEW.score,
    NEW.total_points,
    NEW.completed_at
  FROM users u 
  WHERE u.id = NEW.user_id
  ON CONFLICT (quiz_id, user_id) 
  DO UPDATE SET
    score = GREATEST(quiz_leaderboard.score, NEW.score), -- Keep the best score
    total_points = NEW.total_points,
    completed_at = CASE 
      WHEN NEW.score > quiz_leaderboard.score THEN NEW.completed_at 
      ELSE quiz_leaderboard.completed_at 
    END,
    user_name = COALESCE(
      (SELECT COALESCE(u2.full_name, u2.email, SUBSTRING(u2.wallet_address, 1, 8) || '...') 
       FROM users u2 WHERE u2.id = NEW.user_id),
      quiz_leaderboard.user_name
    ),
    wallet_address = (SELECT u3.wallet_address FROM users u3 WHERE u3.id = NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update leaderboard
DROP TRIGGER IF EXISTS trigger_update_leaderboard ON quiz_attempts;
CREATE TRIGGER trigger_update_leaderboard
  AFTER INSERT OR UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_leaderboard();

-- Populate existing data into leaderboard
INSERT INTO quiz_leaderboard (quiz_id, user_id, user_name, wallet_address, score, total_points, completed_at)
SELECT DISTINCT ON (qa.quiz_id, qa.user_id)
  qa.quiz_id,
  qa.user_id,
  COALESCE(u.full_name, u.email, SUBSTRING(u.wallet_address, 1, 8) || '...') as user_name,
  u.wallet_address,
  qa.score,
  qa.total_points,
  qa.completed_at
FROM quiz_attempts qa
JOIN users u ON u.id = qa.user_id
ORDER BY qa.quiz_id, qa.user_id, qa.score DESC
ON CONFLICT (quiz_id, user_id) DO NOTHING;
