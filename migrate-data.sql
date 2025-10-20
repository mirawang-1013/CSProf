-- Data Migration Script
-- Run this AFTER creating the schema in your Supabase SQL Editor

-- Insert universities
INSERT INTO universities (id, name, country, ranking, logo_url, website) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Stanford University', 'United States', 1, 'https://upload.wikimedia.org/wikipedia/en/b/b7/Stanford_University_seal_2003.svg', 'https://stanford.edu'),
('550e8400-e29b-41d4-a716-446655440002', 'Massachusetts Institute of Technology', 'United States', 2, 'https://upload.wikimedia.org/wikipedia/en/4/44/MIT_Seal.svg', 'https://web.mit.edu'),
('550e8400-e29b-41d4-a716-446655440003', 'University of California, Berkeley', 'United States', 4, 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Seal_of_University_of_California%2C_Berkeley.svg', 'https://berkeley.edu'),
('550e8400-e29b-41d4-a716-446655440004', 'Carnegie Mellon University', 'United States', 5, 'https://upload.wikimedia.org/wikipedia/en/3/34/Carnegie_Mellon_University_seal.svg', 'https://cmu.edu'),
('550e8400-e29b-41d4-a716-446655440005', 'University of Washington', 'United States', 8, 'https://upload.wikimedia.org/wikipedia/en/5/54/University_of_Washington_seal.svg', 'https://washington.edu'),
('550e8400-e29b-41d4-a716-446655440006', 'Georgia Institute of Technology', 'United States', 12, 'https://upload.wikimedia.org/wikipedia/en/3/3a/Georgia_Tech_seal.svg', 'https://gatech.edu'),
('550e8400-e29b-41d4-a716-446655440007', 'University of Illinois at Urbana-Champaign', 'United States', 15, 'https://upload.wikimedia.org/wikipedia/en/4/4a/University_of_Illinois_seal.svg', 'https://illinois.edu'),
('550e8400-e29b-41d4-a716-446655440008', 'University of Texas at Austin', 'United States', 18, 'https://upload.wikimedia.org/wikipedia/en/8/8a/University_of_Texas_at_Austin_seal.svg', 'https://utexas.edu'),
('550e8400-e29b-41d4-a716-446655440009', 'Cornell University', 'United States', 20, 'https://upload.wikimedia.org/wikipedia/en/7/7b/Cornell_University_seal.svg', 'https://cornell.edu'),
('550e8400-e29b-41d4-a716-446655440010', 'University of Michigan', 'United States', 22, 'https://upload.wikimedia.org/wikipedia/en/7/7a/University_of_Michigan_seal.svg', 'https://umich.edu');

-- Insert research topics
INSERT INTO research_topics (id, name, description) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Machine Learning', 'Algorithms and statistical models for computer systems to perform tasks without explicit instructions'),
('650e8400-e29b-41d4-a716-446655440002', 'Artificial Intelligence', 'Intelligence demonstrated by machines, in contrast to natural intelligence displayed by humans'),
('650e8400-e29b-41d4-a716-446655440003', 'Computer Vision', 'Field of artificial intelligence that trains computers to interpret and understand the visual world'),
('650e8400-e29b-41d4-a716-446655440004', 'Natural Language Processing', 'Subfield of linguistics, computer science, and AI concerned with interactions between computers and human language'),
('650e8400-e29b-41d4-a716-446655440005', 'Robotics', 'Interdisciplinary branch of engineering and science that includes mechanical engineering, electrical engineering, and computer science'),
('650e8400-e29b-41d4-a716-446655440006', 'Human-Computer Interaction', 'Research in the design and use of computer technology, focused on interfaces between people and computers'),
('650e8400-e29b-41d4-a716-446655440007', 'Distributed Systems', 'System whose components are located on different networked computers that communicate and coordinate their actions'),
('650e8400-e29b-41d4-a716-446655440008', 'Cybersecurity', 'Practice of protecting systems, networks, and programs from digital attacks'),
('650e8400-e29b-41d4-a716-446655440009', 'Data Science', 'Interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge from data'),
('650e8400-e29b-41d4-a716-446655440010', 'Software Engineering', 'Systematic approach to the design, development, and maintenance of software');

-- Insert candidates (sample data from your mock data)
INSERT INTO candidates (id, name, university_id, graduation_year, total_citations, h_index, research_interests, profile_image_url, linkedin_url, google_scholar_url) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Dr. Sarah Chen', '550e8400-e29b-41d4-a716-446655440001', 2023, 1247, 18, ARRAY['Machine Learning', 'Computer Vision', 'Deep Learning'], 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/sarahchen', 'https://scholar.google.com/citations?user=sarahchen'),
('750e8400-e29b-41d4-a716-446655440002', 'Dr. Michael Rodriguez', '550e8400-e29b-41d4-a716-446655440001', 2023, 892, 15, ARRAY['Natural Language Processing', 'Machine Learning', 'AI Ethics'], 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/michaelrodriguez', 'https://scholar.google.com/citations?user=michaelrodriguez'),
('750e8400-e29b-41d4-a716-446655440003', 'Dr. Emily Watson', '550e8400-e29b-41d4-a716-446655440002', 2023, 1563, 22, ARRAY['Robotics', 'Computer Vision', 'Human-Robot Interaction'], 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/emilywatson', 'https://scholar.google.com/citations?user=emilywatson'),
('750e8400-e29b-41d4-a716-446655440004', 'Dr. James Kim', '550e8400-e29b-41d4-a716-446655440002', 2023, 1089, 17, ARRAY['Distributed Systems', 'Cloud Computing', 'Software Engineering'], 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/jameskim', 'https://scholar.google.com/citations?user=jameskim'),
('750e8400-e29b-41d4-a716-446655440005', 'Dr. Lisa Thompson', '550e8400-e29b-41d4-a716-446655440003', 2023, 1345, 19, ARRAY['Human-Computer Interaction', 'User Experience', 'Accessibility'], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/lisathompson', 'https://scholar.google.com/citations?user=lisathompson'),
('750e8400-e29b-41d4-a716-446655440006', 'Dr. David Park', '550e8400-e29b-41d4-a716-446655440003', 2023, 987, 16, ARRAY['Cybersecurity', 'Network Security', 'Cryptography'], 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/davidpark', 'https://scholar.google.com/citations?user=davidpark'),
('750e8400-e29b-41d4-a716-446655440007', 'Dr. Anna Johnson', '550e8400-e29b-41d4-a716-446655440004', 2023, 1123, 18, ARRAY['Data Science', 'Machine Learning', 'Statistics'], 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/annajohnson', 'https://scholar.google.com/citations?user=annajohnson'),
('750e8400-e29b-41d4-a716-446655440008', 'Dr. Robert Lee', '550e8400-e29b-41d4-a716-446655440004', 2023, 1456, 21, ARRAY['Artificial Intelligence', 'Machine Learning', 'Neural Networks'], 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/robertlee', 'https://scholar.google.com/citations?user=robertlee'),
('750e8400-e29b-41d4-a716-446655440009', 'Dr. Maria Garcia', '550e8400-e29b-41d4-a716-446655440005', 2023, 876, 14, ARRAY['Software Engineering', 'Programming Languages', 'Compiler Design'], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/mariagarcia', 'https://scholar.google.com/citations?user=mariagarcia'),
('750e8400-e29b-41d4-a716-446655440010', 'Dr. Kevin Zhang', '550e8400-e29b-41d4-a716-446655440005', 2023, 1234, 20, ARRAY['Computer Vision', 'Image Processing', 'Machine Learning'], 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face', 'https://linkedin.com/in/kevinzhang', 'https://scholar.google.com/citations?user=kevinzhang');

-- Insert candidate-topic relationships
INSERT INTO candidate_topics (candidate_id, topic_id) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440004'),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440005'),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440007'),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440010'),
('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440006'),
('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440008'),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440009'),
('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440002'),
('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001'),
('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440010'),
('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003'),
('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001');

-- Insert sample publications
INSERT INTO publications (id, candidate_id, title, venue, year, citations, doi, abstract) VALUES
('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Deep Learning for Computer Vision: A Comprehensive Survey', 'IEEE Transactions on Pattern Analysis and Machine Intelligence', 2023, 234, '10.1109/TPAMI.2023.1234567', 'This paper presents a comprehensive survey of deep learning techniques for computer vision applications.'),
('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'Attention Mechanisms in Neural Networks: A Review', 'Neural Information Processing Systems', 2022, 189, '10.5555/1234567.1234567', 'We review the latest developments in attention mechanisms for neural networks.'),
('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Large Language Models for Natural Language Understanding', 'Association for Computational Linguistics', 2023, 156, '10.18653/v1/2023.acl-long.123', 'This work explores the capabilities of large language models in natural language understanding tasks.'),
('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440003', 'Human-Robot Interaction in Collaborative Environments', 'International Journal of Robotics Research', 2023, 198, '10.1177/02783649231234567', 'We present a framework for human-robot interaction in collaborative work environments.'),
('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440004', 'Distributed Systems Architecture for Cloud Computing', 'ACM Computing Surveys', 2022, 145, '10.1145/1234567.1234567', 'This survey examines distributed systems architectures used in modern cloud computing platforms.');

-- Insert academic metrics for university comparison
INSERT INTO academic_metrics (university_id, year, publications_count, total_citations, h_index_avg, conference_papers, journal_papers) VALUES
('550e8400-e29b-41d4-a716-446655440001', 2023, 1250, 45000, 18.5, 800, 450),
('550e8400-e29b-41d4-a716-446655440001', 2022, 1180, 42000, 17.8, 750, 430),
('550e8400-e29b-41d4-a716-446655440001', 2021, 1100, 38000, 16.9, 700, 400),
('550e8400-e29b-41d4-a716-446655440002', 2023, 1350, 52000, 20.2, 900, 450),
('550e8400-e29b-41d4-a716-446655440002', 2022, 1280, 48000, 19.5, 850, 430),
('550e8400-e29b-41d4-a716-446655440002', 2021, 1200, 44000, 18.7, 800, 400),
('550e8400-e29b-41d4-a716-446655440003', 2023, 980, 35000, 16.8, 650, 330),
('550e8400-e29b-41d4-a716-446655440003', 2022, 920, 32000, 16.2, 600, 320),
('550e8400-e29b-41d4-a716-446655440003', 2021, 880, 29000, 15.5, 580, 300),
('550e8400-e29b-41d4-a716-446655440004', 2023, 750, 28000, 15.9, 500, 250),
('550e8400-e29b-41d4-a716-446655440004', 2022, 720, 26000, 15.3, 480, 240),
('550e8400-e29b-41d4-a716-446655440004', 2021, 680, 24000, 14.8, 450, 230);
