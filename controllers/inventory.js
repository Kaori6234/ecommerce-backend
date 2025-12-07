const Category = require('../models/Category');
const Brand = require('../models/Brand');

// --- Categories ---
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const newCat = await Category.create(req.body.name);
        res.status(201).json(newCat);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.delete(req.params.id);
        res.json({ message: "Category deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Brands ---
exports.getBrands = async (req, res) => {
    try {
        const brands = await Brand.getAll();
        res.json(brands);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body.name);
        res.status(201).json(newBrand);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};