const pool = require('./db.js');
/*
CREATE TABLE `tutors` (
    `id` SERIAL,
    `google_sub` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `tutor_subjects` (
    `id` SERIAL,
    `tutor_id` int NOT NULL,
    `subject` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`tutor_id`) REFERENCES `tutors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `availability` (
    `id` SERIAL,
    `tutor_id` int NOT NULL,
    `day` smallint NOT NULL,
    `period` smallint NOT NULL,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`tutor_id`) REFERENCES `tutors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

*/

async function createTutor(google_sub, email, name) {
    const query = `INSERT INTO tutors (google_sub, email, name) VALUES ($1, $2, $3)`;
    const values = [google_sub, email, name];
    await pool.query(query, values);
}

async function deleteTutorSubjects(tutor_id) {
    const query = `DELETE FROM tutor_subjects WHERE tutor_id = $1`;
    const values = [tutor_id];
    await pool.query(query, values);
}

async function deleteTutorAvailability(tutor_id) {
    const query = `DELETE FROM availability WHERE tutor_id = $1`;
    const values = [tutor_id];
    await pool.query(query, values);
}

async function updateTutorSubjects(tutor_id, subjects) {
    await deleteTutorSubjects(tutor_id);
    const query = `INSERT INTO tutor_subjects (tutor_id, subject) VALUES ($1, $2)`;
    for (let subject of subjects) {
        const values = [tutor_id, subject];
        await pool.query(query, values);
    }
}

async function updateTutorAvailability(tutor_id, availability) {
    await deleteTutorAvailability(tutor_id);
    const query = `INSERT INTO availability (tutor_id, day, period) VALUES ($1, $2, $3)`;
    for (let day in availability) {
        for (let period of availability[day]) {
            const values = [tutor_id, day, period];
            await pool.query(query, values);
        }
    }
}

async function getAvailableTutorsBySubject(subject) {
    const query = `
        SELECT tutors.id, tutors.google_sub, tutors.email, tutors.name
        FROM tutors
        INNER JOIN tutor_subjects ON tutors.id = tutor_subjects.tutor_id
        WHERE tutor_subjects.subject = $1
    `;
    const values = [subject];
    const result = await pool.query(query, values);
    return result.rows;
}

module.exports = {
    createTutor,
    updateTutorSubjects,
    updateTutorAvailability,
    getAvailableTutorsBySubject
};
