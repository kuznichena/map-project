CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT
);

INSERT INTO documents (title, url) VALUES 
    ('Document #1', 'https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf'),
    ('Document #2', 'https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf');
