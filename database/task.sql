SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

DROP SCHEMA IF EXISTS `mydb` ;
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `Task`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Task` ;

CREATE  TABLE IF NOT EXISTS `Task` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `Content` VARCHAR(280) NOT NULL COMMENT '任务内容' ,
  `StartTime` DATETIME NOT NULL COMMENT '开始时间' ,
  `Days` DOUBLE NOT NULL COMMENT '完成该任务所需天数' ,
  `CurStatus` INT NOT NULL COMMENT '任务当前状态：1执行中、2完成、3作废、4关闭' ,
  `SecretStatus` INT NOT NULL COMMENT '只支持一种状态：1公开、2好友可见、3特定用户组可见、4特定用户可见、5私有' ,
  `CreatorId` BIGINT NOT NULL COMMENT '创建者' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '任务表';

CREATE INDEX `IDX_CreatorId` USING BTREE ON `Task` (`CreatorId` ASC) ;


-- -----------------------------------------------------
-- Table `TaskSchedule`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `TaskSchedule` ;

CREATE  TABLE IF NOT EXISTS `TaskSchedule` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `TaskId` BIGINT NOT NULL COMMENT '关联任务Id' ,
  `Content` VARCHAR(280) NOT NULL COMMENT '任务进度内容' ,
  `ComStatus` INT NOT NULL COMMENT '完成情况：1优、2良、3合格、4差、5很差' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '任务的 进度列表';

CREATE INDEX `IDX_TaskId` USING BTREE ON `TaskSchedule` (`TaskId` ASC) ;


-- -----------------------------------------------------
-- Table `User`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `User` ;

CREATE  TABLE IF NOT EXISTS `User` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `UserName` VARCHAR(45) NOT NULL ,
  `Email` VARCHAR(320) NOT NULL COMMENT '邮箱：登录名、找回密码' ,
  `Introduction` VARCHAR(280) NULL COMMENT '个人描述介绍' ,
  `HomePage` VARCHAR(100) NULL COMMENT '个人主页' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '用户表';

CREATE INDEX `IDX_Email` ON `User` (`Email` ASC) ;

CREATE INDEX `IDX_UserName` USING BTREE ON `User` (`UserName` ASC) ;


-- -----------------------------------------------------
-- Table `GroupAuthorize`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `GroupAuthorize` ;

CREATE  TABLE IF NOT EXISTS `GroupAuthorize` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `TaskId` BIGINT NOT NULL COMMENT '任务Id' ,
  `FriendGroupId` BIGINT NOT NULL COMMENT '好友分组Id' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '按好友的分组授权';

CREATE INDEX `IDX_TaskId` USING BTREE ON `GroupAuthorize` (`TaskId` ASC) ;


-- -----------------------------------------------------
-- Table `UserAuthorize`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `UserAuthorize` ;

CREATE  TABLE IF NOT EXISTS `UserAuthorize` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `TaskId` BIGINT NOT NULL ,
  `FriendId` BIGINT NOT NULL ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '按特定好友授权';

CREATE INDEX `IDX_TaskId` USING BTREE ON `UserAuthorize` (`TaskId` ASC) ;


-- -----------------------------------------------------
-- Table `Friend`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Friend` ;

CREATE  TABLE IF NOT EXISTS `Friend` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `CreatorId` BIGINT NOT NULL COMMENT '当前用户Id' ,
  `FriendId` BIGINT NOT NULL COMMENT '好友Id' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '好友';

CREATE INDEX `IDX_CreatorId` USING BTREE ON `Friend` (`CreatorId` ASC) ;


-- -----------------------------------------------------
-- Table `Follow`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Follow` ;

CREATE  TABLE IF NOT EXISTS `Follow` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `CreatorId` BIGINT NOT NULL COMMENT '当前用户Id' ,
  `FollowId` BIGINT NOT NULL COMMENT '跟随者Id' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '跟随列表';

CREATE INDEX `IDX_CreatorId` USING BTREE ON `Follow` (`CreatorId` ASC) ;

CREATE INDEX `IDX_FollowId` USING BTREE ON `Follow` (`FollowId` ASC) ;


-- -----------------------------------------------------
-- Table `FriendGroup`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `FriendGroup` ;

CREATE  TABLE IF NOT EXISTS `FriendGroup` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `GroupName` VARCHAR(45) NOT NULL ,
  `CreatorId` BIGINT NOT NULL COMMENT '当前用户Id' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '好友分组';

CREATE INDEX `IDX_CreatorId` USING BTREE ON `FriendGroup` (`CreatorId` ASC) ;


-- -----------------------------------------------------
-- Table `Comment`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `Comment` ;

CREATE  TABLE IF NOT EXISTS `Comment` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `TaskId` BIGINT NULL COMMENT '任务Id' ,
  `TaskScheduleId` BIGINT NULL COMMENT '任务进度Id' ,
  `Content` VARCHAR(280) NOT NULL ,
  `CreatorId` BIGINT NULL COMMENT '评论者Id' ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '任务或任务进度的评论';

CREATE INDEX `IDX_TaskId` ON `Comment` (`TaskId` ASC) ;

CREATE INDEX `IDX_TaskScheduleId` ON `Comment` (`TaskScheduleId` ASC) ;

CREATE INDEX `IDX_CreatorId` USING BTREE ON `Comment` (`CreatorId` ASC) ;


-- -----------------------------------------------------
-- Table `FriendGroupRelation`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `FriendGroupRelation` ;

CREATE  TABLE IF NOT EXISTS `FriendGroupRelation` (
  `FriendGroupId` BIGINT NOT NULL COMMENT '好友分组Id' ,
  `FriendId` BIGINT NOT NULL COMMENT '好友Id' )
ENGINE = InnoDB
COMMENT = '好友分组和好友之间的关联关系';

CREATE INDEX `IDX_FriendId` USING BTREE ON `FriendGroupRelation` (`FriendId` ASC) ;

CREATE INDEX `IDX_FriendGroupId` USING BTREE ON `FriendGroupRelation` (`FriendGroupId` ASC) ;


-- -----------------------------------------------------
-- Table `PrivateDirect`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `PrivateDirect` ;

CREATE  TABLE IF NOT EXISTS `PrivateDirect` (
  `Id` BIGINT NOT NULL AUTO_INCREMENT ,
  `CreatorId` BIGINT NOT NULL ,
  `ReceiverId` BIGINT NOT NULL ,
  `Content` VARCHAR(280) NOT NULL ,
  `IsRead` BIT NOT NULL ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB
COMMENT = '私信';

CREATE INDEX `IDX_CreatorId` USING BTREE ON `PrivateDirect` (`CreatorId` ASC) ;

CREATE INDEX `IDX_ReceiverId` USING BTREE ON `PrivateDirect` (`ReceiverId` ASC) ;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
