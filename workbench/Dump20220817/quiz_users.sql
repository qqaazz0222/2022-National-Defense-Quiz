-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: quiz
-- ------------------------------------------------------
-- Server version	8.0.29

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `uid` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `upw` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uname` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uunitcode` int NOT NULL,
  `uscore` int NOT NULL,
  `utype` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `uunitname` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unselected',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('0','0','0',0,1,'user','사령부'),('00000','00000','00000',0,0,'user','사령부'),('11','11','11',100,0,'user','100부대'),('111','1234','00',100,0,'user','100부대'),('1111','2222','3333',1002,0,'user','1002부대'),('1234','1234','1234',1002,0,'user','1002부대'),('a1','1','a',1000,10,'user','1000부대'),('a2','1','a',1000,18,'user','1000부대'),('a3','1','a',1000,13,'user','1000부대'),('admin','1111','관리자',1000,0,'admin','1000부대'),('b1','1','b',1001,13,'user','1001부대'),('b2','1','b',1001,12,'user','1001부대'),('c1','1','c',1002,17,'user','1002부대'),('demander','1234','사령관',0,0,'user','사령부'),('id00','pw00','이름00',1000,0,'user','1000부대'),('id1','pw1','홍길동',1000,0,'user','1000부대'),('id2','pw2','홍길동',1000,0,'user','1000부대'),('id3','pw3','홍길동',1000,0,'user','1000부대'),('qqaazz0222','1234','김현수',1002,0,'user','1002부대'),('superadmin','1234','김준현',0,0,'admin','사령부'),('user1','password1','유저1',1000,0,'user','1000부대'),('user2','password2','유저2',1000,0,'user','1000부대'),('user3','password3','유저3',1000,0,'user','1000부대'),('user4','password4','유저4',1000,0,'user','1000부대');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-08-17 12:30:24
