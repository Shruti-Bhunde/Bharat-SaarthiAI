-- SQL script for Bharat Saarthi AI database setup

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    picture VARCHAR(500),
    age INT NULL,
    occupation VARCHAR(255) NULL,
    income DECIMAL(12, 2) NULL,
    gender VARCHAR(50) NULL,
    education VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_path VARCHAR(500),
    detected_type VARCHAR(100),
    suggested_department VARCHAR(100),
    severity VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS government_schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    min_age INT DEFAULT 0,
    max_age INT DEFAULT 150,
    occupations TEXT, -- Comma-separated allowed occupations or 'Any'
    max_income DECIMAL(12, 2) DEFAULT 99999999.00, -- Maximum income to qualify
    gender VARCHAR(50) DEFAULT 'All', -- Male, Female, All
    education_level TEXT, -- Comma-separated allowed education levels or 'Any'
    benefits TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT,
    risk_score INT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    reasoning TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Seed Initial Government Schemes
INSERT INTO government_schemes (name, description, min_age, max_age, occupations, max_income, gender, education_level, benefits) VALUES
('PM Garib Kalyan Anna Yojana (PMGKAY)', 'Provides free food grains to eligible households to ensure food security for economically weaker sections.', 0, 120, 'Any', 250000.00, 'All', 'Any', '5 kg of free food grains per person per month.'),
('Pradhan Mantri Awas Yojana (PMAY) - Gramin/Urban', 'Provides financial assistance for constructing a pucka house with basic amenities to homeless and families living in dilapidated houses.', 18, 70, 'Any', 600000.00, 'All', 'Any', 'Financial subsidy up to ₹2.67 Lakhs for home construction.'),
('Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)', 'A voluntary and contributory pension scheme for unorganized workers like street vendors, rickshaw pullers, agricultural workers, construction workers, etc.', 18, 40, 'Farmer, Laborer, Street Vendor, Unemployed, Driver, Artisan', 180000.00, 'All', 'Any', 'Assured monthly pension of ₹3,000 after attaining the age of 60 years.'),
('Post Matric Scholarship Scheme for SC/ST/OBC Students', 'Financial assistance to students belonging to scheduled castes, scheduled tribes, and other backward classes to pursue post-matric or post-secondary courses.', 15, 30, 'Student', 250000.00, 'All', 'Student, Secondary, Graduate, Postgraduate', '100% tuition fee coverage and monthly maintenance allowance.'),
('Pradhan Mantri Mudra Yojana (PMMY)', 'Provides loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises to help entrepreneurs start or expand businesses.', 18, 65, 'Business Owner, Entrepreneur, Artisan, Self Employed', 99999999.00, 'All', 'Any', 'Collateral-free business loans up to ₹10 Lakhs under Shishu, Kishor, and Tarun categories.'),
('Sukanya Samriddhi Yojana (SSY)', 'A small deposit scheme for a girl child launched as a part of the Beti Bachao Beti Padhao campaign. Parents can open an account for their daughter under age 10.', 0, 10, 'Student, Any', 99999999.00, 'Female', 'Any', 'High-interest rate savings account with tax exemptions (Section 80C) for girl education/marriage.'),
('Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)', 'Provides free health cover of up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization to poor and vulnerable families.', 0, 120, 'Any', 150000.00, 'All', 'Any', 'Cashless health insurance cover up to ₹5,000,000 per family per year at empaneled hospitals.'),
('Lakhpati Didi Scheme', 'A scheme targeting rural women to encourage them to start micro-enterprises and raise their annual income to at least ₹1 Lakh per year.', 18, 60, 'Self Employed, Artisan, Homemaker, Farmer', 300000.00, 'Female', 'Any', 'Financial literacy training, skill development, and interest-free loans up to ₹5 Lakhs.');
