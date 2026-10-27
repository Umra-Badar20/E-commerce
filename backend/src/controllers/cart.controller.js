import mongoose from "mongoose";
import productModel from "../models/products.model.js";
import userModel from "../models/users.model.js";

function getCartWithTotals(cart) {
    let total = 0;
    let hasUnpricedProduct = false;
    const items = cart.map(item => {
        const entry = item.toObject();
        const price = entry.product?.price;
        if (typeof price !== "number" || !Number.isFinite(price)) {
            hasUnpricedProduct = true;
            return { ...entry, lineTotal: null };
        }

        const lineTotal = Math.round((price * entry.quantity + Number.EPSILON) * 100) / 100;
        total += lineTotal;
        return { ...entry, lineTotal };
    });

    return {
        cart: items,
        total: hasUnpricedProduct ? null : Math.round((total + Number.EPSILON) * 100) / 100
    };
}

async function addToCart(req, res) {
    try {
        const { productId } = req.body
        const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity)

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product Id" })
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a positive integer" })
        }
        const product = await productModel.findById(productId)
        if (!product) {
            return res.status(400).json({ message: "Product not found" })

        }
        if (typeof product.price !== "number" || !Number.isFinite(product.price)) {
            return res.status(409).json({ message: "This product does not have a price yet" })
        }
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        const cartItem = user.cart.find(item => item.product.toString() === productId)
        if (cartItem) {
            cartItem.quantity += quantity
        } else {
            user.cart.push({ product: productId, quantity })
        }
        await user.save()

        const updatedUser = await userModel.findById(user._id).select("cart").populate("cart.product", "name desc image price")
        const { cart, total } = getCartWithTotals(updatedUser.cart)
        const updatedUserData = updatedUser.toObject()
        updatedUserData.cart = cart

        return res.status(200).json({ message: "Product Added to cart", cart, total, updatedUser: updatedUserData })

    } catch (error) {
        return res.status(400).json({ message: "Failed to Add to cart", error: error.message })
    }
}

async function getCartForUser(userId) {
    const user = await userModel.findById(userId).select("cart").populate("cart.product", "name desc image price")
    if (!user) {
        return null
    }
    return getCartWithTotals(user.cart)
}

async function getCart(req, res) {
    const result = await getCartForUser(req.user.id)
    if (!result) {
        return res.status(400).json({ message: "User not found" })
    }
    return res.status(200).json(result)
}

async function removeFromCart(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
        return res.status(400).json({ message: "Invalid Product Id" })
    }

    const user = await userModel.findById(req.user.id)
    if (!user) {
        return res.status(400).json({ message: "User not found" })
    }

    user.cart.pull({ product: req.params.productId })
    await user.save()
    const result = await getCartForUser(user._id)
    return res.status(200).json({ message: "Product removed from cart", ...result })

}

export {addToCart, getCart, removeFromCart}