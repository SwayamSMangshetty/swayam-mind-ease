/*
  # Add Mock Mood Data for Visualization

  1. Purpose
     - Adds 60+ mock mood entries across different time periods
     - Enables meaningful visualization in mood trend charts
     - Supports both Home page mini-chart and detailed Trends page

  2. Data Distribution
     - Last 7 days: 14 entries (2 per day average)
     - Last 30 days: 28 entries (about 1 per day)
     - Last 90+ days: 25+ additional entries for historical trends

  3. Mood Types
     - Uses only frontend-supported moods: happy, sad, neutral, angry
     - Realistic emotional patterns with natural variations

  4. User Assignment
     - All entries assigned to temporary user: 00000000-0000-0000-0000-000000000000
     - Complies with RLS policies and database constraints
*/

-- Insert mock mood entries for the last 90+ days
INSERT INTO mood_entries (user_id, mood, notes, created_at) VALUES 

-- Last 7 days (more frequent entries for detailed weekly view)
('00000000-0000-0000-0000-000000000000', 'happy', 'Great day with friends!', NOW() - INTERVAL '6 hours'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Regular evening routine', NOW() - INTERVAL '1 day 2 hours'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Feeling stressed about assignments', NOW() - INTERVAL '1 day 8 hours'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Good progress on project', NOW() - INTERVAL '2 days 3 hours'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Quiet study session', NOW() - INTERVAL '2 days 9 hours'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Frustrated with technical issues', NOW() - INTERVAL '3 days 4 hours'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Normal class day', NOW() - INTERVAL '3 days 7 hours'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Weekend relaxation', NOW() - INTERVAL '4 days 1 hour'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Fun social activity', NOW() - INTERVAL '4 days 5 hours'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Missing home', NOW() - INTERVAL '5 days 3 hours'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Regular study routine', NOW() - INTERVAL '5 days 8 hours'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Good exam results', NOW() - INTERVAL '6 days 2 hours'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Planning the week', NOW() - INTERVAL '6 days 6 hours'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Feeling overwhelmed', NOW() - INTERVAL '7 days 1 hour'),

-- Days 8-30 (weekly patterns)
('00000000-0000-0000-0000-000000000000', 'happy', 'Great workout session', NOW() - INTERVAL '8 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Regular classes', NOW() - INTERVAL '9 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Difficult day', NOW() - INTERVAL '10 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Group project conflicts', NOW() - INTERVAL '11 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Nice weather day', NOW() - INTERVAL '12 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Library study time', NOW() - INTERVAL '13 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Weekend fun', NOW() - INTERVAL '14 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Stress about deadlines', NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Regular routine', NOW() - INTERVAL '16 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Successful presentation', NOW() - INTERVAL '17 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Technology problems', NOW() - INTERVAL '18 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Quiet day', NOW() - INTERVAL '19 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Good social time', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Feeling tired', NOW() - INTERVAL '21 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Weekend activities', NOW() - INTERVAL '22 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Study session', NOW() - INTERVAL '23 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Parking issues', NOW() - INTERVAL '24 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Good news from family', NOW() - INTERVAL '25 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Regular classes', NOW() - INTERVAL '26 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Homesick feelings', NOW() - INTERVAL '27 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Achievement unlocked', NOW() - INTERVAL '28 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Planning ahead', NOW() - INTERVAL '29 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Monthly reflection', NOW() - INTERVAL '30 days'),

-- Days 31-60 (monthly patterns)
('00000000-0000-0000-0000-000000000000', 'happy', 'New month energy', NOW() - INTERVAL '35 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Settling into routine', NOW() - INTERVAL '40 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'System maintenance day', NOW() - INTERVAL '42 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Great progress made', NOW() - INTERVAL '45 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Challenging assignment', NOW() - INTERVAL '48 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Mid-term period', NOW() - INTERVAL '50 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Social gathering', NOW() - INTERVAL '52 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Internet outage', NOW() - INTERVAL '55 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Regular study', NOW() - INTERVAL '57 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Weekend trip', NOW() - INTERVAL '60 days'),

-- Days 61-90+ (longer-term patterns for yearly view)
('00000000-0000-0000-0000-000000000000', 'sad', 'Adjustment period', NOW() - INTERVAL '65 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Finding rhythm', NOW() - INTERVAL '70 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Good connections made', NOW() - INTERVAL '72 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Registration issues', NOW() - INTERVAL '75 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Getting organized', NOW() - INTERVAL '78 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Summer memories', NOW() - INTERVAL '80 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Transition stress', NOW() - INTERVAL '82 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Preparing for semester', NOW() - INTERVAL '85 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Excitement for new year', NOW() - INTERVAL '87 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Planning phase', NOW() - INTERVAL '90 days'),

-- Additional historical data for yearly view
('00000000-0000-0000-0000-000000000000', 'happy', 'Spring break fun', NOW() - INTERVAL '120 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Finals stress', NOW() - INTERVAL '150 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Winter routine', NOW() - INTERVAL '180 days'),
('00000000-0000-0000-0000-000000000000', 'angry', 'Weather frustrations', NOW() - INTERVAL '210 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Holiday joy', NOW() - INTERVAL '240 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Fall semester start', NOW() - INTERVAL '270 days'),
('00000000-0000-0000-0000-000000000000', 'sad', 'Seasonal changes', NOW() - INTERVAL '300 days'),
('00000000-0000-0000-0000-000000000000', 'happy', 'Achievement celebration', NOW() - INTERVAL '330 days'),
('00000000-0000-0000-0000-000000000000', 'neutral', 'Year beginning', NOW() - INTERVAL '360 days');