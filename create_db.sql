DROP DATABASE IF EXISTS `nhs_tutoring`;
CREATE DATABASE `nhs_tutoring`;

\ connect nhs_tutoring;

DROP TABLE IF EXISTS `tutors` CASCADE;
DROP TABLE IF EXISTS `tutor_subjects` CASCADE;
DROP TABLE IF EXISTS `availability` CASCADE;

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
