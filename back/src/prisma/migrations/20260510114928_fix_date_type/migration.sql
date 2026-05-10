/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizer_id_fkey";

-- DropForeignKey
ALTER TABLE "complaints" DROP CONSTRAINT "complaints_from_user_fkey";

-- DropForeignKey
ALTER TABLE "user_event" DROP CONSTRAINT "user_event_id_user_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "date" SET DATA TYPE DATE;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "first_name" TEXT,
    "second_name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "organizer_id" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "User_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "organizers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_from_user_fkey" FOREIGN KEY ("from_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_event" ADD CONSTRAINT "user_event_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
