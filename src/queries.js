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

async function getTutorByGoogleSub(google_sub) {
    const query = `SELECT * FROM tutors WHERE google_sub = $1`;
    const values = [google_sub];
    const result = await pool.query(query, values);
    return result.rows[0];
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

async function updateTutorSubjects(tutor_google_sub, subjects) {
    const tutor = await getTutorByGoogleSub(tutor_google_sub);
    const tutor_id = tutor.id;
    await deleteTutorSubjects(tutor_id);
    const query = `INSERT INTO tutor_subjects (tutor_id, subject) VALUES ($1, $2)`;
    for (let subject of subjects) {
        const values = [tutor_id, subject];
        await pool.query(query, values);
    }
}

async function updateTutorAvailability(tutor_google_sub, availability) {
    const tutor = await getTutorByGoogleSub(tutor_google_sub);
    const tutor_id = tutor.id;
    await deleteTutorAvailability(tutor_id);
    const query = `INSERT INTO availability (tutor_id, day, period) VALUES ($1, $2, $3)`;
    for (let day in availability) {
        for (let period of availability[day]) {
            const values = [tutor_id, day, period];
            await pool.query(query, values);
        }
    }
}

async function getTutorAvailability(tutor_google_sub) {
    const tutor = await getTutorByGoogleSub(tutor_google_sub);
    const tutor_id = tutor.id;
    const query = `SELECT day, period FROM availability WHERE tutor_id = $1`;
    const values = [tutor_id];
    const result = await pool.query(query, values);
    let availability = {};
    for (let row of result.rows) {
        if (!(row.day in availability)) {
            availability[row.day] = [];
        }
        availability[row.day].push(row.period);
    }
    return availability;
}

async function getTutorsSubjects(tutor_google_sub) {
    const tutor = await getTutorByGoogleSub(tutor_google_sub);
    const tutor_id = tutor.id;
    const query = `SELECT subject FROM tutor_subjects WHERE tutor_id = $1`;
    const values = [tutor_id];
    const result = await pool.query(query, values);
    return result.rows.map((row) => row.subject);
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
    getTutorByGoogleSub,
    updateTutorSubjects,
    updateTutorAvailability,
    getTutorAvailability,
    getTutorsSubjects,
    getAvailableTutorsBySubject
};
