-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: datawan2
-- ------------------------------------------------------
-- Server version	8.0.33
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
--
-- Table structure for table `archive_job_required_skills`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archive_job_required_skills` (
  `archive_job_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`archive_job_id`,`skill_id`),
  KEY `FKc1bpnpoks64fq56h4wi2ibeyv` (`skill_id`),
  CONSTRAINT `FKc1bpnpoks64fq56h4wi2ibeyv` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`),
  CONSTRAINT `FKplied2dpdpphm3xn1fykq9ci1` FOREIGN KEY (`archive_job_id`) REFERENCES `archived_jobs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `archive_job_service_provider_ids`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archive_job_service_provider_ids` (
  `archive_job_id` bigint NOT NULL,
  `service_provider_id` bigint NOT NULL,
  KEY `FK9tea9j1u33pg4ht04uat5m3f5` (`service_provider_id`),
  KEY `FKn2kb4rpd2tlmsiyn9muou0a4t` (`archive_job_id`),
  CONSTRAINT `FK9tea9j1u33pg4ht04uat5m3f5` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKn2kb4rpd2tlmsiyn9muou0a4t` FOREIGN KEY (`archive_job_id`) REFERENCES `archived_jobs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `archive_potential_job_offers`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archive_potential_job_offers` (
  `accepted` int DEFAULT NULL,
  `service_provider_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`service_provider_id`),
  KEY `FK313ktrror4l1ouojvks9x09wj` (`service_provider_id`),
  CONSTRAINT `FK313ktrror4l1ouojvks9x09wj` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKlmlk0dosjcox24s8iu2fs42e9` FOREIGN KEY (`job_id`) REFERENCES `archived_jobs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `archived_jobs`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archived_jobs` (
  `id` bigint NOT NULL,
  `active` bit(1) DEFAULT NULL,
  `creation_date` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `job_other_skills` varchar(255) DEFAULT NULL,
  `moderator_approval` int DEFAULT NULL,
  `number_of_people` int DEFAULT NULL,
  `project_lead_name` varchar(255) DEFAULT NULL,
  `project_lead_number` varchar(255) DEFAULT NULL,
  `reviewed_by_client` bit(1) DEFAULT NULL,
  `reviewed_by_service_provider` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `client_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `moderator_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjm2pgqk3bktuld5gs05fh1iyb` (`client_id`),
  KEY `FK5ofjfn0is7apdjhfph4v8qakr` (`created_by`),
  KEY `FKjhe7825meqcqfi23p0t7hld4j` (`moderator_id`),
  CONSTRAINT `FK5ofjfn0is7apdjhfph4v8qakr` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKjhe7825meqcqfi23p0t7hld4j` FOREIGN KEY (`moderator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKjm2pgqk3bktuld5gs05fh1iyb` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `department`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `invoice`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `extra_cost` double DEFAULT NULL,
  `extra_cost_description` varchar(255) DEFAULT NULL,
  `kilometer` double DEFAULT NULL,
  `job_id` bigint DEFAULT NULL,
  `service_provider_id` bigint DEFAULT NULL,
  `aantal` bigint DEFAULT NULL,
  `invoice_date` date DEFAULT NULL,
  `invoice_description` varchar(255) DEFAULT NULL,
  `invoice_type` varchar(255) DEFAULT NULL,
  `leverdatum` date DEFAULT NULL,
  `tarief` double DEFAULT NULL,
  `parent_invoice_id` bigint DEFAULT NULL,
  `invoice_number` bigint DEFAULT NULL,
  `day_or_hour` varchar(255) DEFAULT NULL,
  `dagen` varchar(255) DEFAULT NULL,
  `percentage_number` bigint DEFAULT NULL,
  `percentage_switch` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK4idvjnoj3ie9vgwlc71desyww` (`job_id`),
  KEY `FKgx3b301npyqd3d9lutyn58l9m` (`service_provider_id`),
  KEY `FKqhasquq74l7tnk1x3x93hykl7` (`parent_invoice_id`),
  CONSTRAINT `FK4idvjnoj3ie9vgwlc71desyww` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `FKgx3b301npyqd3d9lutyn58l9m` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqhasquq74l7tnk1x3x93hykl7` FOREIGN KEY (`parent_invoice_id`) REFERENCES `invoice` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `invoice_files`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_files` (
  `invoice_id` bigint NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  KEY `FK90m8p0mdc9ismihmq81vpnos5` (`invoice_id`),
  CONSTRAINT `FK90m8p0mdc9ismihmq81vpnos5` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `invoice_lines`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_lines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `aantal` varchar(255) DEFAULT NULL,
  `omschrijving` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `invoice_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7kk938lt30fhvrgfecsujd10o` (`invoice_id`),
  CONSTRAINT `FK7kk938lt30fhvrgfecsujd10o` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `job`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `creation_date` date DEFAULT NULL,
  `description` longtext,
  `destination` varchar(255) DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `payment` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `client_id` bigint DEFAULT NULL,
  `created_by` bigint DEFAULT NULL,
  `moderator_id` bigint DEFAULT NULL,
  `service_provider_id` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `moderator_approval` int DEFAULT NULL,
  `number_of_people` int DEFAULT NULL,
  `project_lead_name` varchar(255) DEFAULT NULL,
  `project_lead_number` varchar(255) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `job_other_skills` varchar(255) NOT NULL,
  `reviewed_by_client` bit(1) DEFAULT NULL,
  `reviewed_by_service_provider` varchar(255) DEFAULT NULL,
  `invoice_number` bigint DEFAULT NULL,
  `is_expired` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKnjwobp1p26mw8heba7eo4es66` (`client_id`),
  KEY `FKlw43c3u9ukxmnvr5rrtrqm5wc` (`created_by`),
  KEY `FKmsu9tj5a1sn622lwu0n96qm3a` (`moderator_id`),
  KEY `FKf7dg3f5f0hmu4q1ejjoedd5lq` (`service_provider_id`),
  CONSTRAINT `FKf7dg3f5f0hmu4q1ejjoedd5lq` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKlw43c3u9ukxmnvr5rrtrqm5wc` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `FKmsu9tj5a1sn622lwu0n96qm3a` FOREIGN KEY (`moderator_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKnjwobp1p26mw8heba7eo4es66` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `job_required_skills`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_required_skills` (
  `job_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`skill_id`),
  KEY `FK7ubrr9h3bhoklnq3ralx98vni` (`skill_id`),
  CONSTRAINT `FK7ubrr9h3bhoklnq3ralx98vni` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`),
  CONSTRAINT `FKgb1yppol0xr2e7cfm70ws680x` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `job_service_provider_ids`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_service_provider_ids` (
  `job_id` bigint NOT NULL,
  `service_provider_id` bigint NOT NULL,
  KEY `FKip6o08t9xlinf55knpsof4xo` (`service_provider_id`),
  KEY `FK257j9xnm7mtbui2hb69bir9vt` (`job_id`),
  CONSTRAINT `FK257j9xnm7mtbui2hb69bir9vt` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `FKip6o08t9xlinf55knpsof4xo` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `job_service_providers`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_service_providers` (
  `job_id` bigint NOT NULL,
  `service_provider_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`service_provider_id`),
  KEY `FKlymogns8m6sv4sfn63nyj3mru` (`service_provider_id`),
  CONSTRAINT `FK1diguqei5ijr3cbyv600om0rs` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `FKlymogns8m6sv4sfn63nyj3mru` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `potential_job_offered`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `potential_job_offered` (
  `accepted` bit(1) NOT NULL,
  `service_provider_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`service_provider_id`),
  KEY `FKrgl2vds0bhb1n7va3545mblet` (`service_provider_id`),
  CONSTRAINT `FK5w0h6uxdyrv138ivmuncxw7ra` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `FKrgl2vds0bhb1n7va3545mblet` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `potential_job_offers`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `potential_job_offers` (
  `accepted` bigint DEFAULT NULL,
  `service_provider_id` bigint NOT NULL,
  `job_id` bigint NOT NULL,
  PRIMARY KEY (`job_id`,`service_provider_id`),
  KEY `FKspf5uqvgi937te0soqw681lrp` (`service_provider_id`),
  CONSTRAINT `FK61aellbu1kh1egb78heaie3x3` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`),
  CONSTRAINT `FKspf5uqvgi937te0soqw681lrp` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `role`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `service_provider_availability_dates`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_provider_availability_dates` (
  `service_provider_id` bigint NOT NULL,
  `availability_dates` date DEFAULT NULL,
  KEY `FKjlkyd40ofr345v7uokleykeku` (`service_provider_id`),
  CONSTRAINT `FKjlkyd40ofr345v7uokleykeku` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `service_provider_skill`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_provider_skill` (
  `service_provider_id` bigint NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`service_provider_id`,`skill_id`),
  KEY `FKgp8f3hifpjgbh020akccmt8k2` (`skill_id`),
  CONSTRAINT `FK4l0hhlearl1m8eme5s48k35dk` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKgp8f3hifpjgbh020akccmt8k2` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `service_provider_unavailability_dates`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_provider_unavailability_dates` (
  `service_provider_id` bigint NOT NULL,
  `unavailability_dates` date DEFAULT NULL,
  KEY `FKg32op6qhvfebic3by0i019r92` (`service_provider_id`),
  CONSTRAINT `FKg32op6qhvfebic3by0i019r92` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `service_provider_unknown_dates`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_provider_unknown_dates` (
  `service_provider_id` bigint NOT NULL,
  `unknown_dates` date DEFAULT NULL,
  KEY `FKhdidgb3yq525qj878t9kgt1iv` (`service_provider_id`),
  CONSTRAINT `FKhdidgb3yq525qj878t9kgt1iv` FOREIGN KEY (`service_provider_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `skill`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `user_role`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_role` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKa68196081fvovjhkek5m97n3y` (`role_id`),
  CONSTRAINT `FKa68196081fvovjhkek5m97n3y` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`),
  CONSTRAINT `FKj345gk1bovqvfame88rcx7yyx` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
--
-- Table structure for table `users`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `about` longtext,
  `active` bit(1) DEFAULT NULL,
  `dep_id` int NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `dtype` varchar(31) NOT NULL,
  `billing` varchar(255) DEFAULT NULL,
  `preferences` varchar(255) DEFAULT NULL,
  `billing_info` varchar(255) DEFAULT NULL,
  `ratings` float DEFAULT NULL,
  `access_level` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `status` bit(1) DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `availability_status` bit(1) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `rating` float DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `availability_end_date` date DEFAULT NULL,
  `availability_options` varchar(255) DEFAULT NULL,
  `availability_start_date` date DEFAULT NULL,
  `profile_image` blob,
  `vat` varchar(255) DEFAULT NULL,
  `agreement` varchar(255) DEFAULT NULL,
  `business_registration` varchar(255) DEFAULT NULL,
  `discussed_rate` double DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `invoice_mail` varchar(255) DEFAULT NULL,
  `kilometer_rate` double DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `phone_number_planning` varchar(255) DEFAULT NULL,
  `sector` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `drivers_license` varchar(255) DEFAULT NULL,
  `billable` varchar(255) DEFAULT NULL,
  `day_rate` double DEFAULT NULL,
  `night_rate` double DEFAULT NULL,
  `rate_type` varchar(255) DEFAULT NULL,
  `time_based_rate` bit(1) DEFAULT NULL,
  `weekend_rate` double DEFAULT NULL,
  `unavailable_end_date` date DEFAULT NULL,
  `unavailable_start_date` date DEFAULT NULL,
  `unknown_end_date` date DEFAULT NULL,
  `unknown_start_date` date DEFAULT NULL,
  `rail_work_rate` double DEFAULT NULL,
  `client_event_rate_type` varchar(255) DEFAULT NULL,
  `discussed_raterw` double DEFAULT NULL,
  `hour_rate` double DEFAULT NULL,
  `hour_raterw` double DEFAULT NULL,
  `night_raterw` double DEFAULT NULL,
  `weekend_raterw` double DEFAULT NULL,
  `minimum_payment_hour` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_k8d0f2n7n88w1a16yhua64onx` (`first_name`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
-- Dump completed on 2025-05-23 17:43:04
