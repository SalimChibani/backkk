import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  categoryname: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32,
    unique: true,
  },
  categoryid: {
    type: String,
    unique: true,
  }
});

export default mongoose.model("Category", categorySchema);
