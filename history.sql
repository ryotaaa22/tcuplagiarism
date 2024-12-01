/* 2024-10-15 21:48:37 [1 ms] */ 
USE data_users;
/* 2024-10-15 21:48:43 [292 ms] */ 
ALTER TABLE user_posts ADD COLUMN file_path VARCHAR(255);
/* 2024-10-16 00:07:14 [4 ms] */ 
SELECT * FROM user_posts WHERE status = 'approved' LIMIT 100;
