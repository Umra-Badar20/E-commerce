import mongoose from "mongoose"

const productSchema= new mongoose.Schema({
    image:{
        type: String,
        required:true
    },
    name:  {
        type: String,
        required:true
    },
    desc: {
        type: String,
        required:true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required:true
    }
})
const productModel = mongoose.model("product",productSchema)
export default productModel
