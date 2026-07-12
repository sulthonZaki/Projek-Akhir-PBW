-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `namaLengkap` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN_RM', 'SUPERVISOR_PRODUKSI', 'ADMIN_FG', 'MANAGER') NOT NULL,
    `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` TEXT NULL,
    `telepon` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `suppliers_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `alamat` TEXT NULL,
    `telepon` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gudang` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gudang_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_bahan_baku` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `stokMinimum` DOUBLE NOT NULL DEFAULT 0,
    `keterangan` VARCHAR(191) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_bahan_baku_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_semen` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kemasan` ENUM('SAK_40KG', 'SAK_50KG', 'CURAH') NOT NULL,
    `beratKg` DOUBLE NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `aktif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jenis_semen_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stok_rm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenisBahanBakuId` INTEGER NOT NULL,
    `gudangId` INTEGER NOT NULL,
    `jumlah` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stok_rm_jenisBahanBakuId_gudangId_key`(`jenisBahanBakuId`, `gudangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stok_fg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenisSemenId` INTEGER NOT NULL,
    `gudangId` INTEGER NOT NULL,
    `jumlah` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stok_fg_jenisSemenId_gudangId_key`(`jenisSemenId`, `gudangId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi_rm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorDokumen` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jenis` ENUM('MASUK', 'KELUAR') NOT NULL,
    `jenisBahanBakuId` INTEGER NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `supplierId` INTEGER NULL,
    `nomorPO` VARCHAR(191) NULL,
    `keterangan` TEXT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaksi_rm_nomorDokumen_key`(`nomorDokumen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorBatch` VARCHAR(191) NOT NULL,
    `tanggalMulai` DATETIME(3) NOT NULL,
    `tanggalSelesai` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'MENUNGGU_APPROVAL', 'DISETUJUI', 'DITOLAK') NOT NULL DEFAULT 'DRAFT',
    `totalOutputKg` DOUBLE NULL,
    `efisiensi` DOUBLE NULL,
    `catatan` TEXT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `produksi_nomorBatch_key`(`nomorBatch`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_produksi_rm` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produksiId` INTEGER NOT NULL,
    `jenisBahanBakuId` INTEGER NOT NULL,
    `jumlahTerpakai` DOUBLE NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_produksi_fg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produksiId` INTEGER NOT NULL,
    `jenisSemenId` INTEGER NOT NULL,
    `jumlahOutput` DOUBLE NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi_fg` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nomorDokumen` VARCHAR(191) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jenis` ENUM('MASUK', 'KELUAR') NOT NULL,
    `jenisSemenId` INTEGER NOT NULL,
    `jumlah` DOUBLE NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NULL,
    `nomorSJ` VARCHAR(191) NULL,
    `keterangan` TEXT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `transaksi_fg_nomorDokumen_key`(`nomorDokumen`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approvals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'DISETUJUI', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    `catatan` TEXT NULL,
    `userId` INTEGER NOT NULL,
    `transaksiRMId` INTEGER NULL,
    `produksiId` INTEGER NULL,
    `transaksiFGId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `approvals_transaksiRMId_key`(`transaksiRMId`),
    UNIQUE INDEX `approvals_produksiId_key`(`produksiId`),
    UNIQUE INDEX `approvals_transaksiFGId_key`(`transaksiFGId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `aksi` VARCHAR(191) NOT NULL,
    `modul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stok_rm` ADD CONSTRAINT `stok_rm_jenisBahanBakuId_fkey` FOREIGN KEY (`jenisBahanBakuId`) REFERENCES `jenis_bahan_baku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stok_rm` ADD CONSTRAINT `stok_rm_gudangId_fkey` FOREIGN KEY (`gudangId`) REFERENCES `gudang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stok_fg` ADD CONSTRAINT `stok_fg_jenisSemenId_fkey` FOREIGN KEY (`jenisSemenId`) REFERENCES `jenis_semen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stok_fg` ADD CONSTRAINT `stok_fg_gudangId_fkey` FOREIGN KEY (`gudangId`) REFERENCES `gudang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_rm` ADD CONSTRAINT `transaksi_rm_jenisBahanBakuId_fkey` FOREIGN KEY (`jenisBahanBakuId`) REFERENCES `jenis_bahan_baku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_rm` ADD CONSTRAINT `transaksi_rm_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_rm` ADD CONSTRAINT `transaksi_rm_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produksi` ADD CONSTRAINT `produksi_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_produksi_rm` ADD CONSTRAINT `detail_produksi_rm_produksiId_fkey` FOREIGN KEY (`produksiId`) REFERENCES `produksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_produksi_rm` ADD CONSTRAINT `detail_produksi_rm_jenisBahanBakuId_fkey` FOREIGN KEY (`jenisBahanBakuId`) REFERENCES `jenis_bahan_baku`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_produksi_fg` ADD CONSTRAINT `detail_produksi_fg_produksiId_fkey` FOREIGN KEY (`produksiId`) REFERENCES `produksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_produksi_fg` ADD CONSTRAINT `detail_produksi_fg_jenisSemenId_fkey` FOREIGN KEY (`jenisSemenId`) REFERENCES `jenis_semen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_fg` ADD CONSTRAINT `transaksi_fg_jenisSemenId_fkey` FOREIGN KEY (`jenisSemenId`) REFERENCES `jenis_semen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_fg` ADD CONSTRAINT `transaksi_fg_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi_fg` ADD CONSTRAINT `transaksi_fg_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_transaksiRMId_fkey` FOREIGN KEY (`transaksiRMId`) REFERENCES `transaksi_rm`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_produksiId_fkey` FOREIGN KEY (`produksiId`) REFERENCES `produksi`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `approvals` ADD CONSTRAINT `approvals_transaksiFGId_fkey` FOREIGN KEY (`transaksiFGId`) REFERENCES `transaksi_fg`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
