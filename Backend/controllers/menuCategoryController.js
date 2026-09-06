const MenuCategory = require("../models/MenuCategory");
const Restaurant = require("../models/Restaurant");

const createMenuCategory = async (req, res) => {
    try {
        const { restaurantId, categoryName, description, image, displayOrder } = req.body;

        // Validation
        if (!restaurantId || !categoryName) {
            return res.status(400).json({
                success: false,
                message: "Restaurant and Category Name are required",
            });
        }

        // Check Restaurant Exists
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        // Check Duplicate Category
        const existingCategory = await MenuCategory.findOne({
            restaurantId,
            categoryName,
        })

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category alreay exists for this restaurant",
            })
        }

        //create category
        const category = await MenuCategory.create({
            restaurantId,
            categoryName,
            description,
            image,
            displayOrder,
        });

        return res.status(201).json({
            success: true,
            message: "Menu Category created successfully",
            data: category,
        });
    } catch (error) {
        console.error("Create Menu Category Error", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


// Get All Categories
const getAllMenuCategories = async (req, res) => {
    try {
        const categories = await MenuCategory.find()
            .populate("restaurantId", "name city")
            .sort({ displayOrder: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        console.error("Get Categories Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

const getMenuCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await MenuCategory.findById(id)
            .populate("restaurantId", "name city");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Menu Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: category,
        })
    } catch (error) {
        console.error("Get Category By ID Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


const updateMenuCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await MenuCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Menu Category not found",
            });
        }

        category.categoryName =
            req.body.categoryName || category.categoryName;

        category.description =
            req.body.description || category.description;

        category.image =
            req.body.image || category.image;

        if (req.body.displayOrder !== undefined) {
            category.displayOrder = req.body.displayOrder;
        }

        if (req.body.isActive !== undefined) {
            category.isActive = req.body.isActive;
        }

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Menu Category updated successfully",
            data: category,
        });
    } catch (error) {
        console.error("Update Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==========================================
// Delete Menu Category
// ==========================================
const deleteMenuCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await MenuCategory.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Menu Category not found",
            });
        }

        await MenuCategory.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Menu Category deleted successfully",
        });
    } catch (error) {
        console.error("Delete Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};


module.exports = { createMenuCategory, getAllMenuCategories, getMenuCategoryById, updateMenuCategory, deleteMenuCategory };
