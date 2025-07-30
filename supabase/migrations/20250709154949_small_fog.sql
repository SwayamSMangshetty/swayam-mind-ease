/*
  # Insert sample meditation guides

  1. Sample Data
    - Insert meditation guides with proper titles, durations, descriptions, and image URLs
    - Use high-quality stock images from Pexels
    - Include various meditation types and durations

  2. Data Structure
    - Each guide has title, duration, description, and image_url
    - Available offline is set to true by default
    - Audio URLs can be added later when audio files are available
*/

-- Insert sample meditation guides
INSERT INTO meditation_guides (title, duration, description, image_url, available_offline) VALUES
  (
    'Mindful Moments',
    '5 min',
    'A quick mindfulness session to center yourself and find peace in the present moment.',
    'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Calm Focus',
    '10 min',
    'Enhance your concentration and mental clarity with this focused breathing meditation.',
    'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Deep Relaxation',
    '15 min',
    'Release tension and stress with this comprehensive body scan and relaxation practice.',
    'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Inner Peace',
    '20 min',
    'Journey inward to discover tranquility and balance through guided meditation.',
    'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Stress Relief',
    '3 min',
    'Quick stress-busting techniques for immediate relief during challenging moments.',
    'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Anxiety Ease',
    '5 min',
    'Gentle breathing exercises to calm anxiety and restore emotional balance.',
    'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Sleep Aid',
    '7 min',
    'Prepare your mind and body for restful sleep with this calming bedtime meditation.',
    'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  ),
  (
    'Mood Boost',
    '10 min',
    'Elevate your spirits and cultivate positive emotions through gratitude and mindfulness.',
    'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400',
    true
  )
ON CONFLICT (id) DO NOTHING;