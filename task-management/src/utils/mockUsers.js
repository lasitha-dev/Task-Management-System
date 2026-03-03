/**
 * Mock Users Utility
 * -----------------------------------------------------------------
 * Since the User Management microservice is not yet developed,
 * this file provides mock user data for local development.
 * Replace with real HTTP calls to user-management service later.
 * -----------------------------------------------------------------
 */

const MOCK_USERS = [
    {
        id: 'user_001',
        name: 'Alex Morgan',
        email: 'alex@merncore.dev',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Morgan&background=144bb8&color=fff',
    },
    {
        id: 'user_002',
        name: 'Jamie Davis',
        email: 'jamie@merncore.dev',
        role: 'developer',
        avatar: 'https://ui-avatars.com/api/?name=Jamie+Davis&background=8b5cf6&color=fff',
    },
    {
        id: 'user_003',
        name: 'Sam Kumar',
        email: 'sam@merncore.dev',
        role: 'developer',
        avatar: 'https://ui-avatars.com/api/?name=Sam+Kumar&background=0891b2&color=fff',
    },
    {
        id: 'user_004',
        name: 'Jordan Lee',
        email: 'jordan@merncore.dev',
        role: 'tester',
        avatar: 'https://ui-avatars.com/api/?name=Jordan+Lee&background=059669&color=fff',
    },
];

/**
 * Get all mock users
 */
function getAllUsers() {
    return MOCK_USERS;
}

/**
 * Find user by ID
 */
function getUserById(id) {
    return MOCK_USERS.find((u) => u.id === id) || null;
}

/**
 * Find user by email
 */
function getUserByEmail(email) {
    return MOCK_USERS.find((u) => u.email === email) || null;
}

/**
 * Validate that a userId exists
 */
function isValidUser(id) {
    return MOCK_USERS.some((u) => u.id === id);
}

module.exports = { getAllUsers, getUserById, getUserByEmail, isValidUser, MOCK_USERS };
