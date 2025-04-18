/*
  # Marketplace Database Schema

  1. New Tables
    - items
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - price (numeric)
      - image_url (text)
      - seller_id (uuid, references auth.users)
      - created_at (timestamp)
      - status (text) - 'available' or 'sold'
    
    - messages
      - id (uuid, primary key)
      - sender_id (uuid, references auth.users)
      - receiver_id (uuid, references auth.users)
      - item_id (uuid, references items)
      - content (text)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  image_url text,
  seller_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
  ) STORED
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  item_id uuid REFERENCES items NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Items policies
CREATE POLICY "Anyone can view available items"
  ON items
  FOR SELECT
  USING (status = 'available');

CREATE POLICY "Users can create items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id);

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create search index
CREATE INDEX IF NOT EXISTS items_search_idx ON items USING gin(search_vector);