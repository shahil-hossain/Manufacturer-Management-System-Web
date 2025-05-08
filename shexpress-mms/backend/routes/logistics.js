const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const ExcelJS = require("exceljs");

// GET all deliveries
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// POST new delivery
router.post("/", async (req, res) => {
  try {
    console.log("Incoming delivery data:", req.body);
    const { orderId, division, district, address, status, date } = req.body;

    if (!orderId || !division || !district || !address || !status) {
      console.log("Missing fields:", { orderId, division, district, address, status });
      return res.status(400).json({ error: "All fields are required." });
    }

    const newDelivery = new Delivery({
      orderId,
      division,
      district,
      address,
      status,
      date,
    });

    await newDelivery.save();
    res.status(201).json(newDelivery);
  } catch (error) {
    console.error("Error saving delivery:", error);
    res.status(500).json({
      error: "Failed to save delivery",
      details: error.message,
    });
  }
});

// Export to Excel
router.get("/export/excel", async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Shipments");

    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 20 },
      { header: "Division", key: "division", width: 20 },
      { header: "District", key: "district", width: 20 },
      { header: "Address", key: "address", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Date", key: "date", width: 15 },
    ];

    deliveries.forEach((delivery) => {
      worksheet.addRow(delivery.toObject());
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=deliveries.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Failed to export Excel file" });
  }
});

module.exports = router;