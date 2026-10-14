-- ==============================================================================
-- SMART WASTE MANAGEMENT SYSTEM - RELATIONAL DATABASE SCHEMA
-- Professional Communication and Ethics (PCE) Prototype v1.0
-- ==============================================================================

-- 1. Complaints Table (Civic Public Cleanliness Reports)
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(32) PRIMARY KEY,                  -- e.g. 'TKT-2026-0101'
    issue_type VARCHAR(64) NOT NULL,             -- 'overflowing_bin', 'roadside_dumping', 'food_waste', 'mixed_waste', 'other'
    severity VARCHAR(16) NOT NULL,               -- 'low', 'medium', 'high'
    address TEXT NOT NULL,                       -- Typed street/neighborhood address
    landmark VARCHAR(255),                       -- Optional nearby reference landmark
    latitude DECIMAL(10, 7),                     -- Optional GPS latitude coordinates
    longitude DECIMAL(10, 7),                    -- Optional GPS longitude coordinates
    description TEXT,                            -- Resident description of the situation
    photo_url TEXT,                              -- Uploaded report evidence image
    status VARCHAR(32) NOT NULL DEFAULT 'Submitted', -- 'Submitted', 'Under Review', 'Assigned', 'Cleaning In Progress', 'Resolved', 'Needs More Information', 'Reopened'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolution_note TEXT,                        -- Officer / sanitation note upon resolution
    after_photo_url TEXT,                        -- Cleanliness verification photo after task completion
    created_by VARCHAR(64) DEFAULT 'resident_citizen'
);

-- 2. Special Pickup Requests Table
CREATE TABLE IF NOT EXISTS pickup_requests (
    id VARCHAR(32) PRIMARY KEY,                  -- e.g. 'REQ-2026-1049'
    waste_type VARCHAR(64) NOT NULL,             -- 'e_waste', 'bulky_furniture', 'renovation_scrap', 'garden_green'
    description TEXT NOT NULL,                   -- Description of items (e.g. 'Old wooden wardrobe and study desk')
    quantity_description VARCHAR(128) NOT NULL,  -- e.g. '2 large pieces (~35 kg)'
    address TEXT NOT NULL,                       -- Resident residential address
    preferred_slot VARCHAR(64) NOT NULL,         -- e.g. 'Saturday Morning (9:00 AM - 12:00 PM)'
    status VARCHAR(32) DEFAULT 'Request Received', -- 'Request Received', 'Scheduled', 'Collected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(64) DEFAULT 'resident_citizen'
);

-- 3. Waste Segregation Guide Items Table
CREATE TABLE IF NOT EXISTS waste_guide_items (
    id VARCHAR(32) PRIMARY KEY,
    item_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,               -- 'wet_organic', 'dry_recyclable', 'sanitary', 'e_waste', 'hazardous'
    bin_color VARCHAR(32) NOT NULL,              -- 'green', 'blue', 'red', 'black', 'special'
    instructions TEXT NOT NULL,                  -- Practical steps for domestic segregation
    local_rule_note TEXT,                        -- Ward or municipal variance notice
    special_handling_warning TEXT                -- Safety precautions (gloves, wrapping, sharp edges)
);

-- 4. Community Drives & Events Table
CREATE TABLE IF NOT EXISTS community_events (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date VARCHAR(64) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    registration_count INT DEFAULT 0,
    max_capacity INT DEFAULT 50,
    is_demo BOOLEAN DEFAULT TRUE
);

-- 5. Eco-Points & Activity Ledger Table
CREATE TABLE IF NOT EXISTS reward_ledger (
    id VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(64) DEFAULT 'resident_citizen',
    reason VARCHAR(255) NOT NULL,
    points INT NOT NULL,
    related_record_id VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_demo BOOLEAN DEFAULT TRUE
);

-- 6. Administrative Activity & Audit Trail Table (Accountability & Ethics)
CREATE TABLE IF NOT EXISTS admin_activity (
    id VARCHAR(32) PRIMARY KEY,
    complaint_id VARCHAR(32) NOT NULL,
    old_status VARCHAR(32) NOT NULL,
    new_status VARCHAR(32) NOT NULL,
    note TEXT,
    actor_label VARCHAR(64) NOT NULL DEFAULT 'Ward Sanitation Officer',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);
