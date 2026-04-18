CREATE TABLE IF NOT EXISTS book_moods (
  isbn        TEXT PRIMARY KEY,
  mood        JSONB        NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_recommendations (
  isbn        TEXT  NOT NULL,
  variation   INT   NOT NULL  DEFAULT 0,
  playlists   JSONB NOT NULL,
  tracks      JSONB NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  PRIMARY KEY (isbn, variation)
);
