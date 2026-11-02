import mongoose from "mongoose";
import productModel from "../models/products.model.js";
import userModel from "../models/users.model.js";
import uploadFile from "../../services/storage.service.js";

async function createProduct(req, res) {
    try {
        const { name, desc } = req.body
        const price = Number(req.body.price)
        if (!req.file) {
            return res.status(400).json({ message: "Product image is required" })
        }
        if (!name?.trim() || !desc?.trim() || String(req.body.price ?? "").trim() === "" || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: "Name, description, and a nonnegative price are required" })
        }

        const uploadImage = await uploadFile(req.file.buffer, req.file.originalname)
        const product = await productModel.create({
            image: uploadImage.url,
            name: name.trim(),
            desc: desc.trim(),
            price,
            admin: req.user.id
        })
        const populatedProduct = await productModel.findById(product._id).populate("admin", "username email")

        return res.status(201).json({ message: "Product added", product: populatedProduct })
    } catch (error) {
        return res.status(500).json({ message: "Failed to create product", error: error.message })
    }
}

async function getProducts(req,res){
    try {
        
        const products = await productModel.find().populate("admin","username email")
        res.status(200).json({
            message:"Products fetched sucessfully",
            products
        })

    } catch (error) {
        res.status(500).json({
            message:"Failed to fetch Products",
            error:error.message
        })
    }
}

async function updateProduct(req, res) {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (product.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only update your own products" })
        }

        const { name, desc } = req.body
        const price = Number(req.body.price)
        if (!name?.trim() || !desc?.trim() || String(req.body.price ?? "").trim() === "" || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: "Name, description, and a nonnegative price are required" })
        }

        product.name = name.trim()
        product.desc = desc.trim()
        product.price = price
        if (req.file) {
            const uploadImage = await uploadFile(req.file.buffer, req.file.originalname)
            product.image = uploadImage.url
        }
        await product.save()

        const updatedProduct = await productModel.findById(product._id).populate("admin", "username email")
        return res.status(200).json({ message: "Product updated", product: updatedProduct })
    } catch (error) {
        return res.status(500).json({ message: "Failed to update product", error: error.message })
    }
}

async function deleteProduct(req, res) {
    try {
        const { productId } = req.params
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }

        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (product.admin.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own products" })
        }

        await userModel.updateMany(
            { "cart.product": productId },
            { $pull: { cart: { product: productId } } },
        )
        await product.deleteOne()
        return res.status(200).json({ message: "Product deleted" })
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete product", error: error.message })
    }
}

export { createProduct, getProducts, updateProduct, deleteProduct }