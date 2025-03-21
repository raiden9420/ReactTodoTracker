from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    if not os.path.exists('emerge.db'):
        conn = sqlite3.connect('emerge.db')
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL,
                password_hash TEXT,
                is_new INTEGER DEFAULT 1,
                profile_pic TEXT,
                skills TEXT,
                subjects TEXT,
                interests TEXT,
                goal TEXT,
                thinking_style TEXT,
                extra_info TEXT
            )
        ''')
        
        # Create journey table
        cursor.execute('''
            CREATE TABLE journey (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                level TEXT,
                progress INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Seed initial user for testing
        cursor.execute('''
            INSERT INTO users (username, is_new) VALUES (?, ?)
        ''', ('Maya', 1))
        
        user_id = cursor.lastrowid
        
        # Add initial journey data
        cursor.execute('''
            INSERT INTO journey (user_id, level, progress) VALUES (?, ?, ?)
        ''', (user_id, 'Newbie', 0))
        
        conn.commit()
        conn.close()
        print("Database initialized with seed data")

init_db()

# API Routes
@app.route('/api/check-new', methods=['GET'])
def check_new():
    # For demo, we'll assume user ID is 1
    user_id = 1
    
    conn = sqlite3.connect('emerge.db')
    cursor = conn.cursor()
    cursor.execute('SELECT is_new FROM users WHERE id = ?', (user_id,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return jsonify({'is_new': bool(result[0])})
    return jsonify({'is_new': True})

@app.route('/api/survey', methods=['POST'])
def save_survey():
    # For demo, we'll assume user ID is 1
    user_id = 1
    data = request.json
    
    # Extract data from the request
    subjects = json.dumps(data.get('subjects', []))
    interests = data.get('interests', '')
    skills = data.get('skills', '')
    goal = data.get('goal', '')
    thinking_style = data.get('thinking_style', '')
    extra_info = data.get('extra_info', '')
    
    conn = sqlite3.connect('emerge.db')
    cursor = conn.cursor()
    
    # Update user data
    cursor.execute('''
        UPDATE users
        SET is_new = 0, 
            subjects = ?,
            interests = ?,
            skills = ?,
            goal = ?,
            thinking_style = ?,
            extra_info = ?
        WHERE id = ?
    ''', (subjects, interests, skills, goal, thinking_style, extra_info, user_id))
    
    # Update journey based on subjects
    subject_list = json.loads(subjects)
    if subject_list:
        main_subject = subject_list[0]
        level = f"Beginner at {main_subject}"
        cursor.execute('''
            UPDATE journey
            SET level = ?, progress = ?
            WHERE user_id = ?
        ''', (level, 0, user_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/user', methods=['GET'])
def get_user():
    # For demo, we'll assume user ID is 1
    user_id = 1
    
    conn = sqlite3.connect('emerge.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get user data
    cursor.execute('''
        SELECT u.*, j.level, j.progress
        FROM users u
        LEFT JOIN journey j ON u.id = j.user_id
        WHERE u.id = ?
    ''', (user_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        user_data = dict(row)
        # Convert JSON strings back to Python objects
        if user_data['subjects']:
            user_data['subjects'] = json.loads(user_data['subjects'])
        return jsonify(user_data)
    
    return jsonify({'error': 'User not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)