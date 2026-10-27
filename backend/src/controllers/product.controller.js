import mongoose from "mongoose";
import productModel from "../models/products.model.js";
import userModel from "../models/users.model.js";
import uploadFile from "../../services/storage.service.js";

async function createProduct(req, res) {
    if(!req.file){
        return res.status(400).json({
            message: "Image is required"
        })
    }
    const { name, desc } = req.body
    const price = Number(req.body.price)
    if (typeof req.body.price !== "string" || req.body.price.trim() === "" || !Number.isFinite(price) || price < 0) {
        return res.status(400).json({
            message: "Price must be a non-negative number"
        })
    }

    const uploadImage = await uploadFile(
        req.file.buffer,
        req.file.originalname
    )

    const product = await productModel.create({
        image: uploadImage.url,
        name, desc, price,
        admin: req.user.id

    })
    res.status(201).json({
        message:"Product added",
        product
    })
}

async function updateProduct(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid Product Id" })
    }

    const updates = {}
    for (const field of ["name", "desc"]) {
        if (req.body[field] !== undefined) {
            if (typeof req.body[field] !== "string" || !req.body[field].trim()) {
                return res.status(400).json({ message: `${field} cannot be empty` })
            }
            updates[field] = req.body[field].trim()
        }
    }

    if (req.body.price !== undefined) {
        const price = Number(req.body.price)
        if (typeof req.body.price !== "string" || req.body.price.trim() === "" || !Number.isFinite(price) || price < 0) {
            return res.status(400).json({ message: "Price must be a non-negative number" })
        }
        updates.price = price
    }

    if (req.file) {
        const uploadImage = await uploadFile(req.file.buffer, req.file.originalname)
        updates.image = uploadImage.url
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "Provide at least one product field to update" })
    }

    const product = await productModel.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    )
    if (!product) {
        return res.status(404).json({ message: "Product not found" })
    }

    return res.status(200).json({ message: "Product updated", product })
}

async function deleteProduct(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid Product Id" })
    }

    const product = await productModel.findByIdAndDelete(req.params.id)
    if (!product) {
        return res.status(404).json({ message: "Product not found" })
    }

    await userModel.updateMany(
        { "cart.product": product._id },
        { $pull: { cart: { product: product._id } } }
    )

    return res.status(200).json({ message: "Product deleted", productId: product._id })
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

export {createProduct, updateProduct, deleteProduct, getProducts}