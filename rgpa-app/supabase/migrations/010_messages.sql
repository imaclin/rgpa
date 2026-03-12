-- Messages table for contact form submissions
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a message (public INSERT)
DROP POLICY IF EXISTS "Anyone can submit a message" ON messages;
CREATE POLICY "Anyone can submit a message"
  ON messages FOR INSERT WITH CHECK (true);

-- Only authenticated users can view messages
DROP POLICY IF EXISTS "Authenticated users can view messages" ON messages;
CREATE POLICY "Authenticated users can view messages"
  ON messages FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update messages (status changes)
DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;
CREATE POLICY "Authenticated users can update messages"
  ON messages FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete messages
DROP POLICY IF EXISTS "Authenticated users can delete messages" ON messages;
CREATE POLICY "Authenticated users can delete messages"
  ON messages FOR DELETE USING (auth.role() = 'authenticated');
