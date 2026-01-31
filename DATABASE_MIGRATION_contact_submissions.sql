-- Create contact_submissions table for storing range owner contact requests
CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    range_id TEXT NOT NULL REFERENCES ranges(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'declined')),
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contacted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all contact submissions
CREATE POLICY "Admins can view all contact submissions" ON contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role = 'ADMIN'
        )
    );

-- Policy for admins to insert contact submissions
CREATE POLICY "Admins can insert contact submissions" ON contact_submissions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role = 'ADMIN'
        )
    );

-- Policy for admins to update contact submissions
CREATE POLICY "Admins can update contact submissions" ON contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()::text
            AND users.role = 'ADMIN'
        )
    );

-- Policy to allow API to insert submissions (no auth required for public contact form)
CREATE POLICY "Allow public contact form submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_contact_submissions_range_id ON contact_submissions(range_id);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_submitted_at ON contact_submissions(submitted_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_submissions_updated_at();