CREATE TABLE blogs(
  id SERIAL PRIMARY KEY,
  author TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title) VALUES
('Dan Abramov', 'https://overreacted.io/', 'The Road to React'),
('Kent C. Dodds', 'https://kentcdodds.com/blog', 'Epic React');

SELECT * FROM blogs;