-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2025 at 04:34 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `item_exclusivity`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(64) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_name` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `epc_categories`
--

CREATE TABLE `epc_categories` (
  `id` int(11) NOT NULL,
  `catCode` varchar(15) NOT NULL,
  `category` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `epc_categories`
--

INSERT INTO `epc_categories` (`id`, `catCode`, `category`, `created_at`, `updated_at`) VALUES
(1, 'Clocks', 'Clocks', '2025-10-11 10:31:22', '2025-10-11 10:31:22'),
(2, 'Decors', 'Decors', '2025-10-11 10:31:22', '2025-10-11 10:31:22'),
(3, 'Frames', 'Frames', '2025-10-11 10:31:22', '2025-10-11 10:31:22'),
(4, 'Lamps', 'Lamps', '2025-10-11 10:31:22', '2025-10-11 10:31:22'),
(5, 'Stationery', 'Stationery', '2025-10-11 10:31:22', '2025-10-11 10:31:22');

-- --------------------------------------------------------

--
-- Table structure for table `epc_chains`
--

CREATE TABLE `epc_chains` (
  `id` int(11) NOT NULL,
  `chainCode` varchar(10) NOT NULL,
  `chainName` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `epc_chains`
--

INSERT INTO `epc_chains` (`id`, `chainCode`, `chainName`, `created_at`, `updated_at`) VALUES
(1, 'vChain', 'VARIOUS CHAIN', '2025-10-11 10:29:20', '2025-10-11 10:29:20'),
(2, 'sMH', 'SM HOMEWORLD', '2025-10-11 10:29:20', '2025-10-11 10:29:20'),
(3, 'oH', 'OUR HOME', '2025-10-11 10:29:20', '2025-10-11 10:29:20');

-- --------------------------------------------------------

--
-- Table structure for table `epc_item_exclusivity_list`
--

CREATE TABLE `epc_item_exclusivity_list` (
  `id` int(10) NOT NULL,
  `itemCode` varchar(20) NOT NULL,
  `vChainASEH` int(2) DEFAULT NULL,
  `vChainBSH` int(2) DEFAULT NULL,
  `vChainCSM` int(2) DEFAULT NULL,
  `vChainDSS` int(2) DEFAULT NULL,
  `vChainESES` int(2) DEFAULT NULL,
  `sMHASEH` int(2) DEFAULT NULL,
  `sMHBSH` int(2) DEFAULT NULL,
  `sMHCSM` int(2) DEFAULT NULL,
  `sMHDSS` int(2) DEFAULT NULL,
  `sMHESES` int(2) DEFAULT NULL,
  `oHASEH` int(2) DEFAULT NULL,
  `oHBSH` int(2) DEFAULT NULL,
  `oHCSM` int(2) DEFAULT NULL,
  `oHDSS` int(2) DEFAULT NULL,
  `oHESES` int(2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `epc_item_exclusivity_list`
--

INSERT INTO `epc_item_exclusivity_list` (`id`, `itemCode`, `vChainASEH`, `vChainBSH`, `vChainCSM`, `vChainDSS`, `vChainESES`, `sMHASEH`, `sMHBSH`, `sMHCSM`, `sMHDSS`, `sMHESES`, `oHASEH`, `oHBSH`, `oHCSM`, `oHDSS`, `oHESES`, `created_at`, `updated_at`) VALUES
(1, '2010021398261839', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 04:50:33', '2025-11-04 12:20:00'),
(2, '2010030199171167', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 04:50:33', '2025-10-13 04:50:33'),
(3, '2010030498013467', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 04:50:33', '2025-10-13 04:50:33'),
(4, '2010020198018168', 0, 1, NULL, 1, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 04:50:33', '2025-11-04 11:44:09'),
(5, '2010012098170025', 1, 1, NULL, 1, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 04:50:33', '2025-11-04 10:43:33'),
(11, '2010020298187043', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 08:27:04', '2025-11-03 10:49:49'),
(12, '2010042798030001', 1, 1, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 08:27:47', '2025-11-04 10:43:33'),
(13, '2010050204010013', 1, 1, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 08:27:47', '2025-11-04 10:43:33'),
(14, '2010030198021181', 1, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 08:32:47', '2025-11-03 08:38:55'),
(16, '2010050598300016', 1, 1, NULL, 1, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 08:36:42', '2025-11-04 10:43:33'),
(18, '2010010104160019', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-03 08:38:34', '2025-11-03 08:38:34'),
(45, '2020040902220007', 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 10:43:33', '2025-11-04 12:12:09'),
(47, '2020040998160003', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 10:43:33', '2025-11-04 10:43:33'),
(48, '2010030198171195', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-04 11:27:14', '2025-11-04 11:27:14'),
(51, '2060030101180002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, '2025-11-10 09:26:23', '2025-11-10 09:32:17'),
(52, '2010030403163522', NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-10 09:26:23', '2025-11-10 09:32:17');

-- --------------------------------------------------------

--
-- Table structure for table `epc_item_list`
--

CREATE TABLE `epc_item_list` (
  `id` int(11) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `itemDescription` varchar(50) NOT NULL,
  `size` varchar(20) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `itemCategory` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `epc_item_list`
--

INSERT INTO `epc_item_list` (`id`, `itemCode`, `itemDescription`, `size`, `color`, `itemCategory`, `created_at`, `updated_at`) VALUES
(1, '2020021898160006', 'C/S VISTA GOURDIE METAL PENDANT LIGHT', 'FREE SIZE', 'WHITE', 'Lamps', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(2, '2010030199171167', 'ADELLA (OLD CODE) VINTAGE CLOCK', 'FREE SIZE', 'MAROON', 'Clocks', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(3, '2010030498013467', 'AEGEAN / ETHAN 3D WALL CLOCK', 'ASSORTED SIZE', 'CREAM', 'Clocks', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(4, '2010020198018168', 'AEGEAN ALICIA TABLE LAMP', 'FREE SIZE', 'RED', 'Lamps', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(5, '2120060398180001', 'AROMA DIFFUSER MINI 960062-6 BK', 'FREE SIZE', 'WHITE', 'Decors', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(6, '2010010798170134', 'AEGEAN CITY LIFE SET OF 3 WALL FRAME', 'FREE SIZE', 'CREAM', 'Frames', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(7, '2010990198183896', 'SALESMAN SAMPLE WALL DECOR', 'FREE SIZE', 'BLACK', 'Frames', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(8, '2100030698260002', 'ESS ERNA ALUMINUM  TABLE CLOCK', 'FREE SIZE', 'SILVER', 'Clocks', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(9, '2020040998160003', 'O/R VISTA STELLA CRMIC VASE  E', 'FREE SIZE', 'WHITE', 'Decors', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(10, '2010010298160016', 'AUTUMN FAM FRAME - 3OPENING', 'FREE SIZE', 'WHITE', 'Frames', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(11, '2030012601070006', 'COLOR BLOCKPAPERBAG BLU SML MD', 'SMALL', 'BLUE', 'Stationery', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(12, '2020040902220007', 'C/S VISTA YANNIE CERAMIC VASE MED', 'MEDIUM', 'WARM GRAY', 'Decors', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(13, '2010020298187043', 'ESS BEAU DIMMABLE LED DESK LAMP', 'FREE SIZE', 'BLACK', 'Lamps', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(14, '2010030298160003', 'ESS BIANCA DIGITAL CLOCK', 'FREE SIZE', 'WHITE', 'Clocks', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(15, '2070010198220005', 'REUSABLE / WITH BREATHING VALVECLOTH MASK', 'FREE SIZE', 'GRAY', 'Stationery', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(16, '2030021098130101', 'FLAMINGO GRP TUMBLE W/ STRAW', 'FREE SIZE', 'PINK', 'Stationery', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(17, '2030020198130012', 'PASTEL RECTANGLE MINI TRASHCAN', 'FREE SIZE', 'PINK', 'Stationery', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(18, '2010030198171195', 'ESS BELINDA VINTAGE TABLE CLOCK', 'FREE SIZE', 'CREAM', 'Clocks', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(19, '2010010104160019', 'ESS CAVERN A PHOTO FRAME 8x10', 'XL', 'WHITE', 'Frames', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(20, '2020040998180002', 'O/R VISTA STELLA CRMIC VASE  B', 'FREE SIZE', 'BLACK', 'Decors', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(21, '2010021398261839', 'ADAIR FLOOR LAMP', 'FREE SIZE', 'BLACK', 'Lamps', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(22, '2060030101180002', 'O/R HOSH BASIC TWIN BELL SMA', 'SMALL', 'BLACK', 'Clocks', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(23, '2010030403163522', 'ESS GUIAN LUM. WALL CLOCK', 'FREE SIZE', 'BLACK', 'Clocks', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(24, '2020021398180010', 'C/S SM FROS FLOOR LAMP', 'FREE SIZE', 'SATIN NICKEL', 'Lamps', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(25, '2010012098170025', 'AEGEAN BLUSH CHAMBER CNVS ART', 'FREE SIZE', 'CREAM', 'Decors', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(26, '2010990198253893', 'SALESMAN SAMPLE MEMO HOLDER', 'FREE SIZE', 'GOLD', 'Frames', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(27, '2010010798020133', 'AEGEAN EARTH TONES A SET OF 5 W. FRME', 'FREE SIZE', 'ORANGE', 'Frames', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(28, '2010030198021181', 'ANGIE  ROUND TABLE CLOCK', 'FREE SIZE', 'ORANGE', 'Clocks', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(29, '2010050204010013', 'AEGEAN WICKED DOTS PLLR CNDL', 'XL', 'MAROON', 'Decors', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(30, '2020011998200007', 'C/S VISTA WALL FRM WITHERED FLWS A-L', 'FREE SIZE', 'NATURAL', 'Frames', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(31, '2010010398160019', 'BRY MEMO HOLDER + PLANNER', 'FREE SIZE', 'WHITE', 'Stationery', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(32, '2010050598300016', 'BOTTLE STOPPER LED FAIRY LGHT', 'FREE SIZE', 'CLEAR', 'Decors', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(33, '2020021398160020', 'C/S VISTA CARMELLA METAL FLOOR LAMP', 'FREE SIZE', 'WHITE', 'Lamps', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(34, '2060030103180001', 'O/R HOSH BASIC TWIN BELL LAR', 'LARGE', 'BLACK', 'Clocks', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(35, '2030020298980009', 'CHOCOLATE TISSUE BOX', 'FREE SIZE', 'ASSORTED COLOR', 'Stationery', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(36, '2030020198140011', 'STRAWBERRY TRASHCAN', 'FREE SIZE', 'LIGHT PINK', 'Stationery', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(37, '2030013098980003', 'MINI WACKY FACES HGHLGHTR SET', 'FREE SIZE', 'ASSORTED COLOR', 'Stationery', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(38, '2100030698180001', 'ESS EXO ALUMINUM  TABLE CLOCK', 'FREE SIZE', 'BLACK', 'Clocks', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(39, '2020011998210010', 'C/S VISTA WALL FRM SUNSHINE GR B-S', '13.5x17.5', 'DARK BROWN', 'Frames', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(40, '2010042798030001', 'ESS DECOR. BALLS MAGNIFICO', 'FREE SIZE', 'YELLOW', 'Decors', '2025-11-03 03:15:18', '2025-11-03 03:15:18');

-- --------------------------------------------------------

--
-- Table structure for table `epc_stores`
--

CREATE TABLE `epc_stores` (
  `storeCode` varchar(20) NOT NULL,
  `storeName` varchar(150) NOT NULL,
  `chainCode` varchar(20) DEFAULT NULL,
  `lampsClass` varchar(50) DEFAULT NULL,
  `decorsClass` varchar(50) DEFAULT NULL,
  `clocksClass` varchar(50) DEFAULT NULL,
  `stationeryClass` varchar(50) DEFAULT NULL,
  `framesClass` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `epc_stores`
--

INSERT INTO `epc_stores` (`storeCode`, `storeName`, `chainCode`, `lampsClass`, `decorsClass`, `clocksClass`, `stationeryClass`, `framesClass`, `created_at`, `updated_at`) VALUES
('C-LAND001', 'THE LANDMARK DEPT STORE FILINVEST ALABANG', 'vChain', 'ASEH', 'CSM', 'DSS', NULL, 'ESES', '2025-10-29 07:35:17', '2025-11-18 05:08:27'),
('C-LAND002', 'THE LANDMARK DEPT STORE MAKATI', 'vChain', 'ASEH', NULL, NULL, NULL, 'ESES', '2025-10-29 07:35:17', '2025-11-18 05:08:29'),
('C-LAND003', 'THE LANDMARK DEPT STORE TRINOMA', 'vChain', 'ASEH', NULL, NULL, NULL, 'ESES', '2025-10-29 07:35:17', '2025-11-18 05:08:33'),
('C-LAND004', 'THE LANDMARK DEPT STORE  NUVALI', 'vChain', 'ASEH', NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-18 05:08:31'),
('C-LAND005', 'THE LANDMARK DEPT STORE MANILA BAY', 'vChain', 'ASEH', NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-18 05:08:35'),
('C-SMHW019', 'SM HOMEWORLD STA ROSA', 'sMH', 'BSH', 'BSH', 'BSH', 'BSH', 'BSH', '2025-11-10 11:04:14', '2025-11-11 09:25:46'),
('C-SMHW021', 'SM HOMEWORLD TARLAC', 'sMH', 'ASEH', 'DSS', NULL, NULL, NULL, '2025-11-10 11:02:16', '2025-11-11 09:06:33'),
('C-SMHW022', 'SM HOMEWORLD TELABASTAGAN', 'sMH', 'ASEH', 'CSM', NULL, NULL, 'ESES', '2025-11-10 11:02:16', '2025-11-11 09:06:42'),
('C-SMHW024', 'SM HOMEWORLD SUCAT', 'sMH', 'ASEH', 'DSS', NULL, NULL, NULL, '2025-11-10 11:02:16', '2025-11-11 09:06:47'),
('C-SMHW032', 'SM HOMEWORLD TUGUEGARAO', 'sMH', 'BSH', 'BSH', 'BSH', 'BSH', 'BSH', '2025-11-10 11:04:14', '2025-11-11 09:25:46');

-- --------------------------------------------------------

--
-- Table structure for table `epc_store_class`
--

CREATE TABLE `epc_store_class` (
  `id` int(11) NOT NULL,
  `storeClassCode` varchar(50) NOT NULL,
  `storeClassification` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `epc_store_class`
--

INSERT INTO `epc_store_class` (`id`, `storeClassCode`, `storeClassification`, `created_at`, `updated_at`) VALUES
(1, 'ASEH', 'A Stores – Extra High', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(2, 'BSH', 'B Stores – High', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(3, 'CSM', 'C Stores – Medium', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(4, 'DSS', 'D Stores – Small', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(5, 'ESES', 'E Stores – Extra Small', '2025-10-11 10:27:24', '2025-10-11 10:27:24');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  `executed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`, `executed_at`) VALUES
(1, '001_create_epc_chains_table.js', 1, '2025-11-03 03:15:18'),
(2, '002_create_epc_categories_table.js', 1, '2025-11-03 03:15:18'),
(3, '003_create_epc_store_class_table.js', 1, '2025-11-03 03:15:18'),
(4, '004_create_epc_branches_table.js', 1, '2025-11-03 03:15:18'),
(5, '005_create_epc_item_list_table.js', 1, '2025-11-03 03:15:18'),
(6, '006_create_epc_item_exclusivity_list_table.js', 1, '2025-11-03 03:15:18'),
(7, '007_create_audit_logs_table.js', 1, '2025-11-03 03:15:18'),
(8, '008_add_unique_itemcode_constraint.js', 2, '2025-11-03 08:07:14'),
(9, '009_create_users_table.js', 3, '2025-11-11 02:10:36'),
(10, '010_create_default_admin.js', 3, '2025-11-11 02:10:36'),
(11, '011_add_password_reset_tokens.js', 4, '2025-11-11 03:19:32'),
(12, '009_add_user_email_to_audit_logs.js', 5, '2025-11-11 09:10:34'),
(13, '012_add_business_unit_to_users.js', 6, '2025-11-11 10:45:52'),
(14, '013_duplicate_tables_for_nbfi.js', 7, '2025-11-12 10:21:54'),
(15, '014_create_nbfi_store_exclusivity_list.js', 8, '2025-11-14 09:42:49'),
(16, '015_remove_storeBrand_from_nbfi_store_exclusivity_list.js', 9, '2025-11-17 09:35:13'),
(17, '016_add_brand_columns_to_nbfi_store_exclusivity_list.js', 10, '2025-11-17 09:39:32'),
(18, '017_add_brand_columns_to_nbfi_stores.js', 11, '2025-11-17 09:59:54'),
(19, '018_change_brand_columns_to_varchar10.js', 12, '2025-11-17 10:08:01'),
(20, '019_nullify_zero_brand_values.js', 13, '2025-11-17 10:12:44'),
(21, '020_modify_nbfi_item_exclusivity_list.js', 14, '2025-11-18 01:09:52'),
(22, '021_rename_nbfi_item_exclusivity_to_list.js', 14, '2025-11-18 01:09:52'),
(23, '022_drop_nbfi_store_exclusivity_list.js', 15, '2025-11-18 03:03:45'),
(24, '023_update_nbfi_item_exclusivity_columns.js', 16, '2025-11-18 07:23:12'),
(25, '024_rename_nbfi_item_exclusivity_list.js', 17, '2025-11-18 07:25:45'),
(26, '025_create_nbfi_rds_wds_item_exclusivity_lists.js', 18, '2025-11-18 07:36:46');

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_alturas_item_exclusivity_list`
--

CREATE TABLE `nbfi_alturas_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_bq_item_exclusivity_list`
--

CREATE TABLE `nbfi_bq_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_brands`
--

CREATE TABLE `nbfi_brands` (
  `id` int(11) NOT NULL,
  `brandCode` varchar(15) NOT NULL,
  `brand` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `nbfi_brands`
--

INSERT INTO `nbfi_brands` (`id`, `brandCode`, `brand`, `created_at`, `updated_at`) VALUES
(1, 'BARBIZON', 'BARBIZON', '2025-10-11 10:31:22', '2025-11-14 10:36:49'),
(2, 'MONALISA', 'MONALISA\n', '2025-10-11 10:31:22', '2025-11-14 10:36:52'),
(3, 'SASSA', 'SASSA', '2025-10-11 10:31:22', '2025-11-12 10:53:01'),
(4, 'ANGELFISH', 'ANGELFISH', '2025-10-11 10:31:22', '2025-11-14 10:37:05'),
(5, 'ROCKLOBSTER', 'ROCKLOBSTER', '2025-10-11 10:31:22', '2025-11-14 10:37:17'),
(6, 'DISNEY', 'DISNEY', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(7, 'MARVEL', 'MARVEL', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(8, 'STARWARS', 'STARWARS', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(9, 'ISLANDHAZE', 'ISLAND HAZE', '2025-11-14 10:39:41', '2025-11-17 09:40:36'),
(10, 'SWIMLAB', 'SWIMLAB', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(11, 'DANSKIN', 'DANSKIN', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(12, 'NATALIA', 'NATALIA', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(13, 'BATMAN', 'BATMAN', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(14, 'JUSTICELEAGUE', 'JUSTICE LEAGUE', '2025-11-14 10:39:41', '2025-11-17 09:40:42'),
(15, 'SUPERMAN', 'SUPERMAN', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(16, 'BARBIE', 'BARBIE', '2025-11-14 10:39:41', '2025-11-14 10:39:41'),
(17, 'JUMPINGBEANS', 'JUMPING BEANS', '2025-11-14 10:39:41', '2025-11-17 09:40:48'),
(18, 'UMBRO', 'UMBRO', '2025-11-14 10:39:41', '2025-11-14 10:39:41');

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_centro_item_exclusivity_list`
--

CREATE TABLE `nbfi_centro_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_chains`
--

CREATE TABLE `nbfi_chains` (
  `id` int(11) NOT NULL,
  `chainCode` varchar(10) NOT NULL,
  `chainName` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `nbfi_chains`
--

INSERT INTO `nbfi_chains` (`id`, `chainCode`, `chainName`, `created_at`, `updated_at`) VALUES
(1, 'ALTURAS', 'ALTURAS', '2025-12-05 02:05:41', '2025-12-05 02:05:52'),
(2, 'BQ', 'BOHOL QUALITY', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(3, 'CENTRO', 'CENTRO', '2025-12-05 02:05:41', '2025-12-05 02:05:58'),
(4, 'EVER', 'EVER', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(5, 'FF', 'FINDS FINDS', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(6, 'FISHER', 'FISHER', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(7, 'GCAPITAL', 'GAISANO CAPITAL', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(8, 'GCITY', 'GAISANO CITY', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(9, 'GGRAND', 'GAISANO GRAND', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(10, 'GMALL', 'GMALL', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(11, 'JMART', 'JMART', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(12, 'KCC', 'KCC', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(13, 'LANDMARK', 'LANDMARK', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(14, 'LCC', 'LCC', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(15, 'LEE', 'LEE', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(16, 'METRO', 'METRO', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(17, 'NCCC', 'NCCC', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(18, 'PNS', 'PICK N SAVE', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(19, 'RDS', 'ROBINSONS DEPT STORE', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(20, 'SM', 'SM DEPT STORE', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(21, 'SL', 'STA. LUCIA', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(22, 'VP', 'VICTORIA PLAZA', '2025-12-05 02:05:41', '2025-12-05 02:05:41'),
(23, 'WDS', 'WALTERMART DEPT STORE', '2025-12-05 02:05:41', '2025-12-05 02:05:41');

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_ever_item_exclusivity_list`
--

CREATE TABLE `nbfi_ever_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_ff_item_exclusivity_list`
--

CREATE TABLE `nbfi_ff_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_fisher_item_exclusivity_list`
--

CREATE TABLE `nbfi_fisher_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_gcapital_item_exclusivity_list`
--

CREATE TABLE `nbfi_gcapital_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_gcity_item_exclusivity_list`
--

CREATE TABLE `nbfi_gcity_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_ggrand_item_exclusivity_list`
--

CREATE TABLE `nbfi_ggrand_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_gmall_item_exclusivity_list`
--

CREATE TABLE `nbfi_gmall_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_item_list`
--

CREATE TABLE `nbfi_item_list` (
  `id` int(11) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `itemDescription` varchar(100) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `itemBrand` varchar(15) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `nbfi_item_list`
--

INSERT INTO `nbfi_item_list` (`id`, `itemCode`, `itemDescription`, `size`, `color`, `itemBrand`, `created_at`, `updated_at`) VALUES
(1, '1010200138980023', 'BUNDLING 0023 TRAINING BRA SOFT PADS 4 IN 1', '38A', 'ASSORTED', 'BARBIZON', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(2, '1010070136980028', 'BUNDLING 0028 HALF CUP BRA PADDED UNDER WIRE', '36A', 'ASSORTED\n', 'BARBIZON', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(3, '1010080136980030', 'BUNDLING 0030 TEEN\'S BRA SEMI-PADDED', '36A', 'ASSORTED', 'BARBIZON', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(4, '1010130105980032', 'BUNDLING 0032 BIKINI PANTY MID-WAIST 2 IN 1', 'L', 'ASSORTED', 'BARBIZON', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(5, '1010130105981059', 'BIKINI-M-NYLON BUNDLING', 'L', 'ASSORTED', 'BARBIZON', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(6, '1020100338981601', 'TUBE BRA CTTN 2IN1', '38A', 'ASSORTED', 'MONALISA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(7, '1020100332041446', 'TUBE BRA', '32A', 'IVORY', 'MONALISA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(8, '1020070138141602', 'HC-RP-UW-POLYESTER MULTIWAY', '38A', 'RED', 'MONALISA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(9, '1020060136980001', 'CREAMY AVALANCHE 0001 FULL CUP BRA PADDED UNDER WIRE 2 IN 1', '36A', 'ASSORTED', 'MONALISA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(10, '1020130104090611', 'COTTON-THONG', 'M', 'SKINTONE', 'MONALISA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(11, '1030290203310045', 'ZENITH BLEND 0045 SPORTS BRA MEDIUM SUPPORT WITH PADS REMOVABLE PADS', 'S', 'PLUM', 'SASSA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(12, '1030020204021728', 'TNKNI-NYLON ACT', 'M', 'BLACK', 'SASSA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(13, '1030100105023310', 'STANDOUT BORDER 3310 CAPRI REGULAR FIT STRAIGHT CUT BELOW THE KNEE SINGLES POLYESTER', 'L', 'BLACK', 'SASSA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(14, '1030130103023311', 'STANDOUT BORDER 3311 PANTS SKIN FIT SLIM FIT SINGLES POLYESTER', 'S', 'BLACK', 'SASSA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(15, '1030190204210002', 'SAHARA SUNSET 0002 ONE PIECE SLEEVELESS BIKINI CUT SINGLES WITHOUT ZIPPER', 'M', 'MUSTARD', 'SASSA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(16, '1030180207140012', 'RUSTIC TROPIC 0012 RASHGUARD FULL ZIPPED SHORT-SLEEVED WITH REMOVABLE BRA PADS WITH ZIPPER RECYCLED', '2XL', 'HEATHER RED', 'SASSA', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(17, '1040100203280023', 'TROPICANA DREAMS 0023 SHORTS SHORT POLYESTER', 'S', 'MAJOLICA BLUE', 'ANGELFISH', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(18, '1040100207110014', 'TROPICANA DREAMS 0014 SHORTS SHORT', '2XL', 'LIGHT PINK', 'ANGELFISH', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(19, '1040060206020001', 'THE DAWN 0001 ONE PIECE SLEEVELESS BIKINI CUT SINGLES WITHOUT ZIPPER', 'XL', 'BLACK', 'ANGELFISH', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(20, '1040010604100001', 'THE DAWN 0001 BIKINI TOP HALTER SINGLES', 'M', 'DRY ROSE', 'ANGELFISH', '2025-10-13 03:57:12', '2025-10-13 03:57:12'),
(21, '1040010104100001', 'THE DAWN 0001 BIKINI TOP BANDEAU BIKINI HIGH-WAIST SET', 'M', 'DRY ROSE', 'ANGELFISH', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(22, '1040020104270839', 'TANKINI SET', 'M', 'TURQUOISE', 'ANGELFISH', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(23, '1040010205210019', 'STYLISH SPLASH PH1 0019 BIKINI TOP TRIANGLE', 'L', 'CURRY', 'ANGELFISH', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(24, '1170020105270002', 'TANKINI SET NYLN W/O UPF', 'L', 'TURQUOISE', 'BARBIE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(25, '1170020103240001', 'TANKINI SET', 'S', 'MINT GREEN', 'BARBIE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(26, '1100010203260005', 'SUNSET SPLASH 0005 RASHGUARD SHORT-SLEEVED REGULAR FIT', 'S', 'ROYAL BLUE', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(27, '1100030207020048', 'SUNSET DRIFT 0048 SHORTS SWIM SHORTS POLYESTER', '2XL', 'BLACK', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(28, '1100020406070005', 'SUN SHIRTS ITEM FOCUSED 0005 MEN\'S TOPS SUN SHIRT', 'XL', 'DARK GRAY', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(29, '1100030205180027', 'SUMMER HUES 0027 SHORTS SWIM SHORTS', 'L', 'ORANGE', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(30, '1200030304270002', 'WILD WATERS PH 2 0002 SWIM BOTTOMS SHORTS', 'M', 'LIGHT BLUE', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(31, '1200070115110006', 'WHIMSY MONDERS 0006 ONE PIECE LONG-SLEEVED BOYLEG CUT', '2T', 'LIGHT PINK', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(32, '1200050116290013', 'WHIMSY WONDERS 0013 TANKINI TANKINI SKIRT SET', '3T', 'VIOLET', 'ISLAND HAZE', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(33, '1200060106300027', 'WHIMSICAL WONDER 0027 RASHGUARD LONG-SLEEVED BOYLEG SET WITH FULL ZIPPER', 'XL', 'PERIWINKLE', 'JUMPING BEANS', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(34, '1200010104260043', 'TROPICAL TIDES 0043 RASHGUARD LONG-SLEEVED JAMMERS SET WITH BACK ZIPPER', 'M', 'AQUA BLUE', 'JUMPING BEANS', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(35, '1200070203160003', 'TROPICAL BLUSH 0003 ONE PIECE SLEEVELESS', 'S', 'MELLOW ROSE', 'JUMPING BEANS', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(36, '1200050105120008', 'TROPICAL PARADISE 0008 TANKINI TANKINI BOYLEG SET', 'L', 'CARMINE ROSE', 'JUMPING BEANS', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(37, '1200070207100011', 'TROPICAL PARADISE 0011 ONE PIECE SLEEVELESS BIKINI CUT', '2XL', 'OLD ROSE', 'JUMPING BEANS', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(38, '1200070217240002', 'TROPICAL SUMMER 0002 ONE PIECE SLEEVELESS SINGLES', '4T', 'LIME GREEN', 'JUMPING BEANS', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(39, '1110050106080008', 'SULTRY DESERT 0008 RASHGUARD FULL ZIPPED LONG-SLEEVED', 'XL', 'BROWN', 'SWIMLAB', '2025-11-03 03:15:18', '2025-11-03 03:15:18'),
(40, '1110100208210023', 'SUMMER SOLSTICE PH2 0023 SHORTS SHORT', '3XL', 'MUSTARD', 'SWIMLAB', '2025-11-03 03:15:18', '2025-11-03 03:15:18');

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_jmart_item_exclusivity_list`
--

CREATE TABLE `nbfi_jmart_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_kcc_item_exclusivity_list`
--

CREATE TABLE `nbfi_kcc_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_landmark_item_exclusivity_list`
--

CREATE TABLE `nbfi_landmark_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_lcc_item_exclusivity_list`
--

CREATE TABLE `nbfi_lcc_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_lee_item_exclusivity_list`
--

CREATE TABLE `nbfi_lee_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_metro_item_exclusivity_list`
--

CREATE TABLE `nbfi_metro_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_nccc_item_exclusivity_list`
--

CREATE TABLE `nbfi_nccc_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_pns_item_exclusivity_list`
--

CREATE TABLE `nbfi_pns_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_rds_item_exclusivity_list`
--

CREATE TABLE `nbfi_rds_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_sl_item_exclusivity_list`
--

CREATE TABLE `nbfi_sl_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_sm_item_exclusivity_list`
--

CREATE TABLE `nbfi_sm_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nbfi_sm_item_exclusivity_list`
--

INSERT INTO `nbfi_sm_item_exclusivity_list` (`id`, `itemCode`, `ASEH`, `BSH`, `CSM`, `DSS`, `ESES`, `created_at`, `updated_at`) VALUES
(1, '1010200138980023', 1, NULL, NULL, NULL, NULL, '2025-11-18 03:36:45', NULL),
(2, '1010070136980028', 1, NULL, NULL, NULL, NULL, '2025-11-18 03:36:57', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_stores`
--

CREATE TABLE `nbfi_stores` (
  `storeCode` varchar(20) NOT NULL,
  `storeName` varchar(150) NOT NULL,
  `chainCode` varchar(20) DEFAULT NULL,
  `brand_umbro` varchar(10) DEFAULT NULL,
  `brand_jumpingbeans` varchar(10) DEFAULT NULL,
  `brand_barbie` varchar(10) DEFAULT NULL,
  `brand_superman` varchar(10) DEFAULT NULL,
  `brand_justiceleague` varchar(10) DEFAULT NULL,
  `brand_batman` varchar(10) DEFAULT NULL,
  `brand_natalia` varchar(10) DEFAULT NULL,
  `brand_danskin` varchar(10) DEFAULT NULL,
  `brand_swimlab` varchar(10) DEFAULT NULL,
  `brand_islandhaze` varchar(10) DEFAULT NULL,
  `brand_starwars` varchar(10) DEFAULT NULL,
  `brand_marvel` varchar(10) DEFAULT NULL,
  `brand_disney` varchar(10) DEFAULT NULL,
  `brand_rocklobster` varchar(10) DEFAULT NULL,
  `brand_angelfish` varchar(10) DEFAULT NULL,
  `brand_sassa` varchar(10) DEFAULT NULL,
  `brand_monalisa` varchar(10) DEFAULT NULL,
  `brand_barbizon` varchar(10) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Dumping data for table `nbfi_stores`
--

INSERT INTO `nbfi_stores` (`storeCode`, `storeName`, `chainCode`, `brand_umbro`, `brand_jumpingbeans`, `brand_barbie`, `brand_superman`, `brand_justiceleague`, `brand_batman`, `brand_natalia`, `brand_danskin`, `brand_swimlab`, `brand_islandhaze`, `brand_starwars`, `brand_marvel`, `brand_disney`, `brand_rocklobster`, `brand_angelfish`, `brand_sassa`, `brand_monalisa`, `brand_barbizon`, `created_at`, `updated_at`) VALUES
('C-SMHW019', 'SM HOMEWORLD STA ROSA', 'SM', 'ASEH', 'ASEH', 'ASEH', 'ASEH', 'ASEH', 'ASEH', 'BSH', 'BSH', 'BSH', 'BSH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ASEH', '2025-11-10 11:04:14', '2025-11-18 03:42:20'),
('C-SMHW021', 'SM HOMEWORLD TARLAC', 'SM', 'BSH', 'BSH', 'BSH', 'ASEH', 'ASEH', 'ASEH', 'ASEH', NULL, NULL, NULL, 'ESES', 'ESES', NULL, NULL, 'DSS', 'DSS', 'DSS', 'DSS', '2025-11-10 11:02:16', '2025-11-18 02:10:06'),
('C-SMHW022', 'SM HOMEWORLD TELABASTAGAN', 'SM', 'ASEH', 'DSS', 'DSS', 'DSS', 'BSH', 'BSH', 'BSH', 'BSH', 'BSH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ASEH', '2025-11-10 11:02:16', '2025-11-18 03:42:23'),
('C-SMHW024', 'SM HOMEWORLD SUCAT', 'SM', 'ASEH', 'ASEH', 'ASEH', 'ASEH', 'CSM', 'CSM', 'CSM', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ASEH', '2025-11-10 11:02:16', '2025-11-18 03:42:25'),
('C-SMHW032', 'SM HOMEWORLD TUGUEGARAO', 'SM', 'CSM', 'CSM', 'ASEH', 'ASEH', 'ASEH', NULL, NULL, NULL, NULL, NULL, NULL, 'DSS', 'DSS', 'DSS', NULL, 'ASEH', 'ASEH', 'ASEH', '2025-11-10 11:04:14', '2025-11-18 03:42:27'),
('C-WDS004', 'W DEPT STORE CONCEPCION', 'WDS', 'ASEH', 'ASEH', 'ASEH', 'ASEH', 'ASEH', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-18 02:10:06'),
('C-WDS006', 'W DEPT STORE GUIGUINTO', 'WDS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-17 10:12:44'),
('C-WDS025', 'W DEPT STORE LOS BAÑOS', 'WDS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-17 10:12:44'),
('C-WDS033', 'W DEPT STORE GAPAN', 'WDS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-17 10:12:44'),
('C-WDS034', 'W DEPT STORE CALOOCAN', 'WDS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-29 07:35:17', '2025-11-17 10:12:44');

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_store_class`
--

CREATE TABLE `nbfi_store_class` (
  `id` int(11) NOT NULL,
  `storeClassCode` varchar(50) NOT NULL,
  `storeClassification` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `nbfi_store_class`
--

INSERT INTO `nbfi_store_class` (`id`, `storeClassCode`, `storeClassification`, `created_at`, `updated_at`) VALUES
(1, 'ASEH', 'A Stores – Extra High', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(2, 'BSH', 'B Stores – High', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(3, 'CSM', 'C Stores – Medium', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(4, 'DSS', 'D Stores – Small', '2025-10-11 10:27:24', '2025-10-11 10:27:24'),
(5, 'ESES', 'E Stores – Extra Small', '2025-10-11 10:27:24', '2025-10-11 10:27:24');

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_vp_item_exclusivity_list`
--

CREATE TABLE `nbfi_vp_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nbfi_wds_item_exclusivity_list`
--

CREATE TABLE `nbfi_wds_item_exclusivity_list` (
  `id` bigint(20) NOT NULL,
  `itemCode` varchar(16) NOT NULL,
  `ASEH` int(2) DEFAULT NULL,
  `BSH` int(2) DEFAULT NULL,
  `CSM` int(2) DEFAULT NULL,
  `DSS` int(2) DEFAULT NULL,
  `ESES` int(2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('employee','admin','manager') DEFAULT 'employee',
  `business_unit` enum('NBFI','EPC') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `business_unit`, `is_active`, `created_at`, `updated_at`, `reset_token`, `reset_token_expires`) VALUES
(1, 'admin2', 'admin@iem.com', '$2a$10$b1uJ4ayVMqA1nlzhtL9CA.q3UTLxkJSLhEMnAXz9d.G9MAu2Cf7Yu', 'admin', 'NBFI', 0, '2025-11-11 02:10:36', '2025-11-11 10:47:08', NULL, NULL),
(2, 'nbfiroland', 'roland.alavera@barbizonfashion.com', '$2a$10$HmHmVNAYU5b7RyWtQxrmfO8J547tl5sHQ5M.uv4OZdBIfmwY1Bs9.', 'employee', 'NBFI', 1, '2025-11-11 02:33:02', '2025-11-11 10:48:32', 'f14d3a6aaf8658ece78f1f9f7c16cfc7d581096a4c3b70ba9e39cc6117709f90', '2025-11-11 13:00:55'),
(3, 'employee', 'employee@iem.com', '$2a$10$YegxRHBE0b1Z0If4HlQwTO5vKDGt23/sl8ntvZd36PYdAYibqBosG', 'employee', 'NBFI', 0, '2025-11-11 03:07:49', '2025-11-11 10:47:17', NULL, NULL),
(4, 'admin', 'admin@barbizonfashion.com', '$2a$10$U95EQBbkwSkFsZn66oGLdeSYEUWlXph5ma/NGtqaDPt6RCYb7BvIS', 'admin', 'NBFI', 1, '2025-11-11 03:07:57', '2025-11-11 10:47:27', NULL, NULL),
(5, 'epcroland', 'roland.alavera@everydayproductscorp.net', '$2a$10$2GMnbJZRUt1/S1abAVJmku389pOE.OIRsMub7jy74Ukjlsx0.uBfW', 'employee', 'EPC', 1, '2025-11-11 10:49:21', '2025-11-11 10:56:01', NULL, NULL),
(7, 'xirb', 'brix.balanday@everydayproductscorp.com', '$2a$10$ElHL..F3xorYjK27RHEePuGV7bX6pG8sB.vcCo2O54qk538sg6RwK', 'employee', 'EPC', 1, '2025-11-12 02:13:48', '2025-11-12 02:13:48', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_entity` (`entity_type`,`action`);

--
-- Indexes for table `epc_categories`
--
ALTER TABLE `epc_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `catCode` (`catCode`);

--
-- Indexes for table `epc_chains`
--
ALTER TABLE `epc_chains`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chainCode` (`chainCode`);

--
-- Indexes for table `epc_item_exclusivity_list`
--
ALTER TABLE `epc_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_itemcode` (`itemCode`);

--
-- Indexes for table `epc_item_list`
--
ALTER TABLE `epc_item_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `epc_stores`
--
ALTER TABLE `epc_stores`
  ADD PRIMARY KEY (`storeCode`),
  ADD KEY `idx_branchName` (`storeName`);

--
-- Indexes for table `epc_store_class`
--
ALTER TABLE `epc_store_class`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `storeClassCode` (`storeClassCode`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nbfi_alturas_item_exclusivity_list`
--
ALTER TABLE `nbfi_alturas_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_bq_item_exclusivity_list`
--
ALTER TABLE `nbfi_bq_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_brands`
--
ALTER TABLE `nbfi_brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `catCode` (`brandCode`),
  ADD UNIQUE KEY `brandCode` (`brandCode`);

--
-- Indexes for table `nbfi_centro_item_exclusivity_list`
--
ALTER TABLE `nbfi_centro_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_chains`
--
ALTER TABLE `nbfi_chains`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `chainCode` (`chainCode`);

--
-- Indexes for table `nbfi_ever_item_exclusivity_list`
--
ALTER TABLE `nbfi_ever_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_ff_item_exclusivity_list`
--
ALTER TABLE `nbfi_ff_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_fisher_item_exclusivity_list`
--
ALTER TABLE `nbfi_fisher_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_gcapital_item_exclusivity_list`
--
ALTER TABLE `nbfi_gcapital_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_gcity_item_exclusivity_list`
--
ALTER TABLE `nbfi_gcity_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_ggrand_item_exclusivity_list`
--
ALTER TABLE `nbfi_ggrand_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_gmall_item_exclusivity_list`
--
ALTER TABLE `nbfi_gmall_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_item_list`
--
ALTER TABLE `nbfi_item_list`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nbfi_jmart_item_exclusivity_list`
--
ALTER TABLE `nbfi_jmart_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_kcc_item_exclusivity_list`
--
ALTER TABLE `nbfi_kcc_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_landmark_item_exclusivity_list`
--
ALTER TABLE `nbfi_landmark_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_lcc_item_exclusivity_list`
--
ALTER TABLE `nbfi_lcc_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_lee_item_exclusivity_list`
--
ALTER TABLE `nbfi_lee_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_metro_item_exclusivity_list`
--
ALTER TABLE `nbfi_metro_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_nccc_item_exclusivity_list`
--
ALTER TABLE `nbfi_nccc_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_pns_item_exclusivity_list`
--
ALTER TABLE `nbfi_pns_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_rds_item_exclusivity_list`
--
ALTER TABLE `nbfi_rds_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_sl_item_exclusivity_list`
--
ALTER TABLE `nbfi_sl_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_sm_item_exclusivity_list`
--
ALTER TABLE `nbfi_sm_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_stores`
--
ALTER TABLE `nbfi_stores`
  ADD PRIMARY KEY (`storeCode`),
  ADD KEY `idx_branchName` (`storeName`);

--
-- Indexes for table `nbfi_store_class`
--
ALTER TABLE `nbfi_store_class`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `storeClassCode` (`storeClassCode`);

--
-- Indexes for table `nbfi_vp_item_exclusivity_list`
--
ALTER TABLE `nbfi_vp_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `nbfi_wds_item_exclusivity_list`
--
ALTER TABLE `nbfi_wds_item_exclusivity_list`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_item` (`itemCode`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_reset_token` (`reset_token`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `epc_categories`
--
ALTER TABLE `epc_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `epc_chains`
--
ALTER TABLE `epc_chains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `epc_item_exclusivity_list`
--
ALTER TABLE `epc_item_exclusivity_list`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `epc_item_list`
--
ALTER TABLE `epc_item_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `epc_store_class`
--
ALTER TABLE `epc_store_class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `nbfi_alturas_item_exclusivity_list`
--
ALTER TABLE `nbfi_alturas_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_bq_item_exclusivity_list`
--
ALTER TABLE `nbfi_bq_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_brands`
--
ALTER TABLE `nbfi_brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `nbfi_centro_item_exclusivity_list`
--
ALTER TABLE `nbfi_centro_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_chains`
--
ALTER TABLE `nbfi_chains`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `nbfi_ever_item_exclusivity_list`
--
ALTER TABLE `nbfi_ever_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_ff_item_exclusivity_list`
--
ALTER TABLE `nbfi_ff_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_fisher_item_exclusivity_list`
--
ALTER TABLE `nbfi_fisher_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_gcapital_item_exclusivity_list`
--
ALTER TABLE `nbfi_gcapital_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_gcity_item_exclusivity_list`
--
ALTER TABLE `nbfi_gcity_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_ggrand_item_exclusivity_list`
--
ALTER TABLE `nbfi_ggrand_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_gmall_item_exclusivity_list`
--
ALTER TABLE `nbfi_gmall_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_item_list`
--
ALTER TABLE `nbfi_item_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `nbfi_jmart_item_exclusivity_list`
--
ALTER TABLE `nbfi_jmart_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_kcc_item_exclusivity_list`
--
ALTER TABLE `nbfi_kcc_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_landmark_item_exclusivity_list`
--
ALTER TABLE `nbfi_landmark_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_lcc_item_exclusivity_list`
--
ALTER TABLE `nbfi_lcc_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_lee_item_exclusivity_list`
--
ALTER TABLE `nbfi_lee_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_metro_item_exclusivity_list`
--
ALTER TABLE `nbfi_metro_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_nccc_item_exclusivity_list`
--
ALTER TABLE `nbfi_nccc_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_pns_item_exclusivity_list`
--
ALTER TABLE `nbfi_pns_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_rds_item_exclusivity_list`
--
ALTER TABLE `nbfi_rds_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_sl_item_exclusivity_list`
--
ALTER TABLE `nbfi_sl_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_sm_item_exclusivity_list`
--
ALTER TABLE `nbfi_sm_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `nbfi_store_class`
--
ALTER TABLE `nbfi_store_class`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `nbfi_vp_item_exclusivity_list`
--
ALTER TABLE `nbfi_vp_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nbfi_wds_item_exclusivity_list`
--
ALTER TABLE `nbfi_wds_item_exclusivity_list`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
